"use client";

import { useAuthStore } from "@/src/store/authStore";
import { UserBadge } from "@/src/system/atoms/Badge/Badge";
import { EditableAvatar } from "@/src/system/molecules/Avatar/EditableAvatar";

export function SettingsProfileHeader() {
  const user = useAuthStore((state) => state.user);
  if (process.env.NODE_ENV === "development") {
    console.log("[PROFILE HEADER] - Avatar", user?.avatarUrl);
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-6 pb-6 mb-4 sticky">
      <EditableAvatar username={user.username} avatarUrl={user.avatarUrl} size="xl" />

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
