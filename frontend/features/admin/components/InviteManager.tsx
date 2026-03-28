// frontend/features/admin/components/InviteManager.tsx
import { Button } from "@/src/components/ui/Button";

interface InviteManagerProps {
  onGenerate: (role: string) => void;
  isLoading: boolean;
  inviteCode: string | null;
}

export function InviteManager({ onGenerate, isLoading, inviteCode }: InviteManagerProps) {
  return (
    <section className="bg-(--bg-secondary) p-6 neo-border neo-shadow flex flex-col gap-4">
      <h2 className="text-xl font-black font-mono uppercase flex items-center gap-2">
        <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Invitaciones
      </h2>
      <p className="text-xs text-(--text-secondary) leading-relaxed">
        Genera códigos únicos para nuevos usuarios.
      </p>

      <div className="flex flex-col gap-2 mt-2">
        <Button onClick={() => onGenerate("voyager")} isLoading={isLoading} variant="primary">
          + Código Voyager
        </Button>
        <Button onClick={() => onGenerate("artist")} isLoading={isLoading} variant="secondary">
          + Código Artist
        </Button>
      </div>

      {inviteCode && (
        <div className="mt-4 p-4 bg-background border-2 border-dashed border-(--accent-color) flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase opacity-50">Código Activo:</span>
          <code className="text-xl font-black text-(--accent-color) select-all tracking-widest">
            {inviteCode}
          </code>
        </div>
      )}
    </section>
  );
}
