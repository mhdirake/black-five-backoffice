import http from "@/config/http";
import { FREE_PASSES_LIST, FREE_PASS_DETAIL } from "./api";

export const freePassesApi = {
  list: (params) => http.get(FREE_PASSES_LIST, { params }),
  create: (data) => http.post(FREE_PASSES_LIST, data),
  detail: (id) => http.get(FREE_PASS_DETAIL(id)),
  update: (id, data) => http.patch(FREE_PASS_DETAIL(id), data),
  delete: (id) => http.delete(FREE_PASS_DETAIL(id)),
};
