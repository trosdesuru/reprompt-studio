import { API_URL, fetchSeguro } from "./client";

export interface AdminUserDto {
  id: string;
  username: string;
  email: string | null;
  role: string;
  auth_provider: string;
  created_at: string;
  is_active: boolean;
}

export interface DatabaseStatsResponse {
  total_users: number;
  total_prompts: number;
  total_mb: number;
  limit_mb: number;
  users: AdminUserDto[];
}

export interface StorageStatsResponse {
  status: string;
  total_files: number;
  total_mb: number;
  limit_mb: number;
}

export interface GarbageDirectoryResult {
  status: string;
  deleted_logs: number;
  deleted_invites: number;
  deleted_temp_files: number;
}

export interface PurgeResult {
  status: string;
  message: string;
}

export interface UserActivityResponse {
  status: string;
  is_online: boolean;
  logs: {
    id: string;
    username: string;
    action: string;
    details: string;
    timestamp: string;
  }[];
}

export const adminApi = {
  reportBug: async (data: {
    message: string;
    stack?: string;
    digest?: string;
    url: string;
    timestamp: string;
  }) => {
    const res = await fetchSeguro(`${API_URL}/admin/bugs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  manageUser: async (
    userId: string,
    action: "upgrade" | "deactivate" | "activate" | "reset_password",
  ) => {
    const res = await fetchSeguro(`${API_URL}/admin/users/action`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, action }),
    });
    return await res.json();
  },

  deleteUser: async (userId: string) => {
    const res = await fetchSeguro(`${API_URL}/admin/users/${userId}`, {
      method: "DELETE",
    });
    return await res.json();
  },

  getDatabaseStats: async (): Promise<DatabaseStatsResponse> => {
    const res = await fetchSeguro(`${API_URL}/admin/database-stats`, {
      method: "GET",
    });
    return await res.json();
  },

  getStorageStats: async (): Promise<StorageStatsResponse> => {
    const res = await fetchSeguro(`${API_URL}/admin/storage-stats`, {
      method: "GET",
    });
    return await res.json();
  },

  runGarbageCollector: async (): Promise<GarbageDirectoryResult> => {
    const res = await fetchSeguro(`${API_URL}/admin/garbage-collect`, {
      method: "POST",
    });
    return await res.json();
  },

  purgeStorage: async (): Promise<PurgeResult> => {
    const res = await fetchSeguro(`${API_URL}/admin/storage/purge-all`, {
      method: "POST",
    });
    return await res.json();
  },

  getUserActivity: async (userId: string): Promise<UserActivityResponse> => {
    const res = await fetchSeguro(`${API_URL}/admin/users/${userId}/activity`, {
      method: "GET",
    });
    return await res.json();
  },
};
