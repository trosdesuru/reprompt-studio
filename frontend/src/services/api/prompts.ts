import { fetchSeguro } from "./client";
import { ENV } from "@/src/services/config/env";

const API_URL = ENV.API_URL;

export const promptApi = {
  getMyPrompt: () => fetchSeguro(`${API_URL}/prompts/`),

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

  deletePrompt: async (promptId: string) => {
    return fetchSeguro(`${API_URL}/prompts/${promptId}`, {
      method: "DELETE",
    });
  },
};
