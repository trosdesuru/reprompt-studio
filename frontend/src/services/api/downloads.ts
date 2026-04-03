import { fetchSeguro } from "./client";
import { ENV } from "@/src/services/config/env";

export const API_URL = ENV.API_URL;
export const downloadApi = {
  solicitarZipColeccion: (collectionId: string) =>
    fetchSeguro(`${API_URL}/download/collection/${collectionId}`, { method: "POST" }),

  verificarEstado: (jobId: string) =>
    fetchSeguro(`${API_URL}/download/status/${jobId}`),

  descargarImagenUnica: (imageKey: string) =>
    fetchSeguro(`${API_URL}/download/single/${imageKey}`),
};