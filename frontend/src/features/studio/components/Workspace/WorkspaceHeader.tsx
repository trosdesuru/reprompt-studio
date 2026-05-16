"use client";

import { useParams } from "next/navigation";
import { useStudioUI } from "@/src/store/useStudioUI";
import { useStudioPrompts } from "@/src/features/studio/hooks/useStudioPrompts";

import { WorkspaceBreadcrumbs } from "./WorkspaceBreadcrumbs";
import { WorkspaceDefaultControls } from "./WorkspaceDefaultControls";
import { WorkspaceBulkActions } from "./WorkspaceBulkActions";

export function WorkspaceHeader() {
  const { lang } = useParams();

  const {
    activeDirectoryId,
    setActiveDirectory,
    getBreadcrumbs,
    toggleSidebar,
    selectedPromptIds,
    clearSelection,
    directories,
    sortBy,
    setSortBy,
    loadedPromptIds,
    selectAll,
  } = useStudioUI();

  const { deleteBulkPrompts, moveBulkPrompts } = useStudioPrompts();

  const breadcrumbs = getBreadcrumbs();
  const hasSelection = selectedPromptIds.length > 0;

  return (
    <header className="relative flex items-center w-full mb-6 pb-4 border-b border-border/30 min-h-13 overflow-hidden">
      <div
        className={`absolute inset-0 flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
          hasSelection
            ? "opacity-0 -translate-y-4 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex items-center flex-1 overflow-hidden pr-4">
          <WorkspaceBreadcrumbs
            activeDirectoryId={activeDirectoryId}
            breadcrumbs={breadcrumbs}
            onToggleSidebar={toggleSidebar}
            onSetActiveDirectory={setActiveDirectory}
          />
        </div>

        <WorkspaceDefaultControls
          lang={lang as string}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onSelectAll={() => selectAll(loadedPromptIds)}
        />
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
          hasSelection ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <WorkspaceBulkActions
          selectedCount={selectedPromptIds.length}
          directories={directories}
          onClearSelection={clearSelection}
          onMoveBulk={(targetDir) => moveBulkPrompts(selectedPromptIds, targetDir)}
          onDeleteBulk={() => deleteBulkPrompts(selectedPromptIds)}
        />
      </div>
    </header>
  );
}
