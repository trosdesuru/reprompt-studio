// src/system/molecules/Tabs/AuthTabs.tsx
interface AuthTabsProps {
  isLogin: boolean;
  onToggle: (isLogin: boolean) => void;
}

export function AuthTabs({ isLogin, onToggle }: AuthTabsProps) {
  return (
    <div className="flex w-full border-b border-border">
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={`flex-1 pb-4 text-xs font-black tracking-widest uppercase font-mono transition-colors ${
          isLogin
            ? "text-(--accent-color) border-b-2 border-(--accent-color)"
            : "text-(--text-secondary) hover:text-foreground"
        }`}
      >
        Iniciar Sesión
      </button>
      <button
        type="button"
        onClick={() => onToggle(false)}
        className={`flex-1 pb-4 text-xs font-black tracking-widest uppercase font-mono transition-colors ${
          !isLogin
            ? "text-(--accent-color) border-b-2 border-(--accent-color)"
            : "text-(--text-secondary) hover:text-foreground"
        }`}
      >
        Registrarse
      </button>
    </div>
  );
}
