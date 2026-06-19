// src/i18n/translations.ts — Contenido multilingüe de la página "Próximamente".

export type Lang = "es" | "en" | "pt";

// ─── Datos de marca (iguales en todos los idiomas) ───────────────────────────
export const BRAND = {
  name: "ARCAV",
  suffix: "", // p. ej. ".us" si quieres añadir el dominio como acento
  email: "hola@arcav.us", // ← cambia por tu correo real
  social: [
    {
      name: "LinkedIn",
      href: "#", // ← pon tu URL
      path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
    },
    {
      name: "X",
      href: "#", // ← pon tu URL
      path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    },
    {
      name: "GitHub",
      href: "#", // ← pon tu URL
      path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
    },
  ],
};

// ─── Idiomas disponibles y sus rutas ─────────────────────────────────────────
export const LANGS: { code: Lang; label: string; path: string }[] = [
  { code: "es", label: "ES", path: "/es" },
  { code: "en", label: "EN", path: "/en" },
  { code: "pt", label: "PT", path: "/pt" },
];

// ─── Textos por idioma ───────────────────────────────────────────────────────
type Copy = {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  tagline: string;
  launch: string;
  copyright: string;
};

export const translations: Record<Lang, Copy> = {
  es: {
    metaTitle: "ARCAV — Próximamente",
    metaDescription:
      "ARCAV está por llegar. Soluciones web y digitales a medida, construidas con tecnología de punta.",
    badge: "Próximamente",
    tagline:
      "Estamos construyendo algo grande. Soluciones digitales a medida, muy pronto.",
    launch: "Lanzamiento 2026",
    copyright: "© 2026 arcav. Todos los derechos reservados.",
  },
  en: {
    metaTitle: "ARCAV — Coming soon",
    metaDescription:
      "ARCAV is on its way. Tailor-made web and digital solutions, built with cutting-edge technology.",
    badge: "Coming soon",
    tagline:
      "We're building something big. Tailor-made digital solutions, very soon.",
    launch: "Launching 2026",
    copyright: "© 2026 arcav. All rights reserved.",
  },
  pt: {
    metaTitle: "ARCAV — Em breve",
    metaDescription:
      "ARCAV está chegando. Soluções web e digitais sob medida, construídas com tecnologia de ponta.",
    badge: "Em breve",
    tagline:
      "Estamos construindo algo grande. Soluções digitais sob medida, muito em breve.",
    launch: "Lançamento 2026",
    copyright: "© 2026 arcav. Todos os direitos reservados.",
  },
};
