import http from "@/config/http";
import { PAYMENT_DEPOSITS_LIST, PAYMENT_DEPOSIT_DETAIL } from "./api";

export const paymentDepositsApi = {
  list: (params) => http.get(PAYMENT_DEPOSITS_LIST, { params }),
  detail: (id) => http.get(PAYMENT_DEPOSIT_DETAIL(id)),
  update: (id, data) => http.patch(PAYMENT_DEPOSIT_DETAIL(id), data),
};
