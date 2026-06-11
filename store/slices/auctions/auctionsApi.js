import http from "@/config/http";
import { AUCTION_CREATE, AUCTION_DETAIL, AUCTIONS_LIST, AUCTION_CHANGE_STATUS } from "./api";

export const auctionsApi = {
  list:         (params)   => http.get(AUCTIONS_LIST, { params }),
  create:       (data)     => http.post(AUCTION_CREATE, data),
  detail:       (id)       => http.get(AUCTION_DETAIL(id)),
  update:       (id, data) => http.patch(AUCTION_DETAIL(id), data),
  delete:       (id)       => http.delete(AUCTION_DETAIL(id)),
  changeStatus: (id, data) => http.post(AUCTION_CHANGE_STATUS(id), data),
};
