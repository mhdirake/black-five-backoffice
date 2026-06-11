import http from "@/config/http";
import { AUCTION_RUNS_LIST, AUCTION_RUN_DETAIL, AUCTION_RUN_START, AUCTION_RUN_FINISH, AUCTION_RUN_CANCEL } from "./api";

export const auctionRunsApi = {
  list:   (params) => http.get(AUCTION_RUNS_LIST, { params }),
  detail: (id)     => http.get(AUCTION_RUN_DETAIL(id)),
  update: (id, data) => http.patch(AUCTION_RUN_DETAIL(id), data),
  start:  (id)     => http.post(AUCTION_RUN_START(id)),
  finish: (id)     => http.post(AUCTION_RUN_FINISH(id)),
  cancel: (id)     => http.post(AUCTION_RUN_CANCEL(id)),
};
