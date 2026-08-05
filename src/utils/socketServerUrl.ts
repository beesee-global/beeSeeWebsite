/**
 * Avoid storing a changing DHCP/LAN address in the frontend environment.
 * In Vite development the API is always on the same host as the page, port
 * 4003. Production keeps using the explicit public API domain.
 */
export const getSocketServerUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL_BACKEND as string | undefined;

  if (import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:4003`;
  }

  return configuredUrl || window.location.origin;
};
