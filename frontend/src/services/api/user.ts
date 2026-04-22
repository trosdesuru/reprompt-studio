import { API_URL, fetchSeguro } from "./client";

const handleJsonResponse = async (res: Response) => {
  if (!res.ok) {
    const errorBody = await res
      .clone()
      .json()
      .catch(() => ({}));
    throw new Error(
      errorBody.detail || errorBody.message || `Fallo en el servidor (${res.status})`,
    );
  }
  if (res.status === 204) return null;
  return res.json();
};

export const userApi = {
  updateUsername: async (newUsername: string) => {
    return fetchSeguro(`${API_URL}/auth/me/username`, {
      method: "PATCH",
      body: JSON.stringify({ new_username: newUsername }),
    }).then(handleJsonResponse);
  },

  getActivity: async () => {
    return fetchSeguro(`${API_URL}/auth/me/activity`, {
      method: "GET",
    }).then(handleJsonResponse);
  },

  updatePrivacy: async (isPrivate: boolean) => {
    return fetchSeguro(`${API_URL}/auth/me/privacy`, {
      method: "PATCH",
      body: JSON.stringify({ is_private: isPrivate }),
    }).then(handleJsonResponse);
  },
};
