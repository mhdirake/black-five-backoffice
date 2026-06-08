import http from "@/config/http";
import { USERS_LIST, USER_DETAIL } from "./api";

export const usersApi = {
  list: (params) => http.get(USERS_LIST, { params }),
  detail: (id) => http.get(USER_DETAIL(id)),
};
