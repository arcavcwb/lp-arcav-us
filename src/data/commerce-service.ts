// src/data/commerce-service.ts — Copy pt-BR da página pública /solucoes/comercio-digital/.
// Fonte: docs/propostas/center-gas/04-CONTENIDO-PT-BR.md (seção A). Não citar clientes
// nem preços de propostas individuais nesta página.
import type { DemoProduct, IllustrativeOrder } from './proposals/types';

export const commerceService = {
  path: '/solucoes/comercio-digital/',
  meta: {
    title: 'Sites, Pedidos e Campanhas para Comércios em Curitiba | ARCAV',
    description:
      'Sites comerciais, pedidos organizados pelo WhatsApp e ofertas em destaque para comércios de Curitiba, com uma operação simples para você e seus clientes.',
  },
  hero: {
    eyebrow: 'Soluções para comércios',
    title: 'Seus clientes escolhem no site e o pedido chega pronto no seu WhatsApp.',
    subtitle:
      'Criamos sites comerciais, organizamos pedidos pelo WhatsApp e mantemos suas ofertas em destaque. Tudo simples de operar, para você e para seus clientes.',
    cta: 'Quero ver a minha loja',
  },
  /** Loja de exemplo do celular interativo (home e esta página). Ilustrativa. */
  demo: {
    products: [
      { name: 'Café 500 g', detail: 'Pacote', qty: 2 },
      { name: 'Leite 1 L', detail: 'Integral', qty: 1 },
      { name: 'Pão de forma', detail: '500 g', qty: 1 },
      { name: 'Arroz 5 kg', detail: 'Pacote', qty: 0 },
    ] satisfies DemoProduct[],
    caption: 'Toque em + e − e revise o pedido. Loja de exemplo, não representa um cliente real.',
  },
  pillars: {
    label: 'Como ajudamos',
    title: 'Três frentes para facilitar a compra.',
    items: [
      {
        title: 'Pedidos mais práticos',
        text: 'Seu cliente encontra os produtos, escolhe o que precisa e chega ao WhatsApp com o pedido organizado.',
      },
      {
        title: 'Ofertas que não ficam paradas',
        text: 'Preparamos as peças das campanhas diárias, semanais ou mensais para o site e para as suas redes. Você aprova antes de publicar.',
      },
      {
        title: 'Saiba quais produtos chamam atenção',
        text: 'Acompanhe visualizações e cliques para entender quais produtos chamam mais atenção. Isso não substitui o controle de vendas.',
      },
    ],
  },
  process: {
    label: 'Como trabalhamos',
    title: 'Um processo simples, com a sua aprovação.',
    steps: [
      'Entendemos seu atendimento e seus produtos.',
      'Preparamos uma solução prática para o seu negócio.',
      'Você valida os conteúdos e as condições comerciais.',
      'Colocamos no ar o que foi aprovado e acompanhamos o uso.',
    ],
  },
  example: {
    label: 'Exemplo ilustrativo',
    title: 'Um pedido que chega pronto ao seu WhatsApp.',
    text:
      'O cliente escolhe os produtos e as quantidades no site, revisa o pedido e envia a mensagem já organizada para o WhatsApp da loja. O atendimento continua com você, do jeito que já funciona.',
    order: {
      label: 'pedido_exemplo',
      items: [
        { qty: 2, name: 'Café 500 g' },
        { qty: 1, name: 'Leite 1 L' },
        { qty: 1, name: 'Pão de forma' },
      ],
      action: 'Enviar pedido pelo WhatsApp',
      caption: 'Ilustração conceitual. Não representa um cliente real.',
    } satisfies IllustrativeOrder,
  },
  /** Perguntas frequentes. Só respostas confirmadas pelo Armando (preço e prazo: definidos após a análise). */
  faq: {
    title: 'Perguntas frequentes',
    items: [
      {
        q: 'Preciso trocar meu número de WhatsApp?',
        a: 'Não. Os pedidos chegam no mesmo WhatsApp que você já usa para atender.',
      },
      {
        q: 'Quanto custa?',
        a: 'Depende do que o seu comércio precisa. O valor vem junto com a análise e a demonstração, sem compromisso.',
      },
      {
        q: 'Quanto tempo leva para ficar pronto?',
        a: 'O prazo é definido depois da análise, de acordo com o que o seu comércio precisa.',
      },
      {
        q: 'Quem atualiza os produtos e os preços?',
        a: 'Você nos passa as mudanças e nós atualizamos o site. Nas ofertas, você informa produtos, preços e validade e aprova cada peça antes de publicar. Um painel para você mesmo editar é uma etapa à parte, com escopo e orçamento próprios.',
      },
      {
        q: 'Preciso entender de tecnologia?',
        a: 'Não. Você continua atendendo como sempre, e tudo o que vai para o site passa pela sua aprovação.',
      },
    ],
  },
  closing: {
    label: 'Próximo passo',
    title: 'Quer ver como ficaria a sua loja?',
    text:
      'Mande o link do seu site, Instagram ou catálogo. Nós analisamos como você atende hoje e mostramos uma demonstração com os seus produtos, sem compromisso.',
    cta: 'Quero ver a minha loja',
    emailHint: 'Se preferir, escreva para',
    contactSubject: 'Quero ver como ficaria a minha loja',
    contactMessage:
      'Olá! Vi a página de soluções para comércios da ARCAV e quero ver como ficaria a minha loja.\n\nMeu site, Instagram ou catálogo: ',
  },
};
