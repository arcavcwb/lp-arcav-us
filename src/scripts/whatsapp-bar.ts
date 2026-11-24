// Barra fixa do WhatsApp (components/ui/WhatsAppBar.astro). Ela se esconde em dois casos:
// - `data-wa-bar-hide`: outro botão do WhatsApp está à vista (ações do hero, fechamento, "Quero isso no
//   meu negócio", rodapé), para não repetir o que a pessoa já vê;
// - `data-wa-bar-avoid`: algo que se toca (o celular das demonstrações) passa pela faixa de baixo da
//   tela, onde a barra fica, para não cobrir os botões dele.
// Escondida, a barra sai da ordem de tabulação (visibility, no CSS).
export function initWhatsAppBar(): void {
  const bar = document.querySelector<HTMLElement>('[data-wa-bar]');
  if (!bar || !('IntersectionObserver' in window)) return;

  const inView = new Set<Element>();
  const underBar = new Set<Element>();
  const update = () => bar.classList.toggle('is-shown', inView.size === 0 && underBar.size === 0);
  const track = (set: Set<Element>) => (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => (entry.isIntersecting ? set.add(entry.target) : set.delete(entry.target)));
    update();
  };

  const seen = new IntersectionObserver(track(inView));
  document.querySelectorAll('[data-wa-bar-hide]').forEach((el) => seen.observe(el));

  const avoid = document.querySelectorAll('[data-wa-bar-avoid]');
  if (avoid.length === 0) return;
  // A faixa observada tem a altura da barra; muda quando a tela muda de tamanho (barra de endereço).
  let strip: IntersectionObserver | undefined;
  let height = 0;
  const watchStrip = () => {
    if (window.innerHeight === height) return;
    height = window.innerHeight;
    strip?.disconnect();
    underBar.clear();
    const top = Math.max(0, height - bar.offsetHeight);
    strip = new IntersectionObserver(track(underBar), { rootMargin: `-${top}px 0px 0px 0px` });
    avoid.forEach((el) => strip?.observe(el));
  };
  watchStrip();
  window.addEventListener('resize', watchStrip, { passive: true });
}
