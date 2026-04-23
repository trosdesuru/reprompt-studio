"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { useUpdateUsername } from "@/src/features/user/hooks/useUpdateUsername";
import { Button } from "@/src/system/atoms/Button";
import { slugifyUsername } from "@/src/utils/lib/string";
import { IconAt } from "@tabler/icons-react";

export function UpdateUsernameForm({ lang }: { lang: string }) {
  const { user } = useAuthStore();
  const { handleUpdate, isLoading } = useUpdateUsername(lang);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (user?.username) {
      setInputValue(user.username);
    }
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdate(inputValue);
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-md font-medium font-mono text-foreground/90">username</h3>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <IconAt size={18} />
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="nuevo nombre de usuario"
            className="w-full bg-secondary neo-border p-2.5 pl-10 font-mono text-md focus:outline-none focus:ring-2 focus:ring-accent/70 transition-all"
          />
        </div>

        <div className="bg-muted/10">
          <p className="text-xs font-mono text-foreground/50 leading-relaxed">
            Vista previa de tu URL <br />
            <span className="text-foreground font-medium">
              reprompt.studio/{lang}/{slugifyUsername(inputValue) || "..."}
            </span>
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            className="min-w-37.5"
            disabled={inputValue === user?.username || !inputValue}
          >
            Guardar
          </Button>
        </div>
      </form>
    </section>
  );
}
