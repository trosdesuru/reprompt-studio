// frontend/src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref,
  ) => {
    // Mapeo de variantes de color (Neo-brutalismo)
    const variants = {
      primary: "bg-[var(--accent-color)] text-white hover:brightness-110",
      secondary:
        "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800",
      danger: "bg-red-600 text-white hover:bg-red-500",
      ghost:
        "bg-transparent border-transparent shadow-none hover:bg-gray-200 dark:hover:bg-gray-800 text-[var(--text-secondary)]",
    };

    // Mapeo de tamaños
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-10 py-4 text-lg font-bold",
    };

    // Si es "ghost", le quitamos el borde duro y la sombra brutalista
    const brutalistClasses = variant === "ghost" ? "" : "neo-border neo-shadow";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-bold uppercase tracking-wide transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
          ${variants[variant]} 
          ${sizes[size]} 
          ${brutalistClasses}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
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
