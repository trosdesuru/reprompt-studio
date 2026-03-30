import type { Metadata } from "next";
import { Prompt, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/features/auth/AuthProvider";
import { Navbar } from "@/src/system/organisms/Layout/Navbar/Navbar";
import { AppToaster } from "@/src/system/organisms/Layout/AppToaster";
import { GlobalProgress } from "@/src/system/organisms/Layout/GlobalProgress";
import { cn } from "@/lib/utils";

const prompt = Prompt({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-prompt",
});

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "reprompt",
  description: "Wallet para guardar tus imágenes y prompts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn(prompt.variable, "font-mono", jetbrainsMono.variable)}>
      <body className="antialiased selection:bg-(--accent-color) selection:text-white">
        <AuthProvider>
          <GlobalProgress />
          <Navbar />
          {children}
          <AppToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
