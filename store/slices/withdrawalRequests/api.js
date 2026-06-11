export const WITHDRAWAL_REQUESTS_LIST        = "/api/backoffice/withdrawal-requests";
export const WITHDRAWAL_REQUEST_DETAIL      = (id) => `/api/backoffice/withdrawal-requests/${id}`;
export const WITHDRAWAL_REQUEST_APPROVE     = (id) => `/api/backoffice/withdrawal-requests/${id}/approve`;
export const WITHDRAWAL_REQUEST_REJECT      = (id) => `/api/backoffice/withdrawal-requests/${id}/reject`;
export const WITHDRAWAL_REQUEST_MARK_PAID   = (id) => `/api/backoffice/withdrawal-requests/${id}/mark-paid`;
export const WITHDRAWAL_REQUEST_CANCEL      = (id) => `/api/backoffice/withdrawal-requests/${id}/cancel`;
