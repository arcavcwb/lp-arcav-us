// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
// O site é só em português (pt-BR) e vive na raiz. As rotas antigas por idioma
// (/pt/…, /es, /en) redirecionam com 301 para não perder links já compartilhados.
export default defineConfig({
  site: 'https://arcav.us',
  output: 'server',
  adapter: cloudflare(),
  redirects: {
    '/pt': { status: 301, destination: '/' },
    '/pt/solucoes/comercio-digital': { status: 301, destination: '/solucoes/comercio-digital/' },
    '/pt/propostas/center-gas': { status: 301, destination: '/propostas/center-gas/' },
    '/es': { status: 301, destination: '/' },
    '/en': { status: 301, destination: '/' },
  },
});
