import Link from "next/link";

interface PromptErrorStateProps {
  error?: string | null;
  backUrl: string;
  backText: string;
}

export function PromptErrorState({ error, backUrl, backText }: PromptErrorStateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-mono gap-4">
      <p className="text-red-500">{error || "No se pudo cargar el prompt."}</p>
      <Link
        href={backUrl}
        className="text-(--accent-color) hover:underline uppercase text-xs tracking-widest"
      >
        ← {backText}
      </Link>
    </div>
  );
}
