import { useCallback } from "react";
import { useStudioUI } from "@/src/store/useStudioUI";
import { fetchSeguro } from "@/src/services/api/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function useDirectoryActions() {
  const { directories, setDirectories, activeDirectoryId, setActiveDirectory } = useStudioUI();

  const createDirectory = useCallback(
    async (name: string, parentId: string | null) => {
      try {
        const payload: Record<string, string> = { name };
        if (parentId) {
          payload.parent_id = parentId;
        }

        const res = await fetchSeguro(`${API_URL}/directories/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        if (res.ok) {
          const newDir = await res.json();
          setDirectories([...directories, newDir]);
        } else {
          throw new Error("Fallo al crear el directorio");
        }
      } catch (error) {
        console.error("[DirectoryActions] Error creando:", error);
      }
    },
    [directories, setDirectories],
  );

  // En src/features/studio/hooks/useDirectoryActions.ts

  const deleteDirectory = useCallback(
    async (id: string) => {
      try {
        const res = await fetchSeguro(`${API_URL}/directories/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (res.ok) {
          setDirectories(directories.filter((d) => d.id !== id));
          if (activeDirectoryId === id) setActiveDirectory(null);
        } else {
          // 🟢 FRONTEND INTELIGENTE: Leemos el error del backend
          const errorData = await res.json();

          if (res.status === 409 && errorData.detail === "DIRECTORY_NOT_EMPTY") {
            alert(
              "⚠️ Esta carpeta contiene subcarpetas o prompts.\n\nPor seguridad, debes vaciarla o mover sus elementos antes de eliminarla.",
            );
            return;
          }

          throw new Error(errorData.detail || "Fallo al borrar el directorio");
        }
      } catch (error: any) {
        console.error("[DirectoryActions] Error borrando:", error.message);
      }
    },
    [directories, setDirectories, activeDirectoryId, setActiveDirectory],
  );

  const renameDirectory = useCallback(
    async (id: string, newName: string) => {
      try {
        const res = await fetchSeguro(`${API_URL}/directories/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        });

        if (!res.ok) throw new Error("No se pudo renombrar");

        setDirectories(directories.map((dir) => (dir.id === id ? { ...dir, name: newName } : dir)));
      } catch (error) {
        console.error("[DirectoryActions] Error renombrando:", error);
        throw error;
      }
    },
    [directories, setDirectories],
  );

  const moveDirectory = useCallback(
    async (directoryId: string, newParentId: string | null) => {
      const previousDirectories = [...directories];
      setDirectories(
        directories.map((d) => (d.id === directoryId ? { ...d, parent_id: newParentId } : d)),
      );

      try {
        const res = await fetchSeguro(`${API_URL}/directories/${directoryId}/move`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parent_id: newParentId }),
          credentials: "include",
        });

        if (!res.ok) throw new Error("Fallo al mover en el servidor");
      } catch (error) {
        console.error("[DirectoryActions] Error moviendo, haciendo rollback:", error);

        setDirectories(previousDirectories);
      }
    },
    [directories, setDirectories],
  );

  return {
    createDirectory,
    deleteDirectory,
    renameDirectory,
    moveDirectory,
  };
}
