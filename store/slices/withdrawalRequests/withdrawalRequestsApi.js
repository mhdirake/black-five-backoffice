import http from "@/config/http";
import { WITHDRAWAL_REQUESTS_LIST, WITHDRAWAL_REQUEST_DETAIL, WITHDRAWAL_REQUEST_APPROVE, WITHDRAWAL_REQUEST_REJECT, WITHDRAWAL_REQUEST_MARK_PAID, WITHDRAWAL_REQUEST_CANCEL } from "./api";

export const withdrawalRequestsApi = {
  list:     (params)     => http.get(WITHDRAWAL_REQUESTS_LIST, { params }),
  detail:   (id)         => http.get(WITHDRAWAL_REQUEST_DETAIL(id)),
  update:   (id, data)   => http.patch(WITHDRAWAL_REQUEST_DETAIL(id), data),
  approve:  (id)         => http.post(WITHDRAWAL_REQUEST_APPROVE(id)),
  reject:   (id, data)   => http.post(WITHDRAWAL_REQUEST_REJECT(id), data),
  markPaid: (id)         => http.post(WITHDRAWAL_REQUEST_MARK_PAID(id)),
  cancel:   (id)         => http.post(WITHDRAWAL_REQUEST_CANCEL(id)),
};
