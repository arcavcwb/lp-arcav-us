// src/data/site.ts — Conteúdo oficial do site da ARCAV (somente pt-BR).
// Fonte: o antigo src/i18n/translations.ts (versão PT) e docs/BRAND.md.
// Não adicionar depoimentos, métricas ou logos de clientes sem evidência.

import type { IconName } from '@components/ui/icons';

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
  statement: 'Focados em escopo. Sérios em engenharia.',
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
} as const;

export const home = {
  meta: {
    title: 'ARCAV — Produtos digitais e evolução de processos | Curitiba',
    description:
      'Transformo processos de negócio em produtos digitais simples, automatizados e fáceis de operar. Sites institucionais, migrações, landing pages, lojas com pedido pelo WhatsApp e automações em Curitiba, por Armando Castro.',
  },
  hero: {
    /** Copy da arte aprovada do hero (decisão do usuário, 2026-11-22). A frase da marca segue em BRAND.message. */
    title: 'Eu transformo processos travados em produtos digitais que funcionam.',
    subtitle:
      'Sites institucionais, migração de sites e sistemas, landing pages, lojas com pedido pelo WhatsApp e automações para a operação.',
    primaryCta: 'Descrever meu caso',
    secondaryCta: 'Conhecer soluções',
    /**
     * Arte do hero aprovada pelo usuário (2026-11-22), decorativa: laptop com o logo, ícones e curvas.
     * Uma imagem por enquadramento; `<picture>` baixa só uma. `desktopMedia` acompanha
     * --breakpoint-xl (60rem) dos tokens. Proveniência no .json ao lado de cada arquivo.
     */
    art: {
      desktopMedia: '(min-width: 60rem)',
      desktop: { src: '/hero/hero-arte-desktop.webp', width: 762, height: 696 },
      mobile: { src: '/hero/hero-arte-mobile.webp', width: 697, height: 654 },
    },
  },
  services: {
    title: 'O que eu construo para o seu negócio.',
    subtitle:
      'Começo pelo que já funciona no seu negócio e entrego algo que você e sua equipe conseguem operar no dia a dia.',
    /** Acima dos discos: diz o que fazer, já que a frase do cliente agora abre a história de cada serviço. */
    intro: 'Escolha um serviço e veja como ele funciona.',
    /**
     * Ficha de cada serviço: nome, frase do cliente e botão no alto; embaixo, a ilustração do serviço
     * e "Como funciona" desenhado (as três frases de `journey`, cada uma com o seu ícone,
     * `journeyIcons` em solutions.ts). A legenda das ilustrações conceituais é a da página de comércio.
     */
    catalog: {
      cta: (name: string) => `Ver a solução: ${name}`,
      how: 'Como funciona',
      before: 'Antes',
      after: 'Depois',
      /** Captura real do celular de exemplo no passo "Pedido pronto" (proveniência no .json ao lado). */
      order: {
        image: '/exemplos/comercio-pedido.webp',
        width: 640,
        height: 989,
        alt: 'Celular da loja de exemplo com o pedido pronto: “Olá! Quero fazer um pedido: 1 × Café 500 g, 1 × Leite 1 L”.',
      },
      /** Painel de automação com dados fictícios: o estado vem no título do grupo e no ícone, não só na cor. */
      log: {
        done: 'Feito hoje',
        scheduled: 'Agendado',
        events: [
          { text: 'Orçamento recebido pelo formulário', when: '09:12', done: true },
          { text: 'Cliente adicionado à planilha', when: '09:12', done: true },
          { text: 'Confirmação enviada no WhatsApp', when: '09:13', done: true },
          { text: 'Lembrete da visita', when: 'Amanhã, 8h', done: false },
          { text: 'Relatório da semana por e-mail', when: 'Sexta, 18h', done: false },
        ],
      },
    },
  },
  examples: {
    title: 'Veja um exemplo funcionando.',
    lead: 'Monte um pedido na loja de exemplo e veja a mensagem chegar pronta no WhatsApp. Os exemplos das outras soluções estão sendo preparados a partir de projetos reais.',
  },
  problem: {
    title: 'Quando o negócio cresce, o processo também precisa evoluir.',
    text: 'Planilhas e WhatsApp funcionam bem por um tempo. O problema aparece quando a operação passa a depender de dados espalhados e tarefas manuais.',
    before: { label: 'Hoje' },
    after: { label: 'Depois' },
    /** Cada linha: como é hoje → como fica. Os ícones nomeiam a mesma coisa dos dois lados (Problem.astro). */
    rows: [
      { before: 'Pedido anotado no caderno', after: 'Pedido que chega completo', icons: ['form', 'send'] as [IconName, IconName] },
      { before: 'Informação espalhada entre WhatsApp e planilha', after: 'Tudo em um só lugar', icons: ['chat', 'layout'] as [IconName, IconName] },
      { before: 'Difícil saber o que já foi feito', after: 'Você vê o que está acontecendo', icons: ['grid', 'chart'] as [IconName, IconName] },
    ],
    quote: 'Não modernizo por modernizar. Primeiro entendo o que funciona e o que realmente precisa mudar.',
  },
  method: {
    title: 'Do problema ao produto.',
    /** Cada passo com o ícone de linha do cartão (Method.astro). */
    steps: [
      { title: 'Entender', text: 'O que o seu negócio precisa de verdade.', icon: 'chat' as IconName },
      { title: 'Mapear', text: 'Quem atende, quem compra e onde as coisas travam.', icon: 'people' as IconName },
      { title: 'Simplificar', text: 'Um escopo claro, com um objetivo principal.', icon: 'target' as IconName },
      { title: 'Construir', text: 'A ferramenta e a ligação com o que você já usa.', icon: 'workflow' as IconName },
      { title: 'Observar', text: 'Como ela é usada no dia a dia.', icon: 'chart' as IconName },
      { title: 'Melhorar', text: 'Ajustes com base no que o uso mostrou.', icon: 'refresh' as IconName },
    ],
  },

  contact: {
    title: 'Tem um processo que pode evoluir?',
    subtitle:
      'Conte como funciona hoje. Eu respondo com os próximos passos e, se houver encaixe, preparo uma prévia resumida do seu projeto para acompanhar a proposta.',
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
