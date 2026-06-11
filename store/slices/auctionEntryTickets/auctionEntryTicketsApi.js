import http from "@/config/http";
import { AUCTION_ENTRY_TICKETS_LIST, AUCTION_ENTRY_TICKET_DETAIL } from "./api";

export const auctionEntryTicketsApi = {
  list:   (params) => http.get(AUCTION_ENTRY_TICKETS_LIST, { params }),
  detail: (id)     => http.get(AUCTION_ENTRY_TICKET_DETAIL(id)),
};
