import http from "@/config/http";
import { AUCTION_PARTICIPATIONS_LIST, AUCTION_PARTICIPATION_DETAIL } from "./api";

export const auctionParticipationsApi = {
  list: (params) => http.get(AUCTION_PARTICIPATIONS_LIST, { params }),
  detail: (id) => http.get(AUCTION_PARTICIPATION_DETAIL(id)),
};
