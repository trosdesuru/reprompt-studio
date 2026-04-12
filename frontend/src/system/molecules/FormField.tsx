interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-black uppercase font-mono">{label}</label>
      <input
        {...props}
        className="neo-border p-2 bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-(--accent-color)"
      />
      {error && <span className="text-red-500 text-[10px] font-mono">{error}</span>}
    </div>
  );
}
