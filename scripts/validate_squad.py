#!/usr/bin/env python3
"""Valida la estructura del flujo Claude Code de lp-arcav-us.

Sin red, sin credenciales y sin escribir archivos. Modo por defecto: CLAUDE.md,
subagentes, skills, workflows, config/skills.json, .claude/settings.json,
workflows de GitHub y referencias obsoletas. Con --project comprueba además
PRD.md (4 escenarios por historia) y sprint_actual.md.
"""

import argparse
import json
import os
from pathlib import Path
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))

ROLES = ("producto", "frontend", "integraciones", "qa-revisor", "release")
REGISTRY = "config/skills.json"
REGISTRY_VERSION = 2
CLAUDE_MD_MAX_LINES = 200
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
TRUE_VALUES = {"true", "yes", "on"}

REQUIRED_FILES = (
    "CLAUDE.md", "README.md",
    "docs/protocolo.md", "docs/skills.md", "docs/stack.md", "docs/context-strategy.md",
    "docs/herramientas-locales.md", "docs/claude-pr-review.md", "docs/vikunja.md",
    "templates/PRD.md", "templates/sprint_actual.md", "templates/bug_report.md",
    "templates/entrega.md", "templates/handoff.json", "templates/candidate.json",
    "templates/project_setup.md",
)

# Restos de la plantilla anterior que no deben volver.
RETIRED_PATHS = (
    ".agents", "AGENTS.md", "tools/ai-pr-reviewer", ".github/workflows/ai-pr-review.yml",
    "docs/agy-codex.md", "docs/ai-pr-reviewer.md", "docs/demo-flujo.html",
    "scripts/setup_receiver.py", "scripts/demo_workflow.py",
)

OBSOLETE_TERMS = (
    ("agy/agyFlow", re.compile(r"\bagy(?:flow)?\b", re.IGNORECASE)),
    ("Antigravity", re.compile(r"\bantigravity\b", re.IGNORECASE)),
    ("Codex", re.compile(r"\bcodex\b", re.IGNORECASE)),
    ("Plane", re.compile(r"\bPlane\b|\bplane\.so\b")),
    (".agents/", re.compile(r"(?<![\w-])\.agents/")),
    ("AGENTS.md", re.compile(r"\bAGENTS\.md\b")),
    ("rol antiguo *-agent", re.compile(
        r"\b(?:po|qa|devops|scrum-master|designer|backend-dev|frontend-dev|automation)-agent\b")),
    ("revisor Gemini", re.compile(r"\bai-pr-review(?:er)?\b|\bGEMINI_API_KEY\b")),
    ("mcp_config", re.compile(r"\bmcp_config\b")),
)
# Archivos donde se buscan referencias obsoletas. docs/vikunja.md y
# docs/claude-pr-review.md quedan fuera: documentan el mapeo de etiquetas
# antiguas y la retirada del revisor anterior.
OBSOLETE_SCAN_FILES = (
    "CLAUDE.md", "README.md", "docs/protocolo.md", "docs/skills.md", "docs/context-strategy.md",
    "docs/stack.md", "docs/herramientas-locales.md", "docs/diagrams/README.md",
    REGISTRY, ".claude/settings.json", ".pre-commit-config.yaml",
)
OBSOLETE_SCAN_DIRS = (".claude/agents", ".claude/skills", ".claude/workflows", "templates", ".github/workflows")
TEXT_SUFFIXES = {".md", ".js", ".mjs", ".json", ".yml", ".yaml", ".txt"}
# Una línea que declara explícitamente herramientas retiradas u obsoletas puede nombrarlas.
OBSOLETE_EXEMPT_LINE = re.compile(r"retirad|obsolet", re.IGNORECASE)

BINARY_DIAGRAM = re.compile(r"docs/diagrams/[^\s`'\"]*\.(?:excalidraw|svg|png)", re.IGNORECASE)
NON_DETERMINISTIC = (("Date.now()", re.compile(r"\bDate\.now\s*\(")),
                     ("Math.random()", re.compile(r"\bMath\.random\s*\(")),
                     ("new Date()", re.compile(r"\bnew\s+Date\s*\(")))
BLOCK_SCALARS = {"|", "|-", "|+", ">", ">-", ">+"}


class Context:
    """Lectura confinada a la raíz y acumulación de errores."""

    def __init__(self, root):
        self.root = root.resolve()
        self.errors = []

    def error(self, message):
        self.errors.append(message)

    def path(self, relative):
        return self.root / relative

    def exists(self, relative):
        return os.path.lexists(self.path(relative))

    def inside(self, relative):
        try:
            return self.path(relative).resolve().is_relative_to(self.root)
        except (OSError, RuntimeError):
            return False

    def read(self, relative, required=True):
        path = self.path(relative)
        if not os.path.lexists(path):
            if required:
                self.error(f"{relative}: falta el archivo")
            return None
        if not self.inside(relative):
            self.error(f"{relative}: apunta fuera de la raíz del repositorio")
            return None
        try:
            content = path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            self.error(f"{relative}: no se pudo leer ({exc})")
            return None
        if not content.strip():
            self.error(f"{relative}: archivo vacío")
            return None
        return content


def _unquote(value):
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    # Comentario al final de un escalar plano: `valor  # comentario`.
    return re.sub(r"[ \t]+#.*$", "", value)


def parse_frontmatter(content):
    """Lee el subconjunto de YAML que usan subagentes y skills.

    Admite escalares (planos o entre comillas), listas en bloque (`- item`),
    listas en línea (`[a, b]`) y escalares en bloque (`|` o `>`). Los mapas
    anidados (por ejemplo `hooks:` o `mcpServers:`) se aceptan sin
    interpretarlos y quedan como {}. Devuelve (campos, errores); campos es
    None si no hay frontmatter delimitado.
    """
    content = content.lstrip("\ufeff")
    match = re.match(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)", content, re.S)
    if not match:
        return None, ["falta frontmatter delimitado por ---"]
    fields, errors = {}, []
    lines = match.group(1).splitlines()
    index, current_key, item_indent = 0, None, None
    while index < len(lines):
        line = lines[index]
        index += 1
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if current_key is not None:
            value = fields[current_key]
            item = re.match(r"^([ \t]*)-(?:[ \t]+(.*))?$", line)
            if item and isinstance(value, list) and item_indent in (None, len(item.group(1))):
                item_indent = len(item.group(1))
                value.append(_unquote(item.group(2) or ""))
                continue
            if line[:1] in " \t":
                # Contenido anidado (mapa o elementos compuestos): no se interpreta.
                if isinstance(value, list) and not value:
                    fields[current_key] = {}
                continue
        key_match = re.match(r"^([A-Za-z][A-Za-z0-9_-]*)[ \t]*:(?:[ \t]+(.*))?[ \t]*$", line)
        current_key, item_indent = None, None
        if not key_match:
            errors.append(f"línea de frontmatter no reconocida: {line.strip()!r}")
            continue
        key, value = key_match.group(1), (key_match.group(2) or "").strip()
        if key in fields:
            errors.append(f"campo duplicado en frontmatter: {key}")
        if not value or value.startswith("#"):
            fields[key] = []
            current_key = key
        elif value in BLOCK_SCALARS:
            block = []
            while index < len(lines) and (not lines[index].strip() or lines[index][:1] in " \t"):
                block.append(lines[index].strip())
                index += 1
            joiner = "\n" if value.startswith("|") else " "
            fields[key] = joiner.join(block).strip()
        elif value.startswith("[") and value.endswith("]"):
            inner = value[1:-1].strip()
            fields[key] = [_unquote(part) for part in inner.split(",")] if inner else []
        else:
            if value[0] not in "\"'" and (": " in value or value.endswith(":")):
                errors.append(f"{key}: valor con ': ' sin comillas (YAML inválido)")
            fields[key] = _unquote(value)
    return fields, errors


def _frontmatter(ctx, relative, content):
    fields, errors = parse_frontmatter(content)
    for message in errors:
        ctx.error(f"{relative}: {message}")
    return fields


def _is_true(value):
    return isinstance(value, str) and value.strip().lower() in TRUE_VALUES


def _non_empty_str(value):
    return isinstance(value, str) and bool(value.strip())


def validate_claude_md(ctx):
    content = ctx.read("CLAUDE.md")
    if content is None:
        return
    lines = len(content.splitlines())
    if lines >= CLAUDE_MD_MAX_LINES:
        ctx.error(f"CLAUDE.md: tiene {lines} líneas; debe quedar por debajo de {CLAUDE_MD_MAX_LINES}")
    for role in ROLES:
        if f"`{role}`" not in content:
            ctx.error(f"CLAUDE.md: no menciona el rol `{role}`")
    if "docs/protocolo.md" not in content:
        ctx.error("CLAUDE.md: falta referencia a docs/protocolo.md")


def load_registry(ctx):
    raw = ctx.read(REGISTRY)
    if raw is None:
        return None
    try:
        registry = json.loads(raw)
    except json.JSONDecodeError as exc:
        ctx.error(f"{REGISTRY}: JSON inválido ({exc.msg}, línea {exc.lineno})")
        return None
    if not isinstance(registry, dict):
        ctx.error(f"{REGISTRY}: se requiere un objeto JSON")
        return None
    version = registry.get("version")
    if type(version) is not int or version != REGISTRY_VERSION:
        ctx.error(f"{REGISTRY}: version debe ser {REGISTRY_VERSION}")
    unknown = sorted(set(registry) - {"version", "roles", "user_skills", "workflows"})
    if unknown:
        ctx.error(f"{REGISTRY}: claves desconocidas: {', '.join(unknown)}")

    roles = registry.get("roles")
    if not isinstance(roles, dict):
        ctx.error(f"{REGISTRY}: roles debe ser un objeto")
        roles = {}
    missing, extra = sorted(set(ROLES) - set(roles)), sorted(set(roles) - set(ROLES))
    if missing:
        ctx.error(f"{REGISTRY}: faltan roles: {', '.join(missing)}")
    if extra:
        ctx.error(f"{REGISTRY}: roles desconocidos: {', '.join(extra)}")
    clean_roles = {}
    for role in ROLES:
        entry = roles.get(role)
        if role not in roles:
            continue
        if not isinstance(entry, dict):
            ctx.error(f"{REGISTRY}: la entrada del rol {role} debe ser un objeto")
            continue
        expected_agent = f".claude/agents/{role}.md"
        if entry.get("agent") != expected_agent:
            ctx.error(f"{REGISTRY}: roles.{role}.agent debe ser {expected_agent}")
        skills = entry.get("skills")
        if (not isinstance(skills, list) or not skills
                or not all(isinstance(s, str) and SLUG.fullmatch(s) for s in skills)):
            ctx.error(f"{REGISTRY}: roles.{role}.skills debe ser una lista no vacía de slugs")
            continue
        if len(set(skills)) != len(skills):
            ctx.error(f"{REGISTRY}: roles.{role}.skills tiene duplicados")
        clean_roles[role] = skills

    user_skills = registry.get("user_skills")
    if (not isinstance(user_skills, list)
            or not all(isinstance(s, str) and SLUG.fullmatch(s) for s in user_skills)):
        ctx.error(f"{REGISTRY}: user_skills debe ser una lista de slugs")
        user_skills = []
    elif len(set(user_skills)) != len(user_skills):
        ctx.error(f"{REGISTRY}: user_skills tiene duplicados")
    role_skills = {s for skills in clean_roles.values() for s in skills}
    for skill in sorted(role_skills & set(user_skills)):
        ctx.error(f"{REGISTRY}: {skill} figura como skill de rol y de usuario")

    workflows = registry.get("workflows")
    if not isinstance(workflows, list) or not all(isinstance(w, str) for w in workflows):
        ctx.error(f"{REGISTRY}: workflows debe ser una lista de rutas")
        workflows = []
    elif len(set(workflows)) != len(workflows):
        ctx.error(f"{REGISTRY}: workflows tiene duplicados")
    return clean_roles, user_skills, workflows


def validate_agents(ctx, roles):
    for role, skills in roles.items():
        relative = f".claude/agents/{role}.md"
        content = ctx.read(relative)
        if content is None:
            continue
        fields = _frontmatter(ctx, relative, content)
        if fields is None:
            continue
        if fields.get("name") != role:
            ctx.error(f"{relative}: name debe ser {role}")
        if not _non_empty_str(fields.get("description")):
            ctx.error(f"{relative}: falta description")
        declared = fields.get("skills")
        if isinstance(declared, str):
            # Admite también la forma separada por comas, como el campo tools.
            declared = [part.strip() for part in declared.split(",") if part.strip()]
        if declared != skills:
            ctx.error(f"{relative}: skills del frontmatter {declared!r} no coincide con {REGISTRY} {skills!r}")
        if BINARY_DIAGRAM.search(content):
            ctx.error(f"{relative}: exige un diagrama binario como contexto operativo")
    directory = ctx.path(".claude/agents")
    if directory.is_dir():
        for path in sorted(directory.glob("*.md")):
            if path.stem not in ROLES:
                ctx.error(f".claude/agents/{path.name}: subagente no registrado en {REGISTRY}")


def _validate_skill(ctx, skill, user_skill):
    relative = f".claude/skills/{skill}/SKILL.md"
    content = ctx.read(relative)
    if content is None:
        return
    fields = _frontmatter(ctx, relative, content)
    if fields is None:
        return
    if fields.get("name") != skill:
        ctx.error(f"{relative}: name debe ser {skill}")
    if not _non_empty_str(fields.get("description")):
        ctx.error(f"{relative}: falta description")
    disabled = _is_true(fields.get("disable-model-invocation"))
    if user_skill and not disabled:
        ctx.error(f"{relative}: una skill de usuario requiere disable-model-invocation: true")
    if not user_skill and disabled:
        ctx.error(f"{relative}: una skill de rol no puede usar disable-model-invocation: true "
                  "(impide precargarla en el subagente)")
    if BINARY_DIAGRAM.search(content):
        ctx.error(f"{relative}: exige un diagrama binario como contexto operativo")


def validate_skills(ctx, roles, user_skills):
    role_skills = {s for skills in roles.values() for s in skills}
    for skill in sorted(role_skills):
        _validate_skill(ctx, skill, user_skill=False)
    for skill in user_skills:
        _validate_skill(ctx, skill, user_skill=True)
    directory = ctx.path(".claude/skills")
    if directory.is_dir():
        registered = role_skills | set(user_skills)
        for path in sorted(p for p in directory.iterdir() if p.is_dir()):
            if path.name not in registered:
                ctx.error(f".claude/skills/{path.name}: skill no registrada en {REGISTRY}")


def _strip_js_comments(content):
    content = re.sub(r"(?ms)^[ \t]*/\*.*?\*/", "", content)
    return re.sub(r"(?m)^[ \t]*//.*$", "", content)


def validate_workflows(ctx, workflows):
    for relative in workflows:
        match = re.fullmatch(r"\.claude/workflows/([a-z0-9]+(?:-[a-z0-9]+)*)\.js", relative)
        if not match:
            ctx.error(f"{REGISTRY}: ruta de workflow inválida: {relative}")
            continue
        slug = match.group(1)
        content = ctx.read(relative)
        if content is None:
            continue
        first = next((line for line in content.lstrip("\ufeff").splitlines() if line.strip()), "")
        if not first.startswith("export const meta"):
            ctx.error(f"{relative}: debe empezar con export const meta")
        meta = re.search(r"^export const meta\s*=\s*\{(.*?)^\}", content, re.S | re.M)
        if not meta:
            ctx.error(f"{relative}: no se encontró el objeto meta")
        else:
            body = meta.group(1)
            name = re.search(r"^\s*name\s*:\s*(['\"`])([^'\"`]*)\1", body, re.M)
            if not name or name.group(2) != slug:
                ctx.error(f"{relative}: meta.name debe ser {slug}")
            if not re.search(r"^\s*description\s*:\s*(['\"`])\S", body, re.M):
                ctx.error(f"{relative}: falta meta.description")
            if not re.search(r"^\s*phases\s*:\s*\[", body, re.M):
                ctx.error(f"{relative}: falta meta.phases")
        code = _strip_js_comments(content)
        for label, pattern in NON_DETERMINISTIC:
            if pattern.search(code):
                ctx.error(f"{relative}: usa {label}, no permitido en workflows")
        for agent_type in re.findall(r"\bagentType\s*:\s*['\"`]([^'\"`]+)['\"`]", code):
            if agent_type not in ROLES:
                ctx.error(f"{relative}: agentType desconocido: {agent_type}")
    directory = ctx.path(".claude/workflows")
    if directory.is_dir():
        for path in sorted(directory.glob("*.js")):
            if f".claude/workflows/{path.name}" not in workflows:
                ctx.error(f".claude/workflows/{path.name}: workflow no registrado en {REGISTRY}")


def validate_settings(ctx):
    relative = ".claude/settings.json"
    raw = ctx.read(relative)
    if raw is None:
        return
    try:
        settings = json.loads(raw)
    except json.JSONDecodeError as exc:
        ctx.error(f"{relative}: JSON inválido ({exc.msg}, línea {exc.lineno})")
        return
    permissions = settings.get("permissions") if isinstance(settings, dict) else None
    if not isinstance(permissions, dict):
        ctx.error(f"{relative}: falta el objeto permissions")
        return
    rules = {}
    for kind in ("allow", "ask", "deny"):
        value = permissions.get(kind, [])
        if not isinstance(value, list) or not all(isinstance(r, str) for r in value):
            ctx.error(f"{relative}: permissions.{kind} debe ser una lista de reglas")
            value = []
        rules[kind] = value
    if not any(r.startswith("Read(") and ".env" in r for r in rules["deny"]):
        ctx.error(f"{relative}: permissions.deny debe bloquear la lectura de .env")
    if not any("wrangler deploy" in r for r in rules["deny"]):
        ctx.error(f"{relative}: permissions.deny debe bloquear wrangler deploy")
    for rule in rules["allow"] + rules["ask"]:
        if "wrangler deploy" in rule or "wrangler secret" in rule or (rule.startswith("Read(") and ".env" in rule):
            ctx.error(f"{relative}: regla permitida incompatible con los bloqueos obligatorios: {rule}")


def _strip_yaml_comments(content):
    lines = []
    for line in content.splitlines():
        if line.lstrip().startswith("#"):
            continue
        lines.append(re.sub(r"[ \t]+#(?![^'\"]*['\"][^'\"]*$).*$", "", line))
    return "\n".join(lines)


def _job_ids(yaml_text):
    jobs = re.search(r"(?m)^jobs[ \t]*:[ \t]*\n((?:[ \t]+.*\n?|[ \t]*\n)*)", yaml_text)
    if not jobs:
        return []
    block = jobs.group(1)
    indents = [len(m.group(1)) for m in re.finditer(r"(?m)^([ \t]+)[A-Za-z0-9_-]+[ \t]*:", block)]
    if not indents:
        return []
    level = min(indents)
    return re.findall(r"(?m)^[ \t]{%d}([A-Za-z0-9_-]+)[ \t]*:" % level, block)


def validate_github(ctx):
    relative = ".github/workflows/claude-pr-review.yml"
    content = ctx.read(relative)
    if content is not None:
        text = _strip_yaml_comments(content)
        if re.search(r"\bpull_request_target\b", text):
            ctx.error(f"{relative}: no debe usar pull_request_target")
        if not re.search(r"(?m)^[ \t]*permissions[ \t]*:", text):
            ctx.error(f"{relative}: debe declarar permissions")
        if "validate" in _job_ids(text) or re.search(r"(?m)^[ \t]+name[ \t]*:[ \t]*['\"]?validate['\"]?[ \t]*$", text):
            ctx.error(f"{relative}: ningún job puede llamarse validate (nombre reservado para los checks requeridos)")

    relative = ".github/workflows/validate-squad.yml"
    content = ctx.read(relative)
    if content is not None:
        text = _strip_yaml_comments(content)
        if "validate" not in _job_ids(text):
            ctx.error(f"{relative}: falta el job validate (checks requeridos en main)")
        matrix = re.search(r"python-version[ \t]*:[ \t]*\[([^\]]*)\]", text)
        versions = re.findall(r"['\"]?(3\.\d+)['\"]?", matrix.group(1)) if matrix else []
        if versions != ["3.10", "3.11", "3.12"]:
            ctx.error(f"{relative}: la matriz python-version debe ser [\"3.10\", \"3.11\", \"3.12\"]")
        for command in ("python3 scripts/validate_squad.py", "python3 -m unittest discover tests"):
            if command not in text:
                ctx.error(f"{relative}: falta el paso {command}")


def validate_retired(ctx):
    for relative in RETIRED_PATHS:
        if ctx.exists(relative):
            ctx.error(f"{relative}: pertenece a la plantilla anterior y debe eliminarse")


def _scan_targets(ctx):
    targets = [r for r in OBSOLETE_SCAN_FILES if ctx.path(r).is_file()]
    for base in OBSOLETE_SCAN_DIRS:
        directory = ctx.path(base)
        if not directory.is_dir():
            continue
        for path in sorted(directory.rglob("*")):
            if path.is_file() and path.suffix in TEXT_SUFFIXES and "__pycache__" not in path.parts:
                targets.append(str(path.relative_to(ctx.root)))
    return targets


def validate_obsolete_references(ctx):
    for relative in _scan_targets(ctx):
        if not ctx.inside(relative):
            ctx.error(f"{relative}: apunta fuera de la raíz del repositorio")
            continue
        try:
            content = ctx.path(relative).read_text(encoding="utf-8")
        except (OSError, UnicodeError):
            continue
        for number, line in enumerate(content.splitlines(), start=1):
            if OBSOLETE_EXEMPT_LINE.search(line):
                continue
            for label, pattern in OBSOLETE_TERMS:
                if pattern.search(line):
                    ctx.error(f"{relative}:{number}: referencia obsoleta a {label}")


def validate_templates(ctx):
    raw = ctx.read("templates/handoff.json", required=False)
    if raw is not None:
        try:
            data = json.loads(raw)
            if not isinstance(data, dict) or data.get("schema_version") != 1:
                ctx.error("templates/handoff.json: se requiere schema_version 1")
            elif data.get("target_role") not in ROLES:
                ctx.error("templates/handoff.json: target_role debe ser uno de los roles del flujo")
        except json.JSONDecodeError:
            ctx.error("templates/handoff.json: JSON inválido")
    raw = ctx.read("templates/candidate.json", required=False)
    if raw is not None:
        try:
            json.loads(raw)
        except json.JSONDecodeError:
            ctx.error("templates/candidate.json: JSON inválido")
    diagrams = ctx.read("docs/diagrams/README.md", required=False)
    if diagrams is not None:
        for concept in ("material humano", "no son fuente de verdad"):
            if concept not in diagrams.casefold():
                ctx.error(f"docs/diagrams/README.md: debe declarar que los diagramas son {concept}")


def validate_project(ctx):
    from pipeline import check_prd_text  # noqa: E402  (solo en modo --project)

    prd = ctx.read("PRD.md")
    ctx.read("sprint_actual.md")
    if prd is not None:
        _, errors = check_prd_text(prd)
        for message in errors:
            ctx.error(f"PRD.md: {message}")


def validate(root, project=False):
    ctx = Context(Path(root))
    for relative in REQUIRED_FILES:
        if relative != "CLAUDE.md":
            ctx.read(relative)
    validate_claude_md(ctx)
    loaded = load_registry(ctx)
    roles, user_skills, workflows = loaded if loaded else ({}, [], [])
    validate_agents(ctx, roles)
    validate_skills(ctx, roles, user_skills)
    validate_workflows(ctx, workflows)
    validate_settings(ctx)
    validate_github(ctx)
    validate_retired(ctx)
    validate_obsolete_references(ctx)
    validate_templates(ctx)
    if project:
        validate_project(ctx)
    return ctx.errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1],
                        help="Raíz del repositorio (por defecto, la de este script)")
    parser.add_argument("--project", action="store_true",
                        help="Comprobar además PRD.md (4 escenarios por historia) y sprint_actual.md")
    args = parser.parse_args()
    errors = validate(args.root, args.project)
    for message in errors:
        print(f"ERROR: {message}", file=sys.stderr)
    if errors:
        print(f"Validación fallida: {len(errors)} problema(s).", file=sys.stderr)
        return 1
    scope = "flujo y proyecto" if args.project else "flujo"
    print(f"Validación local correcta ({scope}). No acredita aprobaciones humanas, estado en Vikunja ni QA.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
