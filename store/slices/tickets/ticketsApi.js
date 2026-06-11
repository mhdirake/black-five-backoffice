import http from "@/config/http";
import { TICKETS_LIST, TICKET_DETAIL } from "./api";

export const ticketsApi = {
  list: (params) => http.get(TICKETS_LIST, { params }),
  detail: (id) => http.get(TICKET_DETAIL(id)),
};
