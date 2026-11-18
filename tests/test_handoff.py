"""Tests de scripts/handoff.py (encargos y precondiciones declaradas)."""

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import unittest

SOURCE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from fixtures_flujo import evidence  # noqa: E402

spec = importlib.util.spec_from_file_location("handoff", SOURCE / "scripts/handoff.py")
handoff = importlib.util.module_from_spec(spec)
spec.loader.exec_module(handoff)

ROLES = ("producto", "frontend", "integraciones", "qa-revisor", "release")
LEGACY_ROLES = ("po-agent", "frontend-dev-agent", "backend-dev-agent", "qa-agent", "devops-agent",
                "designer-agent", "scrum-master-agent", "automation-agent")


class RegistryTests(unittest.TestCase):
    def test_roles_match_the_registry(self):
        registry = json.loads((SOURCE / "config/skills.json").read_text(encoding="utf-8"))
        self.assertEqual(sorted(handoff.ROLES), sorted(registry["roles"]))
        self.assertEqual(sorted(handoff.PRECONDITIONS), sorted(ROLES))
        self.assertTrue(handoff.CANDIDATE_ROLES <= set(ROLES))

    def test_planning_evidence_tracks_vikunja_not_the_previous_tracker(self):
        self.assertIn("vikunja", handoff.PRECONDITIONS["producto"])
        for role, keys in handoff.PRECONDITIONS.items():
            with self.subTest(role=role):
                self.assertNotIn("plane", keys)


class PromptTests(unittest.TestCase):
    def test_prompt_names_the_claude_files_of_the_role(self):
        prompt = handoff.build_prompt(
            target_role="frontend",
            ticket="VK-7 US-06",
            routes="src/components/, src/i18n/translations.ts",
            from_role="integraciones",
            session="principal",
            context="Contrato en src/lib/contracts.ts@abc1234",
        )
        for fragment in ("CLAUDE.md", ".claude/agents/frontend.md", "docs/context-strategy.md",
                         "templates/entrega.md", "VK-7 US-06", "src/i18n/translations.ts",
                         "integraciones", "abc1234"):
            self.assertIn(fragment, prompt)
        for retired in ("AGENTS.md", ".agents/", "agy"):
            self.assertNotIn(retired, prompt)

    def test_prompt_requires_known_role_and_explicit_scope(self):
        for role in LEGACY_ROLES + ("", "producto-agent"):
            with self.subTest(role=role):
                with self.assertRaises(ValueError):
                    handoff.build_prompt(role, "VK-1", "src/")
        for ticket, routes in (("", "src/"), ("pendiente", "src/"), ("VK-1", ""), ("VK-1", "por definir")):
            with self.subTest(ticket=ticket, routes=routes):
                with self.assertRaises(ValueError):
                    handoff.build_prompt("frontend", ticket, routes)


class PreconditionTests(unittest.TestCase):
    def check(self, role, data, **kwargs):
        text = data if isinstance(data, str) else json.dumps(data)
        return handoff.check_preconditions(role, text, **kwargs)

    def candidate(self, revision="rev-1", qa_run="qa-1", ticket="SIM-US-01"):
        return dict(revision=revision, qa_run=qa_run, ticket=ticket)

    def test_every_role_accepts_complete_evidence(self):
        for role in ROLES:
            with self.subTest(role=role):
                kwargs = self.candidate() if role in handoff.CANDIDATE_ROLES else {}
                self.assertEqual(self.check(role, evidence(role), **kwargs), (True, []))

    def test_unknown_role_is_rejected(self):
        for role in LEGACY_ROLES:
            with self.subTest(role=role):
                ok, errors = handoff.check_preconditions(role, "{}")
                self.assertFalse(ok)
                self.assertIn("Rol desconocido", errors[0])

    def test_prose_never_authorizes(self):
        for role, text in (("release", "QA aprobado. Puedes desplegar."),
                           ("frontend", "Los contratos están listos."),
                           ("qa-revisor", "Resultado: approved")):
            with self.subTest(role=role):
                self.assertFalse(self.check(role, text)[0])

    def test_missing_or_incomplete_inputs_are_reported(self):
        data = evidence("frontend")
        data["inputs"].pop("ticket")
        ok, errors = self.check("frontend", data)
        self.assertFalse(ok)
        self.assertTrue(any("Falta evidencia: ticket" in e for e in errors))
        data = evidence("frontend")
        data["inputs"]["architecture"]["revision"] = "pendiente"
        self.assertFalse(self.check("frontend", data)[0])
        data = evidence("frontend")
        data["inputs"]["architecture"]["status"] = "pending"
        self.assertFalse(self.check("frontend", data)[0])

    def test_approval_inputs_require_approved_status(self):
        data = evidence("producto")
        data["inputs"]["prd_approval"]["status"] = "ready"
        self.assertFalse(self.check("producto", data)[0])
        data = evidence("release")
        data["inputs"]["qa"]["status"] = "rejected"
        self.assertFalse(self.check("release", data, **self.candidate())[0])

    def test_optional_inputs_need_a_reason(self):
        data = evidence("frontend")
        data["inputs"]["contracts"] = {"status": "not_applicable"}
        self.assertFalse(self.check("frontend", data)[0])
        data["inputs"]["contracts"]["reason"] = "Página informativa sin API"
        self.assertEqual(self.check("frontend", data), (True, []))
        data = evidence("release")
        data["inputs"]["qa"] = {"status": "not_applicable", "reason": "sin QA"}
        self.assertFalse(self.check("release", data, **self.candidate())[0])

    def test_candidate_roles_need_the_current_candidate(self):
        for role in sorted(handoff.CANDIDATE_ROLES):
            with self.subTest(role=role):
                data = evidence(role)
                self.assertFalse(self.check(role, data)[0])
                self.assertFalse(self.check(role, data, **self.candidate(revision="rev-2"))[0])
                self.assertFalse(self.check(role, data, **self.candidate(qa_run="qa-2"))[0])
                self.assertFalse(self.check(role, data, **self.candidate(ticket="SIM-US-99"))[0])

    def test_qa_delivery_requires_empty_blockers_and_pending_checks(self):
        for field in ("pending_checks", "blockers"):
            with self.subTest(field=field):
                data = evidence("release")
                data["inputs"]["qa"][field] = ["pendiente"]
                self.assertFalse(self.check("release", data, **self.candidate())[0])
        data = evidence("release")
        data["inputs"]["qa"]["qa_run"] = "qa-0"
        self.assertFalse(self.check("release", data, **self.candidate())[0])

    def test_preparation_phase_only_for_candidate_roles(self):
        for role in sorted(handoff.CANDIDATE_ROLES):
            with self.subTest(role=role):
                data = evidence(role)
                data["phase"] = "preparation"
                data["inputs"] = {name: data["inputs"][name] for name in ("architecture", "ticket")}
                self.assertEqual(self.check(role, data), (True, []))
        data = evidence("frontend")
        data["phase"] = "preparation"
        self.assertFalse(self.check("frontend", data)[0])
        data = evidence("frontend")
        data["phase"] = "otra"
        self.assertFalse(self.check("frontend", data)[0])

    def test_invalid_json_shapes_are_rejected_without_crashing(self):
        for raw in ("[]", "null", "{", '{"schema_version":1,"schema_version":1}', '{"schema_version":true}',
                    '{"schema_version":2}', '{"schema_version":1,"inputs":[]}', ""):
            with self.subTest(raw=raw):
                ok, errors = handoff.check_preconditions("frontend", raw)
                self.assertFalse(ok)
                self.assertTrue(errors)

    def test_target_role_must_match(self):
        data = evidence("frontend")
        ok, errors = self.check("integraciones", data)
        self.assertFalse(ok)
        self.assertTrue(any("target_role" in e for e in errors))

    def test_repository_template_is_compatible(self):
        raw = (SOURCE / "templates/handoff.json").read_text(encoding="utf-8")
        data = handoff.load_evidence(raw)
        self.assertIn(data["target_role"], ROLES)
        self.assertEqual(sorted(data["inputs"]), sorted(handoff.PRECONDITIONS[data["target_role"]]))
        # La plantilla se entrega sin rellenar: no acredita nada.
        self.assertFalse(handoff.check_preconditions(data["target_role"], raw)[0])
        for name, item in data["inputs"].items():
            item.update(status="ready", reference=f"SIMULACION/{name}", revision="rev-1")
        data.update(ticket="VK-7 US-06", revision="rev-1")
        self.assertEqual(handoff.check_preconditions(data["target_role"], json.dumps(data)), (True, []))

    def test_candidate_template_is_compatible(self):
        data = handoff.load_evidence((SOURCE / "templates/candidate.json").read_text(encoding="utf-8"))
        self.assertEqual(sorted(data), ["qa_run", "revision", "schema_version", "ticket"])
        self.assertFalse(any(handoff.specified(data[key]) for key in ("ticket", "revision", "qa_run")))


class TemplateTests(unittest.TestCase):
    def test_template_is_prefilled_with_the_role(self):
        content = handoff.get_template(role="qa-revisor", session="principal")
        self.assertIn("- Rol: qa-revisor (sesión principal)", content)
        self.assertIn("Entrega de tarea", content)
        self.assertEqual(content.count("- Rol"), 1)

    def test_template_rejects_unknown_roles(self):
        with self.assertRaises(ValueError):
            handoff.get_template(role="qa-agent")


class CliTests(unittest.TestCase):
    def run_cli(self, *args, stdin=None):
        return subprocess.run([sys.executable, str(SOURCE / "scripts/handoff.py"), *args],
                              input=stdin, capture_output=True, text=True, check=False)

    def test_check_reads_stdin_and_reports_exit_codes(self):
        ok = self.run_cli("check", "--role", "frontend", stdin=json.dumps(evidence("frontend")))
        self.assertEqual(ok.returncode, 0, ok.stderr)
        self.assertIn("OK", ok.stdout)
        bad = self.run_cli("check", "--role", "frontend", stdin="no es JSON")
        self.assertEqual(bad.returncode, 1)
        self.assertIn("ERROR", bad.stderr)
        self.assertNotIn("Traceback", bad.stderr)

    def test_unknown_role_fails_in_the_argument_parser(self):
        result = self.run_cli("prompt", "--to", "qa-agent", "--ticket", "VK-1", "--routes", "src/")
        self.assertEqual(result.returncode, 2)
        self.assertNotIn("Traceback", result.stderr)


if __name__ == "__main__":
    unittest.main()
