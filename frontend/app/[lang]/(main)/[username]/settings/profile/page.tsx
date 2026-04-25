"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { SettingsSectionHeader } from "@/src/features/settings/components/SettingsSectionHeader";
import { IconUserSquareRounded } from "@tabler/icons-react";

import { UsernameSettingsSection } from "@/src/features/user/components/UsernameSettingsSection";
import { PersonalDataSettingsSection } from "@/src/features/user/components/PersonalDataSettingsSection";

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

  if (isLoadingAuth || user?.username !== decodedUsername || !user) return null;

  return (
    <div className="text-brand-text font-mono animate-fade-in space-y-8 w-full">
      <SettingsSectionHeader
        title="Perfil Público"
        description="Gestiona tu identidad visual, datos personales y tu nombre de usuario."
        icon={<IconUserSquareRounded className="text-brand" size={24} />}
      />

      <div className="space-y-8 pt-4">
        <UsernameSettingsSection user={user} lang={lang} />

        <PersonalDataSettingsSection user={user} />
      </div>
    </div>
  );
}
