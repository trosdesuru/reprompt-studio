import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { useNotificationStore } from "@/src/store/notificationStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useGoogleAuth() {
  const { checkAuth } = useAuthStore();
  const router = useRouter();
  const notify = useNotificationStore((state) => state.notify);

  // Estados
  const [step, setStep] = useState<"idle" | "invite">("idle");
  const [tempToken, setTempToken] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // PASO 1: Recibe el token directamente del popup de Google
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.status === 202 && data.status === "needs_invite") {
        // Usuario nuevo: Guardamos el token temporal y cambiamos la pantalla
        setTempToken(credentialResponse.credential);
        setUsername(data.suggested_username || "");
        setStep("invite");
        notify("¡Casi listo!", "Necesitamos tu código de invitación.", "info");
      } else if (res.ok) {
        // Usuario existente: Entra directo
        notify("Acceso concedido", data.message || "Bienvenido de nuevo", "success");
        await checkAuth();
        router.push("/");
      } else {
        notify("Error", data.detail || "Error en la autenticación", "error");
      }
    } catch (error) {
      notify("Error", "Error de conexión con el servidor", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    notify("Error", "El login con Google ha fallado", "error");
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode || !username) {
      notify("Atención", "Rellena todos los campos", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/google/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: tempToken, invite_code: inviteCode, username }),
      });

      const data = await res.json();

      if (res.ok) {
        notify("Registro completado", data.message, "success");
        await checkAuth();
        router.push("/");
      } else {
        notify("Error", data.detail || "Código inválido o usuario en uso", "error");
      }
    } catch (error) {
      notify("Error", "Error validando la invitación", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelGoogleLogin = () => {
    setStep("idle");
    setTempToken("");
    setUsername("");
    setInviteCode("");
  };

  return {
    step,
    username,
    setUsername,
    inviteCode,
    setInviteCode,
    isLoading,
    handleGoogleSuccess,
    handleGoogleError,
    handleJoinSubmit,
    cancelGoogleLogin,
  };
}