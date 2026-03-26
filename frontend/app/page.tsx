"use client";

import React, { useState, useEffect, useRef } from "react";

// --- COMPONENTE TARJETA VISOR (Con botón de descarga individual) ---
interface TarjetaProps {
  urlPagina: string;
  numReal: number;
  tituloGaleria: string;
}

const TarjetaVisor: React.FC<TarjetaProps> = ({ urlPagina, numReal, tituloGaleria }) => {
  const [imgReal, setImgReal] = useState<string>("");
  const [cargandoImg, setCargandoImg] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const tarjetaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    if (tarjetaRef.current) observer.observe(tarjetaRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const obtener = async () => {
      setCargandoImg(true);
      try {
        const res = await fetch(`http://localhost:8000/api/resolver_imagen?url=${encodeURIComponent(urlPagina)}`);
        const data = await res.json();
        if (data.status === "success") setImgReal(data.url_img);
      } catch (e) { console.error(e); }
      finally { setCargandoImg(false); }
    };
    obtener();
  }, [urlPagina, visible]);

  // FUNCIÓN: Descargar solo esta foto [cite: 102]
  const descargarEstaFoto = async () => {
    if (!imgReal) return;
    try {
      await fetch("http://localhost:8000/api/descargar_imagen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url_img: imgReal, title: tituloGaleria, index: numReal }),
      });
      console.log(`Petición enviada para imagen ${numReal}`);
    } catch (err) { alert("Error al descargar foto suelta"); }
  };

  return (
    <div ref={tarjetaRef} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col group shadow-lg">
      <div className="h-56 bg-gray-900 relative flex items-center justify-center overflow-hidden">
        {cargandoImg ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        ) : imgReal ? (
          <img src={imgReal} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="page" />
        ) : (
          <span className="text-gray-600 text-xs">Cargando...</span>
        )}
        <span className="absolute top-2 left-2 bg-black/80 text-blue-400 text-xs font-bold px-2 py-1 rounded">#{numReal}</span>
      </div>
      <button 
        onClick={descargarEstaFoto}
        disabled={!imgReal || cargandoImg}
        className="bg-gray-700 hover:bg-green-600 text-white py-2 text-xs font-bold transition-colors disabled:opacity-30"
      >
        ⬇️ GUARDAR FOTO
      </button>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [paginas, setPaginas] = useState<number>(1);
  const [resultados, setResultados] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [visorAbierto, setVisorAbierto] = useState<boolean>(false);
  const [paginasVisor, setPaginasVisor] = useState<string[]>([]);
  const [tituloVisor, setTituloVisor] = useState<string>("");
  const [cargandoVisor, setCargandoVisor] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/api/buscar?query=${encodeURIComponent(query)}&paginas=${paginas}`);
      const data = await res.json();
      if (data.status === "success") setResultados(data.data);
    } catch (err) { setError("Error de conexión API"); }
    finally { setCargando(false); }
  };

  // FUNCIÓN: Descargar toda la galería [cite: 99, 100]
  const handleDownloadTotal = async (url: string, title: string) => {
    alert(`⏳ Iniciando descarga de galería completa:\n${title}`);
    try {
      await fetch("http://localhost:8000/api/descargar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title }),
      });
    } catch (err) { alert("Error al conectar con el backend"); }
  };

  const handleOpenVisor = async (url: string, title: string) => {
    setVisorAbierto(true);
    setCargandoVisor(true);
    setTituloVisor(title);
    try {
      const res = await fetch(`http://localhost:8000/api/leer?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.status === "success") setPaginasVisor(data.paginas);
    } catch (err) { alert("Error al leer páginas"); }
    finally { setCargandoVisor(false); }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <h1 className="text-4xl font-extrabold text-blue-400 text-center mb-10">Buscador de Galerías</h1>
      
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2 mb-12 bg-gray-800 p-2 rounded-xl border border-gray-700 shadow-xl">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="flex-1 p-3 rounded bg-gray-900 border border-gray-700 outline-none focus:border-blue-500"
          placeholder="Buscar personaje o tag..."
        />
        <button type="submit" className="bg-blue-600 px-8 py-3 rounded font-bold hover:bg-blue-500 transition-colors">BUSCAR</button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {resultados.map((item: any, index: number) => (
          <div key={index} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex flex-col shadow-lg">
            <div className="h-64 bg-gray-900 overflow-hidden">
              <img src={item.thumb} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="thumb" />
            </div>
            <div className="p-4 flex flex-col gap-2">
              <h2 className="text-sm font-bold line-clamp-2 h-10 text-gray-200">{item.title}</h2>
              <button 
                onClick={() => handleDownloadTotal(item.url, item.title)}
                className="w-full bg-green-600 py-2 rounded text-xs font-bold hover:bg-green-500 transition-colors"
              >
                ⬇️ BAJAR GALERÍA
              </button>
              <button 
                onClick={() => handleOpenVisor(item.url, item.title)}
                className="w-full bg-blue-600 py-2 rounded text-xs font-bold hover:bg-blue-500 transition-colors"
              >
                📖 ABRIR VISOR
              </button>
            </div>
          </div>
        ))}
      </div>

      {visorAbierto && (
        <div className="fixed inset-0 bg-black/95 z-50 p-6 overflow-y-auto backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-black/40 p-4 rounded-lg z-10">
              <h2 className="text-xl font-bold text-blue-400 truncate w-2/3">{tituloVisor}</h2>
              <button onClick={() => setVisorAbierto(false)} className="bg-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-500 transition-all">CERRAR ✖</button>
            </div>
            {cargandoVisor ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-blue-400 text-lg">Obteniendo enlaces de lectura...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {paginasVisor.map((url: string, i: number) => (
                  <TarjetaVisor key={i} urlPagina={url} numReal={i + 1} tituloGaleria={tituloVisor} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}