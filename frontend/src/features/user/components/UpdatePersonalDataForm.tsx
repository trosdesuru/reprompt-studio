"use client";

import { useState, type SyntheticEvent } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { Input } from "@/src/system/atoms/Input/Input";
import { Button } from "@/src/system/atoms/Button/Button";
import { IconUser, IconBriefcase, IconCalendarEvent } from "@tabler/icons-react";
import { toast } from "react-hot-toast";

export function UpdatePersonalDataForm({ onSuccess }: Readonly<{ onSuccess: () => void }>) {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const profession = formData.get("profession") as string;
    const age = formData.get("age") as string;

    try {
      // TODO Conectar con endpoint: api.user.updateProfile
      await new Promise((resolve) => setTimeout(resolve, 800));

      updateUser({ fullName, profession, age: Number.parseInt(age) });

      toast.success("Perfil actualizado");
      onSuccess();
    } catch (error) {
      toast.error("Error al guardar los cambios");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col animate-in fade-in duration-300">
      <div className="p-6 md:p-8 space-y-5">
        <Input
          label="Nombre Completo"
          name="fullName"
          defaultValue={user?.fullName || ""}
          placeholder="Tu nombre y apellidos"
          icon={<IconUser size={18} />}
        />

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <Input
              label="Edad"
              name="age"
              type="number"
              defaultValue={user?.age || ""}
              placeholder="00"
              icon={<IconCalendarEvent size={18} />}
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Profesión"
              name="profession"
              defaultValue={user?.profession || ""}
              placeholder="Ej: Prompt Engineer"
              icon={<IconBriefcase size={18} />}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/5 border-t border-border/30 flex justify-end">
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          Guardar Perfil
        </Button>
      </div>
    </form>
  );
}
