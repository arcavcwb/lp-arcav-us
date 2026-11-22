// Funções de texto puras, usadas por componentes e dados.

/** Iniciais de um nome: "Armando Castro" → "AC". */
export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase())
    .join('');

/** Primeiro nome: "Armando Castro" → "Armando". */
export const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? name;

/** Frase entre as aspas curvas do português: quoted('Preciso de um site.') → “Preciso de um site.” */
export const quoted = (text: string): string => `“${text}”`;

/** Numeral de dois dígitos de uma posição (base 0): ordinal(0) → "01". */
export const ordinal = (index: number): string => String(index + 1).padStart(2, '0');
