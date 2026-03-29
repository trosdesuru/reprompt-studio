// frontend/features/admin/components/SecurityModule.tsx
import { Button } from "@/src/components/ui/Button";

export function SecurityModule({ onRevokeAll }: { onRevokeAll: () => void }) {
  return (
    <section className="bg-(--bg-secondary) p-6 neo-border neo-shadow flex flex-col gap-4 border-red-500/20">
      <h2 className="text-xl font-black font-mono uppercase flex items-center gap-2 text-red-500">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span> Seguridad
      </h2>
      <p className="text-xs text-(--text-secondary) leading-relaxed">
        Gestión de sesiones activas en Redis. La revocación es instantánea y global.
      </p>
      <div className="mt-auto">
        <Button
          onClick={onRevokeAll}
          className="w-full bg-red-600/10 hover:bg-red-600 hover:text-white border-red-600 text-red-500 transition-all font-black text-xs"
        >
          REVOCAR TODAS LAS SESIONES
        </Button>
      </div>
    </section>
  );
}
