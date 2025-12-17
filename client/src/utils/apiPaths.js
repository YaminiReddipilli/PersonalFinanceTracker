export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    GET_USER: "/api/v1/auth/me"
  },

  INCOME: {
    ADD: "/api/v1/income",
    GET: "/api/v1/income",
    DELETE: (id) => `/api/v1/income/${id}`
  },

  EXPENSE: {
    ADD: "/api/v1/expenses",
    GET: "/api/v1/expenses",
    DELETE: (id) => `/api/v1/expenses/${id}`
  },

  DASHBOARD: {
    GET: "/api/v1/dashboard"
  },

  RECEIPT: {
    UPLOAD: "/api/v1/receipt"
  }
};
