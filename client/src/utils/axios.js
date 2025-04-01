import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_PROD_LINK ,
});

export const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_PROD_LINK ,
  withCredentials: true,
});
// export const api = axios.create({
//   baseURL: "http://localhost:5000/",
// });

// export const axiosPrivate = axios.create({
//   baseURL: "http://localhost:5000/",
//   withCredentials: true,
// });
