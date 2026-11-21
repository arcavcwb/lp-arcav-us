// Pedido de exemplo (celular de demonstração e ilustração do WhatsApp): tipos e regras puras,
// usadas tanto na renderização (frontmatter) quanto nos scripts do navegador.
import { ui } from '../data/ui';

export interface OrderItem {
  qty: number;
  name: string;
}

/** Evento que o celular dispara a cada mudança; a ilustração do WhatsApp (`live`) escuta. */
export const ORDER_EVENT = 'demo:order';

export interface OrderEventDetail {
  items: OrderItem[];
}

/** Quantidade máxima de cada produto na demonstração. */
export const MAX_QTY = 9;

export const clampQty = (qty: number): number => Math.min(MAX_QTY, Math.max(0, qty));

export const totalQty = (items: OrderItem[]): number => items.reduce((sum, item) => sum + item.qty, 0);

/** "2 × Gás P13" */
export const formatOrderLine = ({ qty, name }: OrderItem): string => `${qty} × ${name}`;

/** Resumo abaixo da lista: "Nenhum item ainda", "1 item no pedido", "3 itens no pedido". */
export const orderSummary = (total: number): string => {
  const { summary } = ui.phoneDemo;
  return total === 0 ? summary.empty : total === 1 ? summary.one : summary.many(total);
};

/** Passos do guia "Experimente" (os mesmos de ui.phoneDemo.guideSteps), mais o "concluído". */
export const GUIDE = { tap: 1, review: 2, send: 3, done: 4 } as const;

/** Passo atual do guia: tocar em + enquanto o pedido está vazio, revisar, enviar. */
export const guideStep = (view: 'store' | 'message', total: number): number =>
  view === 'message' ? GUIDE.send : total > 0 ? GUIDE.review : GUIDE.tap;
