import http from "@/config/http";
import { PAYMENT_DEPOSITS_LIST, PAYMENT_DEPOSIT_DETAIL, PAYMENT_DEPOSIT_MARK_PAID, PAYMENT_DEPOSIT_MARK_FAILED, PAYMENT_DEPOSIT_CANCEL } from "./api";

export const paymentDepositsApi = {
  list:       (params)   => http.get(PAYMENT_DEPOSITS_LIST, { params }),
  detail:     (id)       => http.get(PAYMENT_DEPOSIT_DETAIL(id)),
  update:     (id, data) => http.patch(PAYMENT_DEPOSIT_DETAIL(id), data),
  markPaid:   (id)       => http.post(PAYMENT_DEPOSIT_MARK_PAID(id)),
  markFailed: (id)       => http.post(PAYMENT_DEPOSIT_MARK_FAILED(id)),
  cancel:     (id)       => http.post(PAYMENT_DEPOSIT_CANCEL(id)),
};
