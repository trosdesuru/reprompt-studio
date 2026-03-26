// frontend/src/components/VisorModal.tsx
"use client";

import { useState } from "react";
import TarjetaVisor from "./tarjetaVisor";

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
  // 🟢 ESTADO PRINCIPAL: Si hay una imagen aquí, se muestra el Lightbox
  const [imagenPantallaCompleta, setImagenPantallaCompleta] = useState<
    string | null
  >(null);

  // 🟢 LOG PARA VER SI EL PADRE RECIBE LA ORDEN
  const handleAbrirImagen = (img: string) => {
    console.log("📥 El padre (VisorModal) ha recibido la orden de abrir:", img);
    setImagenPantallaCompleta(img);
  };

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
              onAbrirImagen={handleAbrirImagen} // 🟢 Pasamos la función con logs
            />
          ))}
          {paginas.length === 0 && (
            <p className="col-span-full text-center">
              No se encontraron páginas.
            </p>
          )}
        </div>
      )}

      {/* ⬛ EL VISUALIZADOR "LIGHTBOX" ⬛ */}
      {imagenPantallaCompleta && (
        <div
          className="fixed inset-0 z-9999 bg-black bg-opacity-95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => {
            console.log("✖️ Cerrando Lightbox...");
            setImagenPantallaCompleta(null);
          }}
        >
          <img
            src={imagenPantallaCompleta}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full object-contain drop-shadow-2xl"
            alt="Pantalla Completa"
          />
          <button
            className="absolute top-6 right-6 text-white bg-gray-800 hover:bg-red-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-2xl transition-colors border border-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              console.log("✖️ Cerrando Lightbox desde la X...");
              setImagenPantallaCompleta(null);
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
