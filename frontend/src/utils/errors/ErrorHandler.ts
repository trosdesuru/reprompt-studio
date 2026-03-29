import { AuthError } from "./AppErrors";

export const handleError = (error: unknown) => {
  if (error instanceof AuthError) {
    if (window.location.pathname !== "/login") {
      console.warn("🔐 Redirigiendo: Sesión no válida.");
      window.location.href = "/login";
    }
    return;
  }

  console.error("Error del Sistema:", error);
};
