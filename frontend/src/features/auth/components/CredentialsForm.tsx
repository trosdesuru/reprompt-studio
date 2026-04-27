// src/system/molecules/Auth/CredentialsForm.tsx
import { IconMail, IconLock, IconTicket, IconLoader2 } from "@tabler/icons-react";

interface CredentialsFormProps {
  // ... (Mismos props de antes, no cambian)
  isLogin: boolean;
  isLoading: boolean;
  isSocialLoading: boolean;
  emailOrUser: string;
  password: string;
  inviteCode: string;
  isInviteLocked: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onInviteChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CredentialsForm({
  isLogin, isLoading, isSocialLoading, emailOrUser, password,
  inviteCode, isInviteLocked, onEmailChange, onPasswordChange, onInviteChange, onSubmit,
}: CredentialsFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-(--text-secondary)">
          <IconMail size={18} />
        </div>
        <input
          type="text"
          required
          placeholder={isLogin ? "EMAIL O USUARIO" : "CORREO ELECTRÓNICO"}
          value={emailOrUser}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full h-12 bg-background border border-border pl-10 pr-3 text-sm font-mono focus:outline-none focus:border-(--accent-color) transition-colors placeholder:text-(--text-secondary)/50"
          disabled={isLoading}
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-(--text-secondary)">
          <IconLock size={18} />
        </div>
        <input
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="w-full h-12 bg-background border border-border pl-10 pr-3 text-sm font-mono focus:outline-none focus:border-(--accent-color) transition-colors placeholder:text-(--text-secondary)/50"
          disabled={isLoading}
        />
      </div>

      {!isLogin && (
        <div className="relative animate-in slide-in-from-top-2 duration-200">
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isInviteLocked ? "text-(--accent-color)" : "text-(--text-secondary)"}`}>
            <IconTicket size={18} />
          </div>
          <input
            type="text"
            required
            placeholder="CÓDIGO DE INVITACIÓN"
            value={inviteCode}
            onChange={(e) => onInviteChange(e.target.value.toUpperCase())}
            readOnly={isInviteLocked}
            className={`w-full h-12 border pl-10 pr-3 text-sm font-mono uppercase focus:outline-none transition-colors placeholder:text-(--text-secondary)/50 ${
              isInviteLocked
                ? "bg-(--accent-color)/10 border-(--accent-color) text-(--accent-color) font-black"
                : "bg-background border-border focus:border-(--accent-color)"
            }`}
            disabled={isLoading}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || isSocialLoading}
        className="w-full justify-center h-12 mt-2 text-sm font-black uppercase font-mono tracking-widest bg-white text-black hover:bg-gray-200 neo-border transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <IconLoader2 className="animate-spin mx-auto" size={20} />
        ) : isLogin ? (
          "Entrar"
        ) : (
          "Confirmar Acceso"
        )}
      </button>
    </form>
  );
}