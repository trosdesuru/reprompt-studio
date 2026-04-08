import { Suspense } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { AuthForm } from "@/src/system/organisms/Auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-muted/10">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <IconLoader2 className="animate-spin" size={32} />
            <span className="font-mono text-sm tracking-widest uppercase">Cargando acceso...</span>
          </div>
        }
      >
        <AuthForm />
      </Suspense>
    </main>
  );
}