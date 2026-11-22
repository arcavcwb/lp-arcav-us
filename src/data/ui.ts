// src/data/ui.ts — Textos de interface: rótulos, botões, avisos e textos de acessibilidade que os
// componentes e os scripts usam. O conteúdo de cada página fica em site.ts, solutions.ts,
// commerce-service.ts. Componentes e scripts não escrevem texto solto: leem daqui.
import { BRAND, home } from './site';
import { firstName } from '../lib/text';

export interface FormField {
  id: 'name' | 'business' | 'link' | 'reply' | 'message';
  label: string;
  type: 'text' | 'textarea';
  required: boolean;
  autocomplete?: string;
  inputmode?: 'url' | 'email';
  rows?: number;
  placeholder?: string;
  hint?: string;
  error?: string;
}

/** Saudação do pedido, igual no celular de exemplo e na ilustração do WhatsApp. */
const ORDER_GREETING = 'Olá! Quero fazer um pedido:';
const SEND_WHATSAPP = 'Enviar pelo WhatsApp';
const REPLY_LABEL = 'E-mail ou WhatsApp para a resposta';

export const ui = {
  a11y: {
    skipLink: 'Pular para o conteúdo',
    newTab: '(abre em nova aba)',
    homeLink: `${BRAND.name}, página inicial`,
  },

  /** Rótulos de dados que se repetem (rodapé, Sobre). */
  labels: {
    location: 'Localização',
    trajectory: 'Trajetória',
    trajectoryList: 'Trajetória profissional',
    contact: 'Contato',
  },

  whatsapp: (display: string) => `WhatsApp ${display}`,
  responseTime: (time: string) => `Resposta ${time}.`,

  brand: {
    byline: `por ${BRAND.author}`,
  },

  header: {
    nav: 'Principal',
    cta: 'Fale comigo',
    menuOpen: 'Abrir menu',
    menuClose: 'Fechar menu',
  },

  footer: {
    nav: 'Rodapé',
  },

  faq: {
    title: 'Perguntas frequentes',
  },

  /** Marcador de uma foto que ainda não chegou (data/photos.ts). */
  photo: {
    pending: 'Foto em breve',
    spec: (ratio: string, width: number, height: number) => `${ratio} · mínimo ${width} × ${height} px`,
    caption: `${BRAND.author} · ${BRAND.city}`,
  },

  examples: {
    tabs: 'Exemplos por solução',
    open: 'Abrir o exemplo',
    solution: 'Ver a solução',
  },

  exampleFrame: {
    open: 'Abrir o exemplo',
    openLabel: (client: string | null) => `Abrir o exemplo: ${client}`,
    caption: (client: string | null) => `Exemplo · ${client}`,
    pendingTitle: 'Exemplo real em preparação',
    pendingText: 'Baseado em um projeto de verdade, com autorização do cliente.',
    pendingCaption: 'Em breve',
  },

  closingContact: {
    responder: `Quem responde é o ${BRAND.author}`,
    place: `Aqui de ${BRAND.city}.`,
    whatsappLead: 'Se preferir, chame no WhatsApp',
    emailOr: 'ou escreva para',
    emailLead: 'Se preferir, escreva para',
  },

  contactForm: {
    optional: '(opcional)',
    trap: 'Não preencha este campo',
    required: 'Campo obrigatório.',
    submit: {
      whatsapp: SEND_WHATSAPP,
      store: 'Quero uma loja assim',
      general: 'Enviar mensagem',
      sending: 'Enviando…',
    },
    sent: {
      title: 'Mensagem enviada.',
      text: 'Vamos responder pelo contato que você informou.',
    },
    composed: {
      readyWhatsapp: 'Mensagem pronta. Estamos abrindo o WhatsApp com ela escrita; é só enviar.',
      readyEmail: (email: string) =>
        `Mensagem pronta. Abrimos seu aplicativo de e-mail para ${email}. Se ele não abriu, copie a mensagem abaixo.`,
      reopen: 'Abrir de novo',
      copy: 'Copiar mensagem',
      copied: 'Copiada',
      copyFallback: 'Selecione e copie o texto',
    },
    note: {
      whatsappOpens: 'O WhatsApp abre com a sua mensagem pronta; é só tocar em enviar.',
      privacy: 'Usamos seus dados só para responder.',
      emailLead: 'Se preferir, escreva para',
      emailDirectLead: 'Se preferir, escreva direto para',
      whatsappLead: 'Se preferir, chame no WhatsApp',
      emailOr: 'ou escreva para',
    },
    /** Comércios: conversa sobre um site de pedidos. */
    store: [
      { id: 'name', label: 'Seu nome', type: 'text', autocomplete: 'name', required: true, error: 'Escreva seu nome para sabermos com quem estamos falando.' },
      { id: 'link', label: 'Link do seu site, Instagram ou catálogo', type: 'text', autocomplete: 'url', inputmode: 'url', required: true, placeholder: 'Ex.: instagram.com/sualoja', error: 'Cole o link para podermos ver os seus produtos.' },
      { id: 'reply', label: REPLY_LABEL, type: 'text', autocomplete: 'email', inputmode: 'email', required: true, error: 'Informe um e-mail ou WhatsApp para podermos responder.' },
      { id: 'message', label: 'Algo mais que devemos saber?', type: 'textarea', rows: 3, required: false, placeholder: 'Ex.: vendemos gás e água e recebemos pedidos pelo WhatsApp.' },
    ] satisfies FormField[],
    /** Home e soluções. A pergunta da mensagem pode ser trocada por página. */
    general: [
      { id: 'name', label: 'Seu nome', type: 'text', autocomplete: 'name', required: true, error: 'Escreva seu nome para eu saber com quem estou falando.' },
      { id: 'business', label: 'Empresa ou negócio', type: 'text', autocomplete: 'organization', required: false },
      { id: 'reply', label: REPLY_LABEL, type: 'text', autocomplete: 'email', inputmode: 'email', required: true, hint: 'Respondo por onde for mais prático para você.', error: 'Informe um e-mail ou WhatsApp para eu poder responder.' },
      { id: 'message', label: 'Como funciona hoje e o que você quer melhorar?', type: 'textarea', rows: 5, required: true, placeholder: 'Ex.: recebo pedidos pelo WhatsApp e anoto tudo no caderno.', error: 'Conte em poucas linhas o que você precisa.' },
    ] satisfies FormField[],
  },

  /** Mensagem que o formulário monta (navegador e /api/contato). */
  contactMessage: {
    topic: home.contact.subject,
    storeGreeting: 'Olá! Quero conversar sobre um site de pedidos para a minha loja.',
    generalGreeting: `Olá, ${firstName(BRAND.author)}!`,
    link: 'Site, Instagram ou catálogo',
    name: 'Nome',
    business: 'Negócio',
    reply: 'Resposta por',
  },

  phoneDemo: {
    storeName: 'Sua loja',
    storeNote: 'Escolha os produtos e as quantidades',
    greeting: ORDER_GREETING,
    guideTitle: 'Experimente: monte um pedido',
    guideLabel: 'Como testar',
    guideSteps: ['Toque em +', 'Revise', 'Envie'],
    screen: 'Demonstração: monte um pedido de exemplo',
    remove: (name: string) => `Tirar um ${name}`,
    add: (name: string) => `Adicionar um ${name}`,
    review: 'Revisar pedido',
    back: 'Voltar aos produtos',
    ready: 'Pedido pronto',
    sendHint: 'Na loja de verdade, este botão abre o WhatsApp com a mensagem já escrita.',
    sent: 'Pronto. Numa loja real, o pedido chegaria assim no WhatsApp do atendimento.',
    send: SEND_WHATSAPP,
    summary: {
      empty: 'Nenhum item ainda',
      one: '1 item no pedido',
      many: (total: number) => `${total} itens no pedido`,
    },
  },

  orderMessage: {
    greeting: ORDER_GREETING,
    reply: 'Recebido! Já vamos separar seu pedido.',
    note: 'O atendimento continua com você, no WhatsApp de sempre.',
    customer: 'Cliente pelo site',
    channel: 'WhatsApp da loja · agora',
  },
};
