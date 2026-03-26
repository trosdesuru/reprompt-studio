import datos from '../data/analytics_chun_li.json';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      {/* Cabecera */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">Buscador de Galerías</h1>
        <p className="text-gray-400">Mostrando {datos.length} resultados encontrados</p>
      </header>

      {/* Cuadrícula de resultados (Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {datos.map((item, index) => (
          <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500 transition-colors">
            
            {/* Imagen de Portada */}
            <div className="h-64 overflow-hidden bg-gray-700 flex items-center justify-center">
              {item.thumb && item.thumb !== "N/A" ? (
                <img 
                  src={item.thumb} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500">Sin miniatura</span>
              )}
            </div>

            {/* Información de la Galería */}
            <div className="p-4">
              <h2 className="text-lg font-bold truncate mb-2" title={item.title}>
                {item.title}
              </h2>
              
              <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                <span>📄 {item.pages} páginas</span>
              </div>

              {/* Etiquetas (Tags) principales */}
              <div className="flex flex-wrap gap-2 mb-4 h-16 overflow-hidden">
                {/* Mostramos solo algunos tags de parodia o personaje como ejemplo */}
                {(item.tags.character || item.tags.parody || []).slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Botón para ir a la galería original */}
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition-colors"
              >
                Ver Galería
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}