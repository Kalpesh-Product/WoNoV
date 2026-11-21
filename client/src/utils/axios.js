import axios from "axios";

const baseURL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_PROD_LINK
    : import.meta.env.VITE_DEV_LINK;

export const api = axios.create({ baseURL });

export const axiosPrivate = axios.create({
  baseURL,
  withCredentials: true,
});
