// src/services/api.ts
import { authApi } from "./api/auth";
import { searchApi } from "./api/search";
import { downloadApi } from "./api/downloads";
import { promptApi } from "./api/prompts";
import { publicApi } from "./api/public";
import { collectionsApi } from "./api/collections";
import { adminApi } from "./api/admin";

export const api = {
  ...authApi,
  ...searchApi,
  ...downloadApi,
  ...promptApi,

  public: publicApi,
  collections: collectionsApi,
  admin: adminApi,
  prompts: promptApi,
};
