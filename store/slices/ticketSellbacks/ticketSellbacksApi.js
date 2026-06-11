import http from "@/config/http";
import { TICKET_SELLBACKS_LIST, TICKET_SELLBACK_DETAIL } from "./api";

export const ticketSellbacksApi = {
  list: (params) => http.get(TICKET_SELLBACKS_LIST, { params }),
  detail: (id) => http.get(TICKET_SELLBACK_DETAIL(id)),
  update: (id, data) => http.patch(TICKET_SELLBACK_DETAIL(id), data),
};
