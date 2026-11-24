// src/data/site.ts — Conteúdo oficial do site da ARCAV (somente pt-BR).
// Fonte: o antigo src/i18n/translations.ts (versão PT) e docs/BRAND.md.
// Não adicionar depoimentos, métricas ou logos de clientes sem evidência.

const CITY = 'Curitiba';

export const BRAND = {
  name: 'ARCAV',
  tagline: 'Produtos digitais e evolução de processos',
  author: 'Armando Castro',
  city: CITY,
  location: `${CITY}, Brasil`,
  email: 'hola@arcav.us',
  social: [
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/armando-castro' },
    { name: 'GitHub', href: 'https://github.com/arcavcwb' },
  ],
  trajectory: ['Venezuela', 'México', 'San Diego / EUA', 'Curitiba / Brasil'],
  message: 'Transformo processos de negócio em produtos digitais simples, automatizados e fáceis de operar.',
  statement: 'Focado em escopo. Sério em engenharia.',
} as const;

/** Documento: idioma, cor do navegador, ícones e as fontes pré-carregadas (Layout.astro). */
export const SITE = {
  lang: 'pt-BR',
  ogLocale: 'pt_BR',
  /** Cor da barra do navegador no celular: a mesma de --color-paper (tokens.css). */
  themeColor: '#ffffff',
  /** O recorte latin das duas famílias: sem Inter aqui, o texto troca de fonte depois do primeiro quadro e a página pula. */
  fontPreloads: ['/fonts/inter-latin.woff2', '/fonts/manrope-latin.woff2'],
  icons: { ico: '/favicon.ico', svg: '/favicon.svg', apple: '/apple-touch-icon.png' },
  /**
   * Imagem ao compartilhar o link (WhatsApp, redes): o celular com o pedido, o título e o logo.
   * Gerada a partir de public/exemplos/comercio-pedido.webp; proveniência em public/og-image.png.json.
   */
  ogImage: {
    src: '/og-image.png',
    width: 1200,
    height: 630,
    alt: 'Celular com um pedido pronto para o WhatsApp, ao lado do título “Sites, lojas com pedido pelo WhatsApp e automações” e do logo da ARCAV.',
  },
} as const;

export const home = {
  meta: {
    title: 'Criação de sites e lojas com pedido pelo WhatsApp em Curitiba | ARCAV',
    description:
      'Sites, lojas com pedido pelo WhatsApp e automações simples de operar, para negócios de Curitiba. Teste cada solução no site.',
  },
  hero: {
    /** Concreto e na língua do dono do negócio (2026-11-24); a frase da marca (BRAND.message) fica fora do hero. */
    title: 'Sites, lojas e automações para negócios de Curitiba.',
    subtitle: 'Do site da sua empresa ao pedido que chega organizado no WhatsApp. Teste um exemplo aqui mesmo.',
    /** A ação principal abre o WhatsApp da ARCAV com a mensagem pronta (contact.waMessage); sem número, abre o formulário. */
    primaryCta: 'Chamar no WhatsApp',
    secondaryCta: 'Testar um pedido',
    /** Linha embaixo dos botões. O prazo de resposta só entra quando RESPONSE_TIME (lib/contact.ts) existir. */
    note: {
      response: (time: string) => `Respondo ${time}`,
      place: `Atendimento direto comigo, em ${CITY}.`,
    },
    /**
     * Arte do hero aprovada pelo usuário (2026-11-22), decorativa: laptop com o logo, ícones e curvas.
     * Só a partir de `desktopMedia` (--breakpoint-xl, 60rem): no celular ela não aparece nem é baixada
     * (2026-11-24), para a lista de casos começar já na primeira tela. Proveniência no .json ao lado.
     */
    art: {
      desktopMedia: '(min-width: 60rem)',
      desktop: { src: '/hero/hero-arte-desktop.webp', width: 762, height: 696 },
    },
  },
  /** "Qual é o seu caso?": os cinco serviços como uma lista; cada linha é a frase do cliente e leva à página do serviço. */
  services: {
    title: 'Qual é o seu caso?',
    subtitle: 'Escolha a frase mais parecida com a sua situação.',
  },
  experiment: {
    title: 'Experimente antes de contratar.',
    /** Fala da loja porque é a única demonstração publicada; trocar quando entrar a segunda (data/demos.ts). */
    lead: 'Faça o papel do seu cliente: monte um pedido e veja como ele chega no WhatsApp da loja.',
    notice: 'Demonstrações com negócios e dados fictícios.',
  },
  /**
   * "Como funciona": os mesmos quatro passos das páginas de solução (SOLUTION_STEPS, solutions.ts) e quem
   * atende. Substitui o método de seis cartões e a seção escura "Hoje / Depois" (2026-11-24).
   */
  how: {
    title: 'Como funciona',
    about: `Quem conversa com você, constrói e dá suporte sou eu, ${BRAND.author}.`,
    linkedin: 'Meu perfil no LinkedIn',
  },

  contact: {
    title: 'Vamos conversar sobre o seu negócio?',
    subtitle: 'Conte como funciona hoje e eu respondo com os próximos passos.',
    subject: 'Contato pelo site da ARCAV',
    waMessage: 'Olá, Armando! Vi o site da ARCAV e quero conversar sobre o meu negócio.',
  },
  footer: {
    copyright: '© 2026 ARCAV por Armando Castro. Todos os direitos reservados.',
  },
};

/** Página 404. */
export const notFound = {
  meta: {
    title: 'Página não encontrada | ARCAV',
    description: 'Esta página não existe ou mudou de endereço.',
  },
  title: 'Esta página não existe ou mudou de endereço.',
  text: 'Talvez o link esteja incompleto. Você pode voltar ao início ou ver as soluções da ARCAV.',
  homeCta: 'Ir para o início',
  solutionsCta: 'Ver as soluções',
};
