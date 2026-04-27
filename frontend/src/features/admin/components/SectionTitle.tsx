export function SectionTitle({ title, highlight }: { title: string; highlight: string }) {
  return (
    <h3 className="text-lg font-bold font-mono uppercase tracking-widest">
      {title} <span className="text-accent">{highlight}</span>
    </h3>
  );
}
