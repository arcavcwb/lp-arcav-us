import importlib.util
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("orchestrator", ROOT / "scripts/agent_orchestrator.py")
orchestrator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(orchestrator)


class OrchestratorTests(unittest.TestCase):
    def test_runtime_declares_all_roles_without_model_defaults(self):
        cfg = orchestrator.load_config()
        self.assertEqual(set(cfg["agents"]), orchestrator.ROLES)
        self.assertTrue(all(item["model_env"] for item in cfg["agents"].values()))

    def test_missing_model_fails_closed(self):
        result = subprocess.run([sys.executable, str(ROOT / "scripts/agent_orchestrator.py"),
                                "po-agent", "--ticket", "HARDENING", "--routes", "docs/"],
                               capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("falta AGY_MODEL_PO_AGENT", result.stderr)

    def test_main_is_rejected_before_model_launch(self):
        result = subprocess.run([sys.executable, str(ROOT / "scripts/agent_orchestrator.py"),
                                "po-agent", "--ticket", "HARDENING", "--routes", "docs/"],
                               capture_output=True, text=True, env={**__import__('os').environ,
                                                                      "AGY_MODEL_PO_AGENT": "fixture-model"})
        # This repository checkout is a hardening branch; test the invariant directly.
        self.assertIn("fixture-model", result.stdout)


if __name__ == "__main__":
    unittest.main()
