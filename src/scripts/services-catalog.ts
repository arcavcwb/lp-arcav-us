// src/scripts/services-catalog.ts — Catálogo de serviços da home (home/Services.astro).
// A troca de serviço é HTML e CSS (botões de opção). Este script só ajuda em duas coisas, e sem ele
// tudo funciona igual:
// 1. rolagem no celular: quando a ficha aberta acima se fecha, a frase escolhida sobe e pode sumir
//    sob o cabeçalho; aqui ela volta para a vista;
// 2. imagem da ficha: as fichas fechadas carregam as imagens só quando abrem (loading="lazy", para
//    não disputar a rede com as fontes no primeiro carregamento); ao apontar ou focar uma linha, a
//    imagem da ficha dela já começa a baixar.

/** Começa a baixar as imagens da ficha que vem logo depois da linha apontada ou focada. */
function warmPanel(event: Event): void {
  const option = (event.target as Element | null)?.closest?.('.services__option');
  option?.nextElementSibling?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
    img.loading = 'eager';
  });
}

export function initServicesCatalog(): void {
  document.querySelectorAll<HTMLElement>('[data-services]').forEach((root) => {
    root.addEventListener('pointerover', warmPanel);
    root.addEventListener('focusin', warmPanel);
    root.addEventListener('change', (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      const label = input.closest<HTMLElement>('.services__option');
      if (!label) return;
      const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
      if (label.getBoundingClientRect().top >= headerBottom) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      label.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    });
  });
}
