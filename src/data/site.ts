// src/data/site.ts — Conteúdo oficial do site da ARCAV (somente pt-BR).
// Fonte: o antigo src/i18n/translations.ts (versão PT) e docs/BRAND.md.
// Não adicionar depoimentos, métricas ou logos de clientes sem evidência.

export const BRAND = {
  name: 'ARCAV',
  tagline: 'Produtos digitais e evolução de processos',
  author: 'Armando Castro',
  location: 'Curitiba, Brasil',
  email: 'hola@arcav.us',
  social: [
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/armando-castro' },
    { name: 'GitHub', href: 'https://github.com/arcavcwb' },
  ],
  trajectory: ['Venezuela', 'México', 'San Diego / EUA', 'Curitiba / Brasil'],
  message: 'Transformo processos de negócio em produtos digitais simples, automatizados e fáceis de operar.',
  statement: 'Focados em escopo. Sérios em engenharia.',
} as const;

export const COMMERCE_PATH = '/solucoes/comercio-digital/';

export interface NavLink {
  href: string;
  label: string;
}

/** Navegação principal. `base` permite apontar para âncoras da home a partir de outras páginas. */
export function mainNav(base = ''): NavLink[] {
  return [
    { href: `${base}#solucoes`, label: 'Soluções' },
    { href: `${base}#exemplos`, label: 'Exemplos' },
    { href: `${base}#metodo`, label: 'Método' },
    { href: `${base}#sobre`, label: 'Sobre' },
  ];
}

export const home = {
  meta: {
    title: 'ARCAV — Produtos digitais e evolução de processos | Curitiba',
    description:
      'Transformo processos de negócio em produtos digitais simples, automatizados e fáceis de operar. Sites, sistemas enxutos e automações em Curitiba, por Armando Castro.',
  },
  hero: {
    title: BRAND.message,
    subtitle:
      'Landing pages para marcas, campanhas, produtos e palestras, sites de pedido para comércios e automações para a operação.',
    primaryCta: 'Contar como funciona hoje',
    secondaryCta: 'Ver as soluções',
  },
  services: {
    title: 'O que eu construo para o seu negócio.',
    subtitle:
      'Começo pelo que já funciona no seu negócio e entrego algo que você e sua equipe conseguem operar no dia a dia.',
  },
  problem: {
    title: 'Quando o negócio cresce, o processo também precisa evoluir.',
    text: 'Planilhas e WhatsApp funcionam bem por um tempo. O problema aparece quando a operação passa a depender de dados espalhados e tarefas manuais.',
    before: {
      label: 'Hoje',
      items: ['Pedido anotado no caderno', 'Informação espalhada entre WhatsApp e planilha', 'Difícil saber o que já foi feito'],
    },
    after: {
      label: 'Depois',
      items: ['Pedido que chega completo', 'Tudo em um só lugar', 'Você vê o que está acontecendo'],
    },
    quote: 'Não modernizo por modernizar. Primeiro entendo o que funciona e o que realmente precisa mudar.',
  },
  method: {
    title: 'Do problema ao produto.',
    steps: [
      { title: 'Entender', text: 'O que o seu negócio precisa de verdade.' },
      { title: 'Mapear', text: 'Quem atende, quem compra e onde as coisas travam.' },
      { title: 'Simplificar', text: 'Um escopo claro, com um objetivo principal.' },
      { title: 'Construir', text: 'A ferramenta e a ligação com o que você já usa.' },
      { title: 'Observar', text: 'Como ela é usada no dia a dia.' },
      { title: 'Melhorar', text: 'Ajustes com base no que o uso mostrou.' },
    ],
  },
  about: {
    title: 'A tecnologia tem mais valor quando resolve problemas reais.',
    text: 'Sou Armando Castro, desenvolvedor de produtos e criador da ARCAV. Comecei a carreira no frontend e ampliei minha atuação para backend, banco de dados, infraestrutura e automação.',
    statement: 'Ferramentas mudam. O problema do negócio vem em primeiro lugar.',
  },
  contact: {
    title: 'Tem um processo que pode evoluir?',
    subtitle:
      'Vamos conversar e explorar como transformá-lo em um produto digital simples e fácil de operar.',
    subject: 'Contato pelo site da ARCAV',
  },
  footer: {
    copyright: '© 2026 ARCAV por Armando Castro. Todos os direitos reservados.',
  },
};
