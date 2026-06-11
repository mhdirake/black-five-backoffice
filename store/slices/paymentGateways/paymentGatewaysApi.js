import http from "@/config/http";
import { PAYMENT_GATEWAYS_LIST, PAYMENT_GATEWAY_DETAIL } from "./api";

export const paymentGatewaysApi = {
  list: (params) => http.get(PAYMENT_GATEWAYS_LIST, { params }),
  create: (data) => http.post(PAYMENT_GATEWAYS_LIST, data),
  detail: (id) => http.get(PAYMENT_GATEWAY_DETAIL(id)),
  update: (id, data) => http.patch(PAYMENT_GATEWAY_DETAIL(id), data),
  delete: (id) => http.delete(PAYMENT_GATEWAY_DETAIL(id)),
};
