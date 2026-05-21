import { Building2, TrendingUp, Wallet, Users, ArrowUpCircle, ArrowDownCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';

const Dashboard = ({ data }) => {
  const { accounts, transactions, budgets = {} } = data;

  // Calculate total net worth
  const totalNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Get current month transactions
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentMonthTransactions = transactions.filter(txn => {
    const txnDate = new Date(txn.date);
    return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
  });

  const monthlyIncome = currentMonthTransactions
    .filter(txn => txn.type === 'income')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const monthlyExpense = currentMonthTransactions
    .filter(txn => txn.type === 'expense')
    .reduce((sum, txn) => sum + txn.amount, 0);

  // Budget tracking
  const getBudgetAlerts = () => {
    const alerts = [];
    const categorySpending = {};

    currentMonthTransactions
      .filter(txn => txn.type === 'expense')
      .forEach(txn => {
        if (txn.category) {
          categorySpending[txn.category] = (categorySpending[txn.category] || 0) + txn.amount;
        }
      });

    Object.entries(budgets).forEach(([category, budget]) => {
      const spent = categorySpending[category] || 0;
      const percentage = (spent / budget) * 100;

      if (percentage >= 100) {
        alerts.push({
          category,
          budget,
          spent,
          percentage,
          type: 'exceeded',
          message: `${category}: Over budget by ${formatCurrency(spent - budget)}`
        });
      } else if (percentage >= 80) {
        alerts.push({
          category,
          budget,
          spent,
          percentage,
          type: 'warning',
          message: `${category}: ${percentage.toFixed(0)}% of budget used`
        });
      }
    });

    return alerts;
  };

  const budgetAlerts = getBudgetAlerts();

  // Get last 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Get chit fund progress
  const chitFund = accounts.find(acc => acc.type === 'chit_fund');
  const chitFundProgress = chitFund
    ? (chitFund.balance / (chitFund.monthly_contribution * chitFund.duration_months)) * 100
    : 0;

  const getAccountIcon = (type) => {
    const icons = {
      bank: Building2,
      investment: TrendingUp,
      wallet: Wallet,
      chit_fund: Users
    };
    return icons[type] || Wallet;
  };

  const getTransactionColor = (type) => {
    return type === 'income' ? 'text-green-600' : type === 'expense' ? 'text-red-600' : 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your finances</p>
      </div>

      {/* Net Worth Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <p className="text-green-100 text-sm font-medium">Total Net Worth</p>
        <h2 className="text-4xl font-bold mt-2">{formatCurrency(totalNetWorth)}</h2>
      </div>

      {/* Income vs Expense */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">This Month Income</p>
              <h3 className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{formatCurrency(monthlyIncome)}</h3>
            </div>
            <ArrowUpCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">This Month Expense</p>
              <h3 className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{formatCurrency(monthlyExpense)}</h3>
            </div>
            <ArrowDownCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Budget Alerts</h2>
          </div>
          <div className="space-y-2">
            {budgetAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 ${
                  alert.type === 'exceeded'
                    ? 'bg-red-50 border-red-300 text-red-800'
                    : 'bg-yellow-50 border-yellow-300 text-yellow-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm sm:text-base">{alert.message}</p>
                  <span className="text-xs sm:text-sm font-bold">
                    {formatCurrency(alert.spent)} / {formatCurrency(alert.budget)}
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      alert.type === 'exceeded' ? 'bg-red-600' : 'bg-yellow-600'
                    }`}
                    style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accounts Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(account => {
            const Icon = getAccountIcon(account.type);
            return (
              <div key={account.id} className="bg-white rounded-lg p-5 shadow border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(account.balance)}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{account.type.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chit Fund Progress */}
      {chitFund && (
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Chit Fund Progress</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-gray-900">{chitFundProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(chitFundProgress, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 text-xs sm:text-sm">
              <div>
                <p className="text-gray-600">Monthly</p>
                <p className="font-semibold text-gray-900 text-xs sm:text-sm">{formatCurrency(chitFund.monthly_contribution)}</p>
              </div>
              <div>
                <p className="text-gray-600">Paid</p>
                <p className="font-semibold text-gray-900 text-xs sm:text-sm">{formatCurrency(chitFund.balance)}</p>
              </div>
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="font-semibold text-gray-900 text-xs sm:text-sm">{chitFund.duration_months} months</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map(txn => (
              <div key={txn.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{txn.description || 'Transaction'}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{formatDate(txn.date)} • {txn.type}</p>
                </div>
                <p className={`text-base sm:text-lg font-bold whitespace-nowrap ${getTransactionColor(txn.type)}`}>
                  {txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
