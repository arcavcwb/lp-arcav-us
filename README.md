# ARCAV Landing Page (lp-arcav-us)

Sitio web de ARCAV, solo en portugués de Brasil (pt-BR), desarrollado con **Astro** y configurado para despliegue en **Cloudflare Workers**. Sistema visual en `DESIGN.md`.

---

## 🚀 Estructura del Proyecto

```text
/
├── docs/                 # Marca, contenido, casos, sistema de diseño y propuestas
├── public/               # Assets estáticos (favicon, fuentes, capturas de ejemplos)
├── src/
│   ├── assets/brand/     # Logo y foto de Armando (ver README de la carpeta)
│   ├── components/       # Solo marcado: home/, solution/, proposal/, ui/
│   ├── data/             # Contenido pt-BR: site.ts, solutions.ts, commerce-service.ts, proposals/
│   ├── lib/              # Reglas puras, sin DOM (build, navegador y servidor)
│   │   ├── order.ts             # Pedido de ejemplo: formato, totales, pasos de la guía
│   │   ├── contact-message.ts   # Asunto y texto del contacto (formulario y /api/contato)
│   │   └── contact.ts           # Canales y flags (WhatsApp, DIRECT_SEND, RESPONSE_TIME)
│   ├── scripts/          # Comportamiento en el navegador: un init… por pieza
│   │   └── tabs.ts, site-header.ts, contact-form.ts, phone-demo.ts, order-message.ts
│   ├── styles/           # Tailwind v4 configurado en CSS (ver abajo)
│   └── pages/            # Home, soluciones (/solucoes/…), propuestas, /api/contato
└── package.json
```

### Estilos: Tailwind v4 sobre el Design System

**Regla: cero valores sueltos.** Ningún componente, CSS o script escribe un color, tamaño, espacio, radio, sombra, duración, curva o punto de quiebre: todo sale de `src/styles/tokens.css`. Si falta un valor, se crea ahí con nombre. Tampoco hay `px-[…]`, `text-[…]` ni `grid-cols-[…]` en el marcado.

- **Entrada única:** `src/styles/global.css`. Capas en orden `theme < base < components < utilities`. Sin el *preflight* de Tailwind: el reset propio está en `base.css`.
- **Tokens:** `src/styles/tokens.css` (`@theme`). El tema por defecto de Tailwind no se carga (`--*: initial`): solo existe lo de la marca.
  - color: `paper`, `surface`, `ink`, `muted`, `line`, `line-strong`, `line-hover`, `accent`, `dark`, `on-dark`, `clay`, `danger`, `selection`…;
  - texto: `text-micro` … `text-h1`, más `text-lg`, `text-md`, `text-brand`, `text-statement`, `text-figure`; entrelínea (`leading-body`, `leading-title`, `leading-caption`…) y tracking (`tracking-tight`, `tracking-title`…);
  - espacio: la unidad `--spacing` (0,25rem) para `p-4`, `gap-3`… y medidas con nombre: `gap-split`, `p-panel`, `p-card`, `px-gutter`, `min-h-header`, `top-sticky`, `mt-optical`…;
  - anchos (`max-w-xs` … `max-w-2xl`, `max-w-measure`, `max-w-phone`), grillas (`grid-cols-form`, `grid-cols-aside`, `grid-cols-hero-portrait`…), proporciones (`aspect-screen`, `aspect-portrait`, `aspect-wide`);
  - forma y movimiento: `rounded-card`, `rounded-xs`, `shadow-raised`, `shadow-lift`, `shadow-drawer`, `duration-fast` … `duration-pulse`, `ease-out`, `transition-lift`, `animate-fade-up`;
  - puntos de quiebre: `sm` 480, `pair` 560, `inline` 640, `md` 720, `columns` 800, `lg` 880, `split` 900, `xl` 960, `2xl` 1024 px.
- **En el CSS:** `var(--…)` para tokens, `--spacing(n)` para medidas de la unidad base y `theme(--breakpoint-…)` en las media queries. Las medidas propias de la ilustración del celular se nombran una vez al inicio de `phone-demo.css`.
- **En los scripts:** las animaciones hechas en JavaScript leen los tokens del CSS (`src/scripts/tokens.ts`).
- **Piezas compartidas:** `src/styles/primitives/`:
  - `shell` (el contenedor de la página; reemplaza a `.container`, que es una utilidad propia de Tailwind);
  - `section`, `section-head`, `page-hero`;
  - `h1`, `h2`, `lead`, `small`;
  - `btn`, `link-arrow`, `card`, `icon-badge`, `steps`, `flow`.
- **Componentes sin `<style>`:** las utilidades van en el marcado. Las combinaciones que se repiten se nombran una vez en el frontmatter (por ejemplo `const link = '…'`).
  - Los tres componentes con muchos estados tienen CSS propio en `src/styles/components/`: `phone-demo.css`, `contact-form.css` y `proposal.css`.
  - Todos sus selectores van bajo la clase raíz (`.phone-demo`, `.contact-form`, `.proposal`), para que nada se filtre al resto del sitio.
- **Clases sin estilo** como `hero-home`, `hero-note`, `sflow`, `faq__item`, `path`, `closing__form`, `order-message` y `field--trap` quedan como enganches para las pruebas de navegador. No borrarlas sin actualizar las pruebas.

### Textos, datos y lógica: nada escrito en los componentes

- **`src/data/`** — todo el texto del sitio:
  - `site.ts` (marca, `SITE` del documento, home, 404), `solutions.ts` (soluciones, `SOLUTION_PAGE`, `LANDING_PICKER`), `commerce-service.ts`, `proposals/`;
  - `ui.ts`: textos de interfaz que se repiten (botones, avisos, accesibilidad, formulario, celular de ejemplo);
  - `anchors.ts`: los ids de sección (`#contato`, `#demo`…) y `toAnchor()`;
  - `navigation.ts`: menú principal y pie;
  - `photos.ts`: las fotos reales y su lugar (ver abajo).
- **`src/lib/`** — reglas puras, sin DOM, compartidas entre páginas, scripts y `/api/contato`: `order.ts`, `contact-message.ts`, `contact.ts`, `text.ts` (`initials`, `firstName`, `quoted`), `view-transitions.ts`, `photos.ts`.
- **`src/scripts/`** — comportamiento en el navegador, una función `init…` por comportamiento.
- Astro descarta el espacio entre una expresión y el texto o enlace que la sigue: en frases con enlaces se usa `{' '}`.

### Fotos

Las fotos reales van en `src/assets/fotos/` con el nombre de `src/data/photos.ts` (`retrato-trabalho`, `retrato`, `processo`, `curitiba`). Mientras falta una, su lugar muestra un marcador gris con la descripción, la proporción y el tamaño mínimo. `SHOW_PHOTO_PLACEHOLDERS = false` oculta los marcadores (desactivarlo antes de publicar si falta alguna foto).

Las rutas antiguas `/pt/…`, `/es` y `/en` redirigen con 301 (ver `redirects` en `astro.config.mjs`).

---

## 🛠️ Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local |
| `npm run build` | Genera la build de producción en `./dist/` |
| `npm run preview` | Previsualiza la build localmente |

---

## Formulário de contato

Os formulários (home e página de comércios) enviam o contato pelo próprio site em `POST /api/contato` (`src/pages/api/contato.ts`). A API tenta, nesta ordem:

1. **n8n**: se existir a variável `N8N_WEBHOOK_URL`, envia o contato em JSON para esse webhook (com `Authorization: Bearer <N8N_WEBHOOK_TOKEN>` se o token existir). Campos: `source`, `variant` (`general` ou `store`), `page`, `receivedAt`, `name`, `business`, `link`, `reply`, `message`, `subject`, `text`. É aqui que o fluxo com Evolution API pode avisar o Armando e responder o cliente no WhatsApp. O site não promete prazo de resposta enquanto `RESPONSE_TIME` (`src/lib/contact.ts`) for `null`; reative-o só quando a automação garantir o prazo.
2. **E-mail da Cloudflare**: se o binding `SEND_EMAIL` existir, envia um e-mail para `hola@arcav.us`.
3. **Plano B**: sem nenhum dos dois (ou se ambos falharem), a API responde 503/502 e o formulário monta a mensagem e abre o WhatsApp da ARCAV no aparelho do visitante.

**Interruptor `DIRECT_SEND`** (`src/lib/contact.ts`): enquanto estiver `false`, o formulário nem chama a API. O botão diz "Enviar pelo WhatsApp" e abre o WhatsApp com a mensagem pronta, para não prometer um envio que o site ainda não faz. Depois de configurar o n8n ou o e-mail e testar um envio real em produção, mude para `true` e publique de novo.

Configurar o n8n (recomendado):

```bash
npx wrangler secret put N8N_WEBHOOK_URL     # ex.: https://n8n.seudominio/webhook/contato-site
npx wrangler secret put N8N_WEBHOOK_TOKEN   # opcional; valide no n8n o header Authorization
```

Para testar localmente, crie um `.dev.vars` (não versionado) com `N8N_WEBHOOK_URL=...`. Atenção: o `wrangler.jsonc` usa `global_fetch_strictly_public`, então o webhook precisa ter endereço público (não `localhost`).

Configurar o e-mail (opcional, requer acesso à conta Cloudflare do domínio):

1. Ative **Email Routing** para `arcav.us` e verifique o destino `hola@arcav.us`.
2. Adicione ao `wrangler.jsonc`: `"send_email": [{ "name": "SEND_EMAIL", "destination_address": "hola@arcav.us" }]`.
3. Opcional: `CONTACT_FROM` (padrão `site@arcav.us`) e `CONTACT_TO` (padrão `hola@arcav.us`).

A API não guarda dados, valida os campos obrigatórios e descarta envios de robôs pelo campo-armadilha `website`.

---

## Medição de visitas

`src/lib/analytics.ts` tem `CF_WEB_ANALYTICS_TOKEN`. Ative o **Web Analytics** no painel da Cloudflare e cole o token: o layout passa a carregar o script em todas as páginas (sem cookies). Se o domínio estiver em proxy pela Cloudflare, dá para usar o modo automático do painel e deixar o token como `null`.
