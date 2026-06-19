// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://arcav.us',
  output: 'server',
  adapter: cloudflare(),
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'pt'],
    routing: {
      prefixDefaultLocale: true, // es -> "/es", en -> "/en", pt -> "/pt"; "/" detecta idioma
    },
  },
});