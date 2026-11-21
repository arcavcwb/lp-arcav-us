# ARCAV Landing Page (lp-arcav-us)

Sitio web de ARCAV, solo en portugués de Brasil (pt-BR), desarrollado con **Astro** y configurado para despliegue en **Cloudflare Workers**. Sistema visual en `DESIGN.md`.

---

## 🚀 Estructura del Proyecto

```text
/
├── docs/                 # Marca, contenido, casos, sistema de diseño y propuestas
├── public/               # Assets estáticos (favicon, fuentes Schibsted Grotesk)
├── src/
│   ├── assets/brand/     # Logo y foto de Armando (ver README de la carpeta)
│   ├── components/       # home/, ui/ (Header, Footer, PhoneDemo, ContactForm…), proposal/
│   ├── data/             # Contenido pt-BR: site.ts, commerce-service.ts, proposals/
│   ├── lib/contact.ts    # Canal de contacto (e-mail; WhatsApp cuando haya número verificado)
│   └── pages/
│       ├── index.astro                    # Home
│       ├── solucoes/comercio-digital.astro # Soluciones para comercios
│       └── propostas/center-gas.astro     # Propuesta Center Gás (noindex)
└── package.json
```

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
