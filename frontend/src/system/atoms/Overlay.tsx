export function Overlay({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
      onClick={onClick}
    />
  );
}
