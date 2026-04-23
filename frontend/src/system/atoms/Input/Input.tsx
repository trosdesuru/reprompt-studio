"use client";

import React, { useState, useId } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type = "text", className = "", ...props }, ref) => {
    const autoId = useId();
    const inputId = props.id || autoId;

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordType = type === "password";
    const currentType = isPasswordType && isPasswordVisible ? "text" : type;

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-black font-mono uppercase tracking-widest text-muted-foreground block"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={currentType}
            className={`
              w-full bg-brackground border-2 border-color rounded-lg p-2 text-foreground
              focus:outline-none focus:ring-2 focus:ring-accent-color transition-all
              overflow-auto
              ${icon ? "pl-12" : ""} 
              ${isPasswordType ? "pr-12" : ""}
              ${error ? "border-red-500 focus:ring-red-500" : ""}
              ${className}
            `}
            {...props}
          />

          {isPasswordType && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
              tabIndex={-1}
            >
              {isPasswordVisible ? <IconEye size={20} /> : <IconEyeOff size={20} />}
            </button>
          )}
        </div>

        {error && <p className="text-xs font-bold text-red-500 animate-fade-in">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
