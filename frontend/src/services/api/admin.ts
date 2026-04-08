import { API_URL, fetchSeguro } from "./client";

export const adminApi = {
  reportBug: async (data: {
    message: string;
    stack?: string;
    digest?: string;
    url: string;
    timestamp: string;
  }) => {
    return fetchSeguro(`${API_URL}/admin/bugs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
