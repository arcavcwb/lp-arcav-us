// Formulário de contato no navegador: valida os campos obrigatórios (e os grupos de opções, como
// "O que você precisa?") e, sem envio direto,
// monta a mensagem e abre o WhatsApp (ou o e-mail). Com DIRECT_SEND, tenta /api/contato antes.
// A redação da mensagem é a mesma do servidor (lib/contact-message).
import {
  composeContactMessage,
  composedMessageHref,
  type ContactData,
  type ContactVariant,
} from '@lib/contact-message';
import { CONTACT_ENDPOINT, CONTACT_TIMEOUT_MS } from '@lib/contact';
import { EXTERNAL_LINK } from '@lib/links';
import { ui } from '@data/ui';

const copy = ui.contactForm;

/** Valores dos campos (`data-field`) e das opções marcadas no formato da mensagem. */
const toContactData = (d: Record<string, string>, needs: string[]): ContactData => ({
  name: d.name ?? '',
  reply: d.reply ?? '',
  needs,
  demo: d.demo,
  business: d.business,
  link: d.link,
  message: d.message,
});

export function initContactForms(): void {
  document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
    const variant: ContactVariant = form.dataset.variant === 'store' ? 'store' : 'general';
    const email = form.dataset.email!;
    const whatsapp = form.dataset.whatsapp || '';
    const subject = form.dataset.subject!;
    const direct = form.dataset.direct === 'true';
    const inputs = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-field]')];
    const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
    const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]')!;
    const sent = form.querySelector<HTMLElement>('[data-sent]')!;
    const composed = form.querySelector<HTMLElement>('[data-composed]')!;
    const status = form.querySelector<HTMLElement>('[data-composed-status]')!;
    const text = form.querySelector<HTMLElement>('[data-composed-text]')!;
    const openLink = form.querySelector<HTMLAnchorElement>('[data-composed-open]')!;
    const copyButton = form.querySelector<HTMLButtonElement>('[data-composed-copy]')!;
    const copyLabel = form.querySelector<HTMLElement>('[data-copy-label]')!;
    const defaultLabel = submitLabel.textContent;
    const groups = [...form.querySelectorAll<HTMLFieldSetElement>('[data-choices]')];
    const checkedIn = (group: HTMLElement) =>
      [...group.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')].map((box) => box.value);
    const setGroupError = (group: HTMLFieldSetElement, message: string) => {
      const slot = group.querySelector<HTMLElement>('[data-error-slot]');
      if (slot) slot.textContent = message;
      group.querySelectorAll('input').forEach((box) =>
        message ? box.setAttribute('aria-invalid', 'true') : box.removeAttribute('aria-invalid'),
      );
    };
    groups.forEach((group) =>
      group.addEventListener('change', () => {
        if (checkedIn(group).length) setGroupError(group, '');
      }),
    );

    const slotFor = (input: HTMLElement) => input.closest('.field')?.querySelector<HTMLElement>('[data-error-slot]');
    const setError = (input: HTMLInputElement | HTMLTextAreaElement, message: string) => {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      const slot = slotFor(input);
      if (slot) slot.textContent = message;
    };

    const required = inputs.filter((input) => input.required);
    required.forEach((input) =>
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') && input.value.trim()) setError(input, '');
      }),
    );

    const fallback = (d: Record<string, string>, needs: string[]) => {
      const message = composeContactMessage(variant, subject, toContactData(d, needs));
      const href = composedMessageHref(message, whatsapp, email);
      text.textContent = message.body;
      openLink.href = href;
      if (whatsapp) {
        Object.assign(openLink, EXTERNAL_LINK);
      }
      status.textContent = whatsapp ? copy.composed.readyWhatsapp : copy.composed.readyEmail(email);
      composed.hidden = false;
      copyLabel.textContent = copy.composed.copy;
      composed.focus({ preventScroll: true });
      composed.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      // Mesma aba: depois de um fetch, window.open costuma ser bloqueado no celular.
      window.location.href = href;
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      let firstInvalid: HTMLElement | null = null;
      for (const input of required) {
        const empty = input.value.trim() === '';
        setError(input, empty ? input.dataset.errorMessage ?? copy.required : '');
        if (empty && !firstInvalid) firstInvalid = input;
      }
      for (const group of groups.filter((g) => g.dataset.required === 'true')) {
        const empty = checkedIn(group).length === 0;
        setGroupError(group, empty ? group.dataset.errorMessage ?? copy.required : '');
        if (empty && !firstInvalid) firstInvalid = group.querySelector('input');
      }
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const d: Record<string, string> = { variant, topic: subject };
      inputs.forEach((input) => (d[input.dataset.field!] = input.value.trim()));
      // Demonstração testada antes de abrir o formulário ("Quero isso no meu negócio", demo-stage.ts).
      if (form.dataset.demo) d.demo = form.dataset.demo;
      const needs = groups.flatMap(checkedIn);

      if (!direct) {
        if (d.website) return; // armadilha anti-spam preenchida
        fallback(d, needs);
        return;
      }

      submit.disabled = true;
      submitLabel.textContent = copy.submit.sending;
      composed.hidden = true;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), CONTACT_TIMEOUT_MS);
        const response = await fetch(CONTACT_ENDPOINT, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...d, needs }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!response.ok) throw new Error(String(response.status));
        form.querySelectorAll<HTMLElement>('.field, .contact-form__submit').forEach((el) => (el.hidden = true));
        sent.hidden = false;
        sent.focus({ preventScroll: true });
      } catch {
        fallback(d, needs);
      } finally {
        submit.disabled = false;
        submitLabel.textContent = defaultLabel;
      }
    });

    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text.textContent ?? '');
        copyLabel.textContent = copy.composed.copied;
      } catch {
        copyLabel.textContent = copy.composed.copyFallback;
      }
    });
  });
}
