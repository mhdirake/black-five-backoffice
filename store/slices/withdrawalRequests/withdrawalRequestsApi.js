import http from "@/config/http";
import { WITHDRAWAL_REQUESTS_LIST, WITHDRAWAL_REQUEST_DETAIL } from "./api";

export const withdrawalRequestsApi = {
  list: (params) => http.get(WITHDRAWAL_REQUESTS_LIST, { params }),
  detail: (id) => http.get(WITHDRAWAL_REQUEST_DETAIL(id)),
  update: (id, data) => http.patch(WITHDRAWAL_REQUEST_DETAIL(id), data),
};
