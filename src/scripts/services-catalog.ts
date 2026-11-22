// src/scripts/services-catalog.ts — Catálogo de serviços da home (home/Services.astro).
// A troca de serviço é HTML e CSS (botões de opção). Este script só adianta a imagem da ficha:
// as fichas fechadas carregam as imagens só quando abrem (loading="lazy", para não disputar a rede
// com as fontes no primeiro carregamento); ao apontar ou focar um disco, a imagem da ficha dele já
// começa a baixar. Sem ele, tudo funciona igual.

/** Começa a baixar as imagens da ficha que vem logo depois do disco apontado ou focado. */
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
  });
}
