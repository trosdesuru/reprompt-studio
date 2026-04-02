import { API_URL, fetchSeguro } from "./client";

export const promptApi = {
  savePrompt: (data: any) =>
    fetchSeguro(`${API_URL}/prompts/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  getMyPrompt: () => fetchSeguro(`${API_URL}/prompts/`),
  deletePrompt: (id: number) => fetchSeguro(`${API_URL}/prompts/${id}`, { method: "DELETE" }),
};
