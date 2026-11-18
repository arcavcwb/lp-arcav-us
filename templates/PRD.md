# PRD

Estado: borrador
Revisión: pendiente
Aprobación humana (persona, fecha UTC, alcance y commit o hash aprobado): pendiente

Lo redacta y mantiene `producto`. Solo una persona aprueba; un cambio de alcance
posterior exige una aprobación nueva (ver `docs/protocolo.md`).

## Contexto y problema

Pendiente de brief.

## Objetivo de negocio

Pendiente.

## Historias de usuario

Cada historia tiene un ID estable (`US-XX`) y los 4 escenarios obligatorios con
Dado/Cuando/Entonces. Reemplaza todos los campos entre corchetes.

### [US-XX] Título de la historia
- **Como** [rol de usuario]
- **Quiero** [acción o capacidad concreta]
- **Para** [beneficio o valor observable]

#### Criterios de aceptación (4 escenarios obligatorios):
1. **Camino feliz**:
   - **Dado** [contexto inicial válido]
   - **Cuando** [acción principal del usuario]
   - **Entonces** [resultado exitoso esperado]
2. **Error / validación**:
   - **Dado** [entrada inválida o fallo del servicio]
   - **Cuando** [el usuario intenta la acción]
   - **Entonces** [mensaje de error claro y acción de recuperación]
3. **Caso límite**:
   - **Dado** [valor límite, repetición o expiración de tiempo]
   - **Cuando** [ocurre el evento]
   - **Entonces** [comportamiento determinista esperado]
4. **Estado vacío / carga**:
   - **Dado** [ausencia de datos o consulta en progreso]
   - **Cuando** [el usuario accede a la vista]
   - **Entonces** [indicador de carga o estado vacío con llamada a la acción]

## Fuera de alcance

Pendiente.

## Métricas de éxito

Pendiente.

## Preguntas abiertas

Registra las ambigüedades; no las conviertas en decisiones aprobadas.
