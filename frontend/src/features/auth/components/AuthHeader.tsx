import { useTranslation } from "@/src/dictionaries/I18nProvider";

interface AuthHeaderProps {
  isLogin: boolean;
}

export function AuthHeader({ isLogin }: AuthHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-black uppercase font-mono tracking-tighter">
        {isLogin ? t("auth.login_highlight") : t("auth.join_highlight")}
        <span className="text-(--accent-color)">{isLogin ? "Nuevo" : "Resistencia"}</span>
      </h2>

      <p className="text-xs font-mono text-(--text-secondary) mt-2 uppercase">
        {isLogin ? t("auth.login_subtitle") : t("auth.join_subtitle")}
      </p>
    </div>
  );
}
