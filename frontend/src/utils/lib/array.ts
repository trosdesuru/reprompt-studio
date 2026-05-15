/**
 * Mezcla los elementos de un array de forma segura.
 * @returns Un nuevo array con los elementos mezclados.
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);

    globalThis.crypto.getRandomValues(randomBuffer);

    const float = randomBuffer[0] / (0xffffffff + 1);

    const j = Math.floor(float * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};
