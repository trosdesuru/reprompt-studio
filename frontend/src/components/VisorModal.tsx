"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";

// --- SUBCOMPONENTE: La tarjeta individual con Lazy Loading ---
// Lo dejamos dentro de este mismo archivo porque solo lo usa el Visor
const TarjetaVisor = ({
  urlPagina,
  numReal,
  tituloVisor,
}: {
  urlPagina: string;
  numReal: number;
  tituloVisor: string;
}) => {
  const [imgReal, setImgReal] = useState("");
  const [cargandoImg, setCargandoImg] = useState(false);

  // Estados para el "radar" de visibilidad
  const [visible, setVisible] = useState(false);
  const tarjetaRef = useRef<HTMLDivElement>(null);

  // 1. Radar: Detecta cuándo haces scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    if (tarjetaRef.current) observer.observe(tarjetaRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Petición HTTP silenciosa
  useEffect(() => {
    if (!visible) return;

    const obtenerImagenReal = async () => {
      setCargandoImg(true);
      try {
        const data = await api.resolverImagen(urlPagina);
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

  // 3. Acción de descargar
  const handleDescargar = async () => {
    if (!imgReal) return;
    try {
      await api.descargarImagen(imgReal, tituloVisor, numReal);
      console.log(`Petición enviada: imagen ${numReal}`);
    } catch (error) {
      alert(`Error al descargar la imagen ${numReal}`);
    }
  };

  return (
    <div
      ref={tarjetaRef}
      className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 flex flex-col group shadow-lg"
    >
      <div className="h-56 bg-gray-900 relative flex items-center justify-center overflow-hidden">
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
          <span className="text-red-400 text-xs font-bold">Error</span>
        )}
        <span className="absolute top-2 left-2 bg-black bg-opacity-80 text-xs font-bold px-2 py-1 rounded text-blue-400">
          #{numReal}
        </span>
      </div>
      <button
        onClick={handleDescargar}
        disabled={!imgReal || cargandoImg}
        className="bg-gray-700 hover:bg-green-600 text-white font-semibold py-2 transition-colors text-sm w-full disabled:opacity-30 disabled:hover:bg-gray-700"
      >
        ⬇️ Guardar foto
      </button>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL: El Modal ---
interface VisorModalProps {
  titulo: string;
  paginas: string[];
  cargando: boolean;
  onClose: () => void;
}

export default function VisorModal({
  titulo,
  paginas,
  cargando,
  onClose,
}: VisorModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col overflow-y-auto p-4 sm:p-8 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-blue-400 truncate w-2/3">
          {titulo}
        </h2>
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-full shadow-lg transition-colors"
        >
          Cerrar ✖
        </button>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center grow">
          <p className="text-blue-400 text-2xl animate-pulse">
            Obteniendo enlaces de lectura...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-7xl mx-auto w-full pb-20">
          {paginas.map((urlPagina, i) => (
            <TarjetaVisor
              key={i}
              urlPagina={urlPagina}
              numReal={i + 1}
              tituloVisor={titulo}
            />
          ))}
          {paginas.length === 0 && (
            <p className="col-span-full text-center">
              No se encontraron páginas.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
