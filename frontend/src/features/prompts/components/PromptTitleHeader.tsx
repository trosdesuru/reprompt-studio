"use client";

interface PromptTitleHeaderProps {
  title?: string;
  createdAt: string | Date;
}

export function PromptTitleHeader({ title, createdAt }: PromptTitleHeaderProps) {
  return (
    <header className="shrink-0 mb-6">
      <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter mb-2 leading-tight">
        {title || "Prompt Sin Título"}
      </h1>
      <p className="text-xs font-mono text-muted-foreground/80 tracking-widest uppercase">
        Creado el {new Date(createdAt).toLocaleDateString()}
      </p>
    </header>
  );
}
