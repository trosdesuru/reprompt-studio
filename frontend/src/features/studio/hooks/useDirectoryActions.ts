import { useStudioUI } from "@/src/store/useStudioUI";
import toast from "react-hot-toast";

export function useDirectoryActions(directoryId: string | number, directoryName: string) {
  const { setActiveDirectory, deleteDirectory, createDirectory, renameDirectory } = useStudioUI();

  const safeId = String(directoryId);

  const handleCreateSubdirectory = async (onSuccess: () => void) => {
    const name = window.prompt("Nombre de la nueva subcarpeta:");
    if (!name || name.trim() === "") return;
    try {
      await createDirectory(name.trim(), safeId);
      toast.success("Subcarpeta creada");
      onSuccess();
    } catch (error: any) {
      toast.error("Error al crear subcarpeta");
    }
  };

  const handleDeleteDirectory = async (isSelected: boolean) => {
    const confirm = window.confirm(`¿Eliminar "${directoryName}" y todo su contenido?`);
    if (!confirm) return;
    try {
      await deleteDirectory(safeId);
      toast.success("Carpeta eliminada");
      if (isSelected) setActiveDirectory(null);
    } catch (error: any) {
      toast.error("Error al eliminar");
    }
  };

  const handleRenameDirectory = async () => {
    const newName = window.prompt("Renombrar carpeta:", directoryName);
    if (!newName || newName.trim() === "" || newName.trim() === directoryName) return;
    try {
      await renameDirectory(safeId, newName.trim());
      toast.success("Carpeta renombrada");
    } catch (error: any) {
      toast.error("Error al renombrar");
    }
  };

  return {
    setActiveDirectory,
    handleCreateSubdirectory,
    handleDeleteDirectory,
    handleRenameDirectory,
  };
}
