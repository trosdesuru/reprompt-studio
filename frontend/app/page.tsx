"use client";

import { useState, useEffect, useRef } from "react";

// --- NUEVO COMPONENTE CON LAZY LOADING (CARGA DIFERIDA) ---
const TarjetaVisor = ({ urlPagina, numReal, descargarImagenSuelta }: any) => {
  const [imgReal, setImgReal] = useState("");
  const [cargandoImg, setCargandoImg] = useState(false);

  // Nuevos estados para controlar si la tarjeta está en pantalla
  const [visible, setVisible] = useState(false);
  const tarjetaRef = useRef<HTMLDivElement>(null);

  // 1. El "Radar": Detecta cuándo haces scroll y la tarjeta aparece en pantalla
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect(); // Una vez activada, apagamos el radar
        }
      },
      { rootMargin: "300px" },
    ); // Empieza a cargar 300px ANTES de que la veas

    if (tarjetaRef.current) observer.observe(tarjetaRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. La Petición: Solo dispara a Python si la tarjeta es 'visible'
  useEffect(() => {
    if (!visible) return; // Si no se ve en pantalla, no hacemos nada. ¡Ahorramos recursos!

    const obtenerImagenReal = async () => {
      setCargandoImg(true);
      try {
        const res = await fetch(
          `http://localhost:8000/api/resolver_imagen?url=${encodeURIComponent(urlPagina)}`,
        );
        const data = await res.json();
        if (data.status === "success" && data.url_img) {
          setImgReal(data.url_img);
        }
      } catch (e) {
        console.error("Error al resolver imagen", e);
      } finally {
        setCargandoImg(false);
      }
    };
    obtenerImagenReal();
  }, [urlPagina, visible]);

  return (
    <div
      ref={tarjetaRef}
      className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 flex flex-col group shadow-lg"
    >
      <div className="h-56 bg-gray-900 relative flex items-center justify-center overflow-hidden">
        {/* Lógica visual de los estados */}
        {!visible ? (
          <span className="text-gray-600 text-sm font-medium">
            Esperando scroll...
          </span>
        ) : cargandoImg ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        ) : imgReal ? (
          <img
            src={imgReal}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-red-400 text-xs font-bold">Error de red</span>
        )}

        <span className="absolute top-2 left-2 bg-black bg-opacity-80 text-xs font-bold px-2 py-1 rounded text-blue-400">
          #{numReal}
        </span>
      </div>
      <button
        onClick={() => imgReal && descargarImagenSuelta(imgReal, numReal)}
        disabled={!imgReal || cargandoImg}
        className="bg-gray-700 hover:bg-green-600 text-white font-semibold py-2 transition-colors text-sm w-full disabled:opacity-30 disabled:hover:bg-gray-700"
      >
        ⬇️ Guardar foto
      </button>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function Home() {
  const [query, setQuery] = useState("");
  const [paginas, setPaginas] = useState(1);
  const [resultados, setResultados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [visorAbierto, setVisorAbierto] = useState(false);
  const [paginasVisor, setPaginasVisor] = useState<string[]>([]); // 👈 Ahora guardamos los enlaces de las páginas
  const [tituloVisor, setTituloVisor] = useState("");
  const [cargandoVisor, setCargandoVisor] = useState(false);

  const buscarEnPython = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setCargando(true);
    setError("");
    setResultados([]);

    try {
      const res = await fetch(
        `http://localhost:8000/api/buscar?query=${encodeURIComponent(query)}&paginas=${paginas}`,
      );
      if (!res.ok) throw new Error("Error de servidor");
      const data = await res.json();
      if (data.status === "success") setResultados(data.data);
    } catch (err) {
      setError("Error de conexión. Revisa que la API esté encendida.");
    } finally {
      setCargando(false);
    }
  };

  const mandarADescargarTotal = async (url: string, title: string) => {
    alert(
      `⏳ Descarga iniciada para toda la galería:\n"${title}"\n\nLas fotos nuevas sobreescribirán a las antiguas respetando el orden.`,
    );
    try {
      await fetch("http://localhost:8000/api/descargar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title }),
      });
    } catch (error) {
      alert("❌ Error al conectar.");
    }
  };

  const descargarImagenSuelta = async (url_img: string, index: number) => {
    try {
      await fetch("http://localhost:8000/api/descargar_imagen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url_img, title: tituloVisor, index }),
      });
      console.log(`Petición enviada para descargar la imagen ${index}`);
    } catch (error) {
      alert(`Error al descargar la imagen ${index}`);
    }
  };

  const abrirVisor = async (url: string, title: string) => {
    setVisorAbierto(true);
    setCargandoVisor(true);
    setPaginasVisor([]);
    setTituloVisor(title);

    try {
      const res = await fetch(
        `http://localhost:8000/api/leer?url=${encodeURIComponent(url)}`,
      );
      const data = await res.json();
      if (data.status === "success") {
        setPaginasVisor(data.paginas);
      }
    } catch (error) {
      alert("Error al cargar la galería.");
    } finally {
      setCargandoVisor(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans relative">
      <header className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-4">
          Buscador de Galerías
        </h1>
        <form
          onSubmit={buscarEnPython}
          className="flex flex-col sm:flex-row gap-3 shadow-xl bg-gray-800 p-3 rounded-xl border border-gray-700"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: Chun Li..."
            className="flex-1 p-3 rounded bg-gray-900 border border-gray-700 focus:border-blue-500 outline-none text-white text-lg"
            disabled={cargando}
          />
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded px-4">
            <span className="text-gray-400 mr-2">Páginas:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={paginas}
              onChange={(e) => setPaginas(Number(e.target.value))}
              className="w-12 bg-transparent outline-none text-white text-center font-bold"
              disabled={cargando}
            />
          </div>
          <button
            type="submit"
            disabled={cargando || !query}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded font-bold disabled:bg-gray-600 text-lg"
          >
            Buscar
          </button>
        </form>
      </header>

      {cargando && (
        <div className="text-center mt-12 text-blue-400 text-lg animate-pulse">
          🤖 Buscando galerías...
        </div>
      )}

      {!cargando && resultados.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {resultados.map((item, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col"
            >
              <div className="h-64 overflow-hidden bg-gray-900">
                {item.thumb && item.thumb !== "N/A" ? (
                  <img
                    src={item.thumb}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600">
                    Sin foto
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow justify-between">
                <h2
                  className="text-sm font-bold text-gray-200 line-clamp-2 mb-4"
                  title={item.title}
                >
                  {item.title}
                </h2>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => mandarADescargarTotal(item.url, item.title)}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded text-sm"
                  >
                    ⬇️ Bajar Galería
                  </button>
                  <button
                    onClick={() => abrirVisor(item.url, item.title)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-sm"
                  >
                    📖 Abrir Visor
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⬛ VISOR DE IMÁGENES ASÍNCRONO */}
      {visorAbierto && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col overflow-y-auto p-4 sm:p-8 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold text-blue-400 truncate w-2/3">
              {tituloVisor}
            </h2>
            <button
              onClick={() => setVisorAbierto(false)}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-full shadow-lg transition-colors"
            >
              Cerrar ✖
            </button>
          </div>

          {cargandoVisor ? (
            <div className="flex items-center justify-center flex-grow">
              <p className="text-blue-400 text-2xl animate-pulse">
                Obteniendo enlaces de lectura...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-7xl mx-auto w-full pb-20">
              {paginasVisor.map((urlPagina, i) => (
                <TarjetaVisor
                  key={i}
                  urlPagina={urlPagina}
                  numReal={i + 1}
                  descargarImagenSuelta={descargarImagenSuelta}
                />
              ))}
              {paginasVisor.length === 0 && (
                <p className="col-span-full text-center">
                  No se encontraron páginas.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
