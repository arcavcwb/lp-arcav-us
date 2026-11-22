// Fotos em src/assets/fotos/: encontra o arquivo de cada lugar de data/photos.ts.
import type { ImageMetadata } from 'astro';
import { PHOTOS, SHOW_PHOTO_PLACEHOLDERS, type PhotoId } from '@data/photos';

const files = import.meta.glob<ImageMetadata>('../assets/fotos/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});

const baseName = (path: string) => path.split('/').pop()!.replace(/\.[^.]+$/, '');

/** A foto do lugar, ou null enquanto o arquivo não existe. */
export function photoFor(id: PhotoId): ImageMetadata | null {
  const entry = Object.entries(files).find(([path]) => baseName(path) === PHOTOS[id].file);
  return entry?.[1] ?? null;
}

/** O lugar aparece na página: com a foto ou, enquanto ela não chega, com o marcador. */
export const photoShown = (id: PhotoId): boolean => Boolean(photoFor(id)) || SHOW_PHOTO_PLACEHOLDERS;
