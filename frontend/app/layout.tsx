// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/components/AuthProvider";
import { AppShell } from "@/src/components/layout/AppShell"; // 🟢 Importamos el Layout

// Optimizamos las fuentes para que el navegador no dé saltos al cargar
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "EH Explorer | Enterprise UX",
  description: "Plataforma de extracción y visor de alto rendimiento",
  themeColor: "#f4f4f0", // 🟢 Color para la barra superior de Android/iOS
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="antialiased selection:bg-(--accent-color) selection:text-white">
        <AuthProvider>
          {/* 🟢 Nuestro Cascarón UI */}
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
