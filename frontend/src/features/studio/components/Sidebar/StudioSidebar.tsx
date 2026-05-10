"use client";

import { useStudioUI } from "@/src/store/useStudioUI";
import { useAuthStore } from "@/src/store/authStore";
import { useTranslation } from "@/src/dictionaries/I18nProvider";

import { SidebarContainer, SidebarDivider } from "@/src/system/organisms/Sidebar";
import { QuotaBar } from "@/src/features/admin/components/QuotaBar";

import { SidebarExploreSection } from "./SidebarExploreSection";
import { SidebarWorkspaceSection } from "./SidebarWorkspaceSection";

export function StudioSidebar() {
  const { t } = useTranslation();
  const { isSidebarOpen, setSidebarOpen } = useStudioUI();
  const { user } = useAuthStore();

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          transition-all duration-300 ease-in-out z-50 shrink-0 h-full
          bg-background border-r border-border/30 w-65
          absolute left-0 top-0
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"}
          md:bg-surface/80 md:border-none md:relative md:translate-x-0
          ${isSidebarOpen ? "md:w-65 md:opacity-100" : "md:w-0 md:opacity-0 md:overflow-hidden"}
        `}
      >
        <div className="w-65 h-full flex flex-col">
          <SidebarContainer>
            <SidebarExploreSection />

            <SidebarDivider />

            <SidebarWorkspaceSection />

            <div className="px-3 pt-6 pb-10 mt-auto border-t border-border/50 bg-background/50 backdrop-blur-sm z-10 sticky bottom-0">
              <QuotaBar
                label={t("studio.stored_prompts") || "Prompts Almacenados"}
                used={user?.prompts_count || 0}
                limit={user?.role === "artist" ? 5000 : 50}
              />
            </div>
          </SidebarContainer>
        </div>
      </aside>
    </>
  );
}
