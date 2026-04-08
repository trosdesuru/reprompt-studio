import { API_URL, fetchSeguro } from "./client";

export const collectionsApi = {
  create: async (data: { name: string; description?: string; is_private: boolean }) => {
    return fetchSeguro(`${API_URL}/collections`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyCollections: async () => {
    return fetchSeguro(`${API_URL}/collections/`);
  },

  assignPrompt: async (promptId: number, collectionId: number | null) => {
    return fetchSeguro(`${API_URL}/collections/assign/${promptId}`, {
      method: "PUT",
      body: JSON.stringify({ collection_id: collectionId }),
    });
  },
};
