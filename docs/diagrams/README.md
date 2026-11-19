# Diagramas del flujo Claude Code

Lienzo editable (Excalidraw / Excalidash) y vista previa SVG del flujo de
trabajo de `lp-arcav-us` con Claude Code.

Estos diagramas son material humano de análisis. Los subagentes no leen
archivos `.excalidraw`, SVG o PNG como contexto operativo salvo que la tarea
sea crear, modificar o verificar diagramas. No son fuente de verdad: las
decisiones vigentes están en `CLAUDE.md`, `docs/protocolo.md`, `PRD.md` y el
documento de diseño que corresponda. Ver `docs/context-strategy.md`.

## Generar

El lienzo no se versiona por defecto: se genera bajo demanda con un script
determinista (sin fechas ni azar), así que dos ejecuciones sobre el mismo
código producen los mismos archivos.

```bash
python3 scripts/generate_diagram_canvas.py
python3 scripts/generate_diagram_canvas.py --out-dir /ruta/temporal --name flujo-claude
```

Por defecto escribe en esta carpeta:

- `flujo-claude.excalidraw`: lienzo editable.
- `flujo-claude.svg`: vista previa vectorial.

Si decides versionarlos, vuelve a generarlos cada vez que cambie
`docs/protocolo.md`, los roles o las herramientas, y revisa el diff antes del
commit.

## Contenido

| Marco | Qué resume | Fuente de verdad |
|---|---|---|
| **01 · Principios y gates humanos** | Cero asunción, 4 escenarios por historia, gates de PRD y de merge a `main`, máximo 3 reaperturas, lectura progresiva, secretos fuera del repositorio e i18n | `CLAUDE.md`, `docs/protocolo.md` |
| **02 · Cinco roles** | Sesión principal y los subagentes `producto`, `frontend`, `integraciones`, `qa-revisor` y `release` con sus skills y límites | `.claude/agents/`, `config/skills.json` |
| **03 · Flujo de una historia** | Los 7 pasos, el rechazo de QA con reapertura, el escalado humano, la revisión de Claude en el PR y el despliegue con Workers Builds | `docs/protocolo.md` |
| **04 · Herramientas y revisión** | `validate_squad.py`, tests y CI, `pipeline.py`, `handoff.py`, `tools/vikunja_sync.py`, `/entregar-historia`, `/revisar-proyecto` y `claude-pr-review.yml` | `docs/herramientas-locales.md`, `docs/claude-pr-review.md` |

Los bordes discontinuos marcan piezas opcionales (la revisión de Claude en el
PR). Las flechas rojas indican el retorno desde QA a corrección y el escalado.

## Abrir

- **Excalidraw:** abre un dibujo nuevo y usa el menú **Abrir** para cargar
  `flujo-claude.excalidraw`. No lo cargues sobre un dibujo que quieras
  conservar.
- **Excalidash:** usa la importación de dibujos, si tu instancia la ofrece, y
  selecciona el mismo archivo. La restauración de un respaldo `.excalidash` es
  una operación distinta.

## Mantenimiento

- Edita el contenido en `scripts/generate_diagram_canvas.py`, no a mano en el
  `.excalidraw`, para que el lienzo se pueda regenerar.
- La vista previa escapa el texto como XML y declara los marcadores de flecha
  en `<defs>`; los tests comprueban que el SVG es XML bien formado y que
  importar el script no crea carpetas.
- Si el diagrama contradice un documento del flujo, prevalece el documento:
  corrige el script y regenera.
