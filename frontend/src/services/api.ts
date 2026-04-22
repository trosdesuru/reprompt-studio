// src/services/api.ts
import { authApi } from "./api/auth";
import { searchApi } from "./api/search";
import { downloadApi } from "./api/downloads";
import { promptApi } from "./api/prompts";
import { publicApi } from "./api/public";
import { directoriesApi } from "./api/directories";
import { adminApi } from "./api/admin";
import { userApi } from "./api/user";

export const api = {
  ...authApi,
  ...searchApi,
  ...downloadApi,
  ...promptApi,
  ...userApi,

  admin: adminApi,
  auth: authApi,
  user: userApi,
  public: publicApi,
  prompts: promptApi,
  directories: directoriesApi,
};
