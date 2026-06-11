import http from "@/config/http";

const BASE = "/api/backoffice/dashboard";

export const dashboardApi = {
  overview:   (params) => http.get(`${BASE}/overview`,   { params }),
  revenue:    (params) => http.get(`${BASE}/revenue`,    { params }),
  auctions:   (params) => http.get(`${BASE}/auctions`,   { params }),
  finance:    (params) => http.get(`${BASE}/finance`,    { params }),
  users:      (params) => http.get(`${BASE}/users`,      { params }),
  operations: (params) => http.get(`${BASE}/operations`, { params }),
};
