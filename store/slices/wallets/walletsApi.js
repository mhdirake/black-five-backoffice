import http from "@/config/http";
import { WALLETS_LIST, WALLET_DETAIL } from "./api";

export const walletsApi = {
  list: (params) => http.get(WALLETS_LIST, { params }),
  detail: (id) => http.get(WALLET_DETAIL(id)),
};
