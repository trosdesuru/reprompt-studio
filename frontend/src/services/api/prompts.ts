import { API_URL, fetchSeguro } from "./client";

export const promptApi = {
  guardarPrompt: (data: any) =>
    fetchSeguro(`${API_URL}/prompts/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};
