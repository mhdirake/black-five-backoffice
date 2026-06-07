import axios from "axios";
import { toast } from "react-toastify";

const PERMISSION_NOT_ALLOWED = 403;
const USER_NOT_LOGGED_IN = 401;

const isClient = typeof window !== "undefined";

const responseHandler = (response) => {
  return response?.data;
};

const requestHandler = async (config) => {
  let token = null;

  if (isClient) {
    const { getSession } = await import("next-auth/react");
    const session = await getSession();

    if (session?.error === "RefreshAccessTokenError") {
      const { logout } = await import("@/config/authClient");
      await logout("/");
      return Promise.reject({ response: { status: 401 }, config });
    }

    token = session?.accessToken;

    if (!token) {
      token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("userToken");
    }
  } else {
    const { cookies } = await import("next/headers");
    const { getNextAuthToken } = await import("@/config/nextAuthToken");
    const cookieStore = await cookies();
    const nextAuthToken = await getNextAuthToken(cookieStore);

    token = nextAuthToken?.accessToken;
  }

  if (!token && config.requireAuth) {
    return Promise.reject({
      response: {
        status: USER_NOT_LOGGED_IN,
        data: null,
      },
      config,
    });
  }

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const errorHandler = async (error) => {
  const status = error?.response?.status;
  const errors = error?.response?.data?.errors;

  if (
    isClient &&
    [USER_NOT_LOGGED_IN, PERMISSION_NOT_ALLOWED].includes(status)
  ) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userToken");

    const { logout } = await import("@/config/authClient");
    await logout("/");

    return Promise.reject(error);
  }

  if (isClient && errors && typeof errors === "object") {
    Object.entries(errors).forEach(([_, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((msg) => toast.error(String(msg)));
      }
    });
  }

  return Promise.reject(error);
};

const http = axios.create({
  baseURL: isClient ? "" : process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

http.interceptors.request.use(requestHandler, errorHandler);
http.interceptors.response.use(responseHandler, errorHandler);

export default http;
