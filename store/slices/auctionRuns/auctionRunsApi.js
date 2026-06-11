import http from "@/config/http";
import { AUCTION_RUNS_LIST, AUCTION_RUN_DETAIL } from "./api";

export const auctionRunsApi = {
  list: (params) => http.get(AUCTION_RUNS_LIST, { params }),
  detail: (id) => http.get(AUCTION_RUN_DETAIL(id)),
  update: (id, data) => http.patch(AUCTION_RUN_DETAIL(id), data),
};
