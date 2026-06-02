import { useState } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle, Edit2, Save, X, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Budget = ({ data, onSave, showToast }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const budgets = data.settings?.budgets || {};
  const expenseCategories = data.categories.expense || [];

  // Calculate current month spending by category
  const getCurrentMonthSpending = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthTransactions = data.transactions.filter(
      txn => txn.type === 'expense' && txn.date.startsWith(currentMonth)
    );

    const spending = {};
    expenseCategories.forEach(cat => {
      spending[cat] = monthTransactions
        .filter(txn => txn.category === cat)
        .reduce((sum, txn) => sum + txn.amount, 0);
    });

    return spending;
  };

  const currentSpending = getCurrentMonthSpending();

  const handleEditBudget = (category) => {
    setEditingCategory(category);
    setEditAmount(budgets[category]?.toString() || '');
  };

  const handleSaveBudget = () => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      showToast('Please enter a valid budget amount', 'error');
      return;
    }

    const updatedData = {
      ...data,
      settings: {
        ...data.settings,
        budgets: {
          ...budgets,
          [editingCategory]: parseFloat(editAmount)
        }
      }
    };

    onSave(updatedData, ['settings']);
    showToast(`Budget set for ${editingCategory}`, 'success');
    setEditingCategory(null);
    setEditAmount('');
  };

  const handleRemoveBudget = (category) => {
    if (!confirm(`Remove budget for ${category}?`)) return;

    const updatedBudgets = { ...budgets };
    delete updatedBudgets[category];

    const updatedData = {
      ...data,
      settings: {
        ...data.settings,
        budgets: updatedBudgets
      }
    };

    onSave(updatedData, ['settings']);
    showToast(`Budget removed for ${category}`, 'success');
  };

  const handleAddCategory = () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      showToast('Please enter a category name', 'error');
      return;
    }

    if (expenseCategories.includes(trimmedCategory)) {
      showToast('Category already exists', 'error');
      return;
    }

    const updatedData = {
      ...data,
      categories: {
        ...data.categories,
        expense: [...expenseCategories, trimmedCategory]
      }
    };

    onSave(updatedData, ['categories']);
    showToast(`Category "${trimmedCategory}" added`, 'success');
    setNewCategory('');
    setShowAddCategory(false);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditAmount('');
  };

  const getBudgetStatus = (category) => {
    const budget = budgets[category];
    const spent = currentSpending[category] || 0;

    if (!budget) return { status: 'none', percentage: 0, remaining: 0 };

    const percentage = (spent / budget) * 100;
    const remaining = budget - spent;

    let status = 'good';
    if (percentage >= 100) status = 'exceeded';
    else if (percentage >= 80) status = 'warning';

    return { status, percentage, remaining, budget, spent };
  };

  const getTotalBudget = () => {
    return Object.values(budgets).reduce((sum, amount) => sum + amount, 0);
  };

  const getTotalSpent = () => {
    return Object.values(currentSpending).reduce((sum, amount) => sum + amount, 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'exceeded':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getProgressBarColor = (status) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'exceeded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const totalBudget = getTotalBudget();
  const totalSpent = getTotalSpent();
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Prepare pie chart data
  const getPieChartData = () => {
    const chartData = expenseCategories
      .filter(cat => (currentSpending[cat] || 0) > 0)
      .map(cat => ({
        name: cat,
        value: currentSpending[cat] || 0,
        budget: budgets[cat] || 0
      }))
      .sort((a, b) => b.value - a.value);
    
    return chartData;
  };

  const pieChartData = getPieChartData();
  
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Spent: {formatCurrency(data.value)}</p>
          {data.budget > 0 && (
            <p className="text-sm text-gray-600">Budget: {formatCurrency(data.budget)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget Management</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Set spending limits and track your progress</p>
      </div>

      {/* Overall Budget Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Summary Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-6 h-6" />
            <h2 className="text-lg sm:text-xl font-bold">This Month's Budget</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm">Total Budget</p>
              <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalBudget)}</p>
            </div>
            <div>
              <p className="text-blue-100 text-xs sm:text-sm">Total Spent</p>
              <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-blue-100 text-xs sm:text-sm">Remaining</p>
              <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(Math.max(0, totalBudget - totalSpent))}</p>
            </div>
          </div>

          {totalBudget > 0 && (
            <>
              <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-3 mb-2">
                <div
                  className="bg-white h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                />
              </div>
              <p className="text-blue-100 text-sm text-right">{totalPercentage.toFixed(1)}% used</p>
            </>
          )}
        </div>

        {/* Spending Pie Chart */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Spending Breakdown</h2>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              <p>No spending data for this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Budgets */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Category Budgets</h2>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Create New Category</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Enter category name (e.g., Groceries)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategory('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {expenseCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expense categories available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expenseCategories.map(category => {
              const budgetInfo = getBudgetStatus(category);
              const isEditing = editingCategory === category;

              return (
                <div
                  key={category}
                  className={`border-2 rounded-lg p-3 transition-all ${
                    budgetInfo.status !== 'none' ? getStatusColor(budgetInfo.status) : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{category}</h3>
                      {budgetInfo.status !== 'none' && (
                        <div className="flex items-center gap-1 mt-1">
                          {budgetInfo.status === 'exceeded' ? (
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          ) : budgetInfo.status === 'warning' ? (
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          ) : (
                            <CheckCircle className="w-3 h-3 flex-shrink-0" />
                          )}
                          <span className="text-xs font-medium truncate">
                            {budgetInfo.status === 'exceeded'
                              ? `Over by ${formatCurrency(Math.abs(budgetInfo.remaining))}`
                              : `${formatCurrency(budgetInfo.remaining)} left`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      {!isEditing && budgetInfo.status !== 'none' && (
                        <button
                          onClick={() => handleRemoveBudget(category)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                          title="Remove budget"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      {!isEditing && (
                        <button
                          onClick={() => handleEditBudget(category)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                          title={budgetInfo.status !== 'none' ? 'Edit budget' : 'Set budget'}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="Amount"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="100"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveBudget}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : budgetInfo.status !== 'none' ? (
                    <>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{formatCurrency(budgetInfo.spent)}</span>
                        <span>{formatCurrency(budgetInfo.budget)}</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getProgressBarColor(budgetInfo.status)}`}
                          style={{ width: `${Math.min(budgetInfo.percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-right mt-1 font-medium">
                        {budgetInfo.percentage.toFixed(0)}%
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-600 mb-1">No budget set</p>
                      <p className="text-xs text-gray-500">
                        Spent: {formatCurrency(currentSpending[category] || 0)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Budget Tips
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Set realistic budgets based on your past spending patterns</li>
          <li>Review and adjust budgets monthly as your needs change</li>
          <li>Aim to keep spending below 80% of your budget for a safety buffer</li>
          <li>Check the Reports page for detailed spending analysis</li>
        </ul>
      </div>
    </div>
  );
};

export default Budget;
