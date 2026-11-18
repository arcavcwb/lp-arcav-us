"""Tests de scripts/pipeline.py (estructura del PRD y diagnóstico de fase)."""

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from fixtures_flujo import PRD, approved_prd, evidence  # noqa: E402

spec = importlib.util.spec_from_file_location("pipeline", SOURCE / "scripts/pipeline.py")
pipeline = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pipeline)

ROLES = ("producto", "frontend", "integraciones", "qa-revisor", "release")


def story(title="[US-01] Historia", scenarios=None):
    scenarios = scenarios or [
        ("Camino feliz", "Dado un dato válido, cuando envío, entonces veo la confirmación."),
        ("Error / validación", "Dado un dato inválido, cuando envío, entonces veo el error."),
        ("Caso límite", "Dado un envío repetido, cuando envío, entonces no se duplica."),
        ("Estado vacío / carga", "Dado un envío en curso, cuando espero, entonces veo la carga."),
    ]
    body = "\n".join(f"{index}. **{name}**:\n   {text}" for index, (name, text) in enumerate(scenarios, 1))
    return f"### {title}\n- Como usuario\n\n#### Criterios de aceptación:\n{body}\n"


class CheckPrdTests(unittest.TestCase):
    def test_fixture_prd_is_valid(self):
        self.assertEqual(pipeline.check_prd_text(PRD), (True, []))

    def test_legacy_scenario_titles_are_accepted(self):
        prd = "# PRD\n" + story(scenarios=[
            ("Happy Path (Camino ideal)", "Dado a, cuando b, entonces c."),
            ("Sad Path (Error / Validación)", "Dado a, cuando b, entonces c."),
            ("Edge Case (Límite / Tiempo)", "Dado a, cuando b, entonces c."),
            ("Estado Vacío / Carga (UI / UX)", "Dado a, cuando b, entonces c."),
        ])
        self.assertEqual(pipeline.check_prd_text(prd), (True, []))

    def test_missing_scenarios_are_reported(self):
        prd = "# PRD\n### [US-01] Búsqueda\n- Como usuario\n\nDado algo, cuando busco, entonces veo resultados.\n"
        ok, errors = pipeline.check_prd_text(prd)
        self.assertFalse(ok)
        self.assertEqual(sum("falta escenario obligatorio" in e for e in errors), 4)

    def test_draft_or_storyless_prd_fails(self):
        self.assertFalse(pipeline.check_prd_text("")[0])
        self.assertFalse(pipeline.check_prd_text("# PRD\nPendiente de brief\n")[0])
        ok, errors = pipeline.check_prd_text("# PRD\n## Contexto\n1. Camino feliz: dado a cuando b entonces c\n")
        self.assertFalse(ok)
        self.assertIn("No se detectaron historias", errors[0])

    def test_every_scenario_requires_its_own_clauses(self):
        prd = PRD.replace("   - **Entonces** veo un estado vacío y puedo cambiarla.", "")
        ok, errors = pipeline.check_prd_text(prd)
        self.assertFalse(ok)
        self.assertTrue(any("estado_vacio_carga" in e and "Dado, Cuando y Entonces" in e for e in errors))

    def test_placeholders_between_brackets_fail(self):
        prd = PRD.replace("un horario disponible", "[precondición]")
        self.assertTrue(any("corchetes" in e for e in pipeline.check_prd_text(prd)[1]))

    def test_repeated_scenario_fails(self):
        prd = "# PRD\n" + story(scenarios=[
            ("Camino feliz", "Dado a, cuando b, entonces c."),
            ("Camino feliz alternativo", "Dado a, cuando b, entonces c."),
            ("Error", "Dado a, cuando b, entonces c."),
            ("Caso límite", "Dado a, cuando b, entonces c."),
            ("Estado vacío", "Dado a, cuando b, entonces c."),
        ])
        self.assertTrue(any("repetido" in e for e in pipeline.check_prd_text(prd)[1]))

    # Regresión: la última historia absorbía las listas numeradas de las
    # secciones posteriores ("Métricas de éxito") y fallaba por duplicados.
    def test_last_story_does_not_absorb_later_numbered_lists(self):
        self.assertIn("## Métricas de éxito", PRD)
        self.assertEqual(pipeline.check_prd_text(PRD), (True, []))
        last = pipeline.story_blocks(PRD)[-1]
        self.assertNotIn("Métricas de éxito", last)
        self.assertNotIn("100 reservas", last)

    def test_story_ends_at_non_scenario_heading_of_level_two_or_three(self):
        extra = "### Notas\n1. **Límite:** dado a, cuando b, entonces c.\n"
        prd = "# PRD\n" + story() + extra + story("[US-02] Otra")
        blocks = pipeline.story_blocks(prd)
        self.assertEqual(len(blocks), 2)
        self.assertNotIn("Notas", blocks[0])
        self.assertEqual(pipeline.check_prd_text(prd), (True, []))

    def test_scenario_heading_does_not_end_story(self):
        prd = ("# PRD\n### [US-01] Historia\n### Camino feliz\n1. Camino feliz: dado a, cuando b, entonces c.\n"
               "2. Error: dado a, cuando b, entonces c.\n3. Caso límite: dado a, cuando b, entonces c.\n"
               "4. Estado vacío: dado a, cuando b, entonces c.\n")
        self.assertEqual(pipeline.check_prd_text(prd), (True, []))

    def test_headings_inside_code_fences_are_ignored(self):
        prd = "# PRD\n" + story().replace("#### Criterios", "```md\n## No es un encabezado\n```\n#### Criterios")
        self.assertEqual(pipeline.check_prd_text(prd), (True, []))

    # Regresión: un ítem numerado vacío ("N. ") provocaba IndexError.
    def test_empty_numbered_item_does_not_crash(self):
        for text in ("# PRD\n### [US-01] Historia\n1. ",
                     "# PRD\n### [US-01] Historia\n1. \n2.",
                     "# PRD\n### [US-01] Historia\n1. \n\n2. Camino feliz: dado a, cuando b, entonces c.\n"):
            with self.subTest(text=text[-12:]):
                ok, errors = pipeline.check_prd_text(text)
                self.assertFalse(ok)
                self.assertTrue(any("falta escenario obligatorio" in e for e in errors))
        self.assertEqual(pipeline.check_prd_text(PRD.replace("## Fuera de alcance", "5. \n\n## Fuera de alcance")),
                         (True, []))

    # Regresión con el PRD.md real del repositorio: US-09 es la última historia.
    def test_repository_prd_passes(self):
        path = SOURCE / "PRD.md"
        if not path.is_file():
            self.skipTest("PRD.md no existe en esta copia")
        content = path.read_text(encoding="utf-8")
        ok, errors = pipeline.check_prd_gherkin(path)
        self.assertEqual(errors, [])
        self.assertTrue(ok)
        headers = [block.splitlines()[0] for block in pipeline.story_blocks(content)]
        if any("[US-09]" in header for header in headers):
            self.assertIn("[US-09]", headers[-1])

    def test_check_prd_gherkin_missing_or_unreadable_file(self):
        with tempfile.TemporaryDirectory() as temp:
            self.assertFalse(pipeline.check_prd_gherkin(Path(temp) / "PRD.md")[0])
            (Path(temp) / "PRD.md").write_bytes(b"\xff\xfe\x00")
            self.assertFalse(pipeline.check_prd_gherkin(Path(temp) / "PRD.md")[0])


class PhaseTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory(prefix="test-pipeline-")
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)

    def write(self, name, content):
        path = self.root / name
        path.write_text(content if isinstance(content, str) else json.dumps(content), encoding="utf-8")
        return path

    def run_cli(self, *args):
        return subprocess.run([sys.executable, str(SOURCE / "scripts/pipeline.py"), "--root", str(self.root), *args],
                              capture_output=True, text=True, check=False)

    def test_phases_cover_every_role(self):
        self.assertEqual(set(pipeline.PHASES), set(ROLES))
        self.assertEqual(set(pipeline.ROLES), set(ROLES))

    def test_empty_root_starts_with_requirements(self):
        self.assertEqual(pipeline.detect_phase(self.root)[0::2], ("1_REQUISITOS", "producto"))

    def test_garbage_documents_do_not_skip_prd_gate(self):
        self.write("PRD.md", "Borrador sin aprobar")
        self.write("sprint_actual.md", "Sin sincronizar")
        self.write("bug_report.md", "Resultado: approved")
        self.assertEqual(pipeline.detect_phase(self.root)[0], "1_REQUISITOS")

    def test_pending_approval_stops_at_human_gate(self):
        self.write("PRD.md", PRD)
        phase, detail, actor = pipeline.detect_phase(self.root)
        self.assertEqual((phase, actor), ("1_GATE_PRD", "HUMANO"))
        self.assertIn("Estado: aprobado", detail)

    def test_status_approved_without_approval_line_stays_at_gate(self):
        self.write("PRD.md", PRD.replace("Estado: listo_para_aprobacion", "Estado: aprobado"))
        self.assertEqual(pipeline.detect_phase(self.root)[0], "1_GATE_PRD")

    def test_header_approval_moves_to_planning(self):
        self.write("PRD.md", approved_prd())
        phase, detail, actor = pipeline.detect_phase(self.root)
        self.assertEqual((phase, actor), ("2_PLANIFICACION", "producto"))
        self.assertIn("Vikunja", detail)

    def test_repository_prd_header_is_parsed(self):
        header = pipeline.prd_header("# PRD\n\nEstado: aprobado\nRevisión: v1\n"
                                     "Aprobación humana (persona, fecha, alcance y evidencia): Ana, 2026-09-17\n\n## Contexto\n"
                                     "Estado: otro\n")
        self.assertEqual(header, {"estado": "aprobado", "revision": "v1", "aprobacion": "Ana, 2026-09-17"})

    def test_approval_record_is_linked_to_hash_and_not_overwritten(self):
        self.write("PRD.md", approved_prd())
        path = pipeline.record_prd_approval(self.root, "PERSONA FICTICIA", "US-01", "TEST")
        self.assertTrue(path.is_relative_to(self.root / "docs/aprobaciones"))
        record = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual(record["sha256"], pipeline.prd_digest(self.root))
        self.assertTrue(pipeline.valid_approval(self.root))
        with self.assertRaises(FileExistsError):
            pipeline.record_prd_approval(self.root, "Otra persona", "Otro alcance", "TEST")
        self.write("PRD.md", approved_prd() + "\nAlcance modificado\n")
        self.assertEqual(pipeline.detect_phase(self.root)[0], "1_GATE_PRD")
        self.assertFalse(pipeline.valid_approval(self.root))

    def test_record_requires_header_approval_and_explicit_fields(self):
        self.write("PRD.md", PRD)
        with self.assertRaises(ValueError):
            pipeline.record_prd_approval(self.root, "PERSONA", "US-01", "TEST")
        self.write("PRD.md", approved_prd())
        with self.assertRaises(ValueError):
            pipeline.record_prd_approval(self.root, "pendiente", "US-01", "TEST")
        self.assertFalse((self.root / "docs").exists())

    def prepare_release(self, qa_status="approved", candidate_revision="rev-1"):
        self.write("PRD.md", approved_prd())
        data = evidence("release")
        data["inputs"]["qa"]["status"] = qa_status
        self.write("handoff.json", data)
        self.write("candidate.json", dict(schema_version=1, revision=candidate_revision, qa_run="qa-1",
                                          ticket="SIM-US-01"))

    def test_release_requires_current_approved_qa(self):
        self.prepare_release()
        self.assertEqual(pipeline.detect_phase(self.root)[0::2], ("5_RELEASE", "release"))
        self.prepare_release(qa_status="rejected")
        self.assertEqual(pipeline.detect_phase(self.root)[0], "BLOQUEADO")
        self.prepare_release(candidate_revision="rev-2")
        self.assertEqual(pipeline.detect_phase(self.root)[0], "BLOQUEADO")

    def test_candidate_roles_require_candidate_file(self):
        self.prepare_release()
        (self.root / "candidate.json").unlink()
        phase, detail, _ = pipeline.detect_phase(self.root)
        self.assertEqual(phase, "BLOQUEADO")
        self.assertIn("candidate.json", detail)

    def test_prose_approval_cannot_override_rejected_evidence(self):
        self.prepare_release(qa_status="rejected")
        self.write("bug_report.md", "Historial: approved\n")
        self.assertEqual(pipeline.detect_phase(self.root)[0], "BLOQUEADO")

    def test_implementation_roles_map_to_implementation_phase(self):
        self.write("PRD.md", approved_prd())
        for role in ("frontend", "integraciones"):
            with self.subTest(role=role):
                self.write("handoff.json", evidence(role))
                self.assertEqual(pipeline.detect_phase(self.root)[0::2], ("3_IMPLEMENTACION", role))

    def test_preparation_phase_for_qa(self):
        self.write("PRD.md", approved_prd())
        data = evidence("qa-revisor")
        data["phase"] = "preparation"
        self.write("handoff.json", data)
        self.assertEqual(pipeline.detect_phase(self.root)[0], "PREPARACION")

    def test_planning_handoff_must_reference_approved_revision(self):
        self.write("PRD.md", approved_prd())
        data = evidence("producto", revision="otro-hash")
        self.write("handoff.json", data)
        self.assertEqual(pipeline.detect_phase(self.root)[0], "BLOQUEADO")
        data = evidence("producto", revision="abc1234")
        self.write("handoff.json", data)
        self.assertEqual(pipeline.detect_phase(self.root)[0::2], ("2_PLANIFICACION", "producto"))

    def test_malformed_or_legacy_handoff_blocks_without_crashing(self):
        self.write("PRD.md", approved_prd())
        legacy = evidence("frontend")
        legacy["target_role"] = "frontend-dev-agent"
        for text in ("{", "[]", '{"schema_version":1,"target_role":[]}', json.dumps(legacy)):
            with self.subTest(text=text[:40]):
                self.write("handoff.json", text)
                self.assertEqual(pipeline.detect_phase(self.root)[0], "BLOQUEADO")

    def test_cli_check_prd_exit_codes(self):
        self.write("PRD.md", PRD)
        result = self.run_cli("check-prd")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.write("PRD.md", "# PRD\n### [US-01] Sin escenarios\n")
        result = self.run_cli("check-prd")
        self.assertEqual(result.returncode, 1)
        self.assertIn("falta escenario obligatorio", result.stdout)

    def test_cli_advance_does_not_record_approval(self):
        self.write("PRD.md", PRD)
        result = self.run_cli("advance")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("No se registró ninguna aprobación", result.stdout)
        self.assertIn("1_GATE_PRD", result.stdout)
        self.assertFalse((self.root / "docs").exists())
        self.assertEqual(sorted(p.name for p in self.root.iterdir()), ["PRD.md"])


if __name__ == "__main__":
    unittest.main()
