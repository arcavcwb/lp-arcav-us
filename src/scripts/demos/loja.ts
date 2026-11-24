// Demonstração da loja: liga o celular e a conversa do WhatsApp do painel. Quando o visitante toca em
// "Enviar", o pedido aparece em "Você recebe" e o palco anuncia o resultado. Nada sai do navegador.
import { DEMO_COPY } from '@data/demos';
import { DEMO_RESET_EVENT, ORDER_SENT_EVENT, formatOrderLine, type OrderEventDetail } from '@lib/order';
import { initOrderMessages } from '@scripts/order-message';
import { initPhoneDemos } from '@scripts/phone-demo';
import type { DemoContext, DemoInstance } from './types';

export function mount(panel: HTMLElement, ctx: DemoContext): DemoInstance {
  initPhoneDemos(panel);
  initOrderMessages(panel);
  const phone = panel.querySelector<HTMLElement>('[data-phone-demo]')!;
  const chat = panel.querySelector<HTMLElement>('[data-order-message]')!;

  phone.addEventListener(ORDER_SENT_EVENT, (event) => {
    const { items } = (event as CustomEvent<OrderEventDetail>).detail;
    ctx.done(DEMO_COPY.loja.received(items.map(formatOrderLine).join(', ')));
  });

  return {
    reset() {
      phone.dispatchEvent(new Event(DEMO_RESET_EVENT));
      chat.dispatchEvent(new Event(DEMO_RESET_EVENT));
    },
  };
}
