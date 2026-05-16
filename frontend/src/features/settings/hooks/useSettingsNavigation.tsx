import { usePathname, useParams } from "next/navigation";
import {
  IconDeviceDesktop,
  IconLockSquareRounded,
  IconUserSquareRounded,
} from "@tabler/icons-react";
import { ReactNode } from "react";

export interface NavLink {
  href: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
}

export function useSettingsNavigation(): NavLink[] {
  const pathname = usePathname();
  const params = useParams();

  const lang = (params?.lang as string) || "es";
  const username = (params?.username as string) || "";
  const basePath = `/${lang}/${username}/settings`;

  return [
    {
      href: `${basePath}/profile`,
      label: "Perfil Público",
      icon: <IconUserSquareRounded size={20} />,
      isActive: pathname.includes(`${basePath}/profile`),
    },
    {
      href: `${basePath}/appearance`,
      label: "Apariencia",
      icon: <IconDeviceDesktop size={20} />,
      isActive: pathname.includes(`${basePath}/appearance`),
    },
    {
      href: `${basePath}/security`,
      label: "Seguridad",
      icon: <IconLockSquareRounded size={20} />,
      isActive: pathname.includes(`${basePath}/security`),
    },
  ];
}
