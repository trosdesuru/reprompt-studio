export function FormHeader() {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <div className="mb-6 relative flex justify-center items-center">
        <img
          src="/logo-brand-black.svg"
          alt="Logotipo de la plataforma"
          className="h-12 w-auto object-contain block dark:hidden"
        />

        <img
          src="/logo-brand-white.svg"
          alt="Logotipo de la plataforma"
          className="h-12 w-auto object-contain hidden dark:block"
        />
      </div>
      <p className="text-xs font-mono text-(--text-secondary) uppercase">
        Identifícate para gestionar tus prompts
      </p>
    </div>
  );
}
