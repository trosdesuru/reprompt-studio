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
      <div className="flex flex-col md:flex-row gap-8">
        <aside>
          <SettingsSidebar username={params.username} lang={params.lang} />
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-(--bg-secondary) neo-border p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
