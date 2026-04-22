// app/[lang]/(main)/[username]/settings/layout.tsx
import { SettingsSidebar } from "@/src/features/settings/components/SettingsSidebar";

export default function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string; username: string };
}) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col md:flex-row gap-10">
        <aside className="w-full md:w-64 shrink-0">
          <SettingsSidebar username={params.username} lang={params.lang} />
        </aside>

        <main className="flex-1 min-w-0 bg-(--bg-secondary) neo-border p-8 min-h-125">
          {children}
        </main>
      </div>
    </div>
  );
}
