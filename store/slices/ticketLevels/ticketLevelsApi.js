import http from "@/config/http";
import { TICKET_LEVELS_LIST, TICKET_LEVEL_DETAIL } from "./api";

export const ticketLevelsApi = {
  list: (params) => http.get(TICKET_LEVELS_LIST, { params }),
  create: (data) => http.post(TICKET_LEVELS_LIST, data),
  update: (id, data) => http.patch(TICKET_LEVEL_DETAIL(id), data),
  delete: (id) => http.delete(TICKET_LEVEL_DETAIL(id)),
};
