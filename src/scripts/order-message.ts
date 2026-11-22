// Ilustração do WhatsApp no modo `live`: espelha o pedido montado no celular de demonstração.
// Sem pedido, mostra o convite para montar um; com pedido, mostra as linhas como chegariam.
import { ORDER_EVENT, formatOrderLine, type OrderEventDetail } from '@lib/order';

export function initOrderMessages(): void {
  const roots = [...document.querySelectorAll<HTMLElement>('[data-order-message]')];
  if (roots.length === 0) return;

  document.addEventListener(ORDER_EVENT, (event) => {
    const { items } = (event as CustomEvent<OrderEventDetail>).detail;
    roots.forEach((root) => {
      const empty = root.querySelector<HTMLElement>('[data-order-empty]')!;
      const thread = root.querySelector<HTMLElement>('[data-order-thread]')!;
      const lines = root.querySelector<HTMLElement>('[data-order-lines]')!;
      empty.hidden = items.length > 0;
      thread.hidden = items.length === 0;
      lines.replaceChildren(
        ...items.map((item) => {
          const li = document.createElement('li');
          li.textContent = formatOrderLine(item);
          return li;
        }),
      );
    });
  });
}
