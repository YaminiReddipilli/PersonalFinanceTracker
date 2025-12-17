import React, { useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import EnhancedCharts from '../../components/EnhancedCharts';
import Pagination from '../../components/Pagination';
import { useDashboard } from '../../hooks/useApi';
import { formatCurrency, formatDate } from '../../utils/helper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity, FiPieChart, FiBarChart, FiList, FiFilter } from 'react-icons/fi';

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState('overview');
  const [filterType, setFilterType] = useState('all');
  
  const { data, loading, error } = useDashboard({ page: currentPage, limit: 10 });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view !== 'transactions') {
      setCurrentPage(1); // Reset pagination when switching views
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const financialStats = [
    {
      title: 'Total Balance',
      amount: formatCurrency(data?.totalBalance || 0),
      trend: data?.totalBalance >= 0 ? '+' : '',
      trendType: data?.totalBalance >= 0 ? 'positive' : 'negative',
      icon: FiDollarSign,
    },
    {
      title: 'Total Income',
      amount: formatCurrency(data?.totalIncome || 0),
      trend: `+${data?.last60DaysIncome?.transactions?.length || 0} this month`,
      trendType: 'positive',
      icon: FiTrendingUp,
    },
    {
      title: 'Total Expenses',
      amount: formatCurrency(data?.totalExpenses || 0),
      trend: `${data?.last30DaysExpenses?.transactions?.length || 0} this month`,
      trendType: 'negative',
      icon: FiTrendingDown,
    },
    {
      title: 'Monthly Savings',
      amount: formatCurrency((data?.last60DaysIncome?.total || 0) - (data?.last30DaysExpenses?.total || 0)),
      trend: 'Last 30 days',
      trendType: 'positive',
      icon: FiActivity,
    },
  ];

  const trendData = data?.last60DaysIncome?.transactions?.slice(0, 7).map((income, index) => ({
    date: formatDate(income.date),
    income: income.amount,
    expenses: data?.last30DaysExpenses?.transactions?.[index]?.amount || 0,
  })) || [];

  const distributionData = [
    { name: 'Income', value: data?.totalIncome || 0, color: '#10B981' },
    { name: 'Expenses', value: data?.totalExpenses || 0, color: '#EF4444' },
  ];

  // Filter transactions based on selected type
  const transactionList = data?.transactions?.data?.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type === filterType;
  }) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Financial Dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Track your financial journey and make informed decisions
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-4">
              <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                <button
                  onClick={() => handleViewChange('overview')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                    activeView === 'overview'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiBarChart className="mr-2 h-4 w-4" />
                  Overview
                </button>
                <button
                  onClick={() => handleViewChange('analytics')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                    activeView === 'analytics'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiPieChart className="mr-2 h-4 w-4" />
                  Analytics
                </button>
                <button
                  onClick={() => handleViewChange('transactions')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                    activeView === 'transactions'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiList className="mr-2 h-4 w-4" />
                  Transactions
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeView === 'overview' && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {financialStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.title} className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Icon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                            <dd className="text-lg font-medium text-gray-900">{stat.amount}</dd>
                          </dl>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center text-sm">
                          <span className={`font-medium ${
                            stat.trendType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Income vs Expenses Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Income vs Expenses Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                <button
                  onClick={() => handleViewChange('transactions')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.recentTransactions?.slice(0, 5).map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.type === 'income' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.source || transaction.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeView === 'analytics' && (
          <EnhancedCharts 
            expenseData={data?.allExpenses || []} 
            incomeData={data?.allIncome || []}
          />
        )}

        {activeView === 'transactions' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">All Transactions</h3>
                
                <div className="flex items-center space-x-2">
                  <FiFilter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Transactions</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expenses Only</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category/Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionList.map((transaction, index) => (
                    <tr key={transaction._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.source || transaction.category || 'Other'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination controls for transaction navigation */}
            {data?.transactions?.pagination && (
              <Pagination
                currentPage={data.transactions.pagination.currentPage}
                totalPages={data.transactions.pagination.totalPages}
                totalItems={data.transactions.pagination.totalItems}
                itemsPerPage={data.transactions.pagination.itemsPerPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Home;
