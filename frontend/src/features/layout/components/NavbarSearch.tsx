"use client";

import { useState, useRef } from "react";
import { useVectorSearch } from "@/src/features/search/useVectorSearch";
import { useSearchStore } from "@/src/store/searchStore";
import { useKeyboardShortcut } from "@/src/utils/hooks/useKeyboardShortcut";
import { useClickOutside } from "@/src/utils/hooks/useClickOutside";

import { Modal } from "@/src/system/molecules/Modal/Modal";
import { UniversalSearchBar } from "@/src/system/molecules/Search/UniversalSearchBar";

import { SearchModalHeader } from "@/src/system/molecules/Navbar/SearchModaHeader";
import {
  SearchTrigger,
  SemanticSearchHeader,
} from "@/src/system/molecules/Navbar/SearchComponents";

export function NavbarSearch() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const globalSearchStore = useSearchStore();

  const vector = useVectorSearch({ scope: "global" });
  const modalContentRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalContentRef, () => {
    if (isModalOpen) handleCloseAndClear();
  });

  useKeyboardShortcut("/", () => {
    setIsModalOpen(true);
  });

  const handleCloseAndClear = () => {
    vector.clear();
    globalSearchStore.clearSearch();
    setIsModalOpen(false);
  };

  const onExecuteSearch = async () => {
    if (!vector.query.trim()) return;

    await vector.handleExecute();

    globalSearchStore.setResults(vector.results);
    globalSearchStore.setQuery(vector.query);
  };

  return (
    <>
      <SearchTrigger onOpen={() => setIsModalOpen(true)} />

      <Modal isOpen={isModalOpen} onClose={handleCloseAndClear} maxWidth="max-w-2xl">
        <div ref={modalContentRef} className="flex flex-col w-full bg-surface tracking-tight">
          <div className="p-5 flex flex-col gap-4">
            <SearchModalHeader />

            <UniversalSearchBar
              query={vector.query}
              isLoading={vector.isLoading}
              placeholder="Búsqueda semántica de conceptos, estilos..."
              onQueryChange={vector.setQuery}
              onSubmit={onExecuteSearch}
              onClear={vector.clear}
              enableKeyboardShortcut={true}
            />

            <SemanticSearchHeader />
          </div>
        </div>
      </Modal>
    </>
  );
}
