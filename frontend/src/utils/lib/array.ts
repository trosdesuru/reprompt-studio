/**
 * Implementa el algoritmo de Fisher-Yates para mezclar un array de forma aleatoria, pura y eficiente.
 * @param array El array original (no será mutado).
 * @returns Un nuevo array con los elementos mezclados.
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
