import type { Metadata } from "next";
import { Prompt, JetBrains_Mono } from "next/font/google";
import "../globals.css"
import { AuthProvider } from "@/src/features/auth/AuthProvider";
import { Navbar } from "@/src/system/organisms/Layout/Navbar/Navbar";
import { AppToaster } from "@/src/system/organisms/Layout/AppToaster";
import { GlobalProgress } from "@/src/system/organisms/Layout/GlobalProgress";
import { cn } from "@/lib/utils";

import { getDictionary, Locale } from "@/src/dictionaries/getDictionary";
import { I18nProvider } from "@/src/dictionaries/I18nProvider";

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

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const dictionary = await getDictionary(params.lang as Locale);

  return (
    <html lang={params.lang} className={cn(prompt.variable, "font-mono", jetbrainsMono.variable)}>
      <body className="antialiased selection:bg-(--accent-color) selection:text-white">
        <I18nProvider dictionary={dictionary}>
          <AuthProvider>
            <GlobalProgress />
            <Navbar />
            {children}
            <AppToaster />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
