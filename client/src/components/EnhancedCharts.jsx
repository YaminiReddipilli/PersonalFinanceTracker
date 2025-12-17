import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { FiCalendar, FiFilter, FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart } from 'react-icons/fi';

const EnhancedCharts = ({ expenseData, incomeData }) => {
  const [timeFilter, setTimeFilter] = useState('monthly'); // 'monthly', 'yearly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Enhanced color palettes for better visual appeal
  const expenseColors = {
    'Food & Dining': '#EF4444',
    'Transportation': '#F97316', 
    'Shopping': '#F59E0B',
    'Entertainment': '#EAB308',
    'Bills & Utilities': '#84CC16',
    'Healthcare': '#22C55E',
    'Education': '#06B6D4',
    'Travel': '#3B82F6',
    'Housing': '#8B5CF6',
    'Other': '#64748B'
  };

  const incomeColors = {
    'Salary': '#10B981',
    'Business': '#059669',
    'Freelance': '#0D9488',
    'Investment': '#0891B2',
    'Rental': '#0284C7',
    'Gift': '#3B82F6',
    'Bonus': '#6366F1',
    'Other': '#64748B'
  };

  // Filter data based on time period
  const filterDataByTime = (data, type) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      
      if (timeFilter === 'monthly') {
        return itemDate.getMonth() + 1 === selectedMonth && 
               itemDate.getFullYear() === selectedYear;
      } else {
        return itemDate.getFullYear() === selectedYear;
      }
    });
  };

  // Process expense data by category
  const processExpensesByCategory = () => {
    const filteredExpenses = filterDataByTime(expenseData, 'expense');
    const categoryTotals = {};

    filteredExpenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
      color: expenseColors[category] || '#64748B'
    }));
  };

  // Process income data by source
  const processIncomeBySource = () => {
    const filteredIncome = filterDataByTime(incomeData, 'income');
    const sourceTotals = {};

    filteredIncome.forEach(income => {
      const source = income.source || 'Other';
      sourceTotals[source] = (sourceTotals[source] || 0) + income.amount;
    });

    return Object.entries(sourceTotals).map(([source, amount]) => ({
      name: source,
      value: amount,
      color: incomeColors[source] || '#64748B'
    }));
  };

  // Process monthly trends for the entire year
  const processMonthlyTrends = () => {
    const months = [];
    const currentYear = selectedYear;
    
    for (let month = 1; month <= 12; month++) {
      const monthExpenses = expenseData?.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() + 1 === month && 
               expenseDate.getFullYear() === currentYear;
      }) || [];
      
      const monthIncome = incomeData?.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() + 1 === month && 
               incomeDate.getFullYear() === currentYear;
      }) || [];

      const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);

      months.push({
        month: new Date(currentYear, month - 1).toLocaleDateString('en-US', { month: 'short' }),
        expenses: totalExpenses,
        income: totalIncome,
        savings: totalIncome - totalExpenses
      });
    }
    
    return months;
  };

  // Process yearly comparison (last 3 years)
  const processYearlyComparison = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 2; year <= currentYear; year++) {
      const yearExpenses = expenseData?.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === year;
      }) || [];
      
      const yearIncome = incomeData?.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getFullYear() === year;
      }) || [];

      const totalExpenses = yearExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = yearIncome.reduce((sum, inc) => sum + inc.amount, 0);

      years.push({
        year: year.toString(),
        expenses: totalExpenses,
        income: totalIncome,
        savings: totalIncome - totalExpenses
      });
    }
    
    return years;
  };

  // Calculate savings analytics
  const calculateSavingsAnalytics = () => {
    const monthlyTrends = processMonthlyTrends();
    const totalSavings = monthlyTrends.reduce((sum, month) => sum + month.savings, 0);
    const avgMonthlySavings = totalSavings / 12;
    const bestMonth = monthlyTrends.reduce((best, month) => 
      month.savings > best.savings ? month : best, monthlyTrends[0]);
    const worstMonth = monthlyTrends.reduce((worst, month) => 
      month.savings < worst.savings ? month : worst, monthlyTrends[0]);

    return {
      totalSavings,
      avgMonthlySavings,
      bestMonth,
      worstMonth,
      savingsRate: totalSavings > 0 ? (totalSavings / (totalSavings + monthlyTrends.reduce((sum, month) => sum + month.expenses, 0))) * 100 : 0
    };
  };

  const expenseChartData = processExpensesByCategory();
  const incomeChartData = processIncomeBySource();
  const monthlyTrendsData = processMonthlyTrends();
  const yearlyComparisonData = processYearlyComparison();
  const savingsAnalytics = calculateSavingsAnalytics();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Control Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FiPieChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Financial Analytics</h3>
              <p className="text-sm text-gray-600">Track your spending patterns and savings</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* Time Period Filter */}
            <div className="flex items-center space-x-2">
              <FiCalendar className="h-4 w-4 text-gray-500" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="monthly">Monthly View</option>
                <option value="yearly">Yearly View</option>
              </select>
            </div>

            {/* Month Selector */}
            {timeFilter === 'monthly' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleDateString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            )}

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Savings Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Savings</p>
              <p className="text-2xl font-bold text-green-600">${savingsAnalytics.totalSavings.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiDollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Monthly Savings</p>
              <p className="text-2xl font-bold text-blue-600">${savingsAnalytics.avgMonthlySavings.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiTrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Month</p>
              <p className="text-lg font-bold text-green-600">{savingsAnalytics.bestMonth?.month}</p>
              <p className="text-sm text-gray-500">${savingsAnalytics.bestMonth?.savings.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiTrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Savings Rate</p>
              <p className="text-2xl font-bold text-purple-600">{savingsAnalytics.savingsRate.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiPieChart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Breakdown Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">
              Expenses by Category
            </h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {timeFilter === 'monthly' ? 
                `${new Date(0, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long' })} ${selectedYear}` : 
                selectedYear}
            </span>
          </div>
          
          {expenseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell key={`expense-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <div className="text-center">
                <FiTrendingDown className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No expense data for selected period</p>
              </div>
            </div>
          )}
        </div>

        {/* Income Breakdown Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">
              Income by Source
            </h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {timeFilter === 'monthly' ? 
                `${new Date(0, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long' })} ${selectedYear}` : 
                selectedYear}
            </span>
          </div>
          
          {incomeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={incomeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeChartData.map((entry, index) => (
                    <Cell key={`income-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <div className="text-center">
                <FiTrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No income data for selected period</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Monthly Trends</h4>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {selectedYear}
          </span>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={monthlyTrendsData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" />
            <YAxis formatter={(value) => `$${value.toLocaleString()}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="savings" 
              fill="#3B82F6" 
              fillOpacity={0.3}
              stroke="#3B82F6"
              name="Net Savings"
            />
            <Bar dataKey="income" fill="#10B981" name="Income" />
            <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Category Comparison Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Category Breakdown</h4>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Bar Chart View
          </span>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={expenseChartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis type="number" formatter={(value) => `$${value.toLocaleString()}`} />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Bar dataKey="value" name="Amount">
              {expenseChartData.map((entry, index) => (
                <Cell key={`bar-cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Yearly Comparison */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Yearly Comparison</h4>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Last 3 Years
          </span>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={yearlyComparisonData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="year" />
            <YAxis formatter={(value) => `$${value.toLocaleString()}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              strokeWidth={3}
              name="Expenses"
            />
            <Line 
              type="monotone" 
              dataKey="savings" 
              stroke="#3B82F6" 
              strokeWidth={3}
              name="Net Savings"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnhancedCharts;
