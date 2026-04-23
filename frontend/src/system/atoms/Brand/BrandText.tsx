interface BrandTextProps {
  text: string;
  brandName?: string;
  className?: string;
}

export function BrandText({
  text,
  brandName = "reprompt",
  className = "",
}: BrandTextProps) {
  if (!text) return null;
  const parts = text.split(new RegExp(`(${brandName})`, "gi"));

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.toLowerCase() === brandName.toLowerCase()) {
          return (
            <span
              key={index}
              className="font-black font-mono tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-primary to-foreground"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
