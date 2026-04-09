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

export interface GarbageCollectionResult {
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
    return fetchSeguro(`${API_URL}/admin/bugs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  manageUser: async (
    userId: string,
    action: "upgrade" | "deactivate" | "activate" | "reset_password",
  ) => {
    return fetchSeguro(`${API_URL}/admin/users/action`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, action }),
    });
  },

  deleteUser: async (userId: string) => {
    return fetchSeguro(`${API_URL}/admin/users/${userId}`, {
      method: "DELETE",
    });
  },

  getDatabaseStats: async (): Promise<DatabaseStatsResponse> => {
    return fetchSeguro(`${API_URL}/admin/database-stats`, {
      method: "GET",
    });
  },

  getStorageStats: async (): Promise<StorageStatsResponse> => {
    return fetchSeguro(`${API_URL}/admin/storage-stats`, {
      method: "GET",
    });
  },

  runGarbageCollector: async (): Promise<GarbageCollectionResult> => {
    return fetchSeguro(`${API_URL}/admin/garbage-collect`, {
      method: "POST",
    });
  },

  purgeStorage: async (): Promise<PurgeResult> => {
    return fetchSeguro(`${API_URL}/admin/storage/purge-all`, {
      method: "POST",
    });
  },

  getUserActivity: async (userId: string): Promise<UserActivityResponse> => {
    return fetchSeguro(`${API_URL}/admin/users/${userId}/activity`, {
      method: "GET",
    });
  },
};
