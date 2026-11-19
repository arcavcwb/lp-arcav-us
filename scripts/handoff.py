#!/usr/bin/env python3
"""Asiste los traspasos entre los roles del flujo Claude Code de lp-arcav-us.

Genera encargos compactos, comprueba evidencias JSON con la forma de
templates/handoff.json y emite templates/entrega.md. No lanza agentes, no
consulta Vikunja ni despliega: un OK es una comprobación local de
declaraciones, no una autorización.
"""

import argparse
import json
from pathlib import Path
import re
import sys

# Slugs de los subagentes (.claude/agents/<rol>.md). Deben coincidir con
# config/skills.json; scripts/validate_squad.py lo comprueba.
ROLES = ("producto", "frontend", "integraciones", "qa-revisor", "release")

# Evidencias locales requeridas por rol en la fase "delivery". Son campos de
# templates/handoff.json, no campos de la API de Vikunja ni de Claude Code.
PRECONDITIONS = {
    "producto": ["prd_approval", "vikunja"],
    "frontend": ["architecture", "ticket", "contracts", "design"],
    "integraciones": ["architecture", "ticket"],
    "qa-revisor": ["architecture", "ticket", "candidate", "criteria", "environment", "tests"],
    "release": ["architecture", "ticket", "qa", "artifact"],
}

# Roles que trabajan sobre una candidata identificada (commit + ejecución QA).
CANDIDATE_ROLES = {"qa-revisor", "release"}
# Entradas que pueden declararse "not_applicable" con motivo.
OPTIONAL_INPUTS = {"contracts", "design"}
# Entradas cuyo estado válido es "approved" en lugar de "ready".
APPROVAL_INPUTS = {"qa", "prd_approval"}
PREPARATION_INPUTS = ["architecture", "ticket"]
UNSPECIFIED = {"pendiente", "por asignar", "por definir", "unknown", "todo", "tbd"}


def load_evidence(text):
    """Carga un objeto JSON con schema_version 1 y sin claves duplicadas."""
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"Campo JSON duplicado: {key}")
            result[key] = value
        return result

    try:
        data = json.loads(text, object_pairs_hook=unique)
    except (ValueError, TypeError) as exc:
        raise ValueError(
            "Se requiere evidencia JSON explícita; el texto libre no acredita precondiciones."
        ) from exc
    if not isinstance(data, dict) or type(data.get("schema_version")) is not int or data["schema_version"] != 1:
        raise ValueError("Se requiere un objeto con schema_version: 1.")
    return data


def specified(value):
    return (isinstance(value, str) and bool(value.strip())
            and value.strip().lower() not in UNSPECIFIED)


def build_prompt(target_role, ticket, routes, from_role=None, session="principal",
                 other_session="Ninguna asignada", context=None):
    if target_role not in ROLES:
        raise ValueError(f"Rol desconocido: {target_role}. Roles válidos: {', '.join(ROLES)}")
    if not specified(ticket) or not specified(routes):
        raise ValueError("El encargo requiere tarea y rutas de escritura identificables.")

    lines = [
        f"Lee CLAUDE.md, .claude/agents/{target_role}.md y las skills declaradas en su frontmatter.",
        "Aplica docs/context-strategy.md y consulta solo las secciones relevantes de docs/protocolo.md y docs/stack.md.",
        f"Tu rol asignado es [{target_role}].",
        f"Ejecuta la tarea de tu rol para [{ticket}] en el alcance asignado: [{routes}].",
        f"Tu etiqueta de sesión es [{session}]. La otra sesión tiene asignado: [{other_session}].",
    ]
    if from_role:
        lines.append(f"Entrega previa procedente de: [{from_role}].")
    if context:
        lines.append(f"Contexto o revisión de entrada:\n{context.strip()}")
    lines.extend([
        "Verifica las entradas de la fase y los contratos existentes antes de editar; lo no verificado se reporta como bloqueo.",
        "Al terminar, entrega una respuesta compacta con el formato de templates/entrega.md (commits, archivos afectados, comprobaciones, bloqueos y pendientes), sin copiar documentos ni conversaciones completas.",
        "No actives por tu cuenta la fase siguiente.",
    ])
    return "\n".join(lines)


def check_preconditions(role, text, *, revision=None, qa_run=None, ticket=None):
    if role not in ROLES:
        return False, [f"Rol desconocido: {role}"]
    try:
        data = load_evidence(text)
    except ValueError as exc:
        return False, [str(exc)]
    errors = []
    if data.get("target_role") != role:
        errors.append("target_role no coincide con el destinatario.")
    if not specified(data.get("ticket")):
        errors.append("Falta ticket o identificador del encargo.")
    if ticket is not None and data.get("ticket") != ticket:
        errors.append("El ticket no coincide con la candidata vigente.")
    if not specified(data.get("revision")):
        errors.append("Falta revisión de entrada.")
    inputs = data.get("inputs")
    if not isinstance(inputs, dict):
        return False, errors + ["inputs debe ser un objeto."]
    phase = data.get("phase", "delivery")
    if (not isinstance(phase, str) or phase not in {"delivery", "preparation"}
            or (phase == "preparation" and role not in CANDIDATE_ROLES)):
        return False, errors + ["phase inválida para el rol."]
    required = PREPARATION_INPUTS if phase == "preparation" else PRECONDITIONS[role]
    for name in required:
        item = inputs.get(name)
        if not isinstance(item, dict):
            errors.append(f"Falta evidencia: {name}.")
            continue
        if name in OPTIONAL_INPUTS and item.get("status") == "not_applicable":
            if not specified(item.get("reason")):
                errors.append(f"{name}: no aplica requiere motivo.")
            continue
        expected = "approved" if name in APPROVAL_INPUTS else "ready"
        if item.get("status") != expected:
            errors.append(f"{name}: estado requerido {expected}; recibido {item.get('status')!r}.")
        if not specified(item.get("reference")) or not specified(item.get("revision")):
            errors.append(f"{name}: requiere reference y revision identificables.")
    # Se compara con una candidata independiente aportada por quien llama,
    # nunca con un reporte antiguo escrito en prosa.
    if phase == "delivery" and role in CANDIDATE_ROLES:
        if not specified(revision) or not specified(qa_run) or not specified(ticket):
            errors.append("Se requiere candidata externa: ticket, revision y qa_run vigentes.")
        if data.get("revision") != revision or data.get("qa_run") != qa_run:
            errors.append("Revisión o ejecución QA desactualizada.")
        for name in (["qa", "artifact"] if role == "release" else ["candidate"]):
            item = inputs.get(name, {})
            if not isinstance(item, dict):
                continue
            if item.get("revision") != revision:
                errors.append(f"{name}: no corresponde a la revisión candidata.")
            if name == "qa":
                if item.get("qa_run") != qa_run:
                    errors.append("qa: ejecución desactualizada.")
                if item.get("pending_checks") != [] or item.get("blockers") != []:
                    errors.append("qa: declara listas vacías de pending_checks y blockers para entregar.")
    return not errors, errors


def get_template(role=None, session="principal"):
    if role is not None and role not in ROLES:
        raise ValueError(f"Rol desconocido: {role}. Roles válidos: {', '.join(ROLES)}")
    template_path = Path(__file__).resolve().parents[1] / "templates/entrega.md"
    content = template_path.read_text(encoding="utf-8") if template_path.is_file() else ""
    if role:
        content = re.sub(r"(?m)^- Rol\b[^:\n]*:.*$",
                         lambda _: f"- Rol: {role} (sesión {session})", content, count=1)
    return content


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    prompt_parser = subparsers.add_parser("prompt", help="Generar el encargo compacto para un rol")
    prompt_parser.add_argument("--to", required=True, dest="target_role", choices=ROLES, help="Rol destinatario")
    prompt_parser.add_argument("--ticket", required=True, help="Historia y tarea de Vikunja (ID o enlace)")
    prompt_parser.add_argument("--routes", required=True, help="Rutas de escritura asignadas al rol")
    prompt_parser.add_argument("--from", dest="from_role", default=None, help="Rol que hizo la entrega previa")
    prompt_parser.add_argument("--session", default="principal", help="Etiqueta de la sesión actual")
    prompt_parser.add_argument("--other-session", default="Ninguna asignada", help="Alcance de la sesión paralela")
    prompt_parser.add_argument("--context", default=None, help="Contexto adicional o entregas previas")

    check_parser = subparsers.add_parser("check", help="Verificar precondiciones de entrada para un rol")
    check_parser.add_argument("--role", required=True, choices=ROLES, help="Rol que se quiere activar")
    check_parser.add_argument("--input", dest="input_file", help="Archivo JSON de evidencias; por defecto stdin")
    check_parser.add_argument("--revision", help="Commit candidato vigente (qa-revisor y release)")
    check_parser.add_argument("--qa-run", help="Ejecución QA vigente")
    check_parser.add_argument("--ticket", help="Ticket de la candidata vigente")

    template_parser = subparsers.add_parser("template", help="Emitir templates/entrega.md prerrellenado")
    template_parser.add_argument("--role", default=None, choices=ROLES, help="Rol que entrega")
    template_parser.add_argument("--session", default="principal", help="Etiqueta de sesión")

    args = parser.parse_args()

    if args.command == "prompt":
        try:
            print(build_prompt(args.target_role, args.ticket, args.routes, from_role=args.from_role,
                               session=args.session, other_session=args.other_session, context=args.context))
        except ValueError as err:
            print(f"ERROR: {err}", file=sys.stderr)
            return 1
    elif args.command == "check":
        try:
            content = (Path(args.input_file).read_text(encoding="utf-8")
                       if args.input_file else sys.stdin.read())
        except (OSError, UnicodeError) as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            return 1
        ok, errors = check_preconditions(args.role, content, revision=args.revision,
                                         qa_run=args.qa_run, ticket=args.ticket)
        if not ok:
            for err in errors:
                print(f"ERROR: {err}", file=sys.stderr)
            return 1
        print(f"OK: declaraciones consistentes para {args.role}; verifica fuentes y permisos antes de actuar.")
    elif args.command == "template":
        try:
            print(get_template(role=args.role, session=args.session))
        except (OSError, UnicodeError, ValueError) as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
