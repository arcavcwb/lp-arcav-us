// src/data/navigation.ts — Links do cabeçalho e do rodapé.
import { ANCHOR, HOME_PATH, toAnchor } from './anchors';
import { SERVICES } from './solutions';

export interface NavLink {
  href: string;
  label: string;
}

/** Navegação principal. `base` aponta para as seções da home a partir de outras páginas ('/'). */
export function mainNav(base = ''): NavLink[] {
  return [
    { href: toAnchor(ANCHOR.solutions, base), label: 'Soluções' },
    { href: toAnchor(ANCHOR.examples, base), label: 'Exemplos' },
    { href: toAnchor(ANCHOR.method, base), label: 'Método' },
  ];
}

/** Rodapé: os cinco serviços e o contato da própria página; fora da home, começa por "Início". */
export function footerNav({ fromHome = false } = {}): NavLink[] {
  const services = SERVICES.map((s) => ({ href: s.path, label: s.label }));
  const contact = { href: toAnchor(ANCHOR.contact), label: 'Contato' };
  return fromHome ? [...services, contact] : [{ href: HOME_PATH, label: 'Início' }, ...services, contact];
}
