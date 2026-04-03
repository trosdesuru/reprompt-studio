export function FormHeader() {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-black uppercase font-mono tracking-tighter">
        Acceso al <span className="text-(--accent-color)">Búnker</span>
      </h2>
      <p className="text-xs font-mono text-(--text-secondary) mt-2 uppercase">
        Identifícate para gestionar tus prompts
      </p>
    </div>
  );
}