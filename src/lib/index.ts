// Barril das regras puras: `import { quoted, whatsappLink } from '@lib'` em componentes e páginas.
// Scripts do navegador e a API importam o módulo direto (`@lib/order`): o barril inclui
// photos.ts, que carrega a lista de fotos, e isso não deve ir para o navegador nem para o worker.
export * from './analytics';
export * from './brand-assets';
export * from './contact';
export * from './contact-message';
export * from './links';
export * from './order';
export * from './photos';
export * from './text';
export * from './view-transitions';
