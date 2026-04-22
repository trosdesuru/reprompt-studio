"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { useUpdateUsername } from "@/src/features/user/hooks/useUpdateUsername";
import { Button } from "@/src/system/atoms/Button";
import { IconUserEdit, IconAt } from "@tabler/icons-react";
import { slugifyUsername } from "@/src/utils/lib/string";

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
    <section className="bg-background neo-border p-6 relative overflow-hidden">
      <div className="flex items-center gap-3 border-b-2 border-(--border-color) pb-4 mb-6">
        <IconUserEdit size={24} className="text-(--accent-color)" />
        <h2 className="text-lg font-bold uppercase font-mono">Nombre de Usuario</h2>
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
            placeholder="nuevo_nombre"
            className="w-full bg-(--bg-secondary) neo-border p-4 pl-12 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-(--accent-color) transition-all"
          />
        </div>

        <div className="bg-muted/10 p-4 neo-border border-dashed border-muted-foreground/30">
          <p className="text-[10px] font-mono text-muted-foreground uppercase leading-relaxed">
            Vista previa de tu URL: <br />
            <span className="text-(--accent-color) font-bold">
              reprompt.studio/{lang}/{slugifyUsername(inputValue) || "..."}
            </span>
          </p>
        </div>

        <p className="text-[10px] text-red-500/70 font-mono uppercase italic">
          * Al cambiar tu nombre, tu sesión se cerrará por seguridad y la URL antigua dejará de
          funcionar.
        </p>

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
