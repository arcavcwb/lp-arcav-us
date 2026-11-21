// src/lib/brand-assets.ts — Arquivos de marca opcionais em src/assets/brand/.
// Quando o arquivo existe, o build o usa; quando não, os componentes mostram o fallback.

const logos = import.meta.glob<string>('../assets/brand/arcav-logo.{svg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const portraits = import.meta.glob<string>('../assets/brand/armando.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const logoUrl: string | null = Object.values(logos)[0] ?? null;
export const portraitUrl: string | null = Object.values(portraits)[0] ?? null;
