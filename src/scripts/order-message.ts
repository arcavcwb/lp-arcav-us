// Ilustração do WhatsApp no modo `live`: espelha o pedido do celular de demonstração.
// data-order-message="change": acompanha cada mudança do carrinho; "send": só mostra o pedido quando
// o visitante toca em "Enviar" (como chegaria de verdade). Sem pedido, mostra o convite para montar
// um. DEMO_RESET_EVENT na ilustração a volta ao convite.
import { DEMO_RESET_EVENT, ORDER_EVENT, ORDER_SENT_EVENT, formatOrderLine, type OrderEventDetail, type OrderItem } from '@lib/order';

function show(root: HTMLElement, items: OrderItem[]): void {
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
}

/** Liga as ilustrações de `scope` (a página inteira, ou só o painel de uma demonstração), uma vez cada. */
export function initOrderMessages(scope: ParentNode = document): void {
  scope.querySelectorAll<HTMLElement>('[data-order-message]:not([data-ready])').forEach((root) => {
    root.dataset.ready = '';
    const event = root.dataset.orderMessage === 'send' ? ORDER_SENT_EVENT : ORDER_EVENT;
    document.addEventListener(event, (e) => show(root, (e as CustomEvent<OrderEventDetail>).detail.items));
    root.addEventListener(DEMO_RESET_EVENT, () => show(root, []));
  });
}
