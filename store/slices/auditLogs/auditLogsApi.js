import http from "@/config/http";
import { AUDIT_LOGS_LIST, AUDIT_LOG_DETAIL } from "./api";

export const auditLogsApi = {
  list: (params) => http.get(AUDIT_LOGS_LIST, { params }),
  detail: (id) => http.get(AUDIT_LOG_DETAIL(id)),
};
