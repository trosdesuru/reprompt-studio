"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { SettingsSectionHeader } from "@/src/features/settings/components/SettingsSectionHeader";
import { IconUserSquareRounded, IconEdit } from "@tabler/icons-react";
import { Button } from "@/src/system/atoms/Button";
import { ChangeUsernameModal } from "@/src/features/user/components/ChangeUsernameModal";

export default function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ lang: string; username: string }>;
}) {
  const { lang, username } = use(params);
  const router = useRouter();
  const { user, isLoadingAuth } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <div className="animate-fade-in space-y-8 w-full">
      <SettingsSectionHeader
        title="Perfil Público"
        description="Gestiona tu identidad visual y tu nombre de usuario."
        icon={<IconUserSquareRounded className="text-primary" size={24} />}
      />

      <div className="bg-background border border-border/50 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-6 shadow-sm">
        <div>
          <h3 className="text-lg font-bold">Nombre de Usuario</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tu nombre actual es <strong className="text-foreground">@{user.username}</strong>. Este
            nombre se usa para tu URL pública.
          </p>
        </div>

        <Button
          variant="secondary"
          className="shrink-0 gap-2 font-mono text-xs tracking-widest uppercase"
          onClick={() => setIsModalOpen(true)}
        >
          <IconEdit size={16} />
          Cambiar Nombre
        </Button>
      </div>

      <ChangeUsernameModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} lang={lang} />
    </div>
  );
}
