import { useState, useEffect } from "react"; 
import { api } from "@/src/services/api";
import { SavedPrompt } from "@/src/features/studio/hooks/useStudio";

export interface ProfileData {
  user: { username: string; role: string };
  collections: any[];
  recent_prompts: SavedPrompt[];
}

export function usePublicProfile(username: string) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api
      .getPublicProfile(username)
      .then((res) => setData(res))
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setError("Este usuario no existe o se ha perdido en el vacío.");
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [username]);

  return { data, isLoading, error };
}
