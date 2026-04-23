"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { UpdateUsernameForm } from "@/src/features/user/components/UpdateUsernameForm";
import { SettingsSectionHeader } from "@/src/features/settings/components/SettingsSectionHeader";
import { IconUserSquareRounded } from "@tabler/icons-react";

export default function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ lang: string; username: string }>;
}) {
  const { lang, username } = use(params);
  const router = useRouter();
  const { user, isLoadingAuth } = useAuthStore();

  const decodedUsername = decodeURIComponent(username);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        router.push(`/${lang}/login`);
      } else if (user.username !== decodedUsername) {
        router.push(`/${lang}/${encodeURIComponent(user.username)}/settings/profile`);
      }
    }
  }, [user, isLoadingAuth, decodedUsername, lang, router]);

  if (isLoadingAuth || user?.username !== decodedUsername) return null;

  return (
    <div className="animate-fade-in">
      <SettingsSectionHeader
        title="Modificar nombre de usuario"
        description="Personaliza tu nombre de usuario."
        icon={<IconUserSquareRounded className="text-accent-color" size={24} />}
      />

      <div className="space-y-8">
        <UpdateUsernameForm lang={lang} />
      </div>
    </div>
  );
}
