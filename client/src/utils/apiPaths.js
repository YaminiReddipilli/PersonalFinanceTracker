export const API_BASE_URL = "https://personalfinancetracker-3eqq.onrender.com";

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        GET_USER: `${API_BASE_URL}/auth/getuser`,
        UPLOAD_IMAGE: `${API_BASE_URL}/auth/upload-image`,
    },
    DASHBOARD:{
        GET: `${API_BASE_URL}/dashboard`,
    },
    INCOME: {
        ADD: `${API_BASE_URL}/income/add`,
        GET: `${API_BASE_URL}/income/get`,
        DOWNLOAD: `${API_BASE_URL}/income/downloadexcel`,
        DELETE: (incomeId) => `${API_BASE_URL}/income/${incomeId}`,
    },
    EXPENSE: {
        ADD: `${API_BASE_URL}/expenses/add`,
        GET: `${API_BASE_URL}/expenses/get`,
        DOWNLOAD: `${API_BASE_URL}/expenses/downloadexcel`,
        DELETE: (expenseId) => `${API_BASE_URL}/expenses/${expenseId}`,
    },
    RECEIPT: {
        EXTRACT: `${API_BASE_URL}/receipt/extract`,
        ADD_EXPENSE: `${API_BASE_URL}/receipt/add-expense`,
    },
};
