export const TICKET_SELLBACKS_LIST      = "/api/backoffice/ticket-sellbacks";
export const TICKET_SELLBACK_DETAIL     = (id) => `/api/backoffice/ticket-sellbacks/${id}`;
export const TICKET_SELLBACK_COMPLETE   = (id) => `/api/backoffice/ticket-sellbacks/${id}/complete`;
export const TICKET_SELLBACK_FAIL       = (id) => `/api/backoffice/ticket-sellbacks/${id}/fail`;
export const TICKET_SELLBACK_CANCEL     = (id) => `/api/backoffice/ticket-sellbacks/${id}/cancel`;
