import { IconBrandGoogleFilled, IconBrandDiscordFilled, IconLoader2 } from "@tabler/icons-react";
import { useTranslation } from "@/src/dictionaries/I18nProvider";

interface SocialLoginsProps {
  isLoading: boolean;
  isGoogleLoading: boolean;
  isDiscordLoading: boolean;
  onGoogle: () => void;
  onDiscord: () => void;
}

export function SocialLogins({
  isLoading,
  isGoogleLoading,
  isDiscordLoading,
  onGoogle,
  onDiscord,
}: SocialLoginsProps) {
  const isDisabled = isLoading || isGoogleLoading || isDiscordLoading;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onGoogle}
        disabled={isDisabled}
        className="flex items-center justify-center gap-3 w-full h-12 bg-transparent text-foreground border border-border hover:bg-muted font-mono uppercase text-xs font-black tracking-widest transition-colors disabled:opacity-50"
      >
        {isGoogleLoading ? (
          <IconLoader2 className="animate-spin" size={18} />
        ) : (
          <IconBrandGoogleFilled size={18} className="text-red-500" />
        )}
        {t("auth.btn_google")}
      </button>

      <button
        type="button"
        onClick={onDiscord}
        disabled={isDisabled}
        className="flex items-center justify-center gap-3 w-full h-12 bg-[#5865F2] text-white hover:bg-[#4752C4] neo-border font-mono uppercase text-xs font-black tracking-widest transition-colors disabled:opacity-50"
      >
        {isDiscordLoading ? (
          <IconLoader2 className="animate-spin" size={18} />
        ) : (
          <IconBrandDiscordFilled size={18} />
        )}
        {t("auth.btn_discord")}
      </button>
    </div>
  );
}
