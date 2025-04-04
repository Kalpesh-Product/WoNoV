import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_DEV_LINK ,
});

export const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_DEV_LINK ,
  withCredentials: true,
});

