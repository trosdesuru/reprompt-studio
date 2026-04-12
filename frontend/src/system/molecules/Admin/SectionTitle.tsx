export function SectionTitle({ title, highlight }: { title: string; highlight: string }) {
  return (
    <div className="border-b-2 border-border pb-2">
      <h2 className="text-2xl font-black font-mono uppercase italic">
        {title} <span className="text-muted-foreground">{highlight}</span>
      </h2>
    </div>
  );
}
