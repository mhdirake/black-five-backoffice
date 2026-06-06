import http from "@/config/http";
import { AUCTION_CREATE, AUCTION_DETAIL, AUCTIONS_LIST } from "./api";

export const auctionsApi = {
  list: (params) => http.get(AUCTIONS_LIST, { params }),
  create: (data) => http.post(AUCTION_CREATE, data),
  detail: (id) => http.get(AUCTION_DETAIL(id)),
};
