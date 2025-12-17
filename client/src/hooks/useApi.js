import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../utils/apiPaths';

export const useDashboard = (params = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async (queryParams = {}) => {
        try {
            setLoading(true);
            const searchParams = new URLSearchParams({
                ...params,
                ...queryParams
            }).toString();
            
            const url = searchParams ? `${API_ENDPOINTS.DASHBOARD.GET}?${searchParams}` : API_ENDPOINTS.DASHBOARD.GET;
            const response = await axiosInstance.get(url);
            setData(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [params.page, params.limit]);

    return { data, loading, error, refetch: fetchDashboardData };
};

export const useIncome = () => {
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchIncomes = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.INCOME.GET);
            setIncomes(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch incomes');
        } finally {
            setLoading(false);
        }
    };

    const addIncome = async (incomeData) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.INCOME.ADD, incomeData);
            setIncomes(prev => [response.data, ...prev]);
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to add income' 
            };
        }
    };

    const deleteIncome = async (incomeId) => {
        try {
            await axiosInstance.delete(API_ENDPOINTS.INCOME.DELETE(incomeId));
            setIncomes(prev => prev.filter(income => income._id !== incomeId));
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to delete income' 
            };
        }
    };

    const downloadExcel = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.INCOME.DOWNLOAD, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'income_details.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to download excel' 
            };
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, []);

    return { 
        incomes, 
        loading, 
        error, 
        addIncome, 
        deleteIncome, 
        downloadExcel,
        refetch: fetchIncomes 
    };
};

export const useExpense = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.EXPENSE.GET);
            setExpenses(response.data.expenses);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    };

    const addExpense = async (expenseData) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.EXPENSE.ADD, expenseData);
            setExpenses(prev => [response.data.expense, ...prev]);
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to add expense' 
            };
        }
    };

    const deleteExpense = async (expenseId) => {
        try {
            await axiosInstance.delete(API_ENDPOINTS.EXPENSE.DELETE(expenseId));
            setExpenses(prev => prev.filter(expense => expense._id !== expenseId));
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to delete expense' 
            };
        }
    };

    const downloadExcel = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.EXPENSE.DOWNLOAD, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'expense_details.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to download excel' 
            };
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    return { 
        expenses, 
        loading, 
        error, 
        addExpense, 
        deleteExpense, 
        downloadExcel,
        refetch: fetchExpenses 
    };
};
