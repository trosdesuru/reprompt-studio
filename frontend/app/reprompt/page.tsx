import { ExtractorContainer } from "@/features/extractor/components/ExtractorContainer";

export default function RepromptPage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Cabecera del Estudio */}
        <section className="text-center space-y-6 pt-10 pb-6">
          <h1 className="text-5xl md:text-7xl font-black uppercase font-mono tracking-tighter text-foreground">
            Estudio <span className="text-(--accent-color)">REPROMPT</span>
          </h1>
          <p className="text-xl md:text-2xl text-(--text-secondary) font-mono max-w-3xl mx-auto leading-relaxed">
            Extrae, analiza y organiza los metadatos de tus generaciones IA.
            <br />
            <span className="text-sm bg-(--accent-color)/10 text-(--accent-color) px-3 py-1 neo-border mt-4 inline-block">
              Procesamiento 100% Local • Cero Servidores
            </span>
          </p>
        </section>

        {/* 🟢 El motor de extracción que creamos */}
        <ExtractorContainer />
      </div>
    </main>
  );
}
