export const PAYMENT_DEPOSITS_LIST         = "/api/backoffice/payment-deposits";
export const PAYMENT_DEPOSIT_DETAIL        = (id) => `/api/backoffice/payment-deposits/${id}`;
export const PAYMENT_DEPOSIT_MARK_PAID     = (id) => `/api/backoffice/payment-deposits/${id}/mark-paid`;
export const PAYMENT_DEPOSIT_MARK_FAILED   = (id) => `/api/backoffice/payment-deposits/${id}/mark-failed`;
export const PAYMENT_DEPOSIT_CANCEL        = (id) => `/api/backoffice/payment-deposits/${id}/cancel`;
