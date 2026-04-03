import { SVGProps, forwardRef } from "react";

export const IconLamp2On = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ width = 24, height = 24, className = "", strokeWidth = 2, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`icon icon-tabler icon-tabler-lamp-2-on ${className}`}
        {...props}
      >
        <defs>
          {/* Filtro de desenfoque para el halo profesional */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Haz de luz direccional blanco */}
          <linearGradient
            id="light-beam-subtle-gray"
            x1="16"
            y1="10"
            x2="12"
            y2="21"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="gray" stopOpacity="0.2" />
            <stop offset="100%" stopColor="gray" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* === CAPA 1: EL HALO AMARILLO SUTIL (Glow) === */}
        <circle
          cx="17"
          cy="11"
          r="4"
          fill="#fbbf24"
          fillOpacity="0.30"
          filter="url(#glow)"
          stroke="none"
        />

        {/* === CAPA 2: LA LUZ PROYECTADA (Blanco) === */}
        <path
          d="M13 14 L 8 21 L 22 21 L 21 6 Z"
          fill="url(#light-beam-subtle-gray)"
          stroke="none"
        />

        {/* === CAPA 3: INTERIOR CAMPANA (Blanco) === */}
        <path
          d="M13 14c-2.148 -2.148 -2.148 -5.852 0 -8c2.088 -2.088 5.842 -1.972 8 0l-8 8"
          fill="gray"
          fillOpacity="0.15"
          stroke="none"
        />

        {/* === CAPA 4: ESTRUCTURA (Blanco Puro) === */}
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 21h9" stroke="gray" />
        <path d="M10 21l-7 -8l8.5 -5.5" stroke="gray" />
        <path
          d="M13 14c-2.148 -2.148 -2.148 -5.852 0 -8c2.088 -2.088 5.842 -1.972 8 0l-8 8"
          stroke="gray"
        />
        <path d="M11.742 7.574l-1.156 -1.156a2 2 0 0 1 2.828 -2.829l1.144 1.144" stroke="gray" />

        {/* === CAPA 5: LA BOMBILLA (Más grande y coloreable) === */}
        <g transform="translate(-3.2, -2.4) scale(1.2)">
          {" "}
          {/* Escalado centrado en la bombilla */}
          <path
            d="M15.5 12l.208 .274a2.527 2.527 0 0 0 3.556 0c.939 -.933 .98 -2.42 .122 -3.4l-.366 -.369"
            fill="currentColor"
            stroke="none"
          />
        </g>
      </svg>
    );
  },
);

IconLamp2On.displayName = "IconLamp2On";
