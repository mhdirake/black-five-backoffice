import http from "@/config/http";
import { CATEGORIES_LIST, CATEGORY_CREATE, CATEGORY_DETAIL, CATEGORY_ACTIVATE, CATEGORY_DEACTIVATE } from "./api";

export const categoriesApi = {
  list:       (params)   => http.get(CATEGORIES_LIST, { params }),
  create:     (data)     => http.post(CATEGORY_CREATE, data),
  detail:     (id)       => http.get(CATEGORY_DETAIL(id)),
  update:     (id, data) => http.patch(CATEGORY_DETAIL(id), data),
  delete:     (id)       => http.delete(CATEGORY_DETAIL(id)),
  activate:   (id)       => http.post(CATEGORY_ACTIVATE(id)),
  deactivate: (id)       => http.post(CATEGORY_DEACTIVATE(id)),
};
