// Palco das demonstrações (components/demos/DemoStage.astro): abas acessíveis (setas, Home e End),
// endereços diretos (#experimente-loja…), carga do script de cada demonstração só quando ela é
// escolhida, "Recomeçar" e "Quero isso no meu negócio" (os dois só depois do resultado; quando o botão
// abre o formulário em vez do WhatsApp, marca o serviço e avisa a mensagem de que o visitante testou a
// demonstração). No celular, quando o resultado chega, a página desce até "Você recebe".
import type { DemoInstance, DemoModule } from './demos/types';

/** Script de cada demonstração, pelo id (data/demos.ts, DEMO_IDS). Cada um vira um arquivo à parte. */
const LOADERS: Record<string, () => Promise<DemoModule>> = {
  loja: () => import('./demos/loja'),
};

/** Margem para começar a carregar a demonstração aberta antes de ela chegar à tela. */
const PRELOAD_MARGIN = '200px';

export function initDemoStage(): void {
  const stage = document.querySelector<HTMLElement>('[data-demo-stage]');
  if (!stage) return;
  const tabs = [...stage.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  // Pelo data-: com uma demonstração só, o painel não tem role="tabpanel" (DemoStage.astro).
  const panels = [...stage.querySelectorAll<HTMLElement>('[data-demo-panel]')];
  if (!panels.length) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const instances = new Map<string, Promise<DemoInstance | null>>();
  let current = panels[0];
  let visible = false;

  const scrollTo = (el: HTMLElement) => el.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });

  const load = (panel: HTMLElement) => {
    const id = panel.dataset.demoPanel!;
    if (!instances.has(id)) {
      const loader = LOADERS[id];
      const status = panel.querySelector<HTMLElement>('[data-demo-status]')!;
      const want = panel.querySelector<HTMLElement>('[data-demo-want]')!;
      const restart = panel.querySelector<HTMLElement>('[data-demo-restart]')!;
      const client = panel.querySelector<HTMLElement>('[data-demo-client]')!;
      const owner = panel.querySelector<HTMLElement>('[data-demo-owner]')!;
      const ctx = {
        done(announcement: string) {
          status.textContent = announcement;
          want.hidden = false;
          restart.hidden = false;
          // Um embaixo do outro (celular): leva o visitante até o resultado.
          if (owner.offsetTop > client.offsetTop) scrollTo(owner);
        },
      };
      instances.set(id, loader ? loader().then((m) => m.mount(panel, ctx)).catch(() => null) : Promise.resolve(null));
    }
    return instances.get(id)!;
  };

  const select = (panel: HTMLElement, { focusTab = false } = {}) => {
    current = panel;
    tabs.forEach((tab) => {
      const on = tab.getAttribute('aria-controls') === panel.id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focusTab) tab.focus();
    });
    panels.forEach((p) => (p.hidden = p !== panel));
    if (visible) load(panel);
  };

  // Com JavaScript: abas à vista, só o painel escolhido aberto e as ações só depois do resultado.
  stage.classList.add('is-ready');
  panels.forEach((panel) =>
    panel.querySelectorAll<HTMLElement>('[data-demo-want], [data-demo-restart]').forEach((el) => (el.hidden = true)),
  );
  select(current);

  tabs.forEach((tab, i) => {
    const panel = panels.find((p) => p.id === tab.getAttribute('aria-controls'))!;
    tab.addEventListener('click', () => {
      select(panel);
      load(panel);
      history.replaceState(null, '', `#${panel.id}`);
    });
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].click();
      tabs[next].focus();
    });
  });

  panels.forEach((panel) => {
    const status = panel.querySelector<HTMLElement>('[data-demo-status]')!;
    const want = panel.querySelector<HTMLElement>('[data-demo-want]')!;
    const restart = panel.querySelector<HTMLElement>('[data-demo-restart]')!;
    restart.addEventListener('click', () => {
      status.textContent = '';
      want.hidden = true;
      restart.hidden = true;
      void load(panel).then((instance) => instance?.reset());
    });
    // Sem número de WhatsApp, o botão abre o formulário (popovertarget); aqui, o serviço marcado e o aviso na mensagem.
    if (!(want instanceof HTMLButtonElement)) return;
    want.addEventListener('click', () => {
      const label = want.dataset.demoWant!;
      document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
        const box = [...form.querySelectorAll<HTMLInputElement>('input[name="needs"]')].find((b) => b.value === label);
        if (!box) return;
        box.checked = true;
        box.dispatchEvent(new Event('change', { bubbles: true }));
        form.dataset.demo = label;
      });
    });
  });

  // Endereços diretos: ao chegar com #experimente-… e nos links "Testar" da página.
  const panelFor = (hash: string) => panels.find((p) => `#${p.id}` === hash);
  const open = (panel: HTMLElement) => {
    select(panel);
    load(panel);
    scrollTo(stage.closest('section') ?? stage);
  };
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    const panel = panelFor(link.getAttribute('href')!);
    if (!panel) return;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      history.pushState(null, '', `#${panel.id}`);
      open(panel);
    });
  });
  window.addEventListener('hashchange', () => {
    const panel = panelFor(location.hash);
    if (panel) open(panel);
  });
  const initial = panelFor(location.hash);
  if (initial) open(initial);

  // A demonstração aberta carrega quando a seção se aproxima da tela.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        visible = true;
        load(current);
      },
      { rootMargin: PRELOAD_MARGIN },
    );
    io.observe(stage);
  } else {
    visible = true;
    load(current);
  }
}
