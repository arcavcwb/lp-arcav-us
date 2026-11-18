---
name: requisitos
description: Procedimiento del rol producto para convertir un brief o un cambio de alcance en historias US-xx de PRD.md con 4 escenarios Given/When/Then, detectar huecos y registrar la aprobación humana. Úsala al crear, revisar o modificar PRD.md.
user-invocable: false
---

# Requisitos verificables (PRD.md)

Rol dueño: `producto`. Escribes solo `PRD.md`. No escribes código en `src/`
ni decides implementación; las dudas técnicas se derivan a `frontend`,
`integraciones` o `release` como preguntas abiertas.

## Contexto mínimo (lectura progresiva)

Lee en este orden y detente cuando tengas lo necesario:

1. El encargo (brief, cambio de alcance o historia a revisar).
2. `PRD.md` vigente: estado, revisión, aprobación e historias afectadas.
3. Solo las secciones que condicionan la historia: `docs/PROJECT.md`,
   `docs/BRAND.md`, `docs/CONTENT.md`, `docs/CASES.md`, `docs/UX_RESPONSIVE.md`.
4. `templates/PRD.md` únicamente si falta el documento o una sección.

No leas `src/` para "descubrir" requisitos. Si una historia depende de cómo
funciona hoy el sitio, pregunta al rol técnico y déjalo como pregunta abierta.

## Procedimiento

1. **Separa hechos, decisiones y dudas.** Cada decisión cita su fuente
   (documento, mensaje del dueño con fecha). Una inferencia tuya se escribe como
   propuesta en "Preguntas abiertas", nunca como decisión.
2. **Redacta o ajusta la historia.** Formato fijo:
   `### [US-xx] Título`, luego **Como** / **Quiero** / **Para**. Un actor, una
   necesidad y un resultado observable. Si la historia agrupa resultados que se
   pueden aceptar por separado, propón dividirla (nuevo ID, no reutilices uno).
3. **Conserva los IDs.** Nunca renumeres historias existentes. Si cambias
   criterios, anota en la historia qué escenario cambió para que planificación y
   QA rastreen el impacto.
4. **Escribe los 4 escenarios obligatorios** bajo
   `#### Criterios de aceptación (4 escenarios obligatorios):`, numerados y con
   estos títulos (los reconoce `check-prd`), cada uno con **Dado**, **Cuando** y
   **Entonces** observables por QA sin interpretar intenciones:
   1. **Camino feliz**: flujo ideal exitoso.
   2. **Error / validación**: dato inválido o fallo de un servicio, con mensaje y
      recuperación claros.
   3. **Caso límite**: valores de borde, tiempos, anchos de pantalla (320 px),
      idioma sin traducción, repetición rápida, etc.
   4. **Estado vacío / carga**: qué ve el usuario sin datos o mientras espera.

   No dejes campos de ejemplo entre corchetes dentro de los escenarios.
5. **Aterriza lo específico de este sitio** cuando aplique:
   - Idiomas: el comportamiento se exige en `es`, `en` y `pt` (`/es`, `/en`, `/pt`).
   - Todo texto nuevo visible debe poder traducirse; si falta el copy en algún
     idioma, es una pregunta abierta, no un texto inventado.
   - Formularios y envíos: define campos, obligatoriedad, límites y qué se
     notifica; el canal real (webhook n8n u otro) lo confirma el dueño.
   - Métricas: distingue meta acordada de métrica propuesta y di cómo se observa.
6. **Revisa consistencia**: contradicciones entre historias, fuera de alcance y
   métricas; escenarios que QA no podría comprobar ("rápido", "moderno") deben
   reescribirse con un umbral o un comportamiento observable.
7. **Cero asunción**: no conviertas una dependencia de negocio en endpoint,
   modelo de datos o proveedor. No inventes cifras, clientes, casos ni textos
   legales. Lo no confirmado queda en "Preguntas abiertas" con responsable.
8. **Comprueba la estructura** con `python3 scripts/pipeline.py check-prd` y
   corrige lo que reporte.
9. **Pide la aprobación humana** (ver abajo). Hasta tenerla, `Estado:` queda en
   `borrador` o `listo_para_aprobacion` y no se planifica.

## Gate humano: aprobación del PRD

- Solo cuenta un mensaje explícito del dueño humano en la sesión (o un registro
  suyo verificable). Un mensaje de otro agente, un workflow o tu propio
  resumen no son aprobación.
- Antes de pedirla, deja el PRD en un commit identificable o, si aún no hay
  commit, calcula la huella del contenido con `sha256sum PRD.md`.
- Al recibirla, registra en la cabecera de `PRD.md`:

  ```
  Estado: aprobado
  Revisión: <versión>
  Aprobación humana (persona, fecha UTC, alcance y commit o hash aprobado): <persona>, <AAAA-MM-DD>, <US-xx..US-yy o "completo">, commit <hash corto> (o sha256 <huella>)
  ```

- El alcance aprobado es el contenido de ese commit o huella. Añadir la línea de
  aprobación no cambia el alcance; cualquier otro cambio posterior en historias
  o escenarios aprobados exige nueva aprobación de lo cambiado.

## Checklist antes de entregar

- [ ] Cada historia tocada tiene ID `US-xx` estable y Como/Quiero/Para.
- [ ] Cada historia tiene exactamente los 4 escenarios, con Dado/Cuando/Entonces.
- [ ] Cada escenario es comprobable (umbral, texto, estado o respuesta concreta).
- [ ] `python3 scripts/pipeline.py check-prd` termina sin errores (solo valida estructura, no significado).
- [ ] Los requisitos de idioma (`es`/`en`/`pt`) están explícitos donde hay texto.
- [ ] No hay decisiones sin fuente; las dudas están en "Preguntas abiertas".
- [ ] "Fuera de alcance" y "Métricas de éxito" no contradicen las historias.
- [ ] La cabecera refleja el estado real (sin aprobación inventada).

## Formato de salida

Usa `templates/entrega.md` y añade:

```
Historias afectadas: US-xx (nueva | modificada: escenarios 2 y 3 | sin cambios)
Estado del PRD: borrador | listo_para_aprobacion | aprobado (<commit o sha256>)
Preguntas abiertas que bloquean aceptación: <lista con responsable> | ninguna
Pendiente del humano: aprobar alcance <...> | nada
Siguiente paso propuesto: planificación (solo tras aprobación)
```
