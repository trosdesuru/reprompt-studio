import { IconUserSquareRounded } from "@tabler/icons-react";
import { UpdateUsernameForm } from "./UpdateUsernameForm";

interface ChangeUsernameFormStepProps {
  lang: string;
}

export function ChangeUsernameFormStep({ lang }: ChangeUsernameFormStepProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/10">
        <IconUserSquareRounded size={20} className="text-primary" />
        <h3 className="text-base font-bold text-foreground">Nuevo nombre de usuario</h3>
      </div>

      <div className="p-4">
        <UpdateUsernameForm lang={lang} />
      </div>
    </div>
  );
}
