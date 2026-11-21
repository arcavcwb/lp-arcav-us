// src/data/anchors.ts — Ids das seções que recebem links (#contato, #demo…).
// Um id muda aqui e as seções e os links acompanham. Sem dependências: dados e componentes importam daqui.

export const ANCHOR = {
  content: 'conteudo',
  solutions: 'solucoes',
  examples: 'exemplos',
  method: 'metodo',
  about: 'sobre',
  contact: 'contato',
  demo: 'demo',
  diagnosis: 'diagnostico',
} as const;

export const HOME_PATH = '/';

/** Link para uma seção. Com `base` (ex.: '/'), aponta para a seção da home a partir de outra página. */
export const toAnchor = (id: string, base = ''): string => `${base}#${id}`;
