// frontend/features/auth/components/RegisterForm.tsx
import { useState } from "react";
import { api } from "@/src/services/api";
import { Button } from "@/src/components/ui/Button";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    invite_code: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await api.registrar(formData);
      setSuccess(`¡Bienvenido, ${data.user.username}! Rol asignado: ${data.user.role.toUpperCase()}`);
      // Aquí en el futuro redirigiremos al Dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-(--bg-secondary) p-8 neo-border neo-shadow max-w-md mx-auto w-full">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-black font-mono uppercase tracking-tighter text-foreground">
          Join<span className="text-[var(--accent-color)]">_</span>Platform
        </h2>
        <p className="text-[var(--text-secondary)] text-sm font-mono mt-2">Acceso restringido por invitación</p>
      </div>

      {error && <div className="bg-red-500 text-white p-3 font-bold neo-border text-sm font-mono uppercase text-center">{error}</div>}
      {success && <div className="bg-green-500 text-white p-3 font-bold neo-border text-sm font-mono uppercase text-center">{success}</div>}

      <div className="flex flex-col gap-2">
        <label className="font-bold text-sm uppercase tracking-wide text-foreground">Usuario</label>
        <input
          type="text"
          required
          className="bg-background text-foreground neo-border p-3 focus:outline-none focus:neo-shadow-accent transition-all font-mono"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-bold text-sm uppercase tracking-wide text-foreground">Contraseña</label>
        <input
          type="password"
          required
          className="bg-background text-foreground neo-border p-3 focus:outline-none focus:neo-shadow-accent transition-all font-mono"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-bold text-sm uppercase tracking-wide text-foreground flex justify-between">
          <span>Código Maestro</span>
          <span className="text-[var(--accent-color)]">🔑</span>
        </label>
        <input
          type="text"
          required
          placeholder="TROYA-XXXXXXX"
          className="bg-background text-foreground neo-border p-3 focus:outline-none focus:neo-shadow-accent transition-all font-mono uppercase placeholder:text-gray-500"
          value={formData.invite_code}
          onChange={(e) => setFormData({ ...formData, invite_code: e.target.value.toUpperCase() })}
        />
      </div>

      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="mt-4 w-full">
        {isLoading ? "Verificando..." : "Reclamar Acceso"}
      </Button>
    </form>
  );
}