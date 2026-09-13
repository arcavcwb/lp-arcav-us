# PRD — ARCAV Landing Page & Product Engine

Estado: listo_para_aprobacion
Revisión: v1.0.0
Aprobación humana (persona, fecha, alcance y evidencia): pendiente

---

## Contexto y problema

**ARCAV** es la marca profesional y portafolio técnico de Armando Castro. Funciona como un **estudio de producto digital técnico** enfocado en resolver el caos operativo y transformar procesos manuales (hojas de cálculo, formularios dispersos, WhatsApp, tareas repetitivas) en sistemas simples, conectados y fáciles de operar.

**Posicionamiento principal:**
> *Transformo procesos de negocio en productos digitales simples, automatizados y fáciles de operar.*
> *Pequeños en alcance. Serios en ingeniería.*

---

## Objetivo de negocio

1. Presentar la propuesta de valor de ARCAV y la trayectoria profesional internacional de Armando Castro (Venezuela → México → San Diego / USA → Brasil).
2. Capturar leads calificados de pequeñas/medianas empresas, equipos de marketing, inmobiliarias y líderes técnicos.
3. Ofrecer una experiencia web multilenguaje (ES / EN / PT) ultrarrápida, responsiva y estéticamente superior en **Cloudflare Workers**.

---

## Historias de usuario

### [US-01] Definición del Brief y PRD
- **Como** Product Owner (`po-agent`)
- **Quiero** formalizar las historias de usuario y criterios de aceptación del proyecto
- **Para** garantizar alineación clara entre negocio, diseño, desarrollo y control de calidad.

#### Criterios de Aceptación (4 Escenarios Obligatorios):
1. **Happy Path (Camino ideal)**:
   - **Dado** el contexto documentado en `docs/PROJECT.md` y `docs/BRAND.md`
   - **Cuando** se redacta el PRD.md con las 9 Historias de Usuario (US-01 a US-09)
   - **Entonces** cada historia incluye 4 escenarios Given/When/Then verificables.
2. **Sad Path (Error / Validación)**:
   - **Dado** un parámetro no especificado o contrato no verificado
   - **Cuando** se ejecuta `python3 scripts/validate_squad.py`
   - **Entonces** la validación identifica la falla o requiere inclusión explícita en Preguntas Abiertas.
3. **Edge Case (Límite / Tiempo)**:
   - **Dado** una modificación de requerimiento durante el sprint
   - **Cuando** el usuario solicita un cambio de alcance
   - **Entonces** se actualiza PRD.md y se requiere nueva aprobación humana vinculada al hash del archivo.
4. **Estado Vacío / Carga (UI / UX)**:
   - **Dado** la ausencia de datos iniciales en un campo de configuración
   - **Cuando** el usuario lee el PRD
   - **Entonces** los campos no completados figuran explícitamente como 'Pendiente de confirmación'.

---

### [US-02] Sistema de Diseño y Tokens ARCAV
- **Como** Diseñador / Frontend (`designer-agent` / `frontend-dev-agent`)
- **Quiero** un sistema de diseño con tokens CSS bien estructurados (paleta oscura, acentos esmeralda y tipografía moderna)
- **Para** lograr una estética premium, moderna y cohesiva en todas las vistas.

#### Criterios de Aceptación (4 Escenarios Obligatorios):
1. **Happy Path (Camino ideal)**:
   - **Dado** los tokens definidos en `docs/DESIGN_SYSTEM.md`
   - **Cuando** se aplican las variables en `src/styles/` e `index.css`
   - **Entonces** la interfaz muestra colores armónicos (#0B0F19, #10B981, #111827), tipografía Outfit/Inter y gradientes suaves.
2. **Sad Path (Error / Validación)**:
   - **Dado** el intento de usar estilos inline arbitrarios o frameworks no solicitados (ej. Tailwind)
   - **Cuando** se compila el proyecto o se revisa el código
   - **Entonces** se rechaza el cambio manteniendo la arquitectura pura en Vanilla CSS.
3. **Edge Case (Límite / Tiempo)**:
   - **Dado** pantallas con alto contraste o dispositivos en modo ahorro de energía
   - **Cuando** el usuario navega en pantallas OLED o móviles
   - **Entonces** los elementos conservan legibilidad mínima de contraste según WCAG AA.
4. **Estado Vacío / Carga (UI / UX)**:
   - **Dado** la carga inicial de fuentes de Google Fonts
   - **Cuando** el navegador procesa la tipografía
   - **Entonces** se aplica `font-display: swap` para prevenir parpadeos o pantallas en blanco.

---

### [US-03] Hero Section & Marca 'Evolución de Procesos'
- **Como** visitante del sitio web
- **Quiero** entender de inmediato la propuesta de valor y trayectoria de ARCAV al cargar la página
- **Para** evaluar rápidamente la credibilidad y soluciones ofrecidas.

#### Criterios de Aceptación (4 Escenarios Obligatorios):
1. **Happy Path (Camino ideal)**:
   - **Dado** que un usuario ingresa a la portada de ARCAV
   - **Cuando** la vista Hero carga
   - **Entonces** visualiza el tagline principal, la metáfora visual (*Negocio → Proceso → Producto → Operación*), la trayectoria (Venezuela → México → San Diego/USA → Brasil) y el botón CTA principal.
2. **Sad Path (Error / Validación)**:
   - **Dado** una falla momentánea de red al cargar assets secundarios
   - **Cuando** la página inicia su renderizado
   - **Entonces** el texto principal y la estructura se muestran inmediatamente sin bloquear el renderizado.
3. **Edge Case (Límite / Tiempo)**:
   - **Dado** una pantalla ultra ancha (4K) o muy angosta (móvil de 320px)
   - **Cuando** se redimensiona el navegador
   - **Entonces** el Hero se adapta dinámicamente manteniendo alineación limpia y sin scroll horizontal.
4. **Estado Vacío / Carga (UI / UX)**:
   - **Dado** la interacción con los efectos de glow y partículas
   - **Cuando** el usuario pasa el cursor o toca la pantalla
   - **Entonces** las animaciones responden fluidamente a 60fps con transiciones de 200ms.

---

### [US-04] Sección de Servicios y Productos Digitales
- **Como** cliente potencial (PYME o líder técnico)
- **Quiero** conocer las 3 líneas principales de solución (Connected Landings, Small Business Systems, Automation)
- **Para** identificar la solución exacta que necesita mi operación.

#### Criterios de Aceptación (4 Escenarios Obligatorios):
1. **Happy Path (Camino ideal)**:
   - **Dado** que el usuario navega a la sección de Servicios
   - **Cuando** explora las tarjetas de productos
   - **Entonces** ve la descripción, casos de uso prácticos y tecnologías conectadas para cada uno de los 3 pilares.
2. **Sad Path (Error / Validación)**:
   - **Dado** una interacción rápida o clicks múltiples en las tarjetas
   - **Cuando** el usuario pasa rápidamente entre elementos
   - **Entonces** los estados hover y modal/detalle responden determinísticamente sin traslapos.
3. **Edge Case (Límite / Tiempo)**:
   - **Dado** navegadores antiguos o sin soporte para CSS Grid avanzado
   - **Cuando** se renderiza la sección
   - **Entonces** el layout degrada elegantemente a un flujo vertical legible.
4. **Estado Vacío / Carga (UI / UX)**:
   - **Dado** un servicio o plantilla en proceso de lanzamiento
   - **Cuando** se visualiza su tarjeta
   - **Entonces** se muestra la etiqueta 'Disponible bajo consulta' con botón para solicitar demostración.

---

### [US-05] Sección de Casos de Uso y Trayectoria
- **Como** reclutador o cliente
- **Quiero** revisar ejemplos prácticos de ingeniería y la experiencia profesional detrás de ARCAV
- **Para** verificar la solvencia técnica y el rigor de ejecución.

#### Criterios de Aceptación (4 Escenarios Obligatorios):
1. **Happy Path (Camino ideal)**:
   - **Dado** la información en `docs/CASES.md`
   - **Cuando** el usuario consulta la sección de Casos e Ingeniería
   - **Entonces** encuentra la síntesis de problemas de negocio resueltos (Arkus Nexus, Drata, soluciones operativas) sin exponer datos confidenciales.
2. **Sad Path (Error / Validación)**:
   - **Dado** el intento de acceder a un caso confidencial de cliente
   - **Cuando** el usuario solicita detalles protegidos
   - **Entonces** la plataforma muestra la descripción del problema de ingeniería de forma anónima y rigurosa.
3. **Edge Case (Límite / Tiempo)**:
   - **Dado** un usuario que navega exclusivamente con teclado (Tab/Shift+Tab)
   - **Cuando** interactúa con las tarjetas de trayectoria
   - **Entonces** cada tarjeta recibe foco visual claro y permite expansión mediante la tecla Enter/Espacio.
4. **Estado Vacío / Carga (UI / UX)**:
   - **Dado** la ausencia de capturas en vivo de un proyecto cliente
   - **Cuando** se despliega la tarjeta del caso
   - **Entonces** se renderiza un diagrama de arquitectura simplificado o mockup interactivo generado.

---

### [US-06] Enrutamiento Multilingüe i18n (ES / EN / PT)
- **Como** usuario internacional (de Latinoamérica, EE. UU. o Brasil)
- **Quiero** navegar el sitio en mi idioma preferido (`/es`, `/en`, `/pt`)
- **Para** comprender la oferta de valor sin barreras de idioma.

#### Criterios de Aceptación (4 Escenarios Obligatorios):
1. **Happy Path (Camino ideal)**:
   - **Dado** un usuario que ingresa a `https://arcav.us/`
   - **Cuando** accede por primera vez
   - **Entonces** se detecta el idioma del navegador, se redirige a `/es`, `/en` o `/pt` y se guarda la preferencia en cookies.
2. **Sad Path (Error / Validación)**:
   - **Dado** una URL con idioma no soportado (ej. `/fr/`)
   - **Cuando** el servidor procesa la petición
   - **Entonces** se redirige suavemente al idioma predeterminado (`/es`) mostrando una notificación discreta.
3. **Edge Case (Límite / Tiempo)**:
   - **Dado** un cambio manual de idioma mediante el selector en el Header
   - **Cuando** el usuario cambia de `/es` a `/en` en una sub-sección
   - **Entonces** se conserva la posición del scroll y se actualiza el contenido instantáneamente.
4. **Estado Vacío / Carga (UI / UX)**:
   - **Dado** una clave de traducción faltante en un idioma secundario
   - **Cuando** se renderiza la vista
   - **Entonces** se utiliza la cadena en español como fallback sin mostrar claves vacías ni errores `undefined`.

---

### [US-07] Formulario de Contacto y Captura de Leads
- **Como** cliente interesado
- **Quiero** enviar un mensaje con mi consulta o requerimiento de proyecto
- **Para** iniciar una conversación directa de trabajo con Armando Castro.

#### Criterios de Aceptación (4 Escenarios Obligatorios):
1. **Happy Path (Camino ideal)**:
   - **Dado** un formulario de contacto con nombre, email y mensaje válidos
   - **Cuando** el usuario presiona 'Enviar mensaje'
   - **Entonces** los datos se procesan, se envía la notificación (vía webhook/n8n) y se muestra una confirmación visual de éxito.
2. **Sad Path (Error / Validación)**:
   - **Dado** un email inválido o mensaje vacío
   - **Cuando** el usuario intenta enviar el formulario
   - **Entonces** se destacan los campos erróneos en rojo con un mensaje de validación claro sin borrar los datos ingresados.
3. **Edge Case (Límite / Tiempo)**:
   - **Dado** múltiples envíos consecutivos (spam o bot)
   - **Cuando** se detecta actividad repetitiva en menos de 10 segundos
   - **Entonces** el sistema aplica rate-limiting y muestra un aviso de espera.
4. **Estado Vacío / Carga (UI / UX)**:
   - **Dado** el estado de envío en progreso
   - **Cuando** el usuario hace click en enviar
   - **Entonces** el botón muestra un spinner de carga y deshabilita clicks adicionales hasta recibir la respuesta.

---

### [US-08] Verificación de QA, Criterios y Bug Report
- **Como** QA Agent (`qa-agent`)
- **Quiero** auditar los criterios de aceptación, accesibilidad y rendimiento en cada entrega
- **Para** prevenir regresiones y garantizar cero defectos antes de desplegar a producción.

#### Criterios de Aceptación (4 Escenarios Obligatorios):
1. **Happy Path (Camino ideal)**:
   - **Dado** una versión candidata implementada por el frontend/backend
   - **Cuando** el `qa-agent` ejecuta el plan de pruebas e inspección
   - **Entonces** emite dictamen `approved` registrando evidencia en `sprint_actual.md`.
2. **Sad Path (Error / Validación)**:
   - **Dado** un fallo en los criterios de aceptación o un error visual/funcional
   - **Cuando** QA evalúa la entrega
   - **Entonces** emite dictamen `rejected`, genera `bug_report.md` con pasos de reproducción y suma +1 al contador de reaperturas.
3. **Edge Case (Límite / Tiempo)**:
   - **Dado** 3 rechazos consecutivos en una misma tarea
   - **Cuando** se alcanza el límite de reaperturas
   - **Entonces** el sistema congela la asignación automática y escala a intervención humana obligatoria.
4. **Estado Vacío / Carga (UI / UX)**:
   - **Dado** un informe de QA sin ejecuciones previas
   - **Cuando** se consulta la evidencia
   - **Entonces** se indica que la revisión está lista para iniciarse.

---

### [US-09] Build y Despliegue en Cloudflare Workers
- **Como** DevOps Agent (`devops-agent`)
- **Quiero** validar el bundle de Astro y desplegar la aplicación en Cloudflare Workers
- **Para** asegurar entregas continuas, rápidas y estables.

#### Criterios de Aceptación (4 Escenarios Obligatorios):
1. **Happy Path (Camino ideal)**:
   - **Dado** una entrega aprobada por QA
   - **Cuando** DevOps ejecuta `npm run build` y la validación de `wrangler.jsonc`
   - **Entonces** la build finaliza en 0 errores y se publica la versión candidata a Staging/Producción.
2. **Sad Path (Error / Validación)**:
   - **Dado** un fallo en la compilación de Astro o TypeScript
   - **Cuando** se ejecuta el comando de build
   - **Entonces** el pipeline se detiene inmediatamente, reporta el log exacto y bloquea el despliegue.
3. **Edge Case (Límite / Tiempo)**:
   - **Dado** un despliegue fallido por interrupción de red con Cloudflare
   - **Cuando** se detecta el timeout
   - **Entonces** el script de release conserva el artefacto anterior intacto permitiendo rollback rápido.
4. **Estado Vacío / Carga (UI / UX)**:
   - **Dado** el proceso de despliegue en curso
   - **Cuando** se consulta el estado de la build
   - **Entonces** se muestra la barra de progreso y logs en tiempo real.

---

## Fuera de alcance

- Creación de un panel CMS complejo de backend (el contenido se gestiona de forma estática e i18n estructurado).
- Integraciones con pasarelas de pago (no aplica para la landing inicial).

---

## Métricas de éxito

1. **Rendimiento:** Puntuación de Lighthouse > 90 en Performance, Accessibility y SEO.
2. **Tiempo de carga:** < 1.5 segundos en dispositivos móviles.
3. **Calidad:** 0 errores de compilación TypeScript y 100% de Historias aprobadas por QA.

---

## Preguntas abiertas

- Ninguna por el momento. Toda la especificación fue contrastada con los documentos en `docs/`.
