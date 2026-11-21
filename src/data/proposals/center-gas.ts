// src/data/proposals/center-gas.ts — Proposta personalizada para Center Gás Curitiba.
// Fonte do copy: docs/propostas/center-gas/04-CONTENIDO-PT-BR.md (observações públicas
// de 20/11/2026). Não adicionar números, resultados ou depoimentos sem evidência.
import type { ProspectProposal } from './types';

export const centerGasProposal: ProspectProposal = {
  slug: 'center-gas',
  companyName: 'Center Gás Curitiba',
  currentSiteUrl: 'https://centergascuritiba.com.br/',
  demoUrl: 'https://centergas-v3.pages.dev/',
  robotsNoIndex: true,

  meta: {
    title: 'Proposta da ARCAV para a Center Gás Curitiba',
    description:
      'Análise do site atual e demonstração navegável para facilitar pedidos de gás e água e destacar ofertas. Uma proposta preparada pela ARCAV.',
  },

  header: { tag: 'Proposta para Center Gás' },

  hero: {
    eyebrow: 'Uma proposta preparada pela ARCAV para a Center Gás Curitiba',
    title: 'E se pedir gás e água fosse ainda mais simples para seus clientes?',
    lead:
      'Conhecemos o site atual da Center Gás e preparamos uma proposta para facilitar pedidos, valorizar ofertas e organizar a divulgação dos produtos. Você pode conhecer a ideia e testar a demonstração pelo celular.',
    cta: 'Ver o que identificamos',
    microproof:
      'Uma proposta com análise do site atual e demonstração navegável, sem compromisso.',
  },

  service: {
    label: 'O que a ARCAV faz',
    title: 'A Center Gás atende seus clientes. A ARCAV ajuda a simplificar o digital.',
    text:
      'Combinamos um site comercial prático, campanhas de ofertas e informações simples sobre o interesse dos visitantes. Tudo pensado para apoiar a rotina de quem vende pelo WhatsApp.',
    cards: [
      {
        title: 'Pedidos mais organizados',
        text: 'Os clientes selecionam produtos e quantidades antes de abrir o WhatsApp.',
      },
      {
        title: 'Ofertas com mais destaque',
        text: 'Produtos e promoções podem ganhar espaço no site e materiais para compartilhamento.',
      },
      {
        title: 'Acompanhamento simples',
        text: 'Relatórios de visitas e cliques ajudam a escolher o que divulgar nas próximas campanhas.',
      },
    ],
  },

  diagnosis: {
    label: 'O que observamos',
    title: 'O site atual já apresenta os produtos. Podemos facilitar o próximo passo.',
    text:
      'A Center Gás já tem um catálogo com opções de gás, água e acessórios e oferece atendimento pelo WhatsApp. Nossa proposta preserva essa praticidade e organiza melhor a experiência de escolha.',
    currentLabel: 'Hoje',
    opportunityLabel: 'Possibilidade',
    items: [
      {
        current: 'Produtos apresentados com acesso ao WhatsApp.',
        opportunity: 'O cliente escolhe vários itens e suas quantidades antes de encaminhar o pedido.',
      },
      {
        current: 'A Center Gás já oferece diferentes categorias de produtos.',
        opportunity: 'As ofertas podem destacar combinações e produtos complementares, como gás e água.',
      },
    ],
    note:
      'Esta análise considera informações públicas dos sites, consultadas em novembro de 2026. Não tivemos acesso aos resultados de vendas ou dados internos da empresa.',
  },

  demo: {
    label: 'A ideia já pode ser testada',
    title: 'A ideia já funciona em uma demonstração.',
    text:
      'Explore uma versão de site com seleção de produtos, carrinho e encaminhamento do pedido pelo WhatsApp. Assim fica mais fácil visualizar a experiência antes de decidir sobre a implantação.',
    cta: 'Testar a nova experiência da Center Gás',
    newTabHint: 'Abre em uma nova aba. Esta página continua aberta para você voltar.',
    caption:
      'Demonstração independente preparada pela ARCAV. Não é o site oficial em produção da Center Gás.',
    illustration: {
      label: 'exemplo_de_pedido',
      items: [
        { qty: 1, name: 'Gás P13' },
        { qty: 1, name: 'Água 20 L' },
      ],
      action: 'Finalizar pelo WhatsApp',
      caption: 'Ilustração do fluxo. Não é uma captura de tela da demonstração.',
    },
  },

  offers: {
    label: 'Ofertas',
    title: 'Suas promoções prontas para divulgar, com a sua aprovação.',
    text:
      'A Center Gás informa os produtos, os preços e os períodos de validade. A ARCAV prepara as peças, organiza a programação e apresenta o material para aprovação. Depois de aprovado, o conteúdo pode ser disponibilizado no site conforme o plano contratado.',
    steps: ['Você informa', 'Nós preparamos', 'Você aprova', 'A oferta é publicada'],
    note:
      'A automação completa e o painel administrativo fazem parte de uma etapa própria de implantação, mediante escopo e orçamento definidos.',
  },

  pricing: {
    label: 'Investimento e planos',
    title: 'Uma forma prática de começar, no ritmo do seu negócio.',
    plans: [
      {
        name: 'Site comercial',
        priceBRL: 3900,
        frequency: 'once',
        priceNote: 'investimento único',
        inclusions: [
          'Catálogo de produtos',
          'Carrinho com quantidades',
          'Pedidos encaminhados pelo WhatsApp',
          'Área de ofertas',
          'Versão para celular',
          'Testes antes da entrega',
        ],
        condition: 'Condição comercial sugerida: 50% na contratação e 50% na entrega aprovada.',
        suggested: true,
      },
      {
        name: 'Ofertas Semanais',
        priceBRL: 490,
        frequency: 'month',
        priceNote: 'por mês',
        inclusions: [
          'Até 4 campanhas semanais e 1 mensal',
          'Total de até 12 peças promocionais por mês',
          'Programação das ofertas no site',
          'Resumo mensal das interações digitais',
        ],
        suggested: true,
      },
      {
        name: 'Ofertas Diárias',
        priceBRL: 890,
        frequency: 'month',
        priceNote: 'por mês',
        inclusions: [
          'Até 22 publicações de ofertas em dias úteis',
          'Até 4 campanhas semanais e 1 mensal',
          'Limite total de 30 peças promocionais por mês',
          'Programação e resumo de desempenho digital',
        ],
      },
    ],
    notes: [
      'Cada campanha depende das informações e da aprovação da Center Gás.',
      'Desenvolvimento do painel administrativo, automações, custos de terceiros, publicidade paga, suporte não descrito e publicações adicionais dependem de orçamento e escopo específicos.',
      'As métricas refletem interesse e cliques, não vendas confirmadas.',
    ],
    recommendation: {
      title: 'Comece pelo Site comercial com as Ofertas Semanais.',
      text: 'Depois, avaliamos juntos se a frequência de ofertas deve aumentar.',
    },
  },

  closing: {
    label: 'Próximo passo',
    title: 'Podemos te mostrar como isso funcionaria na rotina da Center Gás?',
    text:
      'A demonstração já está disponível. Se a ideia fizer sentido, conversamos sobre os próximos passos, o escopo e as condições de implantação.',
    cta: 'Marcar uma conversa',
    nextStep:
      'Na conversa, você conta como funciona a rotina de pedidos e nós explicamos como seria a implantação.',
    reassurance:
      'Conversar não gera compromisso. Se a Center Gás decidir seguir, o site é pago 50% na contratação e 50% na entrega aprovada.',
    emailHint: 'Se preferir, escreva para',
    contactSubject: 'Proposta Center Gás — conversar com a ARCAV',
    contactMessage:
      'Olá! Vi a proposta da ARCAV para a Center Gás e gostaria de conversar sobre a implantação.',
  },

  footer: {
    disclaimer:
      'Proposta comercial independente da ARCAV para avaliação da Center Gás Curitiba. Sem vínculo contratual implícito.',
    arcavLink: 'Conheça a ARCAV',
  },
};
