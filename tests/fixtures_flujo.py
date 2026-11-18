"""Datos sintéticos compartidos por los tests del tooling del flujo.

No son requisitos, aprobaciones ni evidencia real: solo alimentan los tests.
"""

import sys
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1]
if str(SOURCE / "scripts") not in sys.path:
    sys.path.insert(0, str(SOURCE / "scripts"))

from handoff import PRECONDITIONS  # noqa: E402

PENDING_APPROVAL = "Aprobación humana (persona, fecha UTC, alcance y commit o hash aprobado): pendiente"

PRD = f"""# PRD — SIMULACIÓN: reservar una cita

Estado: listo_para_aprobacion
Revisión: v0.1.0
{PENDING_APPROVAL}

Este documento es un ejemplo para tests, no un requisito aprobado.

## Historias de usuario

### [US-01] Reservar un horario disponible
- **Como** cliente
- **Quiero** elegir un horario
- **Para** obtener una reserva confirmada

#### Criterios de aceptación (4 escenarios obligatorios):
1. **Camino feliz**:
   - **Dado** un horario disponible
   - **Cuando** confirmo mis datos
   - **Entonces** veo la confirmación.
2. **Error / validación**:
   - **Dado** un dato obligatorio ausente
   - **Cuando** confirmo
   - **Entonces** veo el error y conservo lo escrito.
3. **Caso límite**:
   - **Dado** un horario ocupado por otra reserva
   - **Cuando** confirmo
   - **Entonces** puedo elegir otro sin duplicar reservas.
4. **Estado vacío / carga**:
   - **Dado** que no hay horarios
   - **Cuando** consulto una fecha
   - **Entonces** veo un estado vacío y puedo cambiarla.

## Fuera de alcance

- Pagos.

## Métricas de éxito

1. **Tiempo de carga:** menos de 2 segundos en móvil.
2. **Errores:** 0 errores de validación sin mensaje.
3. **Límite:** 100 reservas por día.

## Preguntas abiertas

- Ninguna.
"""


def approved_prd(prd=PRD, line="PERSONA FICTICIA, 2026-09-17, US-01, commit abc1234"):
    """Devuelve el PRD con la aprobación registrada en su cabecera."""
    return (prd.replace("Estado: listo_para_aprobacion", "Estado: aprobado")
               .replace(PENDING_APPROVAL, PENDING_APPROVAL.replace(": pendiente", f": {line}")))


def evidence(role, revision="rev-1", qa_run="qa-1", ticket="SIM-US-01"):
    """Declaraciones sintéticas con la forma de templates/handoff.json."""
    inputs = {
        name: {
            "status": "approved" if name in {"qa", "prd_approval"} else "ready",
            "reference": f"SIMULACION/{name}",
            "revision": revision,
        }
        for name in PRECONDITIONS[role]
    }
    if "qa" in inputs:
        inputs["qa"].update(qa_run=qa_run, blockers=[], pending_checks=[])
    return dict(schema_version=1, target_role=role, ticket=ticket, revision=revision,
                qa_run=qa_run, inputs=inputs)
