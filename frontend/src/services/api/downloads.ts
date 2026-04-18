import { fetchSeguro } from "./client";
import { ENV } from "@/src/services/config/env";

const API_URL = ENV.API_URL;
export const downloadApi = {
  solicitarZipColeccion: (directoryId: string) =>
    fetchSeguro(`${API_URL}/download/directory/${encodeURIComponent(directoryId)}`, {
      method: "POST",
    }),

  verificarEstado: (jobId: string) =>
    fetchSeguro(`${API_URL}/download/status/${encodeURIComponent(jobId)}`),

  descargarImagenUnica: (imageKey: string) =>
    fetchSeguro(`${API_URL}/download/single/${encodeURIComponent(imageKey)}`),
};
