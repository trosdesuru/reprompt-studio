import { IconSearch, IconSparkles, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";

export const SearchTrigger = ({ onOpen }: { onOpen: () => void }) => (
  <button
    onClick={onOpen}
    className="w-full max-w-sm lg:max-w-md flex items-center gap-3 h-10 px-3 bg-muted/30 dark:bg-white/0.1 border border-border/50 rounded-xl hover:bg-muted/50 hover:border-border focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-muted-foreground group"
    aria-label="Abrir buscador semántico"
  >
    <IconSearch size={16} className="group-hover:text-foreground transition-colors" />
    <span className="text-sm truncate">Buscar conceptos, estilos...</span>

    <kbd className="ml-auto hidden md:inline-flex h-5 items-center gap-1 rounded border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
      Shift + /
    </kbd>
  </button>
);

export const SemanticSearchHeader = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative flex flex-col gap-3 p-5 border border-accent/50 rounded-md bg-accent/10 animate-in fade-in duration-300">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 p-1.5 text-accent/60 hover:text-accent hover:bg-accent/10 transition-colors rounded-md"
        aria-label="Cerrar explicación"
      >
        <Tooltip className="z-9999" content="Cerrar Información">
          <IconX size={16} stroke={2} />
        </Tooltip>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-md font-black tracking-tight text-foreground">
              Búsqueda Semántica
            </h2>
            <span className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-widest bg-accent/10 text-accent px-2 py-0.5 rounded-sm border border-accent">
              <IconSparkles size={14} /> Motor IA
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed pr-6">
        ¿No recuerdas la palabra exacta? No hay problema. El motor de{" "}
        <span className="font-prompt font-bold text-[16px] text-foreground">reprompt</span> no lee
        palabras, lee contexto y significado. Convierte tus frases en patrones de inteligencia
        artificial para mostrarte los resultados que realmente capturan la esencia de lo que estás
        buscando.
      </p>
    </div>
  );
};
