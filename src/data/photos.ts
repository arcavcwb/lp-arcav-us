// src/data/photos.ts — Fotos reais do site (lista e tratamento em docs/auditorias/AUDITORIA-VISUAL-HOME.md, seção 4).
// Cada foto tem um lugar. Coloque o arquivo em src/assets/fotos/<file>.(jpg|jpeg|png|webp|avif)
// e ele aparece no próximo build. Sem o arquivo, o lugar mostra um marcador com a descrição da foto.
// Nada de banco de imagens nem imagem gerada por IA.
import { BRAND } from './site';

export interface PhotoSpec {
  /** Nome do arquivo em src/assets/fotos/, sem extensão. */
  file: string;
  alt: string;
  /** Proporção natural: portrait 4:5, landscape 3:2 (tokens --aspect-*). */
  aspect: 'portrait' | 'landscape';
  /** O que a foto mostra. Aparece no marcador enquanto ela não chega. */
  brief: string;
  /** Tamanho mínimo, em pixels. */
  min: { width: number; height: number };
}

export const PHOTOS = {
  /** Hero da home. */
  work: {
    file: 'retrato-trabalho',
    alt: `${BRAND.author} no trabalho`,
    aspect: 'portrait',
    brief: `Retrato de trabalho: ${BRAND.author} na mesa ou num café de ${BRAND.city}, luz natural, olhando para fora da câmera.`,
    min: { width: 1600, height: 2000 },
  },
  /** "Sobre" e o avatar de quem responde. */
  portrait: {
    file: 'retrato',
    alt: BRAND.author,
    aspect: 'portrait',
    brief: 'Retrato próximo: olhando para a câmera, fundo neutro ou um interior real.',
    min: { width: 1200, height: 1500 },
  },
  /** Método (opcional; ainda sem lugar na página). */
  process: {
    file: 'processo',
    alt: 'Mapa de um processo desenhado num caderno, ao lado do teclado',
    aspect: 'landscape',
    brief: 'Processo: mãos no teclado, um caderno com o mapa de um processo ou um quadro.',
    min: { width: 1800, height: 1200 },
  },
  /** Sobre (opcional; ainda sem lugar na página). */
  context: {
    file: 'curitiba',
    alt: `Uma rua de ${BRAND.city}`,
    aspect: 'landscape',
    brief: `Contexto: ${BRAND.city} sem cartão-postal, uma rua ou uma janela.`,
    min: { width: 1800, height: 1200 },
  },
} satisfies Record<string, PhotoSpec>;

export type PhotoId = keyof typeof PHOTOS;

/** Ratio legível para o marcador. */
export const ASPECT_LABEL: Record<PhotoSpec['aspect'], string> = { portrait: '4:5', landscape: '3:2' };

/**
 * Mostra os marcadores das fotos que ainda não chegaram. Com false, o lugar de uma foto que falta
 * some (o layout volta ao de antes). Desligar antes de publicar se alguma foto ainda faltar.
 */
export const SHOW_PHOTO_PLACEHOLDERS = true;
