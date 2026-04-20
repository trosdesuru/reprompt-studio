import { useState, useEffect } from "react";
import { api } from "@/src/services/api";
import { SavedPrompt } from "@/src/types/models";

interface ProfileData {
  user: { username: string; role: string };
  directories: any[];
  recent_prompts: SavedPrompt[];
}

export function usePublicProfile(username: string) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.public
      .getDirectory(username, "")
      .then(async (res) => {
        if (!res.ok) throw new Error("Error en la petición");
        const jsonData = await res.json();
        setData(jsonData);
      })
      .finally(() => setIsLoading(false));
  }, [username]);

  return { data, isLoading, error };
}
