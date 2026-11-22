// src/pages/api/contato.ts — Recebe o formulário do site e entrega o contato à ARCAV.
//
// Canais, em ordem:
//   1. N8N_WEBHOOK_URL (variável/secret): envia o contato em JSON para o n8n, que pode
//      avisar o Armando e responder o cliente pelo WhatsApp (Evolution API).
//   2. SEND_EMAIL (binding send_email da Cloudflare): envia um e-mail para a ARCAV.
// Sem nenhum dos dois, responde 503 e o formulário usa o plano B: monta a mensagem e abre
// o WhatsApp (ou o e-mail) do visitante. Nada é guardado aqui.
// Passo a passo: README.md, seção "Formulário de contato".
export const prerender = false;

import { composeContactMessage } from '@lib/contact-message';
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { EmailMessage } from 'cloudflare:email';
import { BRAND } from '@data/site';

interface SendEmailBinding {
  send(message: EmailMessage): Promise<void>;
}

const LIMITS: Record<string, number> = { name: 120, business: 120, link: 300, reply: 160, message: 4000, topic: 120 };

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const oneLine = (value: string) => value.replace(/[\r\n]+/g, ' ');

/** Base64 de texto UTF-8 em linhas de 76 caracteres (corpo MIME). */
function base64(text: string, wrap = false) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const encoded = btoa(binary);
  return wrap ? (encoded.match(/.{1,76}/g) ?? []).join('\r\n') : encoded;
}

export const POST: APIRoute = async ({ request }) => {
  const vars = env as unknown as Record<string, unknown>;
  const binding = vars.SEND_EMAIL as SendEmailBinding | undefined;
  const webhook = typeof vars.N8N_WEBHOOK_URL === 'string' && vars.N8N_WEBHOOK_URL ? vars.N8N_WEBHOOK_URL : '';
  if (!binding && !webhook) return json(503, { ok: false, reason: 'unavailable' });

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json(400, { ok: false, reason: 'invalid' });
  }

  // Campo-armadilha: pessoas não o veem; robôs costumam preenchê-lo.
  if (clean(data.website, 200)) return json(200, { ok: true });

  const variant = data.variant === 'store' ? 'store' : 'general';
  const d = Object.fromEntries(Object.entries(LIMITS).map(([key, max]) => [key, clean(data[key], max)]));
  const missing = ['name', 'reply', variant === 'store' ? 'link' : 'message'].filter((key) => !d[key]);
  if (missing.length) return json(400, { ok: false, reason: 'missing', fields: missing });

  const { subject, body } = composeContactMessage(variant, d.topic, {
    name: d.name,
    reply: d.reply,
    business: d.business,
    link: d.link,
    message: d.message,
  });

  if (webhook) {
    try {
      const headers: Record<string, string> = { 'content-type': 'application/json' };
      if (typeof vars.N8N_WEBHOOK_TOKEN === 'string' && vars.N8N_WEBHOOK_TOKEN) {
        headers.authorization = `Bearer ${vars.N8N_WEBHOOK_TOKEN}`;
      }
      const response = await fetch(webhook, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          source: 'site-arcav',
          variant,
          topic: d.topic,
          page: request.headers.get('referer') ?? '',
          receivedAt: new Date().toISOString(),
          name: d.name,
          business: d.business,
          link: d.link,
          reply: d.reply,
          message: d.message,
          subject,
          text: body,
        }),
        signal: AbortSignal.timeout(6000),
      });
      if (response.ok) return json(200, { ok: true, channel: 'n8n' });
    } catch {
      // segue para o e-mail, se existir
    }
    if (!binding) return json(502, { ok: false, reason: 'send_failed' });
  }

  if (!binding) return json(503, { ok: false, reason: 'unavailable' });

  const from = typeof vars.CONTACT_FROM === 'string' ? vars.CONTACT_FROM : 'site@arcav.us';
  const to = typeof vars.CONTACT_TO === 'string' ? vars.CONTACT_TO : BRAND.email;
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.reply) ? d.reply : '';

  const raw = [
    `From: Site ARCAV <${from}>`,
    `To: <${to}>`,
    replyTo ? `Reply-To: <${oneLine(replyTo)}>` : '',
    `Subject: =?UTF-8?B?${base64(oneLine(subject))}?=`,
    `Message-ID: <${crypto.randomUUID()}@${from.split('@')[1] ?? 'arcav.us'}>`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64(body, true),
  ]
    .filter((line, i) => line !== '' || i > 8)
    .join('\r\n');

  try {
    await binding.send(new EmailMessage(from, to, raw));
    return json(200, { ok: true, channel: 'email' });
  } catch {
    return json(502, { ok: false, reason: 'send_failed' });
  }
};
