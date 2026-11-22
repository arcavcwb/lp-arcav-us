// src/data/types.ts — Tipos do exemplo de loja (celular de demonstração e ilustração do WhatsApp).

/** Produto da loja de exemplo no celular interativo (PhoneDemo). */
export interface DemoProduct {
  name: string;
  detail: string;
  qty?: number;
}

export interface IllustrativeOrder {
  /** Rótulo técnico de la tarjeta, al estilo del diagrama del hero de ARCAV. */
  label: string;
  items: Array<{ qty: number; name: string }>;
  action: string;
  caption: string;
}
