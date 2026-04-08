// frontend/app/admin/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { useAdminDashboard } from "@/src/features/admin/hooks/useAdminDashboard";
import { InviteManager } from "@/src/system/organisms/Admin/InviteManager";
import { SecurityModule } from "@/src/system/organisms/Admin/SecurityModule";
import { AuditTable } from "@/src/system/organisms/Admin/AuditTable";

export default function AdminDashboard() {
  const { user, isLoadingAuth } = useAuthStore();
  const router = useRouter();

  const {
    logs,
    isLoadingLogs,
    inviteCode,
    isLoadingInvite,
    fetchLogs,
    handleGenerateInvite,
    handleRevokeAll,
  } = useAdminDashboard();

  // 🛡️ Protección de ruta: Solo admins pasan de aquí
  useEffect(() => {
    if (!isLoadingAuth && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoadingAuth, router]);

  // Cargar datos al entrar
  useEffect(() => {
    if (user?.role === "admin") {
      fetchLogs();
    }
  }, [user, fetchLogs]);

  // Pantalla de carga mientras verificamos identidad
  if (isLoadingAuth || !user || user.role !== "admin") {
    return (
      <div className="max-h-screen flex items-center justify-center font-mono text-foreground bg-background">
        <span className="animate-pulse">CARGANDO PROTOCOLOS DE MANDO...</span>
      </div>
    );
  }

  // 🎨 La Interfaz Declarativa (Orquestación)
  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b-4 border-(--border-color) pb-6">
          <h1 className="text-4xl md:text-6xl font-black font-mono uppercase italic">
            Admin<span className="text-(--accent-color)">_</span>Terminal
          </h1>
          <p className="text-(--text-secondary) font-mono text-sm mt-2">
            Acceso concedido a: {user.username} [ROOT_ACCESS]
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <InviteManager
            onGenerate={handleGenerateInvite}
            isLoading={isLoadingInvite}
            inviteCode={inviteCode}
          />

          <SecurityModule onRevokeAll={handleRevokeAll} />

          <section className="bg-(--bg-secondary) p-6 neo-border neo-shadow flex flex-col items-center justify-center text-center">
            <span className="text-7xl font-black font-mono text-(--accent-color)">
              {logs.length}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">
              Eventos en Auditoría
            </span>
          </section>
        </div>

        <AuditTable logs={logs} isLoading={isLoadingLogs} onRefresh={fetchLogs} />
      </div>
    </main>
  );
}
