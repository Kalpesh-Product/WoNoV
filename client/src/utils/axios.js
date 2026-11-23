import axios from "axios";

// "/" fallback: an empty baseURL leaves "api/..." (no leading slash) relative to the current page path
const baseURL =
  (import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_LINK
    : import.meta.env.VITE_DEV_LINK) || "/";

export const api = axios.create({ baseURL });

export const axiosPrivate = axios.create({
  baseURL,
  withCredentials: true,
});
