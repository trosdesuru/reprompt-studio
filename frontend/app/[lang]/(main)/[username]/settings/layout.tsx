import { SettingsSidebar } from "@/src/features/settings/components/SettingsSidebar";
import { SettingsProfileHeader } from "@/src/features/settings/components/SettingsProfileHeader";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8 animate-fade-in">
      <div className="w-full max-w-7xl mx-auto flex flex-col flex-1">
        <SettingsProfileHeader />

        <div className="flex flex-1 overflow-hidden mt-4 md:mt-0">
          <aside className="w-64 md:w-72 bg-muted/5 hidden md:flex flex-col shrink-0 rounded-l-lg">
            <SettingsSidebar />
          </aside>

          <main className="flex-1 overflow-y-auto custom-scrollbar pl-4 md:pl-10 py-2">
            <div className="flex flex-col max-w-2xl w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
