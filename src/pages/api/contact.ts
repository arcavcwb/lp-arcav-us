/**
 * POST /api/contact -> reenvía el formulario de contacto al webhook de n8n.
 * Contrato: src/lib/contact.ts. Documentación: docs/contacto.md.
 *
 * Variables (Astro 6 + @astrojs/cloudflare 13): se leen con
 * `import { env } from "cloudflare:workers"` (Astro.locals.runtime ya no existe).
 * - N8N_CONTACT_WEBHOOK_URL   (obligatoria, https)
 * - N8N_CONTACT_WEBHOOK_TOKEN (opcional, se envía como Authorization: Bearer)
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { handleContactPost, methodNotAllowed } from "../../lib/contact-server.ts";

export const prerender = false;

interface ContactEnv {
  N8N_CONTACT_WEBHOOK_URL?: unknown;
  N8N_CONTACT_WEBHOOK_TOKEN?: unknown;
}

export const POST: APIRoute = ({ request }) => {
  const vars = env as unknown as ContactEnv;
  return handleContactPost(request, {
    webhookUrl: vars.N8N_CONTACT_WEBHOOK_URL,
    webhookToken: vars.N8N_CONTACT_WEBHOOK_TOKEN,
  });
};

/** Cualquier otro método: 405 con cabecera Allow: POST. */
export const ALL: APIRoute = () => methodNotAllowed();
