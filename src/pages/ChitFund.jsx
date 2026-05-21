import { useState } from 'react';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Users, Calendar, TrendingUp, Clock, Plus, Trash2 } from 'lucide-react';
import { balanceEngine } from '../utils/balanceEngine';

const ChitFund = ({ data, onSave, showToast }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedChitFund, setSelectedChitFund] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');

  const chitFundAccounts = data.accounts.filter(acc => acc.type === 'chit_fund');

  const getChitFundDetails = (account) => {
    const startDate = new Date(account.start_date);
    const today = new Date();
    const monthsPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 30));
    const monthsCompleted = Math.min(monthsPassed, account.duration_months);
    const remainingMonths = Math.max(0, account.duration_months - monthsCompleted);
    const targetAmount = account.target_amount || 0;
    const totalPaid = account.balance;
    const progress = targetAmount > 0 ? (totalPaid / targetAmount) * 100 : 0;
    const payments = account.payments || [];

    // Calculate next due date
    const nextDueDate = new Date(startDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + monthsCompleted + 1);

    return {
      monthsCompleted,
      remainingMonths,
      targetAmount,
      totalPaid,
      progress,
      nextDueDate,
      payments,
      paymentsCount: payments.length
    };
  };

  const openPaymentModal = (account) => {
    setSelectedChitFund(account);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedChitFund(null);
  };

  const handleAddPayment = (e) => {
    e.preventDefault();

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const newPayment = {
      id: balanceEngine.generateId('pay'),
      amount: amount,
      date: paymentDate,
      notes: paymentNotes,
      timestamp: new Date().toISOString()
    };

    const updatedData = { ...data };
    updatedData.accounts = data.accounts.map(acc => {
      if (acc.id === selectedChitFund.id) {
        return {
          ...acc,
          balance: acc.balance + amount,
          payments: [...(acc.payments || []), newPayment]
        };
      }
      return acc;
    });

    onSave(updatedData, ['accounts']);
    showToast(`Payment of ${formatCurrency(amount)} added`, 'success');
    closePaymentModal();
  };

  const handleDeletePayment = (account, paymentId) => {
    if (!confirm('Delete this payment?')) return;

    const payment = account.payments.find(p => p.id === paymentId);
    if (!payment) return;

    const updatedData = { ...data };
    updatedData.accounts = data.accounts.map(acc => {
      if (acc.id === account.id) {
        return {
          ...acc,
          balance: acc.balance - payment.amount,
          payments: acc.payments.filter(p => p.id !== paymentId)
        };
      }
      return acc;
    });

    onSave(updatedData, ['accounts']);
    showToast('Payment deleted', 'success');
  };

  if (chitFundAccounts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chit Fund Tracker</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Track your chit fund contributions and progress</p>
        </div>
        <div className="bg-white rounded-lg p-8 sm:p-12 shadow border border-gray-200 text-center">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Chit Funds</h3>
          <p className="text-gray-600 text-sm sm:text-base">Add a chit fund account to start tracking</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chit Fund Tracker</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Track your chit fund contributions and progress</p>
      </div>

      {chitFundAccounts.map(account => {
        const details = getChitFundDetails(account);

        return (
          <div key={account.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{account.name}</h2>
                    <p className="text-orange-100 text-sm sm:text-base">Variable monthly contributions</p>
                  </div>
                </div>
                <button
                  onClick={() => openPaymentModal(account)}
                  className="flex items-center gap-2 bg-white text-orange-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors font-medium text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Add Payment</span>
                  <span className="sm:hidden">Pay</span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <p className="text-sm text-gray-600">Target Amount</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(details.targetAmount)}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-gray-600">Total Paid</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(details.totalPaid)}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600">Remaining</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(details.targetAmount - details.totalPaid)}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-600">Payments Made</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{details.paymentsCount}</p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="p-4 sm:p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Progress to Target</h3>
                  <span className="text-xl sm:text-2xl font-bold text-orange-600">{details.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(details.progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>₹0</span>
                  <span>{formatCurrency(details.targetAmount)}</span>
                </div>
              </div>

              {/* Payment History */}
              <div className="mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                {details.payments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500 text-sm">No payments recorded yet</p>
                    <button
                      onClick={() => openPaymentModal(account)}
                      className="mt-3 text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      Add your first payment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...details.payments].reverse().map((payment, index) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              Payment #{details.payments.length - index}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(payment.date)}</span>
                          </div>
                          {payment.notes && (
                            <p className="text-xs text-gray-600 mt-1">{payment.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(payment.amount)}
                          </span>
                          <button
                            onClick={() => handleDeletePayment(account, payment.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Table */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-semibold text-gray-900">{formatDate(account.start_date)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold text-gray-900">{account.duration_months} months</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Maturity Date:</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(new Date(new Date(account.start_date).setMonth(new Date(account.start_date).getMonth() + account.duration_months)).toISOString())}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Avg Payment:</span>
                  <span className="font-semibold text-gray-900">
                    {details.paymentsCount > 0 ? formatCurrency(details.totalPaid / details.paymentsCount) : '₹0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Payment Modal */}
      {showPaymentModal && selectedChitFund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Add Payment - {selectedChitFund.name}
            </h2>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter amount paid"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Month 5 payment"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Add Payment
                </button>
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChitFund;
