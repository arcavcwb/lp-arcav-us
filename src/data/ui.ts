// src/data/ui.ts — Textos de interface: rótulos, botões, avisos e textos de acessibilidade que os
// componentes e os scripts usam. O conteúdo de cada página fica em site.ts, solutions.ts,
// commerce-service.ts. Componentes e scripts não escrevem texto solto: leem daqui.
import { BRAND, home } from './site';
import { firstName } from '@lib/text';

export interface FormField {
  id: 'name' | 'business' | 'link' | 'reply' | 'message' | 'needs';
  label: string;
  /** choices: caixas de seleção (as opções vêm do componente; ex.: os cinco serviços). */
  type: 'text' | 'textarea' | 'choices';
  required: boolean;
  /** O rótulo já diz que o campo é opcional: não acrescenta "(opcional)". */
  bare?: boolean;
  autocomplete?: string;
  inputmode?: 'url' | 'email';
  rows?: number;
  placeholder?: string;
  hint?: string;
  error?: string;
}

/** Saudação do pedido, igual no celular de exemplo e na ilustração do WhatsApp. */
const ORDER_GREETING = 'Olá! Quero fazer um pedido:';
const WHATSAPP = 'WhatsApp';
const SEND_WHATSAPP = `Enviar pelo ${WHATSAPP}`;
const REPLY_LABEL = 'E-mail ou WhatsApp para a resposta';

export const ui = {
  a11y: {
    skipLink: 'Pular para o conteúdo',
    newTab: '(abre em nova aba)',
    homeLink: `${BRAND.name}, página inicial`,
  },

  /** Rótulos de dados que se repetem (rodapé). */
  labels: {
    whatsapp: WHATSAPP,
  },

  whatsapp: (display: string) => `${WHATSAPP} ${display}`,
  responseTime: (time: string) => `Resposta ${time}.`,

  brand: {
    byline: `por ${BRAND.author}`,
  },

  /** Ação que abre o WhatsApp da ARCAV com a mensagem pronta: o mesmo rótulo em todos os lugares da home. */
  whatsappCta: `Chamar no ${WHATSAPP}`,

  header: {
    nav: 'Principal',
    cta: 'Fale comigo',
    /** Rótulo do botão do menu no celular; o navegador anuncia se está aberto ou fechado. */
    menu: 'Menu',
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

  /** Janela com o formulário de contato. */
  contactDialog: {
    open: 'Escrever minha mensagem',
    /** Botão secundário do fechamento quando o WhatsApp é a ação principal. */
    alt: 'Prefiro escrever aqui',
    title: 'Conte o que você precisa',
    close: 'Fechar',
  },

  closingContact: {
    responder: `Quem responde é o ${BRAND.author}`,
    place: `Aqui de ${BRAND.city}.`,
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
      text: 'Vou responder pelo contato que você informou.',
    },
    composed: {
      readyWhatsapp: 'Mensagem pronta. O WhatsApp está abrindo com ela escrita; é só enviar.',
      readyEmail: (email: string) =>
        `Mensagem pronta. Abri seu aplicativo de e-mail para ${email}. Se ele não abriu, copie a mensagem abaixo.`,
      reopen: 'Abrir de novo',
      copy: 'Copiar mensagem',
      copied: 'Copiada',
      copyFallback: 'Selecione e copie o texto',
    },
    note: {
      whatsappOpens: 'O WhatsApp abre com a sua mensagem pronta; é só tocar em enviar.',
      privacy: 'Uso seus dados só para responder.',
      emailLead: 'Se preferir, escreva para',
      emailDirectLead: 'Se preferir, escreva direto para',
      whatsappLead: 'Se preferir, chame no WhatsApp',
      emailOr: 'ou escreva para',
    },
    /** Comércios: conversa sobre um site de pedidos. */
    store: [
      { id: 'name', label: 'Seu nome', type: 'text', autocomplete: 'name', required: true, error: 'Escreva seu nome para eu saber com quem estou falando.' },
      { id: 'link', label: 'Link do seu site, Instagram ou catálogo', type: 'text', autocomplete: 'url', inputmode: 'url', required: true, placeholder: 'Ex.: instagram.com/sualoja', error: 'Cole o link para eu poder ver os seus produtos.' },
      { id: 'reply', label: REPLY_LABEL, type: 'text', autocomplete: 'email', inputmode: 'email', required: true, error: 'Informe um e-mail ou WhatsApp para eu poder responder.' },
      { id: 'message', label: 'Algo mais que eu deva saber?', type: 'textarea', rows: 3, required: false, placeholder: 'Ex.: vendo gás e água e recebo pedidos pelo WhatsApp.' },
    ] satisfies FormField[],
    /**
     * Home e soluções. A conversa continua no WhatsApp do visitante, então o e-mail é opcional.
     * A pergunta da mensagem pode ser trocada por página. As opções de "O que você precisa?" são os
     * nomes curtos dos cinco serviços e `unsure` (ContactForm.astro).
     */
    general: [
      { id: 'name', label: 'Seu nome', type: 'text', autocomplete: 'name', required: true, error: 'Escreva seu nome para eu saber com quem estou falando.' },
      { id: 'needs', label: 'O que você precisa?', type: 'choices', required: true, error: 'Marque pelo menos uma opção.' },
      { id: 'message', label: 'Quer contar mais?', type: 'textarea', rows: 4, required: false, placeholder: 'Ex.: recebo pedidos pelo WhatsApp e anoto tudo no caderno.' },
      { id: 'reply', label: 'E-mail (só se preferir a resposta por e-mail)', type: 'text', autocomplete: 'email', inputmode: 'email', required: false, bare: true },
    ] satisfies FormField[],
    /**
     * Com DIRECT_SEND (envio pelo próprio site), o WhatsApp do visitante não entra na conversa: o campo
     * do e-mail volta a ser o contato obrigatório para a resposta.
     */
    replyDirect: { id: 'reply', label: REPLY_LABEL, type: 'text', autocomplete: 'email', inputmode: 'email', required: true, hint: 'Respondo por onde for mais prático para você.', error: 'Informe um e-mail ou WhatsApp para eu poder responder.' } satisfies FormField,
    /** Última opção de "O que você precisa?". */
    unsure: 'Ainda não sei',
  },

  /** Mensagem que o formulário monta (navegador e /api/contato). */
  contactMessage: {
    topic: home.contact.subject,
    storeGreeting: 'Olá! Quero conversar sobre um site de pedidos para a minha loja.',
    generalGreeting: `Olá, ${firstName(BRAND.author)}!`,
    link: 'Site, Instagram ou catálogo',
    name: 'Nome',
    business: 'Negócio',
    needs: 'Preciso de',
    demo: 'Testei a demonstração de',
    reply: 'Resposta por',
  },

  /** Seção "Experimente": seletor e painéis das demonstrações (DemoStage.astro). */
  demoStage: {
    tabs: 'Escolha uma solução para testar',
    client: 'O seu cliente',
    owner: 'Você recebe',
    restart: 'Recomeçar',
    want: 'Quero isso no meu negócio',
    /** Mensagem do WhatsApp de "Quero isso no meu negócio": diz qual demonstração a pessoa testou. */
    wantMessage: (demo: string) => `Olá, ${firstName(BRAND.author)}! Testei a demonstração "${demo}" no site da ARCAV e quero isso no meu negócio.`,
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
    reply: 'Recebido! Já vou separar seu pedido.',
    note: 'O atendimento continua com você, no WhatsApp de sempre.',
    customer: 'Cliente pelo site',
    channel: 'WhatsApp da loja · agora',
  },
};
