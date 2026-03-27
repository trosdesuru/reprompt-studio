import { authApi } from "./api/auth";
import { searchApi } from "./api/search";
import { downloadApi } from "./api/downloads";

// 🟢 Patrón Facade: Unificamos los dominios para retrocompatibilidad
// En el futuro, los componentes podrán importar solo el dominio que necesiten.
export const api = {
  ...authApi,
  ...searchApi,
  ...downloadApi,
};
