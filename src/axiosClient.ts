import axios from "axios";

const backendUrl = import.meta.env.VITE_API_URL_BACKEND || "";

const sessionStorageKeyForPath = () => {
  const path = window.location.pathname;
  if (path.startsWith("/beesee/ecommerce")) return "beesee.auth.ecommerce";
  return "beesee.auth.technician";
};

const getCurrentAreaToken = () => {
  let areaToken: string | null = null;
  try {
    const storedSession = localStorage.getItem(sessionStorageKeyForPath());
    areaToken = storedSession ? (JSON.parse(storedSession)?.token as string | null) : null;
  } catch { /* fall back to the generic AuthContext token below */ }

  return areaToken || localStorage.getItem("token");
};
// In development, always use Vite's same-origin proxy. This avoids direct
// LAN-origin requests (and their CORS failures) regardless of the configured
// backend host.
const shouldUseDevProxy = import.meta.env.DEV;

const axiosClient = axios.create({
  // Keep the same API prefix in development and production. In development
  // this routes through Vite's /api proxy instead of calling the LAN host
  // directly; in production it targets the configured backend host.
  baseURL: shouldUseDevProxy ? "/api" : `${backendUrl}/api`,
  withCredentials: false,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getCurrentAreaToken();
    // The development-only demo account is a UI access flag, not a JWT. Do
    // not send it to the local API; its development middleware supplies a
    // valid test identity when this header is absent.
    const isDevelopmentDemoToken =
      import.meta.env.DEV && token === "development-demo-ecommerce-token";

    if (token && !isDevelopmentDemoToken) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  // Existing services were written for the response-body contract. Returning
  // the full Axios response adds an extra `.data` layer to every API result.
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;
    const requestConfig = error?.config as (typeof error.config & { _retriedWithoutAuth?: boolean }) | undefined;
    const responseData = error?.response?.data;
    const message = responseData?.message
      || responseData?.error
      || (typeof responseData === "string" && responseData.trim())
      || error?.message
      || "Request failed";

    if (status === 401) {
      localStorage.removeItem(sessionStorageKeyForPath());
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // The local API deliberately supplies a development user when an
      // Authorization header is absent. A stale token from another backend
      // (or the UI's demo account) prevents that fallback, so retry once
      // without the invalid header.
      if (import.meta.env.DEV && requestConfig && !requestConfig._retriedWithoutAuth) {
        requestConfig._retriedWithoutAuth = true;
        delete requestConfig.headers?.Authorization;
        return axiosClient.request(requestConfig);
      }
    }
    console.error("API request failed:", {
      method: error?.config?.method?.toUpperCase(),
      url: error?.config?.url,
      status,
      message,
    });
    return Promise.reject(error);
  }
);

export default axiosClient;
