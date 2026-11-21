// src/data/proposals/types.ts — Contrato de contenido de una propuesta personalizada.
// Un nuevo prospecto = un archivo de datos nuevo + una ruta que use ProposalPage.

/** Produto da loja de exemplo no celular interativo (PhoneDemo). */
export interface DemoProduct {
  name: string;
  detail: string;
  qty?: number;
}

export interface IllustrativeOrder {
  /** Rótulo técnico de la tarjeta, al estilo del diagrama del hero de ARCAV. */
  label: string;
  items: Array<{ qty: number; name: string }>;
  action: string;
  caption: string;
}

export interface ProposalPlan {
  name: string;
  priceBRL: number;
  frequency: 'once' | 'month';
  priceNote: string;
  inclusions: string[];
  condition?: string;
  /** Marca el plan sugerido para empezar (no es urgencia ni descuento). */
  suggested?: boolean;
}

export interface ProspectProposal {
  slug: string;
  companyName: string;
  currentSiteUrl: string;
  demoUrl: string;
  /** Siempre true: la propuesta no se indexa. noindex no la hace privada. */
  robotsNoIndex: true;
  meta: { title: string; description: string };
  header: { tag: string };
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    cta: string;
    microproof: string;
  };
  service: {
    label: string;
    title: string;
    text: string;
    cards: Array<{ title: string; text: string }>;
  };
  diagnosis: {
    label: string;
    title: string;
    text: string;
    currentLabel: string;
    opportunityLabel: string;
    items: Array<{ current: string; opportunity: string }>;
    note: string;
  };
  demo: {
    label: string;
    title: string;
    text: string;
    cta: string;
    newTabHint: string;
    caption: string;
    illustration: IllustrativeOrder;
  };
  offers: {
    label: string;
    title: string;
    text: string;
    steps: string[];
    note: string;
  };
  /** Opcional: si se omite, la sección de inversión no se muestra. */
  pricing?: {
    label: string;
    title: string;
    plans: ProposalPlan[];
    notes: string[];
    /** Uma única recomendação de início (os planos marcados como suggested). */
    recommendation: { title: string; text: string };
  };
  closing: {
    label: string;
    title: string;
    text: string;
    cta: string;
    /** O que acontece depois do clique, dito com clareza. */
    nextStep?: string;
    /** Redução de risco perto do botão (ex.: condição de pagamento). */
    reassurance?: string;
    emailHint: string;
    contactSubject: string;
    contactMessage: string;
  };
  footer: {
    disclaimer: string;
    arcavLink: string;
  };
}
