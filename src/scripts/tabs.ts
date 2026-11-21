// Abas acessíveis (padrão WAI-ARIA "tabs"): clique e teclado trocam o painel visível.
// Marcação esperada dentro de cada raiz: botões `[data-tab]` (role="tab") e painéis
// `[data-panel]` (role="tabpanel"), na mesma ordem. Usado pelo mostruário da home e pela
// escolha do tipo de landing page.

/** Índice da aba de destino para uma tecla, ou `null` se a tecla não navega entre abas. */
export function tabIndexForKey(key: string, current: number, total: number): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % total;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + total) % total;
    case 'Home':
      return 0;
    case 'End':
      return total - 1;
    default:
      return null;
  }
}

/** Liga as abas de cada elemento que casa com `rootSelector`. */
export function initTabs(rootSelector: string): void {
  document.querySelectorAll<HTMLElement>(rootSelector).forEach((root) => {
    const tabs = [...root.querySelectorAll<HTMLElement>('[data-tab]')];
    const panels = [...root.querySelectorAll<HTMLElement>('[data-panel]')];
    if (tabs.length === 0) return;

    const select = (index: number, focus = false) => {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (panels[i]) panels[i].hidden = !selected;
      });
      if (focus) tabs[index].focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i));
      tab.addEventListener('keydown', (event) => {
        const next = tabIndexForKey(event.key, i, tabs.length);
        if (next === null) return;
        event.preventDefault();
        select(next, true);
      });
    });
  });
}
