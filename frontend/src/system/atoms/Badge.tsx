interface BadgeProps {
  text: string;
  color?: string;
  className?: string;
}

export function Badge({ text, color = "bg-blue-500", className = "" }: BadgeProps) {
  return (
    <span
      className={`${color} ${className} text-white font-mono text-[9px] font-bold px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] truncate max-w-30`}
    >
      {text}
    </span>
  );
}
