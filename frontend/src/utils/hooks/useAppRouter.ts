import { usePathname } from "next/navigation";

export function useAppLocale() {
  const pathname = usePathname();
  
  return pathname?.split("/")[1] || "es";
}
