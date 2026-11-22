// Barril dos dados: `import { BRAND, ui, SERVICES } from '@data'` em componentes e páginas.
// Scripts do navegador e a API importam o módulo direto (`@data/ui`), para não levar ao
// JavaScript do visitante dados que ele não usa. Dentro de src/data, os módulos importam
// os vizinhos pelo caminho relativo (sem passar por aqui), para não criar ciclos.
export * from './anchors';
export * from './site';
export * from './ui';
export * from './navigation';
export * from './solutions';
export * from './commerce-service';
export * from './photos';
export * from './types';
