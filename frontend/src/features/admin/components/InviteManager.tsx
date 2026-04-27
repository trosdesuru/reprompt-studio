import { Button } from "@/src/system/atoms/Button/Button";
export function InviteManager({ onGenerate, isLoading, inviteCode }: any) {
  return (
    <div className="p-6 bg-card border border-border rounded-xl space-y-4">
      <h4 className="text-sm font-black uppercase">Gestión de Invitaciones</h4>
      <Button
        onClick={() => onGenerate("user")}
        disabled={isLoading}
        variant="secondary"
        className="w-full"
      >
        {isLoading ? "Generando..." : "Generar Código"}
      </Button>
      {inviteCode && (
        <div className="p-2 bg-muted rounded font-mono text-center text-accent border border-accent/20">
          {inviteCode}
        </div>
      )}
    </div>
  );
}
