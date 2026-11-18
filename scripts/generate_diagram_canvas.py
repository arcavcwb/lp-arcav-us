#!/usr/bin/env python3
"""Genera el lienzo Excalidraw y la vista previa SVG del flujo Claude Code.

Material humano de análisis: resume CLAUDE.md y docs/protocolo.md, que siguen
siendo la fuente de verdad. La salida es determinista (sin fechas ni azar) y
solo se escribe al ejecutar el script; importarlo no crea archivos ni carpetas.
"""

import argparse
import json
from pathlib import Path
import re
import sys
from xml.sax.saxutils import escape, quoteattr

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT_DIR = ROOT / "docs" / "diagrams"
DEFAULT_NAME = "flujo-claude"
FIXED_TIMESTAMP = 1789200000000  # Constante: la salida no depende del reloj.

FRAME_W = 1500
FRAME_H = 1200
GAP = 100
LEFT_X = 80
RIGHT_X = LEFT_X + FRAME_W + GAP
TOP_Y = 190
BOTTOM_Y = TOP_Y + FRAME_H + GAP

GRAY = "#8195A3"
RED = "#DC2626"


class ExcalidrawBuilder:
    def __init__(self):
        self.elements = []
        self.counter = 1000

    def next_id(self):
        self.counter += 1
        return f"flujo-{self.counter}"

    def _base(self, kind, x, y, w, h, stroke, bg, frame_id, **extra):
        element_id = self.next_id()
        element = {
            "id": element_id,
            "type": kind,
            "x": x, "y": y, "width": w, "height": h,
            "angle": 0,
            "strokeColor": stroke,
            "backgroundColor": bg,
            "fillStyle": "solid",
            "strokeWidth": extra.pop("stroke_width", 1.5),
            "strokeStyle": extra.pop("stroke_style", "solid"),
            "roughness": 0,
            "opacity": 100,
            "groupIds": [],
            "frameId": frame_id,
            "roundness": extra.pop("roundness", None),
            "seed": self.counter,
            "version": 1,
            "versionNonce": self.counter + 1000,
            "isDeleted": False,
            "boundElements": [],
            "updated": FIXED_TIMESTAMP,
            "created": FIXED_TIMESTAMP,
            "link": None,
            "locked": False,
        }
        element.update(extra)
        self.elements.append(element)
        return element_id

    def add_frame(self, name, x, y, w, h):
        return self._base("frame", x, y, w, h, "#D4DEE4", "transparent", None, name=name)

    def add_rect(self, x, y, w, h, stroke="#CFD9E0", bg="#FFFFFF", frame_id=None, stroke_style="solid"):
        return self._base("rectangle", x, y, w, h, stroke, bg, frame_id,
                          roundness={"type": 3}, stroke_style=stroke_style)

    def add_text(self, text, x, y, w=300, size=16, color="#172D3E", frame_id=None):
        lines = text.count("\n") + 1
        return self._base(
            "text", x, y, w, lines * size * 1.35, color, "transparent", frame_id,
            stroke_width=1, text=text, originalText=text, fontSize=size, fontFamily=2,
            lineHeight=1.35, baseline=size, textAlign="left", verticalAlign="top",
            containerId=None, autoResize=False,
        )

    def add_arrow(self, x1, y1, x2, y2, color=GRAY, frame_id=None):
        dx, dy = x2 - x1, y2 - y1
        return self._base(
            "arrow", x1, y1, abs(dx), abs(dy), color, "transparent", frame_id,
            stroke_width=2, points=[[0, 0], [dx, dy]], lastCommittedPoint=None,
            startBinding=None, endBinding=None, startArrowhead=None, endArrowhead="arrow",
            elbowed=False,
        )

    def add_card(self, x, y, w, h, title, body, stroke="#CFD9E0", bg="#FFFFFF",
                 badge=None, badge_bg="#F1F5F9", badge_color="#334155", frame_id=None,
                 stroke_style="solid"):
        card = self.add_rect(x, y, w, h, stroke=stroke, bg=bg, frame_id=frame_id, stroke_style=stroke_style)
        current_y = y + 14
        if badge:
            badge_w = min(len(badge) * 8 + 20, w - 32)
            self.add_rect(x + 16, current_y, badge_w, 22, stroke="transparent", bg=badge_bg, frame_id=frame_id)
            self.add_text(badge, x + 26, current_y + 4, badge_w - 10, size=11, color=badge_color, frame_id=frame_id)
            current_y += 30
        self.add_text(title, x + 16, current_y, w - 32, size=17, frame_id=frame_id)
        current_y += 30
        if body:
            self.add_text(body, x + 16, current_y, w - 32, size=13, color="#506677", frame_id=frame_id)
        return card


def _frame_heading(b, frame_id, x, y, text, bg, color):
    b.add_rect(x + 20, y + 20, FRAME_W - 40, 60, stroke="transparent", bg=bg, frame_id=frame_id)
    b.add_text(text, x + 40, y + 37, FRAME_W - 80, size=20, color=color, frame_id=frame_id)


def _grid(b, frame_id, x, y, cards, card_h, gap=30):
    card_w = (FRAME_W - 120) // 2
    for index, card in enumerate(cards):
        row, col = divmod(index, 2)
        title, body, color, badge = card
        b.add_card(x + 40 + col * (card_w + 40), y + 100 + row * (card_h + gap), card_w, card_h,
                   title, body, stroke=color, badge=badge, frame_id=frame_id)


def frame_principles(b):
    x, y = LEFT_X, TOP_Y
    f = b.add_frame("01 · Principios y gates humanos", x, y, FRAME_W, FRAME_H)
    _frame_heading(b, f, x, y, "Reglas que no se negocian (CLAUDE.md y docs/protocolo.md)", "#EFF6FF", "#1E40AF")
    _grid(b, f, x, y, [
        ("Cero asunción",
         "• Lo que sabes del proyecto sale de los archivos leídos en la sesión.\n"
         "• No inventes contratos, endpoints, datos, métricas ni IDs remotos.\n"
         "• Lo no verificado se reporta como bloqueo o pregunta abierta.",
         "#F59E0B", "Regla 1"),
        ("Cuatro escenarios por historia",
         "• Camino feliz.\n"
         "• Error o validación.\n"
         "• Caso límite.\n"
         "• Estado vacío o de carga.\n"
         "Cada uno con Dado / Cuando / Entonces en PRD.md.",
         "#3B82F6", "Regla 2"),
        ("Dos gates humanos",
         "• Aprobación del PRD registrada en PRD.md (persona, fecha, alcance,\n"
         "  commit o hash) antes de planificar.\n"
         "• Merge a main = despliegue a producción con Workers Builds.\n"
         "• Ningún agente mergea, despliega ni ejecuta wrangler deploy.",
         "#6366F1", "Regla 3"),
        ("Máximo 3 reaperturas por tarea",
         "• Cada rechazo de QA con fallo demostrado suma una reapertura.\n"
         "• Un bloqueo de entorno no cuenta.\n"
         "• A la tercera, la tarea pasa a escalado y requiere intervención humana.",
         "#EF4444", "Regla 4"),
        ("Lectura progresiva",
         "• Empieza por CLAUDE.md, el subagente, su skill y la tarea.\n"
         "• Amplía solo ante una dependencia o un riesgo concreto.\n"
         "• Detalle en docs/context-strategy.md.",
         "#10B981", "Regla 5"),
        ("Secretos fuera del repositorio e i18n completo",
         "• El repositorio es público.\n"
         "• Local: .env y .dev.vars (ignorados). Producción: secretos de Cloudflare.\n"
         "• i18n sin textos hardcodeados: todo en src/i18n/translations.ts.",
         "#0EA5E9", "Regla 6"),
    ], card_h=260)


def frame_roles(b):
    x, y = RIGHT_X, TOP_Y
    f = b.add_frame("02 · Cinco roles (subagentes de Claude Code)", x, y, FRAME_W, FRAME_H)
    _frame_heading(b, f, x, y, "Un rol por subagente en .claude/agents/<rol>.md", "#F3E8FF", "#6B21A8")
    _grid(b, f, x, y, [
        ("Sesión principal",
         "• Carga CLAUDE.md, coordina y delega cada paso.\n"
         "• Un escritor por archivo en trabajo paralelo.\n"
         "• Ningún subagente activa la fase siguiente por su cuenta.",
         "#64748B", "Coordinación"),
        ("producto",
         "• Skills: requisitos, planificacion.\n"
         "• PRD.md con historias US-xx y aprobación humana.\n"
         "• Tareas en Vikunja (proyecto 2) y espejo sprint_actual.md.\n"
         "• Nunca escribe código en src/.",
         "#3B82F6", "PO y Scrum"),
        ("frontend",
         "• Skill: entrega-frontend.\n"
         "• Páginas, componentes y layouts Astro; Vanilla CSS con tokens.\n"
         "• i18n es / en / pt, responsive, accesibilidad y SEO.",
         "#10B981", "Interfaz"),
        ("integraciones",
         "• Skill: contratos-integracion.\n"
         "• Contratos TypeScript primero; endpoints src/pages/api/*.\n"
         "• Formulario de contacto y webhook n8n; secretos solo por entorno.\n"
         "• No despliega.",
         "#F59E0B", "Server y contratos"),
        ("qa-revisor",
         "• Skills: evidencia-qa, auditoria-seguridad.\n"
         "• Build, tests, preview y los 4 escenarios en los tres idiomas.\n"
         "• Dictamen approved / rejected con evidencia en bug_report.md.\n"
         "• No modifica código de src/.",
         "#EF4444", "Verificación"),
        ("release",
         "• Skill: build-release.\n"
         "• Build de producción, wrangler.jsonc, astro.config.mjs y CI.\n"
         "• Prepara el PR y el checklist de despliegue.\n"
         "• Nunca mergea, despliega ni ejecuta wrangler deploy.",
         "#06B6D4", "Salida a producción"),
    ], card_h=260)


def frame_flow(b):
    x, y = LEFT_X, BOTTOM_Y
    f = b.add_frame("03 · Flujo de una historia (7 pasos)", x, y, FRAME_W, FRAME_H)
    _frame_heading(b, f, x, y, "De la historia aprobada a la verificación en producción", "#FEF3C7", "#92400E")
    steps = [
        ("1. Requisitos", "producto: historia en PRD.md con 4 escenarios.", "#3B82F6", "producto"),
        ("2. Planificación", "producto: tareas en Vikunja y espejo sprint_actual.md.", "#3B82F6", "producto"),
        ("3. Implementación", "integraciones define contratos primero si hacen falta;\n"
                              "después frontend y/o integraciones implementan.", "#10B981", "frontend / integraciones"),
        ("4. QA", "qa-revisor: dictamen con evidencia para el commit candidato.", "#EF4444", "qa-revisor"),
        ("5. Release", "release: build, checks validate y PR con checklist.", "#06B6D4", "release"),
        ("6. Merge a main", "Decisión humana explícita. Mergear despliega a producción.", "#6366F1", "Gate humano"),
        ("7. Verificación en producción", "qa-revisor y humano comprueban https://arcav.us.", "#EF4444", "qa-revisor + humano"),
    ]
    step_w, step_h, pitch = 620, 120, 150
    step_x = x + 40
    for index, (title, body, color, badge) in enumerate(steps):
        top = y + 100 + index * pitch
        b.add_card(step_x, top, step_w, step_h, title, body, stroke=color, badge=badge, frame_id=f)
        if index < len(steps) - 1:
            b.add_arrow(step_x + step_w / 2, top + step_h, step_x + step_w / 2, top + pitch, frame_id=f)

    side_x, side_w = x + 800, 620
    right_edge = step_x + step_w

    def side(index, title, body, color, badge, arrow_color=GRAY, dashed=False):
        top = y + 100 + index * pitch
        b.add_card(side_x, top, side_w, step_h, title, body, stroke=color, badge=badge, frame_id=f,
                   stroke_style="dashed" if dashed else "solid")
        return top

    top = side(0, "Gate humano: aprobación del PRD",
               "Sin Estado: aprobado y línea de aprobación no se planifica.", "#6366F1", "Gate humano")
    b.add_arrow(right_edge, top + 60, side_x, top + 60, frame_id=f)
    top = side(1, "Vikunja es la fuente de verdad",
               "Escribir en Vikunja requiere confirmación humana.", "#8B5CF6", "Estado")
    b.add_arrow(right_edge, top + 60, side_x, top + 60, frame_id=f)
    escalado = side(2, "Escalado humano",
                    "A la 3.ª reapertura no se reasigna ni se reintenta.", "#B91C1C", "Límite")
    rechazo = side(3, "Rechazo con fallo demostrado",
                   "bug_report.md y reapertura (+1) al responsable.", RED, "rejected")
    b.add_arrow(right_edge, rechazo + 60, side_x, rechazo + 60, color=RED, frame_id=f)
    b.add_arrow(side_x, rechazo + 20, right_edge, y + 100 + 2 * pitch + 90, color=RED, frame_id=f)
    b.add_arrow(side_x + side_w / 2, rechazo, side_x + side_w / 2, escalado + step_h, color=RED, frame_id=f)
    top = side(4, "Revisión de Claude en el PR",
               "Opcional y solo comenta; no es check requerido.", "#64748B", "claude-pr-review.yml", dashed=True)
    b.add_arrow(right_edge, top + 60, side_x, top + 60, frame_id=f)
    top = side(5, "Cloudflare Workers Builds",
               "Construye y despliega main. Ningún agente despliega.", "#6366F1", "Producción")
    b.add_arrow(right_edge, top + 60, side_x, top + 60, frame_id=f)
    side(6, "Si falla en producción",
         "bug_report.md; el humano decide revertir o corregir.", RED, "Incidencia")


def frame_tools(b):
    x, y = RIGHT_X, BOTTOM_Y
    f = b.add_frame("04 · Herramientas y revisión", x, y, FRAME_W, FRAME_H)
    _frame_heading(b, f, x, y, "Comprobaciones locales, CI y workflows de Claude Code", "#F0FDF4", "#166534")
    _grid(b, f, x, y, [
        ("scripts/validate_squad.py",
         "• CLAUDE.md, subagentes, skills, workflows y config/skills.json.\n"
         "• settings.json, workflows de GitHub y referencias obsoletas.\n"
         "• --project: PRD.md con 4 escenarios y sprint_actual.md.",
         "#10B981", "Validador"),
        ("Tests y CI",
         "• python3 -m unittest discover tests -v\n"
         "• Job validate en Python 3.10, 3.11 y 3.12.\n"
         "• Checks requeridos en main: validate (3.10 / 3.11 / 3.12).",
         "#06B6D4", "validate-squad.yml"),
        ("scripts/pipeline.py",
         "• check-prd: estructura de los 4 escenarios.\n"
         "• status / advance: fase propuesta según evidencia local.\n"
         "• approve-prd: registro complementario vinculado al SHA-256.",
         "#3B82F6", "Diagnóstico"),
        ("scripts/handoff.py",
         "• prompt: encargo compacto para un rol.\n"
         "• check: precondiciones de templates/handoff.json.\n"
         "• template: templates/entrega.md prerrellenado.",
         "#6366F1", "Traspasos"),
        ("tools/vikunja_sync.py",
         "• Lectura por defecto; --apply escribe con confirmación humana.\n"
         "• sincronizar, crear-tarea y espejo de sprint_actual.md.\n"
         "• Token solo en el entorno o .env local.",
         "#8B5CF6", "Vikunja"),
        ("/entregar-historia US-xx",
         "• Workflow entrega-historia: requisitos, implementación,\n"
         "  QA con máximo 3 reaperturas y preparación del PR.\n"
         "• Se detiene en los gates humanos.",
         "#F59E0B", "Workflow"),
        ("/revisar-proyecto",
         "• Workflow revision-proyecto: revisión por dimensiones.\n"
         "• Verificación adversarial de cada hallazgo.\n"
         "• Informe con el formato de bug_report.md.",
         "#EF4444", "Workflow"),
        ("Revisión de PR con Claude",
         "• .github/workflows/claude-pr-review.yml con claude-code-action.\n"
         "• Se habilita con variable y secreto; solo comenta.\n"
         "• No sustituye a qa-revisor ni la aprobación del merge.",
         "#64748B", "GitHub"),
    ], card_h=240)


def build_full_canvas():
    b = ExcalidrawBuilder()
    b.add_rect(LEFT_X, 40, FRAME_W * 2 + GAP, 110, bg="#0F172A")
    b.add_text("lp-arcav-us · Flujo de trabajo con Claude Code", LEFT_X + 30, 58, 2500, size=32, color="#F8FAFC")
    b.add_text("Material humano de análisis generado por scripts/generate_diagram_canvas.py. "
               "No es fuente de verdad: consulta CLAUDE.md y docs/protocolo.md.",
               LEFT_X + 30, 105, 3000, size=16, color="#94A3B8")
    frame_principles(b)
    frame_roles(b)
    frame_flow(b)
    frame_tools(b)
    return {
        "type": "excalidraw",
        "version": 2,
        "source": "https://excalidraw.com",
        "elements": b.elements,
        "appState": {
            "gridSize": None,
            "viewBackgroundColor": "#F8FAFC",
            "theme": "light",
            "exportBackground": True,
            "exportWithDarkMode": False,
            "exportScale": 2,
        },
        "files": {},
    }


def _num(value):
    return f"{value:g}" if isinstance(value, float) else str(value)


def render_svg(canvas_data):
    """Devuelve una vista previa SVG bien formada del lienzo."""
    elements = canvas_data["elements"]
    min_x = min(e.get("x", 0) for e in elements) - 40
    min_y = min(e.get("y", 0) for e in elements) - 60
    max_x = max(e.get("x", 0) + e.get("width", 0) for e in elements) + 40
    max_y = max(e.get("y", 0) + e.get("height", 0) for e in elements) + 40
    width, height = max_x - min_x, max_y - min_y

    arrow_colors = sorted({e.get("strokeColor", GRAY) for e in elements if e.get("type") == "arrow"})
    marker_ids = {color: f"flecha-{index}" for index, color in enumerate(arrow_colors)}

    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{_num(min_x)} {_num(min_y)} {_num(width)} {_num(height)}" '
        f'width="{_num(width)}" height="{_num(height)}">',
        "<defs>",
    ]
    for color, marker_id in marker_ids.items():
        svg.append(f'  <marker id={quoteattr(marker_id)} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">'
                   f'<polygon points="0 0, 10 3.5, 0 7" fill={quoteattr(color)} /></marker>')
    svg.extend([
        "</defs>",
        "<style>",
        '  text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }',
        "</style>",
        f'<rect x="{_num(min_x)}" y="{_num(min_y)}" width="{_num(width)}" height="{_num(height)}" fill="#F8FAFC" />',
    ])

    for e in elements:
        kind = e.get("type")
        x, y = e.get("x", 0), e.get("y", 0)
        w, h = e.get("width", 0), e.get("height", 0)
        stroke = quoteattr(e.get("strokeColor", "#000000"))
        stroke_width = _num(e.get("strokeWidth", 1))
        if kind == "frame":
            svg.append(f'<rect x="{_num(x)}" y="{_num(y)}" width="{_num(w)}" height="{_num(h)}" fill="none" '
                       f'stroke={stroke} stroke-width="{stroke_width}" stroke-dasharray="6,6" rx="8" />')
            if e.get("name"):
                svg.append(f'<text x="{_num(x + 20)}" y="{_num(y - 12)}" font-size="20" font-weight="bold" '
                           f'fill="#334155">{escape(e["name"])}</text>')
        elif kind == "rectangle":
            radius = 8 if e.get("roundness") else 0
            dash = ' stroke-dasharray="8,6"' if e.get("strokeStyle") == "dashed" else ""
            fill = quoteattr(e.get("backgroundColor", "transparent"))
            svg.append(f'<rect x="{_num(x)}" y="{_num(y)}" width="{_num(w)}" height="{_num(h)}" fill={fill} '
                       f'stroke={stroke} stroke-width="{stroke_width}" rx="{radius}"{dash} />')
        elif kind == "text":
            size = e.get("fontSize", 14)
            weight = "bold" if size >= 17 else "normal"
            for index, line in enumerate(e.get("text", "").split("\n")):
                line_y = y + (index + 1) * (size * 1.3)
                svg.append(f'<text x="{_num(x)}" y="{_num(line_y)}" font-size="{size}" font-weight="{weight}" '
                           f'fill={stroke} xml:space="preserve">{escape(line)}</text>')
        elif kind == "arrow":
            points = e.get("points") or [[0, 0], [0, 0]]
            if len(points) >= 2:
                x1, y1 = x + points[0][0], y + points[0][1]
                x2, y2 = x + points[-1][0], y + points[-1][1]
                marker = marker_ids.get(e.get("strokeColor", GRAY))
                svg.append(f'<line x1="{_num(x1)}" y1="{_num(y1)}" x2="{_num(x2)}" y2="{_num(y2)}" '
                           f'stroke={stroke} stroke-width="{stroke_width}" marker-end="url(#{marker})" />')
    svg.append("</svg>")
    return "\n".join(svg) + "\n"


def write_outputs(out_dir, name=DEFAULT_NAME):
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name):
        raise ValueError("El nombre base debe usar minúsculas, números y guiones.")
    canvas = build_full_canvas()
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    excalidraw_path = out_dir / f"{name}.excalidraw"
    svg_path = out_dir / f"{name}.svg"
    excalidraw_path.write_text(json.dumps(canvas, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    svg_path.write_text(render_svg(canvas), encoding="utf-8")
    return excalidraw_path, svg_path, len(canvas["elements"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR,
                        help="Carpeta de salida (por defecto docs/diagrams)")
    parser.add_argument("--name", default=DEFAULT_NAME, help="Nombre base de los archivos generados")
    args = parser.parse_args()
    try:
        excalidraw_path, svg_path, count = write_outputs(args.out_dir, args.name)
    except (OSError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    print(f"Lienzo Excalidraw: {excalidraw_path} ({count} elementos)")
    print(f"Vista previa SVG: {svg_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
