import http from "@/config/http";
import { TICKET_SELLBACKS_LIST, TICKET_SELLBACK_DETAIL, TICKET_SELLBACK_COMPLETE, TICKET_SELLBACK_FAIL, TICKET_SELLBACK_CANCEL } from "./api";

export const ticketSellbacksApi = {
  list:     (params)   => http.get(TICKET_SELLBACKS_LIST, { params }),
  detail:   (id)       => http.get(TICKET_SELLBACK_DETAIL(id)),
  update:   (id, data) => http.patch(TICKET_SELLBACK_DETAIL(id), data),
  complete: (id)       => http.post(TICKET_SELLBACK_COMPLETE(id)),
  fail:     (id)       => http.post(TICKET_SELLBACK_FAIL(id)),
  cancel:   (id)       => http.post(TICKET_SELLBACK_CANCEL(id)),
};
