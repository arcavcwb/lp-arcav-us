// Nomes das View Transitions entre páginas. O cabeçalho tem nome fixo no CSS (base.css).

/** O título de uma solução (na home ou na lista de tipos) viaja até o título da página dela. */
export const solutionTransition = (slug: string) => ({ 'view-transition-name': `sol-${slug}` });
