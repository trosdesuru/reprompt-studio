import { API_URL, fetchSeguro } from "./client";

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
