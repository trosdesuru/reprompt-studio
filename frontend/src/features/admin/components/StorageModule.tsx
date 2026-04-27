export function StorageModule() {
  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      <h4 className="text-sm font-black uppercase mb-4">Estado del Almacenamiento (R2)</h4>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-accent w-[45%]" />
      </div>
      <p className="text-[10px] font-mono mt-2 text-muted-foreground">45% CAPACIDAD UTILIZADA</p>
    </div>
  );
}
