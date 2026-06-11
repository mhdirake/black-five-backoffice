import http from "@/config/http";
import { AUCTION_DISCOUNT_TICKET_USAGES_LIST, AUCTION_DISCOUNT_TICKET_USAGE_DETAIL } from "./api";

export const auctionDiscountTicketUsagesApi = {
  list:   (params) => http.get(AUCTION_DISCOUNT_TICKET_USAGES_LIST, { params }),
  detail: (id)     => http.get(AUCTION_DISCOUNT_TICKET_USAGE_DETAIL(id)),
};
