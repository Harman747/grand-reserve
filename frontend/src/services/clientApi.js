import axios from "axios";

export const clientApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

clientApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("gr_management_user");
      localStorage.removeItem("gr_management_token");
      delete clientApi.defaults.headers.common.Authorization;
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export function setManagementToken(token) {
  if (token) {
    clientApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete clientApi.defaults.headers.common.Authorization;
  }
}
