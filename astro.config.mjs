// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// O site é só em português (pt-BR) e vive na raiz. As rotas antigas por idioma
// (/pt/…, /es, /en) redirecionam com 301 para não perder links já compartilhados.
// Propostas para prospectos vivem em projetos próprios (este repositório é só o site e o
// portfólio). A proposta da Center Gás saiu daqui em 2026-11-21: o endereço antigo leva ao
// projeto dela, publicado à parte.
export default defineConfig({
  site: 'https://arcav.us',
  output: 'server',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
  redirects: {
    '/pt': { status: 301, destination: '/' },
    '/pt/solucoes/comercio-digital': { status: 301, destination: '/solucoes/comercio-digital/' },
    '/pt/propostas/center-gas': { status: 301, destination: 'https://centergas-v3.pages.dev/' },
    '/propostas/center-gas': { status: 301, destination: 'https://centergas-v3.pages.dev/' },
    '/es': { status: 301, destination: '/' },
    '/en': { status: 301, destination: '/' },
  },
});
