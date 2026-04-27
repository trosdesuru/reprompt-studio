// src/system/molecules/Auth/AuthHeader.tsx
interface AuthHeaderProps {
  isLogin: boolean;
}

export function AuthHeader({ isLogin }: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-black uppercase font-mono tracking-tighter">
        {isLogin ? "Bienvenido de" : "Únete a la"}{" "}
        <span className="text-(--accent-color)">{isLogin ? "Nuevo" : "Resistencia"}</span>
      </h2>
      <p className="text-xs font-mono text-(--text-secondary) mt-2 uppercase">
        {isLogin ? "Accede para gestionar tus prompts" : "Almacena tu arte generado por IA"}
      </p>
    </div>
  );
}
