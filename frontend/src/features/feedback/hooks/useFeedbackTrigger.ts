import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store/authStore";

export function useFeedbackTrigger() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user?.created_at || !user?.username) return;

    const KEY_ANSWERED = `feedback_beta_answered_${user.username}`;
    const KEY_LAST_DISMISSED = `feedback_beta_dismissed_${user.username}`;

    // 1. Si ya respondió, NUNCA mostrar
    if (localStorage.getItem(KEY_ANSWERED)) return;

    // 2. Verificar antigüedad de la cuenta (2 días)
    const createdAt = new Date(user.created_at).getTime();
    const now = Date.now();
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

    if (now - createdAt < twoDaysInMs) return;

    // 3. Lógica de Reaparición: ¿Cuánto hace que lo cerró?
    const lastDismissed = localStorage.getItem(KEY_LAST_DISMISSED);
    if (lastDismissed) {
      const cooldown = 24 * 60 * 60 * 1000; // 24 horas de espera antes de volver a preguntar
      if (now - parseInt(lastDismissed) < cooldown) return;
    }

    setShowFeedbackModal(true);
  }, [user]);

  // Si lo cierra sin responder (Snooze)
  const snoozeFeedback = () => {
    if (user) {
      localStorage.setItem(`feedback_beta_dismissed_${user.username}`, Date.now().toString());
    }
    setShowFeedbackModal(false);
  };

  // Si completa el flujo (Final)
  const completeFeedback = () => {
    if (user) {
      localStorage.setItem(`feedback_beta_answered_${user.username}`, "true");
    }
    setShowFeedbackModal(false);
  };

  return { showFeedbackModal, snoozeFeedback, completeFeedback };
}
