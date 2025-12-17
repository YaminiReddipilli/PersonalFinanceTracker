import React, { useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ReceiptUpload from '../../components/ReceiptUpload';
import { useExpense } from '../../hooks/useApi';
import { formatCurrency, formatDate } from '../../utils/helper';
import { expenseCategoryOptions, expenseIcons } from '../../utils/data';
import { FiPlus, FiDownload, FiTrash2, FiCalendar, FiDollarSign, FiUpload } from 'react-icons/fi';

const Expense = () => {
  const { expenses, loading, error, addExpense, deleteExpense, downloadExcel, refetch } = useExpense();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    icon: expenseIcons[0],
    date: new Date().toISOString().split('T')[0]
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (!formData.amount || !formData.category || !formData.date) {
        throw new Error('All fields are required');
      }

      if (parseFloat(formData.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const result = await addExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });

      if (result.success) {
        setFormData({
          amount: '',
          category: '',
          icon: expenseIcons[0],
          date: new Date().toISOString().split('T')[0]
        });
        setShowAddForm(false);
      } else {
        setFormError(result.error);
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      const result = await deleteExpense(expenseId);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleDownload = async () => {
    const result = await downloadExcel();
    if (!result.success) {
      alert(result.error);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Expense Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Track and manage your expenses
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiDownload className="mr-2 h-4 w-4" />
                Download Excel
              </button>
              <button
                onClick={() => setShowReceiptUpload(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiUpload className="mr-2 h-4 w-4" />
                Upload Receipt
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiDollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              <p className="text-sm text-gray-500">{expenses.length} expense records</p>
            </div>
          </div>
        </div>

        {/* Add Expense Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Add New Expense</h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">{formError}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select category</option>
                    {expenseCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {expenseIcons.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Expense List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Expense Records</h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No expense records found. Add your first expense!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <i className={`${expense.icon} mr-3 text-red-600`}></i>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{expense.category}</span>
                            {expense.source === 'receipt' && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full w-fit mt-1">
                                From Receipt
                              </span>
                            )}
                            {expense.merchant && (
                              <span className="text-xs text-gray-500 mt-1">{expense.merchant}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2 h-4 w-4" />
                          {formatDate(expense.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Receipt Upload Modal */}
        {showReceiptUpload && (
          <ReceiptUpload
            onExpenseAdded={() => {
              refetch();
              setShowReceiptUpload(false);
            }}
            onClose={() => setShowReceiptUpload(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Expense;