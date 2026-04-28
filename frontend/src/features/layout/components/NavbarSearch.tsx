"use client";

import React, { useState, useRef } from "react";
import { useSearch } from "@/src/features/search/hooks/useSearch";
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
  const { query, setQuery, handleSearch, isLoading } = useSearch();

  const modalContentRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalContentRef, () => {
    if (isModalOpen) handleCloseAndClear();
  });

  useKeyboardShortcut("/", () => {
    setIsModalOpen(true);
  });

  const handleCloseAndClear = () => {
    setQuery("");
    setIsModalOpen(false);
  };

  const onExecuteSearch = () => {
    if (!query.trim()) return;

    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(syntheticEvent);
    handleCloseAndClear();
  };

  return (
    <>
      <SearchTrigger onOpen={() => setIsModalOpen(true)} />

      <Modal isOpen={isModalOpen} onClose={handleCloseAndClear} maxWidth="max-w-2xl">
        <div ref={modalContentRef} className="flex flex-col w-full bg-surface tracking-tight">
          <div className="p-5 flex flex-col gap-4">
            <SearchModalHeader />

            <UniversalSearchBar
              query={query}
              isLoading={isLoading}
              placeholder="Busca conceptos, estilos ...."
              onQueryChange={setQuery}
              onSubmit={onExecuteSearch}
              onClear={() => setQuery("")}
              enableKeyboardShortcut={true}
            />

            <SemanticSearchHeader />
          </div>
        </div>
      </Modal>
    </>
  );
}
