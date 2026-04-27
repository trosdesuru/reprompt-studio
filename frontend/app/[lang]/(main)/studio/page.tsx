import { IconAlbum } from "@tabler/icons-react";
import { PageHeader } from "@/src/system/organisms/Navigation/PageHeader";
import { StudioSidebar } from "@/src/features/studio/components/StudioSidebar";
import { StudioDndWrapper } from "@/src/system/molecules/Studio/StudioDndWrapper";
import { StudioWorkspace } from "@/src/system/templates/Studio/StudioWorkspace";

export default function StudioPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Mi Studio"
        description="Gestiona y organiza tus prompts."
        icon={<IconAlbum size={28} stroke={1.5} className="text-foreground"/>}
        breadcrumbItems={[{ label: "Mi Studio" }]}
        scrollContainerId="studio-main"
        collapseOnHide={true}
      />

      <StudioDndWrapper>
        <div className="flex flex-1 overflow-hidden border border-border/30 rounded-xl bg-card/20 backdrop-blur-sm transition-all duration-500">
          <StudioSidebar />

          <main
            id="studio-main"
            className="flex-1 overflow-y-auto custom-scrollbar bg-background/30 p-4 md:p-6 scroll-smooth"
          >
            <StudioWorkspace />
          </main>
        </div>
      </StudioDndWrapper>
    </div>
  );
}
