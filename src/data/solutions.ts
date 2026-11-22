// src/data/solutions.ts — As soluções da ARCAV. Cada uma tem página própria e um exemplo
// ilustrativo (empresa fictícia). Valor e prazo são definidos depois da avaliação.
import type { IconName } from '@components/ui/icons';
import { ANCHOR, toAnchor } from './anchors';

/** Endereço das páginas de solução: /solucoes/<slug>/ */
export const SOLUTIONS_BASE = '/solucoes/';
export const solutionPath = (slug: string): string => `${SOLUTIONS_BASE}${slug}/`;

export interface Solution {
  slug: string;
  path: string;
  name: string;
  /** Nome curto para cards e abas (ex.: "Campanhas"). */
  label: string;
  /** Nome no disco do catálogo da home, quando `label` não cabe embaixo de um círculo. Padrão: `label`. */
  disc?: string;
  /** Frase curta para os cards simplificados da home. */
  tagline: string;
  /**
   * 'main' = um dos cinco serviços da home (site institucional, migração, landing pages, comércio,
   * automação). 'landing' = um dos tipos de landing page, que vivem dentro de /solucoes/landing-pages/.
   */
  group: 'main' | 'landing';
  /** Frase na voz do cliente que leva a este serviço na home ("Preciso de um site para a minha empresa."). */
  situation?: string;
  /** Uma linha para cards e listas. */
  short: string;
  /**
   * "O caminho do seu cliente" em três frases completas e simples (de onde vem → o que faz → onde
   * você recebe). Aparece na ficha da home e no hero da solução sem exemplo. Frases inteiras, não
   * rótulos com botõezinhos: o esquema fragmentado não se entendia.
   */
  journey?: [string, string, string];
  /** Título do bloco de três frases. Padrão: "O caminho do seu cliente". */
  journeyTitle?: string;
  /** Ícone de cada uma das três frases de `journey`, no processo desenhado da ficha da home. */
  journeyIcons?: [IconName, IconName, IconName];
  /** Objetivo em linguagem simples ("Quero ...") para as abas da home. */
  goal?: string;
  icon: IconName;
  meta: { title: string; description: string };
  hero: { title: string; subtitle: string; cta: string };
  forWho: string[];
  includes: string[];
  /** Exemplo da solução. null nos campos = espaço reservado até existir um exemplo baseado em projeto real. */
  example: {
    path: string | null;
    client: string | null;
    image: string | null;
  };
  faq: Array<{ q: string; a: string }>;
  contact: { subject: string; label: string; placeholder: string };
}

const PRICE_FAQ = {
  q: 'Quanto custa e quanto tempo leva?',
  a: 'O valor e o prazo são definidos depois de entender o seu projeto, sem compromisso. Você recebe tudo por escrito antes de decidir.',
};

/**
 * Dois níveis de demonstração: o exemplo público (qualquer visitante, já publicado no site) e a prévia
 * comercial (resumida, só quando há encaixe depois da conversa). Sem quantidades, prazos ou vagas até
 * o Armando decidir.
 */
const PREVIEW_FAQ = {
  q: 'Posso ver algo antes de contratar?',
  a: 'Sim. Os exemplos publicados no site podem ser testados a qualquer momento. Depois da conversa, se houver encaixe, preparamos uma prévia resumida do seu projeto para acompanhar a proposta. A prévia não substitui o projeto completo.',
};

const ENTRIES: Omit<Solution, 'path'>[] = [
  {
    slug: 'site-institucional',
    name: 'Site institucional',
    label: 'Site institucional',
    // Hífen discreto (\u00AD): só quebra quando a palavra não cabe embaixo do disco (360px ou menos).
    disc: 'Site insti\u00ADtucional',
    situation: 'Preciso de um site para a minha empresa.',
    journeyIcons: ['people', 'layout', 'chat'],
    journey: [
      'Alguém ouve falar da sua empresa e procura o nome no Google.',
      'Abre o seu site, entende o que vocês fazem e chama no WhatsApp ou preenche o formulário.',
      'O contato chega no seu WhatsApp ou no e-mail da empresa.',
    ],
    tagline: 'Quem vocês são, o que fazem e como falar com vocês.',
    group: 'main',
    short: 'O site da sua empresa: quem vocês são, os serviços, onde atendem e como falar com vocês, em poucas páginas claras.',
    icon: 'layout',
    meta: {
      title: 'Site Institucional para Empresas em Curitiba | ARCAV',
      description:
        'Sites institucionais sob medida para empresas de Curitiba: quem vocês são, serviços, localização e contato, em poucas páginas claras e pensadas para o celular.',
    },
    hero: {
      title: 'Um site que apresenta a sua empresa por inteiro.',
      subtitle:
        'Quem vocês são, o que fazem, onde atendem e como falar com vocês, em poucas páginas claras. Feito sob medida e pensado primeiro para o celular.',
      cta: 'Quero um site para a empresa',
    },
    forWho: [
      'Empresas que ainda não têm site ou só têm perfil nas redes',
      'Prestadores de serviço, indústrias e distribuidoras',
      'Empresas que precisam mostrar serviços, equipe e localização',
    ],
    includes: [
      'Páginas essenciais: início, quem somos, serviços e contato',
      'Estrutura e textos organizados com você',
      'Versão para celular revisada tela a tela',
      'WhatsApp, formulário e mapa para o contato',
      'Publicação no seu domínio, com carregamento rápido',
      'Medição de visitas e cliques',
    ],
    example: { path: null, client: null, image: null },
    faq: [
      { q: 'Quantas páginas o site vai ter?', a: 'Depende do que a sua empresa precisa mostrar. Definimos as páginas juntos na conversa, e tudo fica por escrito na proposta.' },
      { q: 'Preciso ter fotos e textos prontos?', a: 'Ajuda, mas não é obrigatório. Partimos do que você já tem e organizamos juntos o que falta.' },
      PREVIEW_FAQ,
      PRICE_FAQ,
    ],
    contact: {
      subject: 'Quero um site institucional',
      label: 'Conte sobre a sua empresa e o que o site precisa mostrar',
      placeholder: 'Ex.: somos uma distribuidora, hoje só temos Instagram e queremos um site com os serviços e o contato.',
    },
  },
  {
    slug: 'migracao',
    name: 'Migração e modernização',
    label: 'Migração',
    situation: 'Meu site está velho, lento ou preso numa plataforma.',
    journeyTitle: 'Como é uma migração',
    journeyIcons: ['grid', 'refresh', 'check'],
    journey: [
      'Levantamos o que existe hoje: páginas, conteúdo, domínio, e-mails e dados.',
      'Montamos a base nova e levamos o conteúdo, com o site atual funcionando até a troca.',
      'Na data combinada, a troca acontece e conferimos tudo com você.',
    ],
    tagline: 'O que você já tem, levado para uma base nova.',
    group: 'main',
    short: 'Sites que saem do WordPress, do Wix ou de uma plataforma antiga; hospedagem, domínio e e-mail que mudam de lugar; dados e sistemas que passam para algo novo.',
    icon: 'refresh',
    meta: {
      title: 'Migração de Site e Sistemas em Curitiba | ARCAV',
      description:
        'Migração de sites do WordPress, do Wix e de plataformas antigas, troca de hospedagem, domínio e e-mail, redesenho do site atual e passagem de dados e sistemas para uma base nova.',
    },
    hero: {
      title: 'Seu site ou sistema em uma base nova, sem começar do zero.',
      subtitle:
        'Para quem tem um site preso no WordPress, no Wix ou numa plataforma antiga, quer trocar de hospedagem ou precisa levar dados e sistemas para algo novo. O que já funciona vai junto.',
      cta: 'Quero conversar sobre a migração',
    },
    forWho: [
      'Sites lentos, desatualizados ou difíceis de editar',
      'Empresas presas a uma plataforma, hospedagem ou fornecedor',
      'Dados espalhados em planilhas ou em sistemas antigos',
    ],
    includes: [
      'Levantamento do que existe: páginas, conteúdo, domínio, e-mails e dados',
      'Site novo a partir do conteúdo atual, com design e textos revisados',
      'Endereços antigos redirecionados para os novos',
      'Troca de hospedagem, domínio e e-mail planejada com você',
      'Passagem de dados de planilhas ou sistemas antigos',
      'Conferência de tudo depois da troca',
    ],
    example: { path: null, client: null, image: null },
    faq: [
      { q: 'O site sai do ar durante a migração?', a: 'A troca é planejada com você e marcada com antecedência. Até lá, o site atual continua funcionando.' },
      { q: 'Preciso migrar tudo de uma vez?', a: 'Não. Às vezes faz sentido migrar por partes, e às vezes nem é preciso migrar: conectar o que já existe resolve. Isso fica claro na conversa.' },
      PREVIEW_FAQ,
      PRICE_FAQ,
    ],
    contact: {
      subject: 'Quero migrar meu site ou sistema',
      label: 'O que você tem hoje e o que quer mudar?',
      placeholder: 'Ex.: nosso site está no Wix, está lento e queremos levar para um lugar nosso, junto com o e-mail.',
    },
  },
  {
    slug: 'landing-pages',
    name: 'Landing pages',
    label: 'Landing pages',
    situation: 'Vou anunciar, lançar um produto ou fazer um evento.',
    journeyIcons: ['target', 'layout', 'chat'],
    journey: [
      'Alguém vê o seu anúncio, recebe o seu link ou procura você no Google.',
      'Abre uma página feita para uma ação só e chama, compra ou se inscreve.',
      'O contato, a venda ou a inscrição chega onde você já trabalha.',
    ],
    tagline: 'Uma página só, feita para uma ação.',
    group: 'main',
    short: 'Uma página para cada objetivo: passar confiança, receber contatos de um anúncio, vender um produto ou encher um evento.',
    icon: 'target',
    meta: {
      title: 'Landing Pages em Curitiba: Campanhas, Produtos e Eventos | ARCAV',
      description:
        'Landing pages sob medida para profissionais, campanhas, lançamentos de produto e eventos. Uma página para cada objetivo, com o contato chegando onde você já trabalha.',
    },
    hero: {
      title: 'Uma página para cada objetivo.',
      subtitle:
        'Landing page é uma página só, feita para levar a pessoa a uma ação: chamar no WhatsApp, deixar o contato, comprar ou se inscrever. Escolha o seu objetivo e veja como funciona.',
      cta: 'Quero uma landing page',
    },
    forWho: [],
    includes: [],
    example: { path: null, client: null, image: null },
    faq: [
      { q: 'Qual tipo de landing page é o meu?', a: 'Se você não tiver certeza, conte o seu objetivo na conversa. A gente indica o tipo de página que faz sentido.' },
      PREVIEW_FAQ,
      PRICE_FAQ,
    ],
    contact: {
      subject: 'Quero uma landing page',
      label: 'Conte o que você quer com a página',
      placeholder: 'Ex.: vou anunciar no Instagram uma promoção de matrículas e quero receber os contatos organizados.',
    },
  },
  {
    slug: 'landing-page-alto-padrao',
    name: 'Landing page de alto padrão',
    label: 'Alto padrão',
    journey: [
      'Alguém procura você no Google, vê seu Instagram ou recebe uma indicação.',
      'Abre a sua página, vê o seu trabalho e chama no WhatsApp ou deixa o contato.',
      'A mensagem chega no seu WhatsApp ou no seu e-mail.',
    ],
    goal: 'Quero passar confiança',
    tagline: 'Para marcas e profissionais que vendem confiança.',
    group: 'landing',
    short: 'Para marcas e profissionais que vendem confiança: design sob medida, acabamento cuidadoso e contato direto.',
    icon: 'gem',
    meta: {
      title: 'Landing Page de Alto Padrão em Curitiba | ARCAV',
      description:
        'Landing pages sob medida para clínicas, escritórios, estúdios e profissionais que precisam transmitir confiança na primeira visita.',
    },
    hero: {
      title: 'Uma página à altura do que você entrega.',
      subtitle:
        'Para clínicas, escritórios, estúdios e profissionais que precisam transmitir confiança na primeira visita. Design sob medida, textos claros e o contato a um toque.',
      cta: 'Quero uma página assim',
    },
    forWho: [
      'Profissionais liberais, clínicas e consultórios',
      'Escritórios de arquitetura, advocacia e consultoria',
      'Marcas que querem se apresentar com mais cuidado',
    ],
    includes: [
      'Design sob medida, sem template',
      'Estrutura e textos pensados com você',
      'Versão para celular revisada tela a tela',
      'Formulário ou WhatsApp para o primeiro contato',
      'Publicação no seu domínio, com carregamento rápido',
      'Medição de visitas e cliques',
    ],
    example: { path: null, client: null, image: null },
    faq: [
      { q: 'Vocês usam template?', a: 'Não. O layout é desenhado para o seu negócio, a partir do que você quer que o visitante sinta e faça.' },
      { q: 'Preciso ter fotos e textos prontos?', a: 'Ajuda, mas não é obrigatório. Partimos do que você já tem e organizamos juntos o que falta.' },
      PREVIEW_FAQ,
      PRICE_FAQ,
    ],
    contact: {
      subject: 'Quero uma landing page de alto padrão',
      label: 'Conte sobre o seu negócio e a página que você imagina',
      placeholder: 'Ex.: tenho um consultório e quero uma página para apresentar meus serviços.',
    },
  },
  {
    slug: 'landing-page-campanhas',
    name: 'Landing page para campanhas',
    label: 'Campanhas',
    journey: [
      'Alguém vê o seu anúncio no Instagram ou no Google e toca nele.',
      'Abre uma página com uma oferta só e preenche o formulário.',
      'O contato chega na sua planilha, no CRM e no seu WhatsApp.',
    ],
    goal: 'Quero contatos de um anúncio',
    tagline: 'Uma página, uma ação e cada contato medido.',
    group: 'landing',
    short: 'Uma página, uma ação: para anúncios e ações com prazo, com formulário à vista e cada contato medido.',
    icon: 'target',
    meta: {
      title: 'Landing Page para Campanhas e Anúncios | ARCAV',
      description:
        'Páginas focadas em uma única ação para anúncios, promoções e matrículas, com formulário, WhatsApp e medição de cada contato.',
    },
    hero: {
      title: 'Uma página para cada campanha, focada em uma só ação.',
      subtitle:
        'Para anúncios, promoções e ações com data para acabar. A mensagem do anúncio continua na página, o formulário fica à vista e cada contato é medido.',
      cta: 'Quero uma página para minha campanha',
    },
    forWho: [
      'Empresas que anunciam no Google, Instagram ou Facebook',
      'Promoções, matrículas e ações com prazo',
      'Equipes de marketing e agências que precisam de páginas rápidas',
    ],
    includes: [
      'Página focada em uma única ação',
      'Formulário ou WhatsApp com os dados certos',
      'Medição de conversões para Google e Meta',
      'Contatos enviados para planilha, CRM ou WhatsApp',
      'Versões para testar título e oferta',
      'Carregamento rápido no celular',
    ],
    example: { path: null, client: null, image: null },
    faq: [
      { q: 'Funciona com os anúncios que eu já faço?', a: 'Sim. A página recebe o tráfego dos seus anúncios e registra de onde veio cada contato.' },
      { q: 'Para onde vão os contatos?', a: 'Para onde for mais prático para você: WhatsApp, e-mail, planilha ou o CRM que você já usa.' },
      PREVIEW_FAQ,
      PRICE_FAQ,
    ],
    contact: {
      subject: 'Quero uma landing page para campanha',
      label: 'Conte sobre a campanha',
      placeholder: 'Ex.: vamos anunciar matrículas em janeiro e queremos receber os contatos no WhatsApp.',
    },
  },
  {
    slug: 'landing-page-produto',
    name: 'Landing page de produto',
    label: 'Produto',
    journey: [
      'Alguém conhece o seu produto por um anúncio, no Google ou no Instagram.',
      'Abre a página, entende como o produto funciona e compra ou começa a testar.',
      'Você recebe o pagamento e os dados do cliente ficam no seu CRM.',
    ],
    goal: 'Quero vender um produto',
    tagline: 'O seu produto explicado até a compra.',
    group: 'landing',
    short: 'Para lançamentos, apps e serviços novos: o produto funcionando, as dúvidas respondidas e o caminho até a compra.',
    icon: 'box',
    meta: {
      title: 'Landing Page de Produto e Lançamento | ARCAV',
      description:
        'Landing pages para lançamentos, apps, cursos e serviços: produto funcionando, benefícios, planos, perguntas e o caminho até a compra.',
    },
    hero: {
      title: 'Uma página que explica o seu produto e leva até a compra.',
      subtitle:
        'Para lançamentos, apps, cursos e serviços novos. Mostramos o produto funcionando, respondemos as dúvidas antes que virem objeção e deixamos o próximo passo claro.',
      cta: 'Quero uma página para meu produto',
    },
    forWho: [
      'Lançamento de produto ou de nova linha',
      'Apps, softwares e serviços por assinatura',
      'Cursos e produtos digitais',
    ],
    includes: [
      'O produto mostrado funcionando, não só descrito',
      'Benefícios, planos e perguntas frequentes',
      'Botão de compra, teste ou contato',
      'Conexão com checkout, agenda ou CRM',
      'Versão para celular',
      'Medição de visitas e cliques',
    ],
    example: { path: null, client: null, image: null },
    faq: [
      { q: 'Dá para vender direto pela página?', a: 'Sim, conectando ao checkout que você já usa ou ao WhatsApp, conforme o produto.' },
      { q: 'E se o produto ainda não está pronto?', a: 'Dá para começar com uma página de lista de espera e evoluir para a de vendas no lançamento.' },
      PREVIEW_FAQ,
      PRICE_FAQ,
    ],
    contact: {
      subject: 'Quero uma landing page de produto',
      label: 'Conte sobre o produto e o lançamento',
      placeholder: 'Ex.: estamos lançando um app para salões e queremos uma página para testes grátis.',
    },
  },
  {
    slug: 'landing-page-palestras',
    name: 'Landing page para palestras e eventos',
    label: 'Palestras e eventos',
    journey: [
      'Alguém recebe o link no WhatsApp ou vê o evento no Instagram.',
      'Abre a página, confere a data e a programação e se inscreve.',
      'A inscrição cai na sua planilha e a pessoa recebe a confirmação por e-mail.',
    ],
    goal: 'Quero inscrições para um evento',
    tagline: 'Tema, data e inscrição em uma página.',
    group: 'landing',
    short: 'Tema, palestrante, data e inscrição em uma página que se compartilha bem no WhatsApp.',
    icon: 'ticket',
    meta: {
      title: 'Landing Page para Palestras e Eventos | ARCAV',
      description:
        'Páginas para palestras, workshops e eventos: programação, palestrante, inscrição com confirmação e lista de inscritos organizada.',
    },
    hero: {
      title: 'Uma página para divulgar o seu evento e receber as inscrições.',
      subtitle:
        'Para palestras, workshops, cursos presenciais e eventos. Tudo o que a pessoa precisa para decidir, a inscrição em poucos campos e a lista de inscritos organizada para você.',
      cta: 'Quero uma página para meu evento',
    },
    forWho: [
      'Palestrantes e consultores',
      'Workshops, cursos e turmas presenciais',
      'Eventos de empresas e associações',
    ],
    includes: [
      'Tema, programação e palestrante em uma página',
      'Inscrição com confirmação automática',
      'Lista de inscritos em planilha',
      'Lembretes por e-mail ou WhatsApp',
      'Prévia caprichada para compartilhar no WhatsApp',
      'Botão para adicionar à agenda',
    ],
    example: { path: null, client: null, image: null },
    faq: [
      { q: 'Dá para cobrar a inscrição?', a: 'Sim. Conectamos a página a um meio de pagamento, ou mantemos a inscrição gratuita com confirmação.' },
      { q: 'Serve para vários eventos?', a: 'Sim. A estrutura pode ser reaproveitada para as próximas datas e turmas.' },
      PREVIEW_FAQ,
      PRICE_FAQ,
    ],
    contact: {
      subject: 'Quero uma página para meu evento',
      label: 'Conte sobre o evento',
      placeholder: 'Ex.: vou dar uma palestra em março para 80 pessoas e preciso das inscrições.',
    },
  },
  {
    slug: 'comercio-digital',
    situation: 'Vendo pelo WhatsApp e quero receber pedidos organizados.',
    name: 'Site para comércio com pedido no WhatsApp',
    label: 'Comércio com pedido no WhatsApp',
    disc: 'Comércio',
    tagline: 'O pedido chega pronto no WhatsApp da loja.',
    group: 'main',
    // As três frases saem do texto aprovado do exemplo da página de comércio (commerce-service.ts).
    journeyIcons: ['cart', 'send', 'chat'],
    journey: [
      'O cliente escolhe os produtos e as quantidades no site.',
      'Revisa o pedido e envia a mensagem já organizada para o WhatsApp da loja.',
      'O atendimento continua com você, do jeito que já funciona.',
    ],
    short: 'Catálogo com carrinho que envia o pedido pronto para o WhatsApp da loja, com ofertas que você só aprova.',
    icon: 'cart',
    meta: { title: '', description: '' },
    hero: { title: '', subtitle: '', cta: 'Quero uma loja assim' },
    forWho: [],
    includes: [],
    example: { path: `${solutionPath('comercio-digital')}${toAnchor(ANCHOR.demo)}`, client: 'Loja de exemplo', image: '/exemplos/comercio.webp' },
    faq: [],
    contact: { subject: '', label: '', placeholder: '' },
  },
  {
    slug: 'sistemas-e-automacao',
    situation: 'Faço tudo à mão, entre planilha, e-mail e WhatsApp.',
    name: 'Sistemas e automação',
    label: 'Sistemas e automação',
    disc: 'Auto\u00ADmação',
    tagline: 'O trabalho repetido acontece sozinho.',
    group: 'main',
    journeyIcons: ['form', 'workflow', 'chart'],
    journey: [
      'Seu cliente faz um pedido pelo formulário ou pelo WhatsApp.',
      'A automação confirma o pedido para ele e registra tudo sozinha.',
      'Você acompanha na planilha, no e-mail ou em um painel.',
    ],
    short: 'Formulários, planilhas e WhatsApp conectados: confirmações, lembretes e relatórios que acontecem sozinhos.',
    icon: 'workflow',
    meta: {
      title: 'Sistemas e Automação de Processos em Curitiba | ARCAV',
      description:
        'Automações que conectam formulários, planilhas, e-mail e WhatsApp, e sistemas pequenos sob medida para agenda, cadastro, pedidos e relatórios.',
    },
    hero: {
      title: 'O trabalho repetido acontece sozinho. Sua equipe cuida do resto.',
      subtitle:
        'Conectamos os formulários, as planilhas e o WhatsApp que você já usa, e criamos sistemas pequenos para o que falta: agenda, cadastro, pedidos e relatórios.',
      cta: 'Quero automatizar um processo',
    },
    forWho: [
      'Equipes que copiam dados de um lugar para outro',
      'Negócios que confirmam agendamentos à mão',
      'Quem precisa de relatórios sem montar planilha toda semana',
    ],
    includes: [
      'Mapeamento do processo antes de qualquer código',
      'Automações entre formulários, planilhas, e-mail e WhatsApp',
      'Sistemas pequenos sob medida: agenda, cadastro, pedidos',
      'Painel com o que importa para a operação',
      'Documentação e acompanhamento depois da entrega',
    ],
    example: { path: null, client: null, image: null },
    faq: [
      { q: 'Preciso trocar as ferramentas que já uso?', a: 'Não. Primeiro conectamos o que já funciona; só criamos algo novo onde falta.' },
      { q: 'E se a automação parar?', a: 'Cada automação é documentada e acompanhada depois da entrega, e você sabe o que fazer se algo falhar.' },
      PREVIEW_FAQ,
      PRICE_FAQ,
    ],
    contact: {
      subject: 'Quero automatizar um processo',
      label: 'Qual processo você quer automatizar?',
      placeholder: 'Ex.: confirmamos agendamentos um por um pelo WhatsApp e anotamos tudo numa planilha.',
    },
  },
];

export const SOLUTIONS: Solution[] = ENTRIES.map((entry) => ({ ...entry, path: solutionPath(entry.slug) }));

export const solutionBySlug = (slug: string) => SOLUTIONS.find((s) => s.slug === slug)!;

/**
 * Os cinco serviços, na ordem da home, do rodapé e de "Outras soluções". Cada um entra por uma
 * situação do cliente (`situation`). Os tipos de landing page ficam dentro de "Landing pages".
 */
export const SERVICES: Solution[] = ['site-institucional', 'migracao', 'landing-pages', 'comercio-digital', 'sistemas-e-automacao'].map(solutionBySlug);

/** Soluções com página própria (comercio-digital.astro, landing-pages.astro); as demais usam [slug].astro. */
export const DEDICATED_PAGES = ['comercio-digital', 'landing-pages'];

/** Tamanho das capturas de exemplo em public/exemplos/ (a moldura reserva o espaço antes de carregar). */
export const EXAMPLE_IMAGE = { width: 1440, height: 900 } as const;

/** Passos comuns a todas as soluções. */
export const SOLUTION_STEPS = [
  'Conversa sobre o seu objetivo e o que já existe.',
  'Se houver encaixe, uma prévia resumida do seu projeto.',
  'Proposta por escrito: o que entra, o prazo e o valor.',
  'Construção com a sua aprovação, publicação e acompanhamento.',
];

/** Textos fixos da página de uma solução (SolutionPage.astro). */
export const SOLUTION_PAGE = {
  heroNote: 'Conversa sem compromisso. Se houver encaixe, você recebe uma prévia resumida do seu projeto junto com a proposta.',
  exampleCta: 'Ver o exemplo',
  /** Título padrão do bloco de três frases (SolutionFlow). */
  journeyTitle: 'O caminho do seu cliente',
  fit: {
    label: 'Para quem é e o que está incluído',
    forWho: 'Para quem é',
    includes: 'O que está incluído',
  },
  how: 'Como funciona',
  others: 'Outras soluções',
  closing: {
    title: 'Vamos conversar sobre o seu projeto?',
    text: 'Conte o que você precisa. Respondemos com os próximos passos, sem compromisso e sem jargão técnico.',
    waMessage: (name: string) => `Olá! Vi a página "${name}" da ARCAV e quero conversar sobre o meu projeto.`,
  },
};

/** Escolha do tipo de landing page em /solucoes/landing-pages/ (LandingFlow.astro). */
export const LANDING_PICKER = {
  title: 'O que você quer com a sua página?',
  lead: 'Escolha o objetivo. Cada tipo de página tem o seu caminho, para quem é e o que entra.',
  tabs: 'O que você quer com a página?',
  typePrefix: 'Landing page de',
  forWho: 'Para quem é',
  includes: 'O que entra',
  more: 'Ver tudo sobre esta página',
  /** Aba aberta ao chegar: o caso mais comum. */
  defaultSlug: 'landing-page-campanhas',
  /** Itens de "O que entra" na ficha; a lista completa fica na página do tipo. */
  maxIncludes: 4,
};
