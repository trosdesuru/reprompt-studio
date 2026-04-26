import Link from "next/link";
import { User } from "@/src/store/authStore";
import { UserAvatar } from "@/src/system/atoms/Avatar/Avatar";
import { MenuLink, MenuSection } from "./MobileMenuPrimitives";
import {
  IconSun,
  IconMoon,
  IconScanTraces,
  IconUserSquareRounded,
  IconLockSquareRounded,
  IconDeviceDesktop,
  IconShieldLock,
  IconLogout,
  IconAlbum,
} from "@tabler/icons-react";

export const UserProfileCard = ({ user }: { user: User }) => (
  <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-xl">
    <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size="md" />
    <div className="flex flex-col">
      <span className="text-sm font-bold text-foreground">@{user.username}</span>
      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
        {user.role}
      </span>
    </div>
  </div>
);

export const AuthenticatedView = ({
  user,
  lang,
  onClose,
}: {
  user: User;
  lang: string;
  onClose: () => void;
}) => (
  <>
    <UserProfileCard user={user} />

    <MenuSection title="Herramientas">
      <MenuLink
        href={`/${lang}/studio`}
        onClick={onClose}
        icon={IconAlbum}
        label="Mi Estudio"
        className="font-bold"
      />

      <MenuLink
        href={`/${lang}/reprompt`}
        onClick={onClose}
        icon={IconScanTraces}
        label="Extractor Reprompt"
        className="text-accent font-bold"
      />
    </MenuSection>

    <MenuSection title="Cuenta">
      <MenuLink
        href={`/${lang}/${user.username}/settings/profile`}
        onClick={onClose}
        icon={IconUserSquareRounded}
        label="Perfil"
      />
      <MenuLink
        href={`/${lang}/${user.username}/settings/security`}
        onClick={onClose}
        icon={IconLockSquareRounded}
        label="Seguridad"
      />
      <MenuLink
        href={`/${lang}/${user.username}/settings/appearance`}
        onClick={onClose}
        icon={IconDeviceDesktop}
        label="Apariencia"
      />

      {user.role === "admin" && (
        <MenuLink
          href={`/${lang}/admin`}
          onClick={onClose}
          icon={IconShieldLock}
          label="Panel Admin"
          className="text-amber-500"
        />
      )}
    </MenuSection>
  </>
);

export const GuestView = ({ lang, onClose }: { lang: string; onClose: () => void }) => (
  <Link
    href={`/${lang}/login`}
    onClick={onClose}
    className="p-3 text-center bg-foreground text-background rounded-lg font-bold text-sm mt-4"
  >
    Iniciar Sesión
  </Link>
);

interface MenuFooterProps {
  user: User | null;
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  onClose: () => void;
}

export const MenuFooterActions = ({
  user,
  isDark,
  toggleTheme,
  onLogout,
  onClose,
}: MenuFooterProps) => (
  <div className="mt-auto pt-8 flex flex-col gap-2">
    <div className="border-t border-border/50 pt-4 flex flex-col gap-2">
      <button
        onClick={toggleTheme}
        className="flex items-center justify-between p-3 rounded-md hover:bg-muted font-bold text-sm transition-colors w-full"
      >
        <span className="flex items-center gap-3">
          {isDark ? <IconSun size={18} /> : <IconMoon size={18} />} Apariencia
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          {isDark ? "OSCURO" : "CLARO"}
        </span>
      </button>

      {user && (
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-destructive/10 text-destructive font-bold text-sm transition-colors w-full"
        >
          <IconLogout size={18} /> Cerrar Sesión
        </button>
      )}
    </div>
  </div>
);
