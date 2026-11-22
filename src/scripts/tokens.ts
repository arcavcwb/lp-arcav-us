// Leitura dos tokens do tema (tokens.css) no navegador, para animações feitas em JavaScript
// (Web Animations não entende var(--…)). O valor continua morando só no CSS.

/** Valor de um token já aplicado na página: cssToken('--ease-out'). */
export const cssToken = (name: string): string => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Duração de um token em milissegundos: '260ms' → 260, '0.3s' → 300. */
export const cssDurationMs = (name: string): number => {
  const value = cssToken(name);
  return value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
};
