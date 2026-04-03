import { fetchSeguro } from "./client";
import { ENV } from "@/src/services/config/env";

export const API_URL = ENV.API_URL;
export const downloadApi = {
  downloadAll: (url: string, title: string) =>
    fetchSeguro(`${API_URL}/descargar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, title }),
    }),
  downloadImage: (url_img: string, title: string, index: number) =>
    fetchSeguro(`${API_URL}/descargar_imagen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url_img, title, index }),
    }),
};
