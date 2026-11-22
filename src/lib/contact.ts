// src/lib/contact.ts — Canal de contato comercial da ARCAV para os CTAs.

/**
 * Número comercial de WhatsApp da ARCAV em formato internacional, só dígitos.
 * Informado pelo Armando em 2026-11-21. Nunca usar aqui o número de um cliente ou prospecto.
 * Com null, os CTAs e o formulário voltam a usar o e-mail público da ARCAV.
 */
export const ARCAV_WHATSAPP: string | null = '5541998450477';

/** O mesmo número no formato que as pessoas leem. */
export const ARCAV_WHATSAPP_DISPLAY = '(41) 99845-0477';

/**
 * Prazo de resposta prometido nos formulários e CTAs. null = nenhum prazo é prometido.
 * Desativado na fase 1 de estabilização (2026-11-21): a resposta ainda é manual. Reativar
 * (ex.: 'em até 1 hora') só quando a automação com n8n + Evolution garantir o prazo.
 */
export const RESPONSE_TIME: string | null = null;

/**
 * true quando /api/contato entrega as mensagens (N8N_WEBHOOK_URL ou SEND_EMAIL configurados).
 * Com false, o formulário não promete "enviar": abre o WhatsApp com a mensagem pronta.
 * Ligar só depois de testar um envio real em produção.
 */
export const DIRECT_SEND = false;

/** Link para abrir uma conversa no WhatsApp da ARCAV, com mensagem opcional. */
export function whatsappLink(message?: string): string | null {
  if (!ARCAV_WHATSAPP) return null;
  return `https://wa.me/${ARCAV_WHATSAPP}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

/** Rota que entrega o formulário quando DIRECT_SEND está ligado (src/pages/api/contato.ts). */
export const CONTACT_ENDPOINT = '/api/contato';

/** Quanto o formulário espera a resposta de CONTACT_ENDPOINT antes de usar o plano B. */
export const CONTACT_TIMEOUT_MS = 8000;
