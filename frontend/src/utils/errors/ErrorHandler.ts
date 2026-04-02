import { AuthError, NetworkError } from "./AppErrors";

export const handleError = (err: unknown, context: string): string => {
  console.error(`[${context}] Error capturado:`, err);

  if (err instanceof AuthError) {
    console.warn("🔐 Acceso denegado o sesión caducada.");

    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;

      if (!currentPath.includes("/login") && !currentPath.includes("/join")) {
        console.warn("Redirigiendo al login...");

        const localeMatch = currentPath.match(/^\/([a-z]{2})\//);
        const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
        window.location.href = `${localePrefix}/login`;
      }
    }
    return "Sesión expirada. Por favor, inicia sesión de nuevo.";
  }

  if (err instanceof NetworkError) {
    return `Error de conexión (${err.statusCode}): ${err.message}`;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Error inesperado en el sistema.";
};
