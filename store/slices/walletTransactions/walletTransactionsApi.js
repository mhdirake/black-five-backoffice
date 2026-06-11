import http from "@/config/http";
import { WALLET_TRANSACTIONS_LIST, WALLET_TRANSACTION_DETAIL } from "./api";

export const walletTransactionsApi = {
  list: (params) => http.get(WALLET_TRANSACTIONS_LIST, { params }),
  detail: (id) => http.get(WALLET_TRANSACTION_DETAIL(id)),
};
