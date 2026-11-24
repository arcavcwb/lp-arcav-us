// Marca o passo atual do guia de uma demonstração (DemoGuide.astro): os anteriores ficam feitos.
// `current` maior que o número de passos marca todos como feitos.
export function setGuideStep(scope: ParentNode, current: number): void {
  scope.querySelectorAll<HTMLElement>('[data-guide-step]').forEach((li, i) => {
    const n = i + 1;
    li.toggleAttribute('data-done', n < current);
    if (n === current) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
  });
}
