"use client";

import { useEffect } from "react";
import { useAdminGuard } from "@/src/features/admin/hooks/useAdminGuard";
import { useAdminDashboard } from "@/src/features/admin/hooks/useAdminDashboard";

// 🏛️ Componentes de la Feature Admin (FSD - Ubicación corregida)
import { InviteManager } from "@/src/features/admin/components/InviteManager";
import { SecurityModule } from "@/src/features/admin/components/SecurityModule";
import { AuditTable } from "@/src/features/admin/components/AuditTable";
import { DatabaseModule } from "@/src/features/admin/components/DatabaseModule";
import { StorageModule } from "@/src/features/admin/components/StorageModule";
import { AdminHeader } from "@/src/features/admin/components/AdminHeader";
import { SectionTitle } from "@/src/features/admin/components/SectionTitle";
import { MetricWidget } from "@/src/features/admin/components/MetricWidget";
import { AdminLoadingScreen } from "@/src/features/admin/components/AdminLoadingScreen";
import { GarbageCollectorModule } from "@/src/features/admin/components/GarbageCollectorModule";
import { IconShieldLock } from "@tabler/icons-react";

export default function AdminDashboardPage() {
  const { user, isLoadingAuth, isAuthorized } = useAdminGuard();

  const {
    logs,
    isLoadingLogs,
    inviteCode,
    isLoadingInvite,
    fetchLogs,
    handleGenerateInvite,
    handleRevokeAll,
  } = useAdminDashboard();

  useEffect(() => {
    if (isAuthorized) fetchLogs();
  }, [isAuthorized, fetchLogs]);

  if (isLoadingAuth || !isAuthorized || !user) return <AdminLoadingScreen />;

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto space-y-12">
        <AdminHeader username={user.username} />

        {/* ZONA 1: Centro de Mando */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <InviteManager
            onGenerate={handleGenerateInvite}
            isLoading={isLoadingInvite}
            inviteCode={inviteCode}
          />
          <SecurityModule onRevokeAll={handleRevokeAll} />
          <MetricWidget
            title="Eventos en Auditoría"
            value={logs.length}
            icon={<IconShieldLock size={20} />}
          />

          {/* El nuevo Botón Nuclear */}
          <GarbageCollectorModule />
        </section>
        {/* ZONA 2: Infraestructura */}
        <section className="space-y-6">
          <SectionTitle title="Monitor de" highlight="Infraestructura" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <DatabaseModule />
            <StorageModule />
          </div>
        </section>

        {/* ZONA 3: Auditoría */}
        <section className="space-y-6">
          <SectionTitle title="Registro de" highlight="Auditoría" />
          <AuditTable logs={logs} isLoading={isLoadingLogs} onRefresh={fetchLogs} />
        </section>
      </div>
    </main>
  );
}
