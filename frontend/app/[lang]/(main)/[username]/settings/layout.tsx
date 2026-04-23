import { SettingsSidebar } from "@/src/features/settings/components/SettingsSidebar";
import { SettingsProfileHeader } from "@/src/features/settings/components/SettingsProfileHeader";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col pl-8 pt-8 min-h-[calc(100vh-4rem)] bg-background animate-fade-in">
      <SettingsProfileHeader />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-muted/5 hidden md:flex flex-col shrink-0">
          <SettingsSidebar />
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12">
          <div className="flex flex-col max-w-4xl mx-auto w-full">
            <div className="max-w-2xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
