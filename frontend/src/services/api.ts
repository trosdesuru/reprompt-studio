// src/services/api.ts
import { authApi } from "./api/auth";
import { searchApi } from "./api/search";
import { downloadApi } from "./api/downloads";
import { promptApi } from "./api/prompts";
import { publicApi } from "./api/public";
import { directoriesApi } from "./api/directories";
import { adminApi } from "./api/admin";

export const api = {
  ...authApi,
  ...searchApi,
  ...downloadApi,
  ...promptApi,

  admin: adminApi,
  auth: authApi,
  public: publicApi,
  prompts: promptApi,
  directories: directoriesApi,
};
