// Mensagem de contato (assunto e texto): a mesma regra no navegador (mensagem pronta para o
// WhatsApp ou o e-mail) e no servidor (/api/contato). Funções puras, sem DOM. Textos em data/ui.ts.
import { ui } from '@data/ui';

export type ContactVariant = 'general' | 'store';

export interface ContactData {
  name: string;
  /** Vazio quando o visitante não quis informar (a conversa continua no WhatsApp dele). */
  reply: string;
  /** "O que você precisa?": os serviços marcados (nomes curtos). */
  needs?: string[];
  /** Nome curto do serviço cuja demonstração o visitante testou antes de escrever. */
  demo?: string;
  business?: string;
  link?: string;
  message?: string;
}

export interface ComposedMessage {
  subject: string;
  body: string;
}

const copy = ui.contactMessage;

/** Assunto usado quando a página não define um. */
export const DEFAULT_TOPIC = copy.topic;

const oneLine = (value: string) => value.replace(/[\r\n]+/g, ' ');

export function composeContactMessage(variant: ContactVariant, topic: string, d: ContactData): ComposedMessage {
  const head = oneLine(topic) || DEFAULT_TOPIC;

  if (variant === 'store') {
    const body = [
      copy.storeGreeting,
      '',
      `${copy.link}: ${d.link ?? ''}`,
      d.message ? `\n${d.message}` : '',
      '',
      `${copy.name}: ${d.name}`,
      `${copy.reply}: ${d.reply}`,
    ]
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    return { subject: `${head} — ${d.name}`, body };
  }

  const body = [
    copy.generalGreeting,
    '',
    d.needs?.length ? `${copy.needs}: ${d.needs.join(', ')}` : '',
    d.demo ? `${copy.demo}: ${d.demo}` : '',
    d.message ?? '',
    '',
    `${copy.name}: ${d.name}`,
    d.business ? `${copy.business}: ${d.business}` : '',
    d.reply ? `${copy.reply}: ${d.reply}` : '',
  ]
    .filter((line, i, all) => !(line === '' && (all[i - 1] === '' || i === all.length - 1)))
    .join('\n')
    .trimEnd();
  return { subject: `${head} — ${d.business || d.name}`, body };
}

/** Link que abre a mensagem pronta: WhatsApp quando há número, senão o e-mail. */
export function composedMessageHref(message: ComposedMessage, whatsapp: string, email: string): string {
  return whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message.body)}`
    : `mailto:${email}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`;
}
