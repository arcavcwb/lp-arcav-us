import importlib.util
import io
import json
from pathlib import Path
import sys
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("orchestrator", ROOT / "scripts/agent_orchestrator.py")
orchestrator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(orchestrator)


class OrchestratorTests(unittest.TestCase):
    def test_runtime_declares_all_roles_with_codex_models(self):
        cfg = orchestrator.load_config()
        self.assertEqual(set(cfg["agents"]), orchestrator.ROLES)
        self.assertTrue(all(item["model"].startswith("gpt-") for item in cfg["agents"].values()))

    def test_declared_codex_model_is_used_by_default(self):
        stdout = io.StringIO()
        argv = ["agent_orchestrator.py", "po-agent", "--ticket", "HARDENING",
                "--routes", "docs/"]
        with mock.patch.object(sys, "argv", argv), \
             mock.patch.object(orchestrator, "branch", return_value="chore/test"), \
             mock.patch.object(orchestrator, "prompt", return_value="handoff"), \
             mock.patch("sys.stdout", stdout):
            result = orchestrator.main()
        self.assertEqual(result, 0)
        self.assertEqual(json.loads(stdout.getvalue())["model"], "gpt-5.6-terra")

    def test_main_is_rejected_before_model_launch(self):
        stderr = io.StringIO()
        argv = ["agent_orchestrator.py", "po-agent", "--ticket", "HARDENING",
                "--routes", "docs/"]
        with mock.patch.object(sys, "argv", argv), \
             mock.patch.object(orchestrator, "branch", return_value="main"), \
             mock.patch.object(orchestrator, "prompt") as prompt, \
             mock.patch("sys.stderr", stderr):
            result = orchestrator.main()
        self.assertEqual(result, 1)
        self.assertIn("branch distinta de main/master", stderr.getvalue())
        prompt.assert_not_called()


if __name__ == "__main__":
    unittest.main()
