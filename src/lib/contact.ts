// src/lib/contact.ts — Canal de contato comercial da ARCAV para os CTAs.
import { BRAND } from '../data/site';

/**
 * Número comercial de WhatsApp da ARCAV em formato internacional, só dígitos.
 * Informado pelo Armando em 2026-11-21. Nunca usar aqui o número de um cliente ou prospecto.
 * Com null, os CTAs e o formulário voltam a usar o e-mail público da ARCAV.
 */
export const ARCAV_WHATSAPP: string | null = '5541998450477';

/** O mesmo número no formato que as pessoas leem. */
export const ARCAV_WHATSAPP_DISPLAY = '(41) 99845-0477';

/** Prazo de resposta prometido nos formulários e CTAs (decisão do Armando, 2026-11-21). */
export const RESPONSE_TIME = 'em até 1 hora';

/** Link para abrir uma conversa no WhatsApp da ARCAV, com mensagem opcional. */
export function whatsappLink(message?: string): string | null {
  if (!ARCAV_WHATSAPP) return null;
  return `https://wa.me/${ARCAV_WHATSAPP}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export type ContactChannel = 'whatsapp' | 'email';

export interface ContactLink {
  href: string;
  channel: ContactChannel;
}

/** Monta o link de contato com a ARCAV com uma mensagem pronta. */
export function arcavContactLink(subject: string, message: string): ContactLink {
  if (ARCAV_WHATSAPP) {
    return {
      href: `https://wa.me/${ARCAV_WHATSAPP}?text=${encodeURIComponent(message)}`,
      channel: 'whatsapp',
    };
  }
  return {
    href: `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
    channel: 'email',
  };
}

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/** Formata um valor em reais: 3900 → "R$ 3.900". */
export function formatBRL(value: number): string {
  return brl.format(value);
}
