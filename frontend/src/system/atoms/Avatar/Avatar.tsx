"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { IconCamera, IconLoader2 } from "@tabler/icons-react";
import { optimizeAvatar } from "@/src/utils/lib/avatar-optimizer";
import { fetchSeguro } from "@/src/services/api/client";
// Importa tu store de autenticación/notificaciones aquí
import { useNotificationStore } from "@/src/store/notificationStore";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  editable?: boolean; // 🟢 Propiedad para permitir o no la edición
  onAvatarUpdate?: (newUrl: string) => void;
}

export function UserAvatar({
  username,
  avatarUrl,
  size = "md",
  className = "",
  editable = false,
  onAvatarUpdate,
}: UserAvatarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notify = useNotificationStore((s) => s.notify);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    "2xl": "w-20 h-20 md:w-28 md:h-28",
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Error", "El archivo debe ser una imagen", "error");
      return;
    }

    setIsUploading(true);
    try {
      const optimizedFile = await optimizeAvatar(file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const ticketRes = await fetchSeguro(`${API_URL}/prompts/generate-upload-url`, {
        method: "POST",
        body: JSON.stringify({
          file_name: `avatars/${username}_${Date.now()}.webp`,
          content_type: "image/webp",
        }),
      });
      if (!ticketRes.ok) throw new Error("Error obteniendo ticket de R2");
      const { upload_url, file_url } = await ticketRes.json();

      const uploadRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000" },
        body: optimizedFile,
      });
      if (!uploadRes.ok) throw new Error("Error subiendo a R2");

      const updateRes = await fetchSeguro(`${API_URL}/auth/me/avatar`, {
        method: "PATCH",
        body: JSON.stringify({ avatar_url: file_url }),
      });
      if (!updateRes.ok) throw new Error("Error guardando en la Base de Datos");

      notify("Perfil", "Avatar actualizado con éxito", "success");

      if (onAvatarUpdate) onAvatarUpdate(file_url);
    } catch (error) {
      console.error(error);
      notify("Error", "Hubo un problema actualizando el avatar", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        shrink-0 rounded-full flex items-center justify-center overflow-hidden
        border-2 border-border/30 bg-accent relative group
        ${editable && !isUploading ? "cursor-pointer hover:border-accent" : ""}
        ${className}
      `}
      aria-label={`Avatar de ${username}`}
      onClick={() => editable && !isUploading && fileInputRef.current?.click()}
    >
      {editable && (
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
      )}

      {isUploading && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <IconLoader2 className="animate-spin text-accent" size={24} />
        </div>
      )}

      {editable && !isUploading && (
        <div className="absolute inset-0 z-10 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
          <IconCamera size={20} className="mb-0.5" />
          <span className="text-[9px] font-mono uppercase font-bold tracking-widest">Cambiar</span>
        </div>
      )}

      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`Imagen de perfil de ${username}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-background flex items-center justify-center p-2">
          <Image
            src="/logo-white.svg"
            alt="Default Avatar"
            width={32}
            height={32}
            className="opacity-30 group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}
    </div>
  );
}
