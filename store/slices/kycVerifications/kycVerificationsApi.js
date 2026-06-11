import http from "@/config/http";
import { KYC_VERIFICATIONS_LIST, KYC_VERIFICATION_DETAIL, KYC_VERIFICATION_APPROVE, KYC_VERIFICATION_REJECT } from "./api";

export const kycVerificationsApi = {
  list: (params) => http.get(KYC_VERIFICATIONS_LIST, { params }),
  detail: (id) => http.get(KYC_VERIFICATION_DETAIL(id)),
  update: (id, data) => http.patch(KYC_VERIFICATION_DETAIL(id), data),
  approve: (id) => http.post(KYC_VERIFICATION_APPROVE(id)),
  reject: (id, data) => http.post(KYC_VERIFICATION_REJECT(id), data),
};
