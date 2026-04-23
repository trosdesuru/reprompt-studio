"use client";

import { useAuthStore } from "@/src/store/authStore";
import { MenuItem } from "@/src/system/atoms/Dropdown/MenuItem";
import { IconLogout } from "@tabler/icons-react";

export function LogoutMenuItem() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <MenuItem
      icon={<IconLogout size={16} />}
      label="Cerrar sesión"
      onClick={logout}
      variant="danger"
    />
  );
}
