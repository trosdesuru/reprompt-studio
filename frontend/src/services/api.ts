const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api";

const fetchSeguro = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401) {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Sesión expirada o no iniciada");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
  }

  return res.json();
};

export const api = {
  // --- AUTH ---
  registrar: async (userData: any) => {
    return fetchSeguro(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: any) => {
    // Tras esto, el navegador guardará la cookie HTTPOnly solo
    return fetchSeguro(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    await fetchSeguro(`${API_URL}/auth/logout`, { method: "POST" });
    window.location.href = "/login";
  },

  cambiarPassword: async (data: { old_password: string; new_password: string }) => {
    return fetchSeguro(`${API_URL}/auth/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  obtenerPerfil: async () => {
    return fetchSeguro(`${API_URL}/auth/me`);
  },

  generarInvitacion: async (role: string = "voyager") => {
    return fetchSeguro(`${API_URL}/auth/invite-codes?role_requested=${role}`, {
      method: "POST",
    });
  },

  obtenerLogsAuditoria: async (limit: number = 50) => {
    return fetchSeguro(`${API_URL}/auth/admin/logs?limit=${limit}`);
  },

  // --- BÚSQUEDA Y LECTURA ---
  buscar: async (
    query: string,
    next_id: string | null = null,
    categories: Record<string, boolean> | null = null,
  ) => {
    let endpoint = `${API_URL}/buscar?query=${encodeURIComponent(query)}`;
    if (next_id) endpoint += `&next_id=${next_id}`;
    if (categories) endpoint += `&categories=${encodeURIComponent(JSON.stringify(categories))}`;
    return fetchSeguro(endpoint);
  },

  leer: async (url: string, p: number = 0) => {
    return fetchSeguro(`${API_URL}/leer?url=${encodeURIComponent(url)}&p=${p}`);
  },

  resolverImagen: async (url: string) => {
    return fetchSeguro(`${API_URL}/resolver_imagen?url=${encodeURIComponent(url)}`);
  },

  // --- DESCARGAS ---
  descargarTotal: async (url: string, title: string) => {
    return fetchSeguro(`${API_URL}/descargar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, title }),
    });
  },

  descargarImagen: async (url_img: string, title: string, index: number) => {
    return fetchSeguro(`${API_URL}/descargar_imagen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url_img, title, index }),
    });
  },
};
