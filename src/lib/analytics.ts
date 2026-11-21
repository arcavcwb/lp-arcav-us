// src/lib/analytics.ts — Medição de visitas com Cloudflare Web Analytics (grátis, sem cookies).
//
// Cole aqui o token do painel da Cloudflare (Web Analytics → Add a site → JS snippet:
// o valor de "token" dentro de data-cf-beacon). Com null, nenhum script é carregado.
// Se o domínio estiver em proxy pela Cloudflare, também dá para ativar sem código
// ("Automatic setup"); nesse caso deixe null para não contar visitas em dobro.
export const CF_WEB_ANALYTICS_TOKEN: string | null = null;
