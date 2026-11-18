"""Tests de scripts/validate_squad.py sobre copias desechables del repositorio."""

import copy
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from fixtures_flujo import PRD  # noqa: E402

spec = importlib.util.spec_from_file_location("validate_squad", SOURCE / "scripts/validate_squad.py")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)

ROLES = ("producto", "frontend", "integraciones", "qa-revisor", "release")
COPIED_FILES = ("CLAUDE.md", "README.md", ".pre-commit-config.yaml")
COPIED_DIRS = (".claude", ".github", "config", "docs", "templates")
IGNORED = shutil.ignore_patterns("__pycache__", "settings.local.json", "*.pyc")


class FrontmatterTests(unittest.TestCase):
    def parse(self, text):
        return validator.parse_frontmatter(text)

    def test_block_list_inline_list_and_scalars(self):
        fields, errors = self.parse("---\nname: producto\nskills:\n  - requisitos\n  - planificacion\n---\ncuerpo\n")
        self.assertEqual((fields, errors), ({"name": "producto", "skills": ["requisitos", "planificacion"]}, []))
        fields, _ = self.parse("---\nname: x\nskills: [a, b]\nlista_vacia: []\n---\n")
        self.assertEqual(fields["skills"], ["a", "b"])
        self.assertEqual(fields["lista_vacia"], [])
        fields, _ = self.parse('---\nname: "x"\ndescription: >-\n  linea uno\n  linea dos\n---\n')
        self.assertEqual(fields, {"name": "x", "description": "linea uno linea dos"})

    def test_nested_mapping_is_accepted_without_interpreting_it(self):
        fields, errors = self.parse("---\nname: x\nhooks:\n  PreToolUse:\n    - matcher: Bash\n"
                                    "description: hola\n---\n")
        self.assertEqual(errors, [])
        self.assertEqual(fields["hooks"], {})
        self.assertEqual(fields["description"], "hola")

    def test_errors_are_reported(self):
        self.assertEqual(self.parse("sin frontmatter"), (None, ["falta frontmatter delimitado por ---"]))
        self.assertTrue(any("': '" in e for e in self.parse("---\nname: x\ndescription: mal: valor\n---\n")[1]))
        self.assertTrue(any("duplicado" in e for e in self.parse("---\nname: x\nname: y\n---\n")[1]))
        self.assertTrue(any("no reconocida" in e for e in self.parse("---\nname: x\ntexto suelto\n---\n")[1]))


class ValidationTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory(prefix="validacion-flujo-")
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name) / "proyecto"
        self.root.mkdir()
        for name in COPIED_FILES:
            shutil.copy2(SOURCE / name, self.root / name)
        for name in COPIED_DIRS:
            shutil.copytree(SOURCE / name, self.root / name, ignore=IGNORED)
        self.registry_path = self.root / "config/skills.json"
        self.registry = json.loads(self.registry_path.read_text(encoding="utf-8"))

    # Utilidades

    def check(self, project=False):
        return validator.validate(self.root, project)

    def save(self, registry):
        self.registry_path.write_text(json.dumps(registry, ensure_ascii=False), encoding="utf-8")

    def edit(self, relative, old, new, count=1):
        path = self.root / relative
        content = path.read_text(encoding="utf-8")
        self.assertIn(old, content, f"{relative}: no se encontró {old!r}")
        path.write_text(content.replace(old, new, count), encoding="utf-8")

    def project_inputs(self, prd=PRD):
        (self.root / "PRD.md").write_text(prd, encoding="utf-8")
        (self.root / "sprint_actual.md").write_text("# Sprint actual\n\nEspejo local de Vikunja.\n", encoding="utf-8")

    def assertProblem(self, fragment, project=False):
        errors = self.check(project)
        self.assertTrue(any(fragment in e for e in errors), f"{fragment!r} no aparece en {errors}")

    # Estado correcto

    def test_current_structure_is_valid(self):
        self.assertEqual(self.check(), [])

    def test_registry_matches_agents_and_skills(self):
        self.assertEqual(self.registry["version"], 2)
        self.assertEqual(sorted(self.registry["roles"]), sorted(ROLES))
        for role, entry in self.registry["roles"].items():
            with self.subTest(role=role):
                self.assertEqual(entry["agent"], f".claude/agents/{role}.md")
                for skill in entry["skills"]:
                    self.assertTrue((self.root / f".claude/skills/{skill}/SKILL.md").is_file())
        for skill in self.registry["user_skills"]:
            self.assertTrue((self.root / f".claude/skills/{skill}/SKILL.md").is_file())
        for workflow in self.registry["workflows"]:
            self.assertTrue((self.root / workflow).is_file())

    # CLAUDE.md

    def test_claude_md_is_required_and_bounded(self):
        self.edit("CLAUDE.md", "# ", "# " + "relleno\n" * 200)
        self.assertProblem("CLAUDE.md: tiene")
        (self.root / "CLAUDE.md").unlink()
        self.assertProblem("CLAUDE.md: falta el archivo")

    def test_claude_md_must_name_roles_and_protocol(self):
        self.edit("CLAUDE.md", "`qa-revisor`", "qa-revisor", count=-1)
        self.assertProblem("no menciona el rol `qa-revisor`")

    # config/skills.json

    def test_registry_version_and_unknown_keys(self):
        registry = copy.deepcopy(self.registry)
        registry["version"] = 1
        registry["schema_version"] = 1
        self.save(registry)
        errors = self.check()
        self.assertTrue(any("version debe ser 2" in e for e in errors))
        self.assertTrue(any("claves desconocidas" in e for e in errors))

    def test_legacy_registry_is_rejected_without_crashing(self):
        self.save({"schema_version": 1, "agents": {"po-agent": {"core": "agy-requirements"}},
                   "bundled": {}, "external": {}})
        self.assertTrue(self.check())

    def test_registry_types_produce_errors_without_crashing(self):
        cases = ["[]", "null", '{"broken"', json.dumps({"version": 2, "roles": [], "user_skills": {},
                                                        "workflows": "x"})]
        for role in ROLES:
            registry = copy.deepcopy(self.registry)
            registry["roles"][role] = None
            cases.append(json.dumps(registry))
        registry = copy.deepcopy(self.registry)
        registry["roles"]["producto"]["skills"] = "requisitos"
        cases.append(json.dumps(registry))
        for raw in cases:
            with self.subTest(raw=raw[:60]):
                self.registry_path.write_text(raw, encoding="utf-8")
                self.assertTrue(self.check())

    def test_missing_and_unknown_roles_are_reported(self):
        registry = copy.deepcopy(self.registry)
        registry["roles"].pop("release")
        registry["roles"]["devops-agent"] = {"agent": ".claude/agents/devops-agent.md", "skills": ["build-release"]}
        self.save(registry)
        errors = self.check()
        self.assertTrue(any("faltan roles: release" in e for e in errors))
        self.assertTrue(any("roles desconocidos" in e for e in errors))

    def test_agent_path_and_duplicate_skills(self):
        registry = copy.deepcopy(self.registry)
        registry["roles"]["frontend"]["agent"] = ".agents/agents/frontend-dev-agent/agent.md"
        registry["roles"]["producto"]["skills"] = ["requisitos", "requisitos"]
        self.save(registry)
        errors = self.check()
        self.assertTrue(any("roles.frontend.agent" in e for e in errors))
        self.assertTrue(any("duplicados" in e for e in errors))

    def test_skill_cannot_be_role_and_user_skill(self):
        registry = copy.deepcopy(self.registry)
        registry["user_skills"] = registry["user_skills"] + ["requisitos"]
        self.save(registry)
        self.assertProblem("figura como skill de rol y de usuario")

    # Subagentes

    def test_agent_name_description_and_skills_must_match(self):
        self.edit(".claude/agents/producto.md", "name: producto", "name: po-agent")
        self.assertProblem("name debe ser producto")
        self.setUp()
        self.edit(".claude/agents/frontend.md", "  - entrega-frontend", "  - entrega-frontend\n  - requisitos")
        self.assertProblem("no coincide con config/skills.json")
        self.setUp()
        self.edit(".claude/agents/release.md", "---\nname: release", "---\nname: release\n")
        path = self.root / ".claude/agents/release.md"
        path.write_text(path.read_text(encoding="utf-8").replace("description:", "descripcion:", 1), encoding="utf-8")
        self.assertProblem("falta description")

    def test_agent_without_frontmatter_or_file_is_reported(self):
        path = self.root / ".claude/agents/qa-revisor.md"
        path.write_text("Sin frontmatter\n", encoding="utf-8")
        self.assertProblem("falta frontmatter")
        path.unlink()
        self.assertProblem(".claude/agents/qa-revisor.md: falta el archivo")

    def test_inline_skill_lists_are_accepted(self):
        self.edit(".claude/agents/producto.md", "skills:\n  - requisitos\n  - planificacion",
                  "skills: [requisitos, planificacion]")
        self.assertEqual(self.check(), [])

    def test_unregistered_agent_file_is_reported(self):
        shutil.copy2(self.root / ".claude/agents/release.md", self.root / ".claude/agents/devops-agent.md")
        self.assertProblem("subagente no registrado")

    def test_agents_cannot_require_binary_diagrams(self):
        path = self.root / ".claude/agents/frontend.md"
        path.write_text(path.read_text(encoding="utf-8") + "\nLee docs/diagrams/flujo-claude.excalidraw siempre.\n",
                        encoding="utf-8")
        self.assertProblem("diagrama binario")

    # Skills

    def test_missing_skill_or_name_mismatch(self):
        (self.root / ".claude/skills/requisitos/SKILL.md").unlink()
        self.assertProblem(".claude/skills/requisitos/SKILL.md: falta el archivo")
        self.setUp()
        self.edit(".claude/skills/evidencia-qa/SKILL.md", "name: evidencia-qa", "name: agy-qa-evidence")
        self.assertProblem("name debe ser evidencia-qa")

    def test_user_skill_requires_disable_model_invocation(self):
        self.edit(".claude/skills/revisar-proyecto/SKILL.md", "disable-model-invocation: true",
                  "disable-model-invocation: false")
        self.assertProblem("requiere disable-model-invocation: true")

    def test_role_skill_cannot_disable_model_invocation(self):
        self.edit(".claude/skills/build-release/SKILL.md", "user-invocable: false",
                  "disable-model-invocation: true")
        self.assertProblem("no puede usar disable-model-invocation")

    def test_unregistered_skill_directory_is_reported(self):
        (self.root / ".claude/skills/agy-planning").mkdir()
        (self.root / ".claude/skills/agy-planning/SKILL.md").write_text("---\nname: agy-planning\n---\n",
                                                                        encoding="utf-8")
        self.assertProblem("skill no registrada")

    # Workflows

    def test_workflow_must_start_with_meta_and_match_its_name(self):
        path = self.root / ".claude/workflows/entrega-historia.js"
        path.write_text("const x = 1\n" + path.read_text(encoding="utf-8"), encoding="utf-8")
        self.assertProblem("debe empezar con export const meta")
        self.setUp()
        self.edit(".claude/workflows/revision-proyecto.js", "name: 'revision-proyecto'", "name: 'revision'")
        self.assertProblem("meta.name debe ser revision-proyecto")

    def test_workflow_rejects_nondeterminism_and_unknown_agents(self):
        path = self.root / ".claude/workflows/entrega-historia.js"
        content = path.read_text(encoding="utf-8")
        path.write_text(content + "\nconst t = Date.now() + Math.random() + new Date()\n", encoding="utf-8")
        errors = self.check()
        for label in ("Date.now()", "Math.random()", "new Date()"):
            self.assertTrue(any(label in e for e in errors), errors)
        self.setUp()
        self.edit(".claude/workflows/entrega-historia.js", "agentType: 'qa-revisor'", "agentType: 'qa-agent'")
        self.assertProblem("agentType desconocido")

    def test_comments_do_not_trigger_nondeterminism(self):
        path = self.root / ".claude/workflows/revision-proyecto.js"
        path.write_text(path.read_text(encoding="utf-8") + "\n// No uses Date.now() en un workflow\n",
                        encoding="utf-8")
        self.assertEqual(self.check(), [])

    def test_missing_or_unregistered_workflow_is_reported(self):
        (self.root / ".claude/workflows/entrega-historia.js").unlink()
        self.assertProblem(".claude/workflows/entrega-historia.js: falta el archivo")
        self.setUp()
        registry = copy.deepcopy(self.registry)
        registry["workflows"] = [".claude/workflows/revision-proyecto.js"]
        self.save(registry)
        self.assertProblem("workflow no registrado")
        self.setUp()
        registry = copy.deepcopy(self.registry)
        registry["workflows"] = ["../fuera/workflow.js"]
        self.save(registry)
        self.assertProblem("ruta de workflow inválida")

    # settings.json

    def test_settings_must_block_env_reads_and_wrangler_deploy(self):
        path = self.root / ".claude/settings.json"
        settings = json.loads(path.read_text(encoding="utf-8"))
        original = copy.deepcopy(settings)
        settings["permissions"]["deny"] = [r for r in settings["permissions"]["deny"] if ".env" not in r]
        path.write_text(json.dumps(settings), encoding="utf-8")
        self.assertProblem("debe bloquear la lectura de .env")
        settings = copy.deepcopy(original)
        settings["permissions"]["deny"] = [r for r in settings["permissions"]["deny"] if "wrangler deploy" not in r]
        path.write_text(json.dumps(settings), encoding="utf-8")
        self.assertProblem("debe bloquear wrangler deploy")
        settings = copy.deepcopy(original)
        settings["permissions"]["allow"].append("Bash(npx wrangler deploy *)")
        path.write_text(json.dumps(settings), encoding="utf-8")
        self.assertProblem("incompatible con los bloqueos obligatorios")

    def test_settings_must_be_valid_json_with_permissions(self):
        path = self.root / ".claude/settings.json"
        path.write_text("{no es json", encoding="utf-8")
        self.assertProblem("JSON inválido")
        path.write_text("{}", encoding="utf-8")
        self.assertProblem("falta el objeto permissions")

    # Workflows de GitHub

    def test_pr_review_workflow_requirements(self):
        relative = ".github/workflows/claude-pr-review.yml"
        self.edit(relative, "pull_request:", "pull_request_target:")
        self.assertProblem("no debe usar pull_request_target")
        self.setUp()
        path = self.root / relative
        path.write_text("\n".join(line for line in path.read_text(encoding="utf-8").splitlines()
                                  if "permissions" not in line), encoding="utf-8")
        self.assertProblem("debe declarar permissions")
        self.setUp()
        self.edit(relative, "claude-review:", "validate:")
        self.assertProblem("ningún job puede llamarse validate")
        self.setUp()
        (self.root / relative).unlink()
        self.assertProblem(f"{relative}: falta el archivo")

    def test_required_checks_job_and_matrix_are_preserved(self):
        relative = ".github/workflows/validate-squad.yml"
        self.edit(relative, "  validate:", "  validar-flujo:")
        self.assertProblem("falta el job validate")
        self.setUp()
        self.edit(relative, 'python-version: ["3.10", "3.11", "3.12"]', 'python-version: ["3.12"]')
        self.assertProblem("la matriz python-version")
        self.setUp()
        self.edit(relative, "python3 scripts/validate_squad.py", "echo sin validador")
        self.assertProblem("falta el paso python3 scripts/validate_squad.py")

    # Restos de la plantilla anterior

    def test_retired_paths_are_rejected(self):
        (self.root / "AGENTS.md").write_text("Índice anterior\n", encoding="utf-8")
        (self.root / ".agents/agents/po-agent").mkdir(parents=True)
        (self.root / "tools/ai-pr-reviewer").mkdir(parents=True)
        (self.root / "scripts").mkdir()
        (self.root / "scripts/setup_receiver.py").write_text("# plantilla\n", encoding="utf-8")
        errors = self.check()
        for retired in ("AGENTS.md", ".agents", "tools/ai-pr-reviewer", "scripts/setup_receiver.py"):
            self.assertTrue(any(e.startswith(f"{retired}:") for e in errors), errors)

    def test_obsolete_references_are_detected_with_file_and_line(self):
        cases = [
            ("CLAUDE.md", "El rol po-agent mantiene el PRD.", "rol antiguo *-agent"),
            ("docs/protocolo.md", "Ejecuta agy run po-agent para planificar.", "agy/agyFlow"),
            (".claude/agents/frontend.md", "Lee AGENTS.md antes de empezar.", "AGENTS.md"),
            (".claude/skills/requisitos/SKILL.md", "Sincroniza las historias con Plane.", "Plane"),
            ("docs/skills.md", "Las skills viven en .agents/skills/.", ".agents/"),
            ("README.md", "Configura GEMINI_API_KEY para el revisor.", "revisor Gemini"),
            (".claude/workflows/entrega-historia.js", "// Compatible con Antigravity", "Antigravity"),
        ]
        for relative, line, label in cases:
            with self.subTest(relative=relative):
                self.setUp()
                path = self.root / relative
                path.write_text(path.read_text(encoding="utf-8") + f"\n{line}\n", encoding="utf-8")
                self.assertProblem(f"referencia obsoleta a {label}")

    def test_lines_that_declare_retired_tools_are_allowed(self):
        path = self.root / "docs/protocolo.md"
        path.write_text(path.read_text(encoding="utf-8")
                        + "\n- Herramienta retirada: el revisor con GEMINI_API_KEY y los roles po-agent y qa-agent.\n",
                        encoding="utf-8")
        self.assertEqual(self.check(), [])

    def test_vikunja_documentation_may_mention_the_old_labels(self):
        path = self.root / "docs/vikunja.md"
        path.write_text(path.read_text(encoding="utf-8")
                        + "\nLa etiqueta antigua role:po corresponde a rol:producto (po-agent).\n", encoding="utf-8")
        self.assertEqual(self.check(), [])

    # Plantillas y diagramas

    def test_handoff_template_must_target_a_current_role(self):
        path = self.root / "templates/handoff.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data["target_role"] = "frontend-dev-agent"
        path.write_text(json.dumps(data), encoding="utf-8")
        self.assertProblem("target_role debe ser uno de los roles")
        path.write_text("{roto", encoding="utf-8")
        self.assertProblem("templates/handoff.json: JSON inválido")

    def test_diagrams_are_declared_non_operational(self):
        self.edit("docs/diagrams/README.md", "material humano", "material obligatorio")
        self.assertProblem("material humano")

    # Rutas fuera de la raíz

    def test_symlink_outside_the_repository_is_rejected(self):
        outside = Path(self.root).parent / "fuera.md"
        outside.write_text("---\nname: requisitos\ndescription: externa\n---\n", encoding="utf-8")
        path = self.root / ".claude/skills/requisitos/SKILL.md"
        path.unlink()
        path.symlink_to(outside)
        self.assertProblem("apunta fuera de la raíz")

    # Modo --project

    def test_project_mode_requires_prd_and_sprint(self):
        errors = self.check(project=True)
        self.assertTrue(any("PRD.md: falta el archivo" in e for e in errors))
        self.assertTrue(any("sprint_actual.md: falta el archivo" in e for e in errors))
        self.project_inputs()
        self.assertEqual(self.check(project=True), [])

    def test_project_mode_reports_incomplete_stories(self):
        self.project_inputs(PRD.replace("2. **Error / validación**:", "2. **Otro escenario**:"))
        self.assertProblem("falta escenario obligatorio", project=True)

    # CLI

    def test_cli_exit_codes_and_messages(self):
        ok = self.run_cli()
        self.assertEqual(ok.returncode, 0, ok.stderr)
        self.assertIn("Validación local correcta", ok.stdout)
        self.registry_path.write_text("{roto", encoding="utf-8")
        bad = self.run_cli()
        self.assertEqual(bad.returncode, 1)
        self.assertIn("Validación fallida", bad.stderr)
        self.assertNotIn("Traceback", bad.stderr)

    def test_cli_project_mode_reports_missing_inputs(self):
        result = self.run_cli("--project")
        self.assertEqual(result.returncode, 1)
        self.assertIn("PRD.md", result.stderr)
        self.project_inputs()
        result = self.run_cli("--project")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("flujo y proyecto", result.stdout)

    def run_cli(self, *args):
        return subprocess.run([sys.executable, str(SOURCE / "scripts/validate_squad.py"),
                               "--root", str(self.root), *args],
                              capture_output=True, text=True, check=False)


if __name__ == "__main__":
    unittest.main()
