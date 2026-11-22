// src/data/anchors.ts — Ids das seções que recebem links (#contato, #demo…).
// Um id muda aqui e as seções e os links acompanham. Sem dependências: dados e componentes importam daqui.

export const ANCHOR = {
  content: 'conteudo',
  solutions: 'solucoes',
  examples: 'exemplos',
  method: 'metodo',
  contact: 'contato',
  /** Janela com o formulário de contato (popover): os botões "Fale comigo" e as CTAs a abrem. */
  contactForm: 'contato-janela',
  demo: 'demo',
} as const;

export const HOME_PATH = '/';

/** Link para uma seção. Com `base` (ex.: '/'), aponta para a seção da home a partir de outra página. */
export const toAnchor = (id: string, base = ''): string => `${base}#${id}`;
