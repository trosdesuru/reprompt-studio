// frontend/features/admin/components/AuditTable.tsx
import { Button } from "@/src/system/atoms/Button/Button";
import { AuditLog } from "@/src/features/admin/admin.types";

interface AuditTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function AuditTable({ logs, isLoading, onRefresh }: AuditTableProps) {
  return (
    <section className="bg-(--bg-secondary) p-6 neo-border neo-shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black font-mono uppercase">Registro de Actividad</h2>
        <Button
          onClick={onRefresh}
          isLoading={isLoading}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          ACTUALIZAR_LOGS
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-(--border-color) bg-background/50">
              <th className="p-4 uppercase font-black opacity-60">Timestamp</th>
              <th className="p-4 uppercase font-black opacity-60">Operador</th>
              <th className="p-4 uppercase font-black opacity-60">Acción</th>
              <th className="p-4 uppercase font-black opacity-60">Detalles de Operación</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center opacity-40 italic">
                  No hay registros de sistema disponibles.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-(--border-color) hover:bg-background/30 transition-colors"
                >
                  <td className="p-4 whitespace-nowrap opacity-70">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-black text-(--accent-color)">@{log.username}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-foreground text-background font-black text-[9px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 max-w-md truncate hover:whitespace-normal" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
