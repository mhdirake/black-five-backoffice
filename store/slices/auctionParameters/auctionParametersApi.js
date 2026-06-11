import http from "@/config/http";
import { AUCTION_PARAMETERS_LIST, AUCTION_PARAMETER_DETAIL } from "./api";

export const auctionParametersApi = {
  list: (params) => http.get(AUCTION_PARAMETERS_LIST, { params }),
  create: (data) => http.post(AUCTION_PARAMETERS_LIST, data),
  detail: (id) => http.get(AUCTION_PARAMETER_DETAIL(id)),
  update: (id, data) => http.patch(AUCTION_PARAMETER_DETAIL(id), data),
  delete: (id) => http.delete(AUCTION_PARAMETER_DETAIL(id)),
};
