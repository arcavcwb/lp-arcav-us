// Celular de demonstração: o visitante ajusta as quantidades, revisa o pedido e vê a mensagem do
// WhatsApp pronta. Com o guia "Experimente", marca os passos e destaca o primeiro "+" uma vez.
// A cada mudança dispara ORDER_EVENT com os itens, para a ilustração do WhatsApp espelhar.
import { ui } from '../data/ui';
import {
  GUIDE,
  ORDER_EVENT,
  clampQty,
  formatOrderLine,
  guideStep,
  orderSummary,
  totalQty,
  type OrderEventDetail,
  type OrderItem,
} from '../lib/order';
import { cssDurationMs, cssToken } from './tokens';

/** Atraso do destaque no "+" depois que o celular aparece na tela ou depois de um link para ele. */
const NUDGE_DELAY_ON_VIEW = 500;
const NUDGE_DELAY_AFTER_LINK = 450;
/** Quanto do celular precisa aparecer na tela para o destaque começar. */
const VISIBLE_RATIO = 0.6;
/** Quanto o número cresce ao mudar a quantidade, antes de voltar ao tamanho normal. */
const QTY_POP_SCALE = 1.35;

function initPhoneDemo(root: HTMLElement, reduceMotion: MediaQueryList): void {
  const store = root.querySelector<HTMLElement>('[data-view="store"]')!;
  const message = root.querySelector<HTMLElement>('[data-view="message"]')!;
  const count = root.querySelector<HTMLElement>('[data-count]')!;
  const summary = root.querySelector<HTMLElement>('[data-summary]')!;
  const review = root.querySelector<HTMLButtonElement>('[data-review]')!;
  const lines = root.querySelector<HTMLElement>('[data-lines]')!;
  const sendStatus = root.querySelector<HTMLElement>('[data-send-status]')!;
  const products = [...root.querySelectorAll<HTMLElement>('[data-product]')];
  const steps = [...root.querySelectorAll<HTMLElement>('[data-guide-step]')];
  const firstPlus = root.querySelector<HTMLButtonElement>('[data-product] [data-step="1"]');
  const defaultHint = sendStatus.textContent;

  const qtyOf = (el: HTMLElement) => Number(el.dataset.qty ?? 0);
  const items = (): OrderItem[] =>
    products.filter((el) => qtyOf(el) > 0).map((el) => ({ qty: qtyOf(el), name: el.dataset.name ?? '' }));
  const total = () => totalQty(items());

  // Guia: os passos anteriores ao atual ficam marcados como feitos.
  const setStep = (current: number) => {
    steps.forEach((li, i) => {
      const n = i + 1;
      li.toggleAttribute('data-done', n < current);
      if (n === current) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
  };

  // Destaque único no primeiro "+": convida a tocar sem repetir a animação a cada rolagem.
  let touched = false;
  const nudge = () => {
    if (touched || !firstPlus || reduceMotion.matches) return;
    firstPlus.classList.remove('is-nudging');
    void firstPlus.offsetWidth;
    firstPlus.classList.add('is-nudging');
  };

  if (steps.length && firstPlus) {
    firstPlus.addEventListener('animationend', () => firstPlus.classList.remove('is-nudging'));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            io.disconnect();
            setTimeout(nudge, NUDGE_DELAY_ON_VIEW);
          }
        },
        { threshold: VISIBLE_RATIO },
      );
      io.observe(root);
    }
    // "Testar o exemplo" e outros links para a demo: depois da rolagem, foco e destaque no "+".
    if (root.id) {
      document.querySelectorAll<HTMLAnchorElement>(`a[href="#${root.id}"]`).forEach((link) => {
        link.addEventListener('click', () => {
          setTimeout(() => {
            if (root.dataset.state !== 'store') return;
            firstPlus.focus({ preventScroll: true });
            touched = false;
            nudge();
          }, NUDGE_DELAY_AFTER_LINK);
        });
      });
    }
  }

  const render = () => {
    const current = items();
    const sum = totalQty(current);
    count.textContent = String(sum);
    summary.textContent = orderSummary(sum);
    review.disabled = sum === 0;
    lines.replaceChildren(
      ...current.map((item) => {
        const li = document.createElement('li');
        li.textContent = formatOrderLine(item);
        return li;
      }),
    );
    root.dispatchEvent(new CustomEvent<OrderEventDetail>(ORDER_EVENT, { bubbles: true, detail: { items: current } }));
  };

  const show = (view: 'store' | 'message') => {
    root.dataset.state = view;
    const [on, off] = view === 'store' ? [store, message] : [message, store];
    on.inert = false;
    on.removeAttribute('aria-hidden');
    off.inert = true;
    off.setAttribute('aria-hidden', 'true');
    setStep(guideStep(view, total()));
    if (view === 'message') {
      sendStatus.textContent = defaultHint;
      root.querySelector<HTMLButtonElement>('[data-back]')?.focus({ preventScroll: true });
    } else {
      review.focus({ preventScroll: true });
    }
  };

  products.forEach((el) => {
    const qtyLabel = el.querySelector<HTMLElement>('[data-qty-label]')!;
    el.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((button) => {
      button.addEventListener('click', () => {
        const next = clampQty(qtyOf(el) + Number(button.dataset.step));
        if (next === qtyOf(el)) return;
        touched = true;
        firstPlus?.classList.remove('is-nudging');
        el.dataset.qty = String(next);
        qtyLabel.textContent = String(next);
        if (!reduceMotion.matches) {
          qtyLabel.animate([{ transform: `scale(${QTY_POP_SCALE})` }, { transform: 'scale(1)' }], {
            duration: cssDurationMs('--transition-duration-pop'),
            easing: cssToken('--ease-out'),
          });
        }
        render();
        setStep(guideStep('store', total()));
      });
    });
  });

  review.addEventListener('click', () => show('message'));
  root.querySelector('[data-back]')?.addEventListener('click', () => show('store'));
  const nextStep = root.querySelector<HTMLElement>('[data-next]');
  root.querySelector('[data-send]')?.addEventListener('click', () => {
    sendStatus.textContent = ui.phoneDemo.sent;
    setStep(GUIDE.done);
    if (nextStep) {
      nextStep.hidden = false;
      nextStep.querySelector('a')?.focus({ preventScroll: true });
    }
  });

  render();
  setStep(guideStep('store', total()));
}

export function initPhoneDemos(): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll<HTMLElement>('[data-phone-demo]').forEach((root) => initPhoneDemo(root, reduceMotion));
}
