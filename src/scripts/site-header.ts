// Cabeçalho: fio inferior depois de rolar a página e menu sanfona no celular
// (abre/fecha pelo botão, fecha ao escolher um link ou com Esc).
import { ui } from '../data/ui';

/** A partir de quantos pixels de rolagem o cabeçalho ganha o fio inferior. */
export const SCROLL_THRESHOLD = 8;

export function initSiteHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-site-nav]');
  const label = document.querySelector<HTMLElement>('[data-menu-label]');

  if (header) {
    const onScroll = () => header.toggleAttribute('data-scrolled', window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (!toggle || !nav) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.toggleAttribute('data-open', open);
    if (label) label.textContent = open ? ui.header.menuClose : ui.header.menuOpen;
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  nav.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
}
