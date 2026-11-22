// src/lib/brand-assets.ts — Arquivos de marca opcionais em src/assets/brand/.
// Quando o arquivo existe, o build o usa; quando não, os componentes mostram o fallback.

const logos = import.meta.glob<string>('../assets/brand/arcav-logo.{svg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const logoUrl: string | null = Object.values(logos)[0] ?? null;

/** Altura do logo em pixels (atributo da imagem, igual ao utilitário h-7 do componente Brand). */
export const LOGO_HEIGHT = 28;
