"use client";

import Image from "next/image";
import { useAuthStore } from "@/src/store/authStore";
import { UserBadge } from "@/src/features/user/components/UserBadge";

export function SettingsProfileHeader() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <div className="flex items-center gap-6 pb-6 mb-4">
      <div className="relative shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-full bg-muted/20 border-2 border-border/30 flex items-center justify-center overflow-hidden shadow-sm group">
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={user.username} fill className="object-cover" />
        ) : (
          <div className="w-full h-full p-4 md:p-6 bg-[#131313] flex items-center justify-center">
            <Image
              src="/logo-brand-white.svg"
              alt="Reprompt Default Avatar"
              width={60}
              height={60}
              className="opacity-90 group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-xl font-black tracking-tighter text-foreground lowercase">
            {user.username}
          </h1>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <UserBadge role={user.role} />
        </div>
      </div>
    </div>
  );
}
