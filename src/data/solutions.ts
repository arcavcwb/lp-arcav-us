// src/data/solutions.ts — As soluções da ARCAV. Cada uma tem página própria e um exemplo
// ilustrativo (empresa fictícia). Valor e prazo são definidos depois da avaliação.
import type { IconName } from '../components/ui/icons';

export interface Solution {
  slug: string;
  path: string;
  name: string;
  /** Nome curto para cards e abas (ex.: "Campanhas"). */
  label: string;
  /** Frase curta para os cards simplificados da home. */
  tagline: string;
  /** Landing page (oferta principal) ou solução complementar. */
  group: 'landing' | 'extra';
  /** Uma linha para cards e listas. */
  short: string;
  /** Percurso da landing page no infográfico da home (só para group 'landing'). */
  flow?: { from: string[]; action: string[]; to: string[] };
  /** Objetivo em linguagem simples ("Quero ...") para o infográfico. */
  goal?: string;
  /** Uma frase de exemplo, em linguagem simples, contando o percurso. */
  story?: string;
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

export const SOLUTIONS: Solution[] = [
  {
    slug: 'landing-page-alto-padrao',
    path: '/solucoes/landing-page-alto-padrao/',
    name: 'Landing page de alto padrão',
    label: 'Alto padrão',
    flow: { from: ['Google', 'Instagram', 'Indicação'], action: ['Chama no WhatsApp', 'Preenche um formulário'], to: ['Seu WhatsApp', 'E-mail'] },
    goal: 'Quero passar confiança',
    story: 'Alguém procura você no Google ou recebe uma indicação, vê uma página à altura do seu trabalho e chama no WhatsApp ou deixa o contato.',
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
    path: '/solucoes/landing-page-campanhas/',
    name: 'Landing page para campanhas',
    label: 'Campanhas',
    flow: { from: ['Anúncios'], action: ['Preenche um formulário'], to: ['Planilha', 'CRM', 'Seu WhatsApp'] },
    goal: 'Quero contatos de um anúncio',
    story: 'Alguém vê seu anúncio no Instagram ou no Google, cai em uma página com uma oferta só e preenche o formulário. O contato chega na planilha, no CRM e no seu WhatsApp.',
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
    path: '/solucoes/landing-page-produto/',
    name: 'Landing page de produto',
    label: 'Produto',
    flow: { from: ['Anúncios', 'Google', 'Instagram'], action: ['Compra ou testa'], to: ['Pagamento', 'CRM'] },
    goal: 'Quero vender um produto',
    story: 'Alguém conhece seu produto por um anúncio ou no Google, entende como ele funciona e compra ou começa a testar ali mesmo.',
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
    path: '/solucoes/landing-page-palestras/',
    name: 'Landing page para palestras e eventos',
    label: 'Palestras e eventos',
    flow: { from: ['WhatsApp', 'Instagram'], action: ['Se inscreve'], to: ['Planilha', 'E-mail'] },
    goal: 'Quero inscrições para um evento',
    story: 'Alguém recebe o link no WhatsApp ou vê no Instagram, confere a data e a programação e se inscreve. A inscrição cai na planilha e a confirmação vai por e-mail.',
    tagline: 'Tema, data e inscrição em uma página.',
    group: 'landing',
    short: 'Tema, palestrante, data e inscrição em uma página que se compartilha bem no WhatsApp.',
    icon: 'mic',
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
    path: '/solucoes/comercio-digital/',
    name: 'Site para comércio com pedido no WhatsApp',
    label: 'Comércio com pedido no WhatsApp',
    tagline: 'O pedido chega pronto no WhatsApp da loja.',
    group: 'extra',
    short: 'Catálogo com carrinho que envia o pedido pronto para o WhatsApp da loja, com ofertas que você só aprova.',
    icon: 'cart',
    meta: { title: '', description: '' },
    hero: { title: '', subtitle: '', cta: 'Quero ver a minha loja' },
    forWho: [],
    includes: [],
    example: { path: '/solucoes/comercio-digital/#demo', client: 'Loja de exemplo', image: '/exemplos/comercio.webp' },
    faq: [],
    contact: { subject: '', label: '', placeholder: '' },
  },
  {
    slug: 'sistemas-e-automacao',
    path: '/solucoes/sistemas-e-automacao/',
    name: 'Sistemas e automação',
    label: 'Sistemas e automação',
    tagline: 'O trabalho repetido acontece sozinho.',
    group: 'extra',
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
      PRICE_FAQ,
    ],
    contact: {
      subject: 'Quero automatizar um processo',
      label: 'Qual processo você quer automatizar?',
      placeholder: 'Ex.: confirmamos agendamentos um por um pelo WhatsApp e anotamos tudo numa planilha.',
    },
  },
];

export const solutionBySlug = (slug: string) => SOLUTIONS.find((s) => s.slug === slug)!;

/** Passos comuns a todas as soluções. */
export const SOLUTION_STEPS = [
  'Conversa sobre o seu objetivo e o que já existe.',
  'Escopo claro: o que entra, o prazo e o valor, por escrito.',
  'Construção com revisões e a sua aprovação.',
  'Publicação, medição e acompanhamento.',
];
