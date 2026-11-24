// src/data/demos.ts — Demonstrações da seção "Experimente antes de contratar" (home).
// Uma demonstração só aparece quando o slug dela está em PUBLISHED_DEMOS.
// Cada uma tem um endereço direto na home: #experimente-loja, #experimente-automacao…
import { ANCHOR } from './anchors';

/** Parte final do endereço direto de cada demonstração, pelo slug da solução (solutions.ts). */
export const DEMO_IDS: Record<string, string> = {
  'comercio-digital': 'loja',
  'sistemas-e-automacao': 'automacao',
  'landing-pages': 'landing',
  'site-institucional': 'site',
  migracao: 'migracao',
};

/** Demonstrações publicadas, na ordem do seletor. As outras não aparecem em lugar nenhum. */
export const PUBLISHED_DEMOS: string[] = ['comercio-digital'];

/** Id da demonstração na página (ex.: experimente-loja). */
export const demoAnchor = (slug: string): string => `${ANCHOR.experiment}-${DEMO_IDS[slug]}`;

/** Textos de cada demonstração (o que não é do celular nem da ilustração do WhatsApp, em ui.ts). */
export const DEMO_COPY = {
  loja: {
    /** "Você recebe" antes do envio. */
    empty: 'Monte um pedido no celular e toque em Enviar: ele chega aqui, pronto para você atender.',
    /** Anúncio para leitores de tela quando o pedido chega. */
    received: (lines: string) => `Pedido recebido no WhatsApp da loja: ${lines}.`,
  },
};
