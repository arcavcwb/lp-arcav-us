#!/usr/bin/env python3
"""Diagnostica la fase del flujo Claude Code con evidencia local.

Comprueba la estructura del PRD, la aprobación humana registrada y las
declaraciones de handoff.json y candidate.json. No lanza agentes, no consulta
Vikunja, no registra aprobaciones por su cuenta y no despliega.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import sys

# Admite ejecución por CLI y la carga con importlib de los tests.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from handoff import CANDIDATE_ROLES, ROLES, check_preconditions, load_evidence, specified  # noqa: E402

HUMANO = "HUMANO"
# Registro complementario de aprobaciones vinculadas al SHA-256 de PRD.md.
APPROVALS_DIR = Path("docs/aprobaciones")

# Claves alineadas con .claude/workflows/entrega-historia.js. Los alias se
# buscan en el título del escenario (texto antes de ":").
SCENARIOS = [
    ("camino_feliz", ("camino feliz", "camino ideal", "flujo ideal", "happy path")),
    ("error_validacion", ("error", "validación", "validacion", "sad path", "fallo")),
    ("caso_limite", ("caso límite", "caso limite", "límite", "limite", "edge case", "borde",
                     "tiempo", "concurrencia")),
    ("estado_vacio_carga", ("estado vacío", "estado vacio", "vacío", "vacio", "carga",
                            "loading", "empty")),
]
_ALIASES = sorted({alias for _, aliases in SCENARIOS for alias in aliases}, key=len, reverse=True)
SCENARIO_HEADING = re.compile(
    r"^(?:\d+[.)]\s*)?(?:%s)(?:\s*[(/:\-–—].*)?$" % "|".join(re.escape(a) for a in _ALIASES)
)
HEADING = re.compile(r"^[ \t]{0,3}(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$")
STORY_ID = re.compile(r"^\[?(?:US|HU|HISTORIA|STORY)-", re.IGNORECASE)
SCENARIO_ITEM = re.compile(r"(?m)^[ \t]*(?:#{1,6}[ \t]+)?\d+[.)](?:[ \t]+|$)")
GIVEN_WHEN_THEN = re.compile(
    r"\b(?:dado|dada|dados|dadas|given)\b.+?\b(?:cuando|when)\b.+?\b(?:entonces|then)\b.+", re.S
)
PHASES = {
    "producto": "2_PLANIFICACION",
    "integraciones": "3_IMPLEMENTACION",
    "frontend": "3_IMPLEMENTACION",
    "qa-revisor": "4_QA",
    "release": "5_RELEASE",
}


def _clean(text):
    return re.sub(r"[*`_]", "", text).strip().lower()


def _is_scenario_heading(text):
    return bool(SCENARIO_HEADING.match(_clean(text)))


def story_blocks(content):
    """Devuelve el texto de cada historia ### [US-xx].

    La sección de una historia termina en la siguiente historia o en el
    siguiente encabezado de nivel 1 a 3 que no sea de escenario, para que las
    listas numeradas de secciones posteriores (por ejemplo "Métricas de
    éxito") no se cuenten como escenarios de la última historia.
    """
    blocks = []
    current = None
    fence = None
    for line in content.splitlines():
        stripped = line.lstrip()
        marker = stripped[:3]
        if marker in ("```", "~~~"):
            fence = None if fence == marker else (fence or marker)
        heading = HEADING.match(line) if fence is None else None
        if heading:
            level, text = len(heading.group(1)), heading.group(2)
            if level == 3 and STORY_ID.match(text):
                current = [line]
                blocks.append(current)
                continue
            if level <= 3 and current is not None and not _is_scenario_heading(text):
                current = None
                continue
        if current is not None:
            current.append(line)
    return ["\n".join(block) for block in blocks]


def scenario_keys(title):
    title = _clean(title)
    return {key for key, aliases in SCENARIOS if any(alias in title for alias in aliases)}


def check_prd_text(content):
    if not content.strip() or "Pendiente de brief" in content:
        return False, ["El PRD está en borrador o pendiente de brief."]
    blocks = story_blocks(content)
    if not blocks:
        return False, ["No se detectaron historias identificables (ejemplo: ### [US-01] Título)."]
    errors = []
    for block in blocks:
        header = block.strip().splitlines()[0].strip()
        # Control estructural local, no un analizador Gherkin completo.
        clean = re.sub(r"[*`_]", "", block.lower())
        items = SCENARIO_ITEM.split(clean)[1:]
        for key, _ in SCENARIOS:
            matches = []
            for item in items:
                first_line = (item.splitlines() or [""])[0]
                if key in scenario_keys(first_line.split(":", 1)[0]):
                    matches.append(item)
            if not matches:
                errors.append(f"{header}: falta escenario obligatorio '{key}'.")
                continue
            if len(matches) > 1:
                errors.append(f"{header}: escenario '{key}' repetido ({len(matches)} veces).")
                continue
            body = matches[0]
            if not GIVEN_WHEN_THEN.search(body):
                errors.append(f"{header}/{key}: requiere Dado, Cuando y Entonces en orden y con contenido.")
            if re.search(r"\[[^\]]+\]", body):
                errors.append(f"{header}/{key}: reemplaza los campos de ejemplo entre corchetes.")
    return not errors, errors


def check_prd_gherkin(prd_path):
    prd_path = Path(prd_path)
    if not prd_path.is_file():
        return False, [f"No se encontró el archivo {prd_path}"]
    try:
        content = prd_path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        return False, [f"No se pudo leer {prd_path}: {exc}"]
    return check_prd_text(content)


def prd_header(content):
    """Lee Estado, Revisión y la línea de aprobación de la cabecera de PRD.md."""
    header = {}
    for line in content.splitlines():
        if re.match(r"^[ \t]{0,3}##[ \t]", line):
            break
        plain = re.sub(r"[*`]", "", line).strip()
        match = re.match(r"^(Estado|Revisión|Revision|Aprobación humana[^:]*|Aprobacion humana[^:]*)\s*:\s*(.*)$",
                         plain, re.IGNORECASE)
        if not match:
            continue
        key = match.group(1).lower()
        key = "aprobacion" if key.startswith("aprob") else ("estado" if key == "estado" else "revision")
        header.setdefault(key, match.group(2).strip())
    return header


def header_approval(content):
    header = prd_header(content)
    if header.get("estado", "").lower() != "aprobado":
        return False, "La cabecera de PRD.md no tiene 'Estado: aprobado'."
    line = header.get("aprobacion", "")
    if not specified(line) or line.lower().startswith("pendiente"):
        return False, "Falta la línea de aprobación humana (persona, fecha UTC, alcance y commit o hash)."
    return True, line


def prd_digest(root):
    return hashlib.sha256((root / "PRD.md").read_bytes()).hexdigest()


def approval_path(root, digest):
    return root / APPROVALS_DIR / f"prd-{digest}.json"


def _safe_under_root(root, path):
    root = root.resolve()
    for part in [path, *path.parents]:
        if part == root:
            break
        if part.is_symlink():
            return False
    return path.resolve().is_relative_to(root)


def _valid_record(path, digest):
    try:
        data = load_evidence(path.read_text(encoding="utf-8"))
        date = datetime.fromisoformat(data.get("recorded_at", ""))
    except (OSError, UnicodeError, ValueError, TypeError):
        return False
    return (data.get("document") == "PRD.md" and data.get("sha256") == digest
            and data.get("status") == "approved" and date.tzinfo is not None
            and all(specified(data.get(k)) for k in ("person", "scope", "evidence")))


def approval_status(root):
    """Devuelve (aprobado, detalle).

    El registro principal es la cabecera de PRD.md. Si además existen
    registros de approve-prd, uno debe corresponder al contenido actual: un
    PRD editado después de registrar su hash exige una aprobación nueva.
    """
    root = Path(root).resolve()
    content = (root / "PRD.md").read_text(encoding="utf-8")
    ok, detail = header_approval(content)
    if not ok:
        return False, detail
    directory = root / APPROVALS_DIR
    if not directory.exists() and not directory.is_symlink():
        return True, f"Aprobación registrada en la cabecera: {detail}"
    if not _safe_under_root(root, directory) or not directory.is_dir():
        return False, f"{APPROVALS_DIR} debe ser un directorio del repositorio sin enlaces simbólicos."
    records = sorted(directory.glob("prd-*.json"))
    if not records:
        return True, f"Aprobación registrada en la cabecera: {detail}"
    digest = prd_digest(root)
    path = approval_path(root, digest)
    if path not in records:
        return False, ("PRD.md cambió después del último registro de aprobación en "
                       f"{APPROVALS_DIR}; requiere una aprobación humana nueva.")
    if not _safe_under_root(root, path) or not _valid_record(path, digest):
        return False, f"Registro de aprobación inválido: {path.relative_to(root)}"
    return True, f"Aprobación registrada en la cabecera y vinculada al SHA-256 {digest[:12]}."


def valid_approval(root):
    try:
        return approval_status(root)[0]
    except (OSError, UnicodeError, ValueError):
        return False


def record_prd_approval(root, person, scope, evidence):
    """Deja constancia local de una aprobación humana ya otorgada."""
    root = Path(root).resolve()
    if not all(specified(v) for v in (person, scope, evidence)):
        raise ValueError("La aprobación requiere persona, alcance y evidencia explícitos.")
    ok, errors = check_prd_gherkin(root / "PRD.md")
    if not ok:
        raise ValueError("PRD incompleto: " + "; ".join(errors))
    ok, detail = header_approval((root / "PRD.md").read_text(encoding="utf-8"))
    if not ok:
        raise ValueError(f"Registra primero la aprobación en la cabecera de PRD.md. {detail}")
    digest = prd_digest(root)
    path = approval_path(root, digest)
    for parent in [path, *path.parents]:
        if parent == root:
            break
        if parent.is_symlink():
            raise ValueError("La ruta de aprobación no admite enlaces simbólicos.")
    path.parent.mkdir(parents=True, exist_ok=True)
    record = dict(schema_version=1, document="PRD.md", sha256=digest, status="approved",
                  person=person, scope=scope, evidence=evidence,
                  recorded_at=datetime.now(timezone.utc).isoformat())
    # Creación exclusiva: una aprobación del mismo contenido no reemplaza el historial.
    with path.open("x", encoding="utf-8") as handle:
        json.dump(record, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    return path


def detect_phase(root):
    root = Path(root).resolve()
    try:
        prd = root / "PRD.md"
        if not prd.is_file():
            return "1_REQUISITOS", "Falta PRD.md.", "producto"
        ok, errors = check_prd_gherkin(prd)
        if not ok:
            return "1_REQUISITOS", "; ".join(errors), "producto"
        approved, detail = approval_status(root)
        if not approved:
            return "1_GATE_PRD", detail, HUMANO
        entry = root / "handoff.json"
        if not entry.exists():
            return ("2_PLANIFICACION",
                    "PRD aprobado. Planifica en Vikunja (proyecto 2) con tools/vikunja_sync.py y regenera "
                    "sprint_actual.md; este diagnóstico no consulta Vikunja.", "producto")
        raw = entry.read_text(encoding="utf-8")
        data = load_evidence(raw)
        role = data.get("target_role")
        if not isinstance(role, str) or role not in ROLES:
            return "BLOQUEADO", "Destinatario desconocido en handoff.json.", HUMANO
        candidate = {}
        if role in CANDIDATE_ROLES and data.get("phase", "delivery") == "delivery":
            candidate_path = root / "candidate.json"
            if not candidate_path.is_file():
                return "BLOQUEADO", "Falta candidate.json con ticket, revision y qa_run vigentes.", role
            candidate = load_evidence(candidate_path.read_text(encoding="utf-8"))
        ok, errors = check_preconditions(role, raw, revision=candidate.get("revision"),
                                         qa_run=candidate.get("qa_run"), ticket=candidate.get("ticket"))
        if ok and role == "producto":
            revision = data["inputs"]["prd_approval"].get("revision", "")
            approval_line = prd_header(prd.read_text(encoding="utf-8")).get("aprobacion", "")
            if revision != prd_digest(root) and not (len(revision) >= 7 and revision in approval_line):
                errors.append("La entrega de planificación no referencia el commit o hash de la aprobación registrada.")
                ok = False
        if not ok:
            return "BLOQUEADO", "; ".join(errors), role
        if data.get("phase") == "preparation":
            return "PREPARACION", "Entradas declaradas consistentes para preparar pruebas o build; sin despliegue.", role
        return (PHASES[role],
                "Entrega declarada consistente. Verifica fuentes, asignación y activación humana antes de actuar.",
                role)
    except (OSError, UnicodeError, ValueError, TypeError, KeyError, AttributeError) as exc:
        return "BLOQUEADO", f"No se pudo verificar la evidencia: {exc}", HUMANO


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    subparsers = parser.add_subparsers(dest="command")
    subparsers.add_parser("status", help="Diagnóstico local; no confirma estado remoto")
    subparsers.add_parser("check-prd", help="Comprobar la estructura de escenarios; no valida su significado")
    subparsers.add_parser("advance", help="Proponer la siguiente acción; no registra aprobaciones ni invoca agentes")
    approve = subparsers.add_parser(
        "approve-prd",
        help="Registrar una aprobación humana ya otorgada y ya escrita en PRD.md, vinculada a su SHA-256",
    )
    for name in ("person", "scope", "evidence"):
        approve.add_argument("--" + name, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    try:
        if args.command == "approve-prd":
            path = record_prd_approval(root, args.person, args.scope, args.evidence)
            print(f"Registro de aprobación escrito en {path}. No activa la fase siguiente.")
            return 0
        if args.command == "check-prd":
            ok, errors = check_prd_gherkin(root / "PRD.md")
            print("Estructura de escenarios válida; requiere revisión de contenido." if ok else "\n".join(errors))
            return 0 if ok else 1
        phase, detail, actor = detect_phase(root)
        print(f"Fase: {phase}\nDetalle: {detail}\nSiguiente actor propuesto: {actor}")
        if args.command == "advance":
            print("No se registró ninguna aprobación ni se ejecutó una fase.")
            if phase == "1_GATE_PRD":
                print("Aporta la aprobación humana en la cabecera de PRD.md (Estado: aprobado y línea de "
                      "aprobación). Opcional: approve-prd --person ... --scope ... --evidence ...")
        return 1 if phase == "BLOQUEADO" else 0
    except (OSError, UnicodeError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
