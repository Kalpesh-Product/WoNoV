import axios from "axios";

export const api = axios.create({
  baseURL: "https://wono-admin-panel-be.vercel.app/",
});

export const axiosPrivate = axios.create({
  baseURL: "https://wono-admin-panel-be.vercel.app/",
  withCredentials: true,
});
// export const api = axios.create({
//   baseURL: "http://localhost:5000/",
// });

// export const axiosPrivate = axios.create({
//   baseURL: "http://localhost:5000/",
//   withCredentials: true,
// });
