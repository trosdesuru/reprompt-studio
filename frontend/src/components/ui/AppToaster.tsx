"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        // 🟢 Estilos base (Civitai-like: limpios, oscuros, con un toque neo-brutalista)
        className: "neo-border shadow-2xl font-mono text-sm tracking-wide",
        style: {
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          borderRadius: "4px", // Bordes menos agresivos
          padding: "16px",
          borderWidth: "2px",
        },
        // 🟢 Variantes Semánticas
        success: {
          style: {
            borderLeft: "6px solid #22c55e",
            borderColor: "var(--border-color)",
          },
          iconTheme: { primary: "#22c55e", secondary: "#fff" },
        },
        error: {
          style: {
            borderLeft: "6px solid #ef4444",
            background: "#450a0a", // Fondo rojizo muy oscuro
            color: "#fecaca",
            borderColor: "#7f1d1d",
          },
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
        // Customizamos nuestro propio warning/info
        custom: {
          style: {
            borderLeft: "6px solid #eab308",
            borderColor: "var(--border-color)",
          },
        },
      }}
    />
  );
}
