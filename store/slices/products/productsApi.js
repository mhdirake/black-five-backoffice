import http from "@/config/http";
import { PRODUCTS_LIST, PRODUCT_CREATE, PRODUCT_DETAIL, PRODUCT_CHANGE_STATUS } from "./api";

export const productsApi = {
  list:         (params)   => http.get(PRODUCTS_LIST, { params }),
  create:       (data)     => http.post(PRODUCT_CREATE, data),
  detail:       (id)       => http.get(PRODUCT_DETAIL(id)),
  update:       (id, data) => http.patch(PRODUCT_DETAIL(id), data),
  delete:       (id)       => http.delete(PRODUCT_DETAIL(id)),
  changeStatus: (id, data) => http.post(PRODUCT_CHANGE_STATUS(id), data),
};
