const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api";

export const api = {
  buscar: async (query: string, paginas: number) => {
    try {
      const res = await fetch(
        `${API_URL}/buscar?query=${encodeURIComponent(query)}&paginas=${paginas}`,
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    } catch (error) {
      console.error("🚨 API Fetch Error (buscar):", error);
      throw error;
    }
  },

  leer: async (url: string, p: number = 0) => {
    const res = await fetch(`${API_URL}/leer?url=${encodeURIComponent(url)}&p=${p}`);
    if (!res.ok) throw new Error("Error al cargar la galería");
    return res.json();
  },

  resolverImagen: async (url: string) => {
    const res = await fetch(`${API_URL}/resolver_imagen?url=${encodeURIComponent(url)}`);
    return res.json();
  },

  // 🟢 CORREGIDO: Ahora parsea el JSON y maneja errores igual que el resto
  descargarTotal: async (url: string, title: string) => {
    const res = await fetch(`${API_URL}/descargar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, title }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },

  // 🟢 CORREGIDO: También parseamos la descarga individual por consistencia
  descargarImagen: async (url_img: string, title: string, index: number) => {
    const res = await fetch(`${API_URL}/descargar_imagen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url_img, title, index }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },
};
