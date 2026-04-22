"use client";

import { useAuthStore } from "@/src/store/authStore";
import { MenuItem } from "@/src/system/atoms/Menu/MenuItem";
import { IconLogout } from "@tabler/icons-react";

export function LogoutMenuItem() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <MenuItem
      icon={<IconLogout size={18} />}
      label="Cerrar Sesión"
      onClick={logout}
      variant="danger"
    />
  );
}
