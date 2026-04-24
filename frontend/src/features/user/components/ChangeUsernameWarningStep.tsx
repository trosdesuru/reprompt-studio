import { IconAlertTriangle } from "@tabler/icons-react";
import { Button } from "@/src/system/atoms/Button/Button";

interface ChangeUsernameWarningStepProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function ChangeUsernameWarningStep({ onClose, onConfirm }: ChangeUsernameWarningStepProps) {
  return (
    <div className="flex flex-col">
      <div className="px-5 pt-5 pb-1">
        <h3 className="text-lg font-bold text-foreground">Cambiar nombre de usuario</h3>
      </div>

      <div className="mx-5 mt-3 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex gap-3 items-start">
        <IconAlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-amber-600 font-medium leading-relaxed">
          No cambies tu username antes de leer la siguiente información.
        </p>
      </div>

      <div className="px-5 mt-5 mb-6">
        <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
          <li className="flex gap-2.5 items-start">
            <span className="text-amber-500 font-black mt-0.5">•</span>
            <span className="leading-relaxed">
              <strong>Reprompt</strong> no realizará las redirecciones de la{" "}
              <strong>antigua URL</strong>.
            </span>
          </li>

          <li className="flex gap-2.5 items-start">
            <span className="text-amber-500 font-black mt-0.5">•</span>
            <span className="leading-relaxed">
              Tu antigua URL devolverá un <strong>Error 404</strong> inmediato. Actualiza tus
              enlaces.
            </span>
          </li>

          <li className="flex gap-2.5 items-start">
            <span className="text-amber-500 font-black mt-0.5">•</span>
            <span className="leading-relaxed">
              Es posible que los cambios se retrasen <strong>unos minutos</strong> en propagarse por
              la base de datos.
            </span>
          </li>
        </ul>
      </div>

      <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-3">
        <Button variant="tertiary" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" onClick={onConfirm}>
          Entendido, continuar
        </Button>
      </div>
    </div>
  );
}
