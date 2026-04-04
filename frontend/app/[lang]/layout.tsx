import type { Metadata } from "next";
import { Prompt, JetBrains_Mono } from "next/font/google";
import "../globals.css";

import { AuthProvider } from "@/src/features/auth/AuthProvider";
import { ThemeProvider } from "@/src/dictionaries/ThemeProvider";
import { AppToaster } from "@/src/system/organisms/Layout/AppToaster";
import { GlobalProgress } from "@/src/system/organisms/Layout/GlobalProgress";
import { cn } from "@/lib/utils";

import { getDictionary, Locale } from "@/src/dictionaries/getDictionary";
import { I18nProvider } from "@/src/dictionaries/I18nProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

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
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html
      lang={lang}
      className={cn(prompt.variable, "font-mono", jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased selection:bg-(--accent-color) selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleOAuthProvider clientId={googleClientId}>
            <I18nProvider dictionary={dictionary}>
              <AuthProvider>
                <GlobalProgress />
                {children}
                <AppToaster />
              </AuthProvider>
            </I18nProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
