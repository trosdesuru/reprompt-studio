import type { Metadata } from "next";
import { Space_Mono, Prompt } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/components/AuthProvider";
import { Navbar } from "@/src/components/layout/Navbar";

// const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const prompt = Prompt({ weight: ["400", "700", "900"], subsets: ["latin"], variable: "--font-prompt" });
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "EH Explorer",
  description: "Plataforma de extracción y visor de alto rendimiento",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${prompt.variable} ${spaceMono.variable}`}>
      <body className="antialiased selection:bg-(--accent-color) selection:text-white">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
