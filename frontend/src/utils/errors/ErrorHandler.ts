import { AppError, AuthError, ExtractionError, NetworkError } from "./AppErrors";

export const handleError = (error: unknown, context?: string): string => {
  if (error instanceof AuthError) {
    const isLoginRoute = typeof window !== "undefined" && window.location.pathname === "/login";
    if (!isLoginRoute) {
      console.warn("🔐 Acceso denegado. Redirigiendo al login...");
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return error.message;
  }

  if (error instanceof ExtractionError) {
    console.warn(`🧩 [Extractor] ${error.code}: ${error.message}`);
    return error.message;
  }

  if (error instanceof NetworkError) {
    console.error(`📡 [Red] HTTP ${error.statusCode || "Unknown"}: ${error.message}`);
    return error.message; // 🟢 Devolvemos el mensaje real que manda FastAPI
  }

  if (error instanceof AppError) {
    console.warn(`🚧 [${context || "App"}] ${error.code}: ${error.message}`);
    return error.message;
  }

  if (error instanceof Error) {
    console.error(`💥 [Error Crítico] ${context || "Sistema"}:`, error);
    return error.message;
  }

  console.error("👽 [Error Alienígena]:", error);
  return "Ha ocurrido un error inesperado en el sistema.";
};
