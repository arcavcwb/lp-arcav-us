# ARCAV Landing Page (lp-arcav-us)

Sitio web de ARCAV, solo en portugués de Brasil (pt-BR), desarrollado con **Astro** y configurado para despliegue en **Cloudflare Workers**. Producto en `PRODUCT.md`, sistema visual en `DESIGN.md`, el resto de la documentación en [`docs/README.md`](docs/README.md).

---

## 🚀 Estructura del Proyecto

Este repositorio es **solo el sitio comercial y el portafolio** de ARCAV. Propuestas para prospectos, productos white-label y ejemplos viven en proyectos propios; aquí solo entran sus capturas, sus datos y el enlace.

```text
/
├── docs/                 # Marca y reglas del portafolio (índice en docs/README.md)
├── public/               # Assets estáticos (favicon, fuentes, capturas de ejemplos)
├── src/
│   ├── assets/           # brand/ (logo) y fotos/ (retratos; ver el README de cada carpeta)
│   ├── components/       # Solo marcado con clases propias: home/, solution/, ui/ (cada carpeta con index.ts)
│   ├── data/             # Todo el texto y la configuración de contenido (index.ts reúne todo)
│   ├── lib/              # Reglas puras, sin DOM (build, navegador y servidor; index.ts reúne todo)
│   ├── scripts/          # Lo poco que necesita JavaScript en el navegador
│   ├── styles/           # Tailwind v4 configurado en CSS (ver abajo)
│   ├── layouts/          # Documento base
│   └── pages/            # Home, soluciones (/solucoes/…), 404, /api/contato
└── package.json
```

### Componentes: clases propias, estilos en CSS

Los componentes no usan utilidades de Tailwind en el marcado. Cada elemento lleva una clase con nombre propio (BEM: `.hero__grid`, `.services__link`, `.services__link:hover .services__arrow`) y su estilo vive en `src/styles/components/<carpeta>/<componente>.css`, armado con `@apply` y los tokens. Tailwind es el motor (tokens, variantes, `@apply`), no el vocabulario del marcado.

```css
/* styles/components/home/services.css */
.services__link {
  @apply relative grid min-h-16 gap-2 py-4 text-ink no-underline lg:grid-cols-index lg:py-7;
}
```

### Estilos: Tailwind v4 sobre el Design System

**Regla: cero valores sueltos.** Ningún componente, CSS o script escribe un color, tamaño, espacio, radio, sombra, duración, curva o punto de quiebre: todo sale de `src/styles/tokens.css`. Si falta un valor, se crea ahí con nombre. Tampoco hay valores arbitrarios (`px-[…]`, `grid-cols-[…]`) en el `@apply`.

- **Entrada única:** `src/styles/global.css`. Capas, de la más débil a la más fuerte: `theme < base < primitives < components < utilities`. La capa `components` vence a `primitives` (por eso `.about__lead` puede dar margen a `.lead`). `utilities` queda vacía: Tailwind no busca clases en los archivos (`source(none)`) y solo genera lo que piden los `@apply`. Sin el *preflight*: el reset propio está en `base.css`.
- **Tokens:** `src/styles/tokens.css` (`@theme`). El tema por defecto de Tailwind no se carga (`--*: initial`): solo existe lo de la marca.
  - color: `paper`, `surface`, `ink`, `muted`, `line`, `line-strong`, `line-hover`, `line-control`, `accent`, `highlight` (ámbar), `focus`, `dark`, `on-dark`, `danger`, `selection`, `backdrop`…;
  - texto: `text-micro` … `text-h1`, más `text-lg`, `text-md`, `text-index`, `text-quote`, `text-numeral`, `text-h2-feature`…; entrelínea (`leading-body`, `leading-title`…) y tracking (`tracking-tight`, `tracking-title`…);
  - espacio: la unidad `--spacing` (0,25rem) para `p-4`, `gap-3`… y medidas con nombre: `gap-split`, `p-panel`, `p-card`, `px-gutter`, `min-h-header`, `top-sticky`, `mt-optical`…;
  - anchos (`max-w-xs` … `max-w-2xl`, `max-w-measure`), grillas (`grid-cols-form`, `grid-cols-hero-portrait`, `grid-cols-index`…), proporciones (`aspect-screen`, `aspect-portrait`, `aspect-wide`);
  - forma y movimiento: `rounded-card`, `shadow-raised`, `shadow-dialog`, `duration-fast` … `duration-pulse`, `ease-out`, `transition-lift`, `animate-fade-up`;
  - puntos de quiebre: `sm` 480, `pair` 560, `inline` 640, `md` 720, `columns` 800, `lg` 880, `split` 900, `xl` 960, `2xl` 1024 px.
- **Fuera de `@apply`:** `var(--…)` para tokens, `--spacing(n)` para medidas de la unidad base y `theme(--breakpoint-…)` en las media queries.
- **Piezas compartidas** (`src/styles/primitives/`): `shell`, `section`, `section-head`, `page-hero`, `hero-note`, `h1`, `h2`, `h2--feature`, `lead`, `small`, `btn`, `link-arrow`, `card`, `icon-badge`, `steps`, `flow` y el movimiento (`enter-group`, `reveal-rows`, `reveal-wipe`).

### Menos JavaScript: lo que hace HTML y CSS

- **Ventana del formulario y menú del celular:** atributo `popover` de HTML. Abren con un botón (`popovertarget`), cierran con Esc o tocando afuera, sin script. Solo el menú tiene tres líneas para cerrarse al elegir un enlace (`scripts/site-menu.ts`).
- **Selector de landing pages:** botones de opción nativos; el CSS muestra la ficha de la opción marcada y las flechas del teclado ya cambian la opción.
- **Movimiento** (`primitives/motion.css`): la apertura de la home entra con CSS al cargar; las filas de servicios y la cita del manifiesto aparecen con animaciones ligadas al scroll (`animation-timeline: view()`). La línea del cabecero al bajar también es CSS. Sin soporte o con "reducir movimiento", todo se ve sin animar.
- **Scripts que quedan** (`src/scripts/`): el celular de demostración y su espejo de WhatsApp (`phone-demo.ts`, `order-message.ts`, hasta que exista el ejemplo externo), el armado del mensaje del formulario (`contact-form.ts`), `site-menu.ts` y `tokens.ts` (lee duración y curva del CSS para la animación del celular).

### Textos, datos e importaciones

- **`src/data/`** — todo el texto del sitio: `site.ts` (marca, `SITE`, home, 404), `solutions.ts` (soluciones, `SOLUTION_PAGE`, `LANDING_PICKER`), `commerce-service.ts`, `ui.ts` (textos de interfaz que se repiten), `anchors.ts` (ids de sección y de la ventana del formulario), `navigation.ts`, `photos.ts`, `types.ts`.
- **`src/lib/`** — reglas puras: `order.ts`, `contact-message.ts`, `contact.ts`, `links.ts` (`EXTERNAL_LINK`), `text.ts` (`initials`, `firstName`, `quoted`, `ordinal`), `view-transitions.ts`, `photos.ts`.
- **Alias** (`tsconfig.json`): `@components/*`, `@layouts/*`, `@data`, `@lib`, `@scripts/*`, `@styles/*`, `@assets/*`. No hay importaciones con `../`.
- **Barriles** (`index.ts`): componentes y páginas importan de `@data`, `@lib`, `@components/ui`, `@components/home`, `@components/solution`. Dos excepciones:
  - dentro de una misma carpeta se importa el archivo vecino (`./Icon.astro`), para no crear ciclos;
  - los scripts del navegador y `/api/contato` importan el módulo directo (`@data/ui`, `@lib/order`): el barril llevaría al JavaScript del visitante datos que no usa.
- `src/env.d.ts` declara los módulos `.astro` para el `tsc` puro (el editor y el build ya los entienden).
- Astro descarta el espacio entre una expresión y el texto o enlace que la sigue: en frases con enlaces se usa `{' '}`.

### Fotos

Las fotos reales van en `src/assets/fotos/` con el nombre de `src/data/photos.ts` (`retrato-trabalho`, `retrato`, `processo`, `curitiba`). Mientras falta una, su lugar muestra un marcador gris con la descripción, la proporción y el tamaño mínimo. `SHOW_PHOTO_PLACEHOLDERS = false` oculta los marcadores (desactivarlo antes de publicar si falta alguna foto).

Las rutas antiguas `/pt/…`, `/es` y `/en` redirigen con 301, y también `/propostas/center-gas/`, que lleva al proyecto de Center Gás (`https://centergas-v3.pages.dev/`), publicado aparte (ver `redirects` en `astro.config.mjs`).

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
