import Image from "next/image";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function UserAvatar({ username, avatarUrl, size = "md", className = "" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    "2xl": "w-20 h-20 md:w-28 md:h-28",
  };

  const fallbackPadding = {
    sm: "p-2",
    md: "p-2.5",
    lg: "p-4",
    xl: "p-6",
    "2xl": "p-5 md:p-8",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        shrink-0 rounded-full flex items-center justify-center overflow-hidden
        border-2 border-border/30 bg-accent relative group
        ${className}
      `}
      aria-label={`Avatar de ${username}`}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`Imagen de perfil de ${username}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      ) : (
        <div
          className={`w-full h-full bg-background flex items-center justify-center relative ${fallbackPadding[size]}`}
        >
          <div className="relative w-full h-full">
            <Image
              src="/logo-white.svg"
              alt="Reprompt Default Avatar"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
