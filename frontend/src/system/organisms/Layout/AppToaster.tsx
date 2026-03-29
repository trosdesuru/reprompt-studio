"use client";
import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: "neo-border shadow-2xl font-mono text-sm",
        style: {
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          borderWidth: "2px",
        },
      }}
    />
  );
}
