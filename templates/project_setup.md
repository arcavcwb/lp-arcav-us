# Comprobación del entorno de trabajo

Complétalo al preparar una máquina o sesión nueva. Registra solo lo comprobado;
esta plantilla no afirma instalaciones ni aprueba ninguna fase.

- Fecha UTC y persona:
- Versión de Claude Code:
- Node.js (`>=22.12.0`) y Python (`>=3.10`):
- Cuenta de git y de `gh` para commits, push y PR (`arcavcwb`):

## Flujo en Claude Code

| Elemento | Comprobación | Resultado |
|---|---|---|
| `CLAUDE.md` | Se carga al iniciar la sesión | |
| Subagentes (`.claude/agents/`) | Aparecen los 5 roles | |
| Skills (`.claude/skills/`) | Coinciden con `config/skills.json` | |
| Workflows (`.claude/workflows/`) | `entrega-historia` y `revision-proyecto` disponibles | |
| Validador | `python3 scripts/validate_squad.py` en verde | |
| Pruebas | `python3 -m unittest discover tests -v` en verde | |

## Servicios

| Servicio | Comprobación de solo lectura | Resultado |
|---|---|---|
| Vikunja | `python3 tools/vikunja_sync.py info` con token en `.env` local | |
| Build | `npm run build` | |
| Revisión de Claude en PR | Variable y secreto configurados en GitHub (ver `docs/claude-pr-review.md`) | |
| Cloudflare Workers Builds | Conectado a `main` en el panel de Cloudflare | |

Los secretos permanecen en `.env`, `.dev.vars` o en la configuración de
Cloudflare y GitHub; aquí solo se registra si están disponibles, nunca su valor.
Estas comprobaciones no sustituyen QA de producto. Aplica `docs/protocolo.md`.
