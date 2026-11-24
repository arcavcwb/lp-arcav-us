// src/data/commerce-service.ts — Copy pt-BR da página pública /solucoes/comercio-digital/.
// Fonte: o conteúdo aprovado da proposta da Center Gás (repositório próprio). Não citar clientes
// nem preços de propostas individuais nesta página.
import type { DemoProduct, IllustrativeOrder } from './types';
import { ANCHOR, toAnchor } from './anchors';
import { solutionPath } from './solutions';

export const commerceService = {
  path: solutionPath('comercio-digital'),
  meta: {
    title: 'Loja com Pedido no WhatsApp para Comércios em Curitiba | ARCAV',
    description:
      'Sites comerciais, pedidos organizados pelo WhatsApp e ofertas em destaque para comércios de Curitiba, com uma operação simples para você e seus clientes.',
  },
  hero: {
    eyebrow: 'Soluções para comércios',
    title: 'Seus clientes escolhem no site e o pedido chega pronto no seu WhatsApp.',
    subtitle:
      'Crio sites comerciais, organizo pedidos pelo WhatsApp e mantenho suas ofertas em destaque. Tudo simples de operar, para você e para seus clientes.',
    cta: 'Quero uma loja assim',
    demoCta: 'Testar o exemplo',
    note: 'Teste a loja de exemplo agora. Se houver encaixe depois da conversa, preparo uma prévia resumida com alguns dos seus produtos.',
  },
  /** Loja de exemplo do celular interativo (home e esta página). Ilustrativa. */
  demo: {
    products: [
      { name: 'Café 500 g', detail: 'Pacote', qty: 0 },
      { name: 'Leite 1 L', detail: 'Integral', qty: 0 },
      { name: 'Pão de forma', detail: '500 g', qty: 0 },
      { name: 'Arroz 5 kg', detail: 'Pacote', qty: 0 },
    ] satisfies DemoProduct[],
    /** Começa vazio: o carrinho cheio parecia uma captura de tela, não algo para tocar. */
    caption: 'Loja de exemplo. Não representa um cliente real.',
    /** Aparece abaixo do celular depois de "Enviar pelo WhatsApp". */
    next: { popover: ANCHOR.contactForm, label: 'Quero isso na minha loja' },
  },
  pillars: {
    label: 'Como eu ajudo',
    title: 'Três frentes para facilitar a compra.',
    items: [
      {
        title: 'Pedidos mais práticos',
        text: 'Seu cliente encontra os produtos, escolhe o que precisa e chega ao WhatsApp com o pedido organizado.',
      },
      {
        title: 'Ofertas que não ficam paradas',
        text: 'Preparo as peças das campanhas diárias, semanais ou mensais para o site e para as suas redes. Você aprova antes de publicar.',
      },
      {
        title: 'Saiba quais produtos chamam atenção',
        text: 'Acompanhe visualizações e cliques para entender quais produtos chamam mais atenção. Isso não substitui o controle de vendas.',
      },
    ],
  },
  process: {
    label: 'Como eu trabalho',
    title: 'Um processo simples, com a sua aprovação.',
    steps: [
      'Entendo seu atendimento e seus produtos.',
      'Preparo uma solução prática para o seu negócio.',
      'Você valida os conteúdos e as condições comerciais.',
      'Coloco no ar o que foi aprovado e acompanho o uso.',
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
    /** A ilustração espelha a demo do topo da página. */
    live: {
      empty: 'Monte um pedido no exemplo do topo da página. Ele aparece aqui do jeito que chegaria no WhatsApp da loja.',
      cta: { href: toAnchor(ANCHOR.demo), label: 'Montar um pedido' },
      caption: 'O lado da loja: o pedido que você montou no exemplo. Não representa um cliente real.',
    },
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
        a: 'Depende do que o seu comércio precisa. O valor vem na proposta, depois da conversa, sem compromisso.',
      },
      {
        q: 'Posso ver como ficaria com os meus produtos?',
        a: 'A loja de exemplo desta página pode ser testada agora. Depois da conversa, se houver encaixe, preparo uma prévia resumida com alguns dos seus produtos para acompanhar a proposta.',
      },
      {
        q: 'Quanto tempo leva para ficar pronto?',
        a: 'O prazo é definido depois da análise, de acordo com o que o seu comércio precisa.',
      },
      {
        q: 'Quem atualiza os produtos e os preços?',
        a: 'Você me passa as mudanças e eu atualizo o site. Nas ofertas, você informa produtos, preços e validade e aprova cada peça antes de publicar. Um painel para você mesmo editar é uma etapa à parte, com escopo e orçamento próprios.',
      },
      {
        q: 'Preciso entender de tecnologia?',
        a: 'Não. Você continua atendendo como sempre, e tudo o que vai para o site passa pela sua aprovação.',
      },
    ],
  },
  closing: {
    label: 'Próximo passo',
    title: 'Quer uma loja assim para o seu comércio?',
    text:
      'Mande o link do seu site, Instagram ou catálogo e conte como você atende hoje. Respondo com os próximos passos e, se houver encaixe, preparo uma prévia resumida com alguns dos seus produtos.',
    cta: 'Quero uma loja assim',
    emailHint: 'Se preferir, escreva para',
    contactSubject: 'Quero uma loja assim',
    contactMessage:
      'Olá! Vi a página de soluções para comércios da ARCAV e quero conversar sobre uma loja assim.\n\nMeu site, Instagram ou catálogo: ',
  },
};
