import { API_URL, fetchSeguro } from "./client";

export const directoriesApi = {
  create: async (data: { name: string; description?: string; is_private: boolean }) => {
    return fetchSeguro(`${API_URL}/directories`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyDirectorys: async () => {
    return fetchSeguro(`${API_URL}/directories/`);
  },

  assignPrompt: async (promptId: number, directoryId: number | null) => {
    return fetchSeguro(`${API_URL}/directories/assign/${promptId}`, {
      method: "PUT",
      body: JSON.stringify({ directory_id: directoryId }),
    });
  },
};
