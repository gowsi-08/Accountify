import { useState } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle, Edit2, Save, X } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const Budget = ({ data, onSave, showToast }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  const budgets = data.budgets || {};
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
      budgets: {
        ...budgets,
        [editingCategory]: parseFloat(editAmount)
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
      budgets: updatedBudgets
    };

    onSave(updatedData, ['settings']);
    showToast(`Budget removed for ${category}`, 'success');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget Management</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Set spending limits and track your progress</p>
      </div>

      {/* Overall Budget Summary */}
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

      {/* Category Budgets */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Category Budgets</h2>
        
        {expenseCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expense categories available</p>
        ) : (
          <div className="space-y-4">
            {expenseCategories.map(category => {
              const budgetInfo = getBudgetStatus(category);
              const isEditing = editingCategory === category;

              return (
                <div
                  key={category}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    budgetInfo.status !== 'none' ? getStatusColor(budgetInfo.status) : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg">{category}</h3>
                      {budgetInfo.status !== 'none' && (
                        <div className="flex items-center gap-2 mt-1">
                          {budgetInfo.status === 'exceeded' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : budgetInfo.status === 'warning' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span className="text-xs sm:text-sm font-medium">
                            {budgetInfo.status === 'exceeded'
                              ? `Over budget by ${formatCurrency(Math.abs(budgetInfo.remaining))}`
                              : budgetInfo.status === 'warning'
                              ? `${formatCurrency(budgetInfo.remaining)} remaining (${(100 - budgetInfo.percentage).toFixed(0)}%)`
                              : `${formatCurrency(budgetInfo.remaining)} remaining`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isEditing && budgetInfo.status !== 'none' && (
                        <button
                          onClick={() => handleRemoveBudget(category)}
                          className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                          title="Remove budget"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {!isEditing && (
                        <button
                          onClick={() => handleEditBudget(category)}
                          className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                          title={budgetInfo.status !== 'none' ? 'Edit budget' : 'Set budget'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="Enter budget amount"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        min="0"
                        step="100"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveBudget}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : budgetInfo.status !== 'none' ? (
                    <>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span>Spent: {formatCurrency(budgetInfo.spent)}</span>
                        <span>Budget: {formatCurrency(budgetInfo.budget)}</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${getProgressBarColor(budgetInfo.status)}`}
                          style={{ width: `${Math.min(budgetInfo.percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs sm:text-sm text-right mt-1 font-medium">
                        {budgetInfo.percentage.toFixed(1)}% used
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-sm text-gray-600 mb-2">No budget set</p>
                      <p className="text-xs text-gray-500">
                        Current month spending: {formatCurrency(currentSpending[category] || 0)}
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
