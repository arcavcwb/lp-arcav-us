#!/usr/bin/env python3
"""Gate and launch an agyFlow role without silently skipping phases.

The dispatcher never invents model names or credentials. Set the model/session
environment variables named in config/agent-runtime.json and invoke one role at
a time. By default it prints the command; --execute is required to launch agy.
"""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "config/agent-runtime.json"
ROLES = {"po-agent", "scrum-master-agent", "designer-agent", "backend-dev-agent",
         "frontend-dev-agent", "qa-agent", "devops-agent", "automation-agent", "DrBrief84"}


def load_config():
    data = json.loads(CONFIG.read_text(encoding="utf-8"))
    if data.get("schema_version") != 1 or data.get("executor") != "agy":
        raise ValueError("configuración de runtime incompatible")
    if set(data.get("agents", {})) != ROLES:
        raise ValueError("el runtime debe declarar exactamente los roles conocidos")
    return data


def branch():
    return subprocess.check_output(["git", "-C", str(ROOT), "branch", "--show-current"], text=True).strip()


def prompt(role, ticket, routes, context):
    if role == "DrBrief84":
        return "\n".join([
            "Leé AGENTS.md y docs/governance.md.",
            f"Revisá el PR/ticket [{ticket}] y solo el alcance [{routes}] en modo lectura.",
            "Sos DrBrief84, agente revisor independiente; no implementes ni corrijas archivos.",
            "Compará el SHA del PR con el contexto recibido y decidí APPROVED o CHANGES_REQUESTED.",
            "Si la política lo permite, enviá una review de GitHub con tu propia identidad.", context,
        ])
    handoff = ROOT / "scripts/handoff.py"
    command = [sys.executable, str(handoff), "prompt", "--to", role,
               "--ticket", ticket, "--routes", routes, "--session",
               os.environ.get(load_config()["agents"][role]["session_env"], role)]
    if context:
        command += ["--context", context]
    return subprocess.check_output(command, text=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("role", choices=sorted(ROLES))
    parser.add_argument("--ticket", required=True)
    parser.add_argument("--routes", required=True)
    parser.add_argument("--context", default="")
    parser.add_argument("--execute", action="store_true", help="lanzar agy; por defecto solo preparar el handoff")
    args = parser.parse_args()
    try:
        cfg = load_config()
        current = branch()
        if not current or current in {"main", "master"}:
            raise RuntimeError("el dispatcher exige una branch distinta de main/master")
        if args.role in {"frontend-dev-agent", "backend-dev-agent", "designer-agent", "qa-agent", "devops-agent"}:
            gate = subprocess.run([sys.executable, str(ROOT / "scripts/governance_gate.py"), "start"], cwd=ROOT)
            if gate.returncode:
                raise RuntimeError("governance_gate bloqueó la activación")
        spec = cfg["agents"][args.role]
        model = os.environ.get(spec["model_env"], "").strip()
        session = os.environ.get(spec["session_env"], args.role).strip()
        if not model:
            raise RuntimeError(f"falta {spec['model_env']}; no se inventa modelo para {args.role}")
        handoff = prompt(args.role, args.ticket, args.routes, args.context)
        command = ["agy", "--agent", args.role, "--model", model, "--prompt", handoff]
        print(json.dumps({"role": args.role, "model": model, "session": session,
                          "branch": current, "command": command, "execute": args.execute}, ensure_ascii=False, indent=2))
        if not args.execute:
            return 0
        return subprocess.call(command, cwd=ROOT)
    except (OSError, ValueError, RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"BLOCKED: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
