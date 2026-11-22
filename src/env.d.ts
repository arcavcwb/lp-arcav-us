// Para o `tsc` sem a extensão do Astro: os barris (components/*/index.ts) reexportam componentes
// .astro. No editor e no build, o Astro resolve esses arquivos com os tipos reais de cada componente;
// esta declaração só vale quando nada mais os resolve.
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

  const Component: AstroComponentFactory;
  export default Component;
}
