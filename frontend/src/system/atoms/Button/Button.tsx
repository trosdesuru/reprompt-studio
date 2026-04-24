import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-accent-color text-foreground neo-border neo-shadow-accent hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--brand-accent)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none font-bold uppercase tracking-wide",

      secondary:
        "bg-background text-foreground neo-border neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--brand-shadow)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none font-bold uppercase tracking-wide",

      tertiary:
        "bg-destructive/20 text-destructive neo-destructive/60 neo-shadow-destructive hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--brand-shadow)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none font-medium uppercase tracking-wide",

      danger:
        "text-red-600 bg-secondary border border-border shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors font-medium tracking-tight",

      ghost:
        "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent font-medium tracking-tight",

      outline:
        "bg-transparent border border-border text-foreground shadow-sm hover:border-foreground/30 font-medium tracking-tight",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
  inline-flex items-center justify-center rounded-md transition-all duration-200 
  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
  ${variants[variant]} 
  ${sizes[size]} 
  ${className}
`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
