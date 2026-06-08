import http from "@/config/http";
import { AUCTION_CREATE, AUCTION_DETAIL, AUCTIONS_LIST, AUCTION_UPDATE } from "./api";

export const auctionsApi = {
  list: (params) => http.get(AUCTIONS_LIST, { params }),
  create: (data) => http.post(AUCTION_CREATE, data),
  detail: (id) => http.get(AUCTION_DETAIL(id)),
  update: (id, data) => http.patch(AUCTION_UPDATE(id), data),
};
