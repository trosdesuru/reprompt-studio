import { SettingsSidebar } from "@/src/features/settings/components/SettingsSidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-10">
        <aside className="w-full md:w-64 shrink-0">
          <SettingsSidebar />
        </aside>
        <main className="flex-1 bg-(--bg-secondary) neo-border p-8 min-h-125">{children}</main>
      </div>
    </div>
  );
}
