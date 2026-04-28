import Image from "next/image";
import { IconCamera, IconLoader2 } from "@tabler/icons-react";

export interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  editable?: boolean;
  isUploading?: boolean;
  onClick?: () => void;
}

export function UserAvatar({
  username,
  avatarUrl,
  size = "md",
  className = "",
  editable = false,
  isUploading = false,
  onClick,
}: UserAvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-md",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-3xl",
    "2xl": "w-20 h-20 md:w-28 md:h-28",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        shrink-0 rounded-full flex items-center justify-center overflow-hidden
        bg-accent relative group
        ${editable && !isUploading ? "cursor-pointer hover:border-accent" : ""}
        ${className}
      `}
      aria-label={`Avatar de ${username}`}
      onClick={onClick}
    >
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
        <div className="w-full h-full bg-popover flex items-center justify-center rounded-full">
          <span className="text-white font-black font-prompt uppercase tracking-widest group-hover:scale-110 transition-transform duration-300">
            {username ? username.substring(0, 2) : "??"}
          </span>
        </div>
      )}
    </div>
  );
}
