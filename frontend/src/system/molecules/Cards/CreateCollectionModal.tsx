"use client";

import { useState } from "react";
import { api } from "@/src/services/api";
import toast from "react-hot-toast";
import { IconX, IconLock, IconWorld } from "@tabler/icons-react";
import { useAuthStore } from "@/src/store/authStore";
import { UpgradeModal } from "../../organisms/Modal/UpgradeModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDirectoryModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const user = useAuthStore((state: any) => state.user);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("El nombre es obligatorio");

    setIsLoading(true);
    try {
      await api.directories.create({ name, description, is_private: isPrivate });
      toast.success("Colección creada");
      setName("");
      setDescription("");
      setIsPrivate(false);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al crear la colección");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const role = user?.role?.toLowerCase() || "voyager";

    console.log("Rol detectado:", role);

    if (!isPrivate && role === "voyager") {
      console.log("Bloqueando acción y abriendo Modal de Ventas...");
      setShowUpgradeModal(true);
    } else {
      console.log("Cambiando estado de privacidad...");
      setIsPrivate(!isPrivate);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-background w-full max-w-md rounded-xl border border-border shadow-2xl overflow-hidden relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <IconX size={20} />
          </button>

          <div className="p-6">
            <h2 className="text-xl font-mono font-bold tracking-tight mb-6 text-(--accent-color)">
              Nueva Colección
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Nombre
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ej. Cyberpunk Portraits"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/10 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent-color)"
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Descripción (Opcional)
                </label>
                <textarea
                  placeholder="Un breve resumen de esta galería..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-muted/10 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent-color) resize-none h-20"
                  disabled={isLoading}
                />
              </div>

              <div
                className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-md mt-2 cursor-pointer transition-colors hover:bg-muted/30"
                onClick={handlePrivacyToggle}
              >
                <div
                  className={`p-2 rounded-full transition-colors ${isPrivate ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}
                >
                  {isPrivate ? <IconLock size={18} /> : <IconWorld size={18} />}
                </div>
                <div className="flex flex-col flex-1 select-none">
                  <span className="text-sm font-bold">
                    {isPrivate ? "Colección Privada" : "Colección Pública"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isPrivate
                      ? "Solo tú podrás verla."
                      : "Visible en tu perfil para todo el mundo."}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-accent/20 text-accent font-mono font-bold uppercase tracking-widest py-3 border border-accent rounded-md hover:bg-accent/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Creando..." : "Crear Colección"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 99999 }}>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          title="Mantén tus Prompts en secreto"
          message={
            <>
              Tu plan actual <strong>Voyager</strong> crea colecciones públicas por defecto. Pásate
              al plan <strong className="text-primary">Artist</strong> para ocultar tus galerías de
              miradas indiscretas y proteger tus prompts.
            </>
          }
        />
      </div>
    </>
  );
}
