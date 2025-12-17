// Income source options
export const incomeSourceOptions = [
    'Salary',
    'Business',
    'Freelance',
    'Investment',
    'Rental',
    'Gift',
    'Other'
];

// Expense category options
export const expenseCategoryOptions = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
];

// Income icons
export const incomeIcons = [
    'fa-solid fa-money-bill',
    'fa-solid fa-coins',
    'fa-solid fa-piggy-bank',
    'fa-solid fa-chart-line',
    'fa-solid fa-building',
    'fa-solid fa-gift',
    'fa-solid fa-briefcase'
];

// Expense icons  
export const expenseIcons = [
    'fa-solid fa-utensils',
    'fa-solid fa-car',
    'fa-solid fa-shopping-cart',
    'fa-solid fa-gamepad',
    'fa-solid fa-bolt',
    'fa-solid fa-heart',
    'fa-solid fa-graduation-cap',
    'fa-solid fa-plane',
    'fa-solid fa-ellipsis'
];

// Chart colors
export const chartColors = {
    income: '#10B981',
    expense: '#EF4444',
    balance: '#3B82F6'
};

// Format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
