"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/src/store/authStore";

import toast from "react-hot-toast";

export function GoogleAuthButton() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const [step, setStep] = useState<"google" | "invite">("google");
  const [tempToken, setTempToken] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.status === 202 && data.status === "needs_invite") {
        setTempToken(credentialResponse.credential);
        setUsername(data.suggested_username || "");
        setStep("invite");
        toast("¡Casi listo! Necesitamos tu código de invitación.", { icon: "🎟️" });
      } else if (res.ok) {
        toast.success(data.message || "Bienvenido de nuevo");
        await checkAuth();
        window.location.href = "/es/studio";
      } else {
        toast.error(data.detail || "Error en la autenticación");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode || !username) return toast.error("Rellena todos los campos");

    try {
      setIsLoading(true);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${API_URL}/api/auth/google/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token: tempToken,
          invite_code: inviteCode,
          username: username,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        await checkAuth();
        window.location.href = "/es/studio";
      } else {
        toast.error(data.detail || "Código inválido o usuario en uso");
      }
    } catch (error) {
      toast.error("Error validando la invitación");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "google") {
    return (
      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("El login con Google ha fallado")}
          useOneTap={false}
          theme="filled_black"
          shape="rectangular"
          text="continue_with"
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleJoinSubmit}
      className="flex flex-col gap-4 w-full p-4 border border-border rounded-lg bg-muted/20"
    >
      <div className="text-sm font-medium text-center">Último paso para unirte</div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Tu alias (Público)</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="ej. cyperpunk_artist"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Código de invitación</label>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary uppercase"
          placeholder="ej. VY-123"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Verificando..." : "Completar Registro"}
      </button>
    </form>
  );
}
