"use client";

import { useAuthStore } from "@/src/store/authStore";
import { UserBadge } from "@/src/features/user/components/UserBadge";
import { UserAvatar } from "@/src/system/atoms/Avatar/UserAvatar";

export function SettingsProfileHeader() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <div className="flex items-center gap-6 pb-6 mb-4">
      <UserAvatar 
        username={user.username} 
        avatarUrl={user.avatarUrl} 
        size="2xl" 
        className="shadow-sm" 
      />

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