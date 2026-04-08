import { fetchSeguro } from "./client";
import { ENV } from "@/src/services/config/env";

export const API_URL = ENV.API_URL;

export const promptApi = {
  savePrompt: (data: any) =>
    fetchSeguro(`${API_URL}/prompts/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  deleteBatch: async (prompt_ids: number[]) => {
    return fetchSeguro(`${API_URL}/prompts/batch-delete`, {
      method: "POST",
      body: JSON.stringify({ prompt_ids }),
    });
  },

  getMyPrompt: () => fetchSeguro(`${API_URL}/prompts/`),
  deletePrompt: (id: number) => fetchSeguro(`${API_URL}/prompts/${id}`, { method: "DELETE" }),
};
