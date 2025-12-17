import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../utils/apiPaths';

export const useReceipt = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractExpenseFromReceipt = async (file) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      const response = await axiosInstance.post(API_ENDPOINTS.RECEIPT.EXTRACT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Error processing receipt';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const addExpenseFromReceipt = async (expenseData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.RECEIPT.ADD_EXPENSE, expenseData);
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Error adding expense';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    loading,
    error,
    extractExpenseFromReceipt,
    addExpenseFromReceipt
  };
};
