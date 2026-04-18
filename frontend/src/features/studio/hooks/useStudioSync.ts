import { useEffect } from "react";
import { useStudioUI } from "@/src/store/useStudioUI";
import { fetchSeguro } from "@/src/services/api/client";

export function useStudioSync() {
  const setDirectories = useStudioUI((state) => state.setDirectories);

  useEffect(() => {
    const fetchDirs = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const res = await fetchSeguro(`${API_URL}/directories/`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setDirectories(data);
        }
      } catch (error) {
        console.error("Error cargando directorios:", error);
      }
    };
    fetchDirs();
  }, [setDirectories]);
}
