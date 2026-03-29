import { authApi } from "./api/auth";
import { searchApi } from "./api/search";
import { downloadApi } from "./api/downloads";
import { promptApi } from "./api/prompts";

export const api = {
  ...authApi,
  ...searchApi,
  ...downloadApi,
  ...promptApi,
};
