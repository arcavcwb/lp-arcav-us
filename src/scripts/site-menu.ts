// Menu do celular: o painel é um popover (abre, fecha, Esc e toque fora sem JavaScript).
// Só falta fechá-lo depois de escolher um link da própria página, que o HTML não faz sozinho.
export function initSiteMenu(): void {
  const nav = document.querySelector<HTMLElement>('[data-site-nav]');
  nav?.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a') && nav.matches(':popover-open')) nav.hidePopover();
  });
}
