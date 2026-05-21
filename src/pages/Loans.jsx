import { useState } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Calendar, TrendingDown, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';
import { loanCalculator } from '../utils/loanCalculator';
import { balanceEngine } from '../utils/balanceEngine';

const Loans = ({ data, onSave, showToast }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [showSchedule, setShowSchedule] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    principal: '',
    interestRate: '',
    tenureMonths: '',
    startDate: new Date().toISOString().split('T')[0],
    lender: '',
    notes: ''
  });

  const loans = data.loans || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const principal = parseFloat(formData.principal);
    const interestRate = parseFloat(formData.interestRate);
    const tenureMonths = parseInt(formData.tenureMonths);
    
    const emi = loanCalculator.calculateEMI(principal, interestRate, tenureMonths);
    const schedule = loanCalculator.generateAmortizationSchedule(
      principal,
      interestRate,
      tenureMonths,
      formData.startDate
    );

    let updatedData = { ...data };

    if (editingLoan) {
      updatedData.loans = loans.map(loan =>
        loan.id === editingLoan.id
          ? {
              ...loan,
              ...formData,
              principal,
              interestRate,
              tenureMonths,
              emi,
              schedule: loan.schedule.map((s, i) => ({
                ...schedule[i],
                paid: s.paid || false
              }))
            }
          : loan
      );
      showToast('Loan updated', 'success');
    } else {
      const newLoan = {
        id: balanceEngine.generateId('loan'),
        ...formData,
        principal,
        interestRate,
        tenureMonths,
        emi,
        schedule,
        createdAt: new Date().toISOString()
      };
      updatedData.loans = [...loans, newLoan];
      showToast('Loan added', 'success');
    }

    onSave(updatedData, ['settings']);
    closeModal();
  };

  const handleDelete = (loan) => {
    if (!confirm(`Delete loan "${loan.name}"?`)) return;

    const updatedData = {
      ...data,
      loans: loans.filter(l => l.id !== loan.id)
    };

    onSave(updatedData, ['settings']);
    showToast('Loan deleted', 'success');
  };

  const handleMarkPaid = (loanId, monthIndex) => {
    const updatedData = { ...data };
    updatedData.loans = loans.map(loan => {
      if (loan.id === loanId) {
        const updatedSchedule = [...loan.schedule];
        updatedSchedule[monthIndex] = {
          ...updatedSchedule[monthIndex],
          paid: !updatedSchedule[monthIndex].paid
        };
        return { ...loan, schedule: updatedSchedule };
      }
      return loan;
    });

    onSave(updatedData, ['settings']);
    showToast(
      updatedData.loans.find(l => l.id === loanId).schedule[monthIndex].paid
        ? 'EMI marked as paid'
        : 'EMI marked as unpaid',
      'success'
    );
  };

  const openModal = (loan = null) => {
    if (loan) {
      setEditingLoan(loan);
      setFormData({
        name: loan.name,
        principal: loan.principal.toString(),
        interestRate: loan.interestRate.toString(),
        tenureMonths: loan.tenureMonths.toString(),
        startDate: loan.startDate,
        lender: loan.lender || '',
        notes: loan.notes || ''
      });
    } else {
      setEditingLoan(null);
      setFormData({
        name: '',
        principal: '',
        interestRate: '',
        tenureMonths: '',
        startDate: new Date().toISOString().split('T')[0],
        lender: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLoan(null);
  };

  const getTotalLoans = () => {
    return loans.reduce((sum, loan) => {
      const summary = loanCalculator.getLoanSummary(loan);
      return sum + summary.remainingBalance;
    }, 0);
  };

  const getTotalEMI = () => {
    return loans.reduce((sum, loan) => sum + loan.emi, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Loan & EMI Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage your loans and track EMI payments</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Loan
        </button>
      </div>

      {/* Summary Cards */}
      {loans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Total Outstanding</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(getTotalLoans())}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Total Monthly EMI</p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{formatCurrency(getTotalEMI())}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Active Loans</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{loans.length}</p>
          </div>
        </div>
      )}

      {/* Loans List */}
      {loans.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:p-12 shadow border border-gray-200 dark:border-gray-700 text-center">
          <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No Loans</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4">Add a loan to start tracking EMI payments</p>
          <button
            onClick={() => openModal()}
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
          >
            Add your first loan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map(loan => {
            const summary = loanCalculator.getLoanSummary(loan);
            const isExpanded = expandedLoan === loan.id;

            return (
              <div key={loan.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Loan Header */}
                <div className="p-4 sm:p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold">{loan.name}</h3>
                      <p className="text-red-100 text-sm mt-1">{loan.lender || 'Loan'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(loan)}
                        className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loan)}
                        className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Loan Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Principal</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(loan.principal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">EMI</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.emi)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Interest Rate</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Tenure</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{loan.tenureMonths} months</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="p-4 sm:p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Repayment Progress</span>
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">{summary.progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(summary.progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span>{summary.paidCount} of {summary.totalMonths} EMIs paid</span>
                      <span>{summary.remainingMonths} remaining</span>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Principal Paid</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(summary.principalPaid)}</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Interest Paid</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(summary.interestPaid)}</p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Remaining Balance</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(summary.remainingBalance)}</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400 text-xs">Total Interest</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalInterest)}</p>
                    </div>
                  </div>

                  {summary.nextDueDate && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          Next EMI Due: {formatDate(summary.nextDueDate)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Toggle Schedule */}
                  <button
                    onClick={() => setShowSchedule(showSchedule === loan.id ? null : loan.id)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {showSchedule === loan.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showSchedule === loan.id ? 'Hide' : 'Show'} Amortization Schedule
                  </button>

                  {/* Amortization Schedule */}
                  {showSchedule === loan.id && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Schedule</h4>
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Month</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Due Date</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">EMI</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Principal</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Interest</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Balance</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loan.schedule.map((payment, index) => (
                              <tr key={index} className={payment.paid ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                                <td className="px-3 py-2 text-gray-900 dark:text-white">{payment.month}</td>
                                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{formatDate(payment.dueDate)}</td>
                                <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{formatCurrency(payment.emi)}</td>
                                <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{formatCurrency(payment.principal)}</td>
                                <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{formatCurrency(payment.interest)}</td>
                                <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{formatCurrency(payment.balance)}</td>
                                <td className="px-3 py-2 text-center">
                                  <button
                                    onClick={() => handleMarkPaid(loan.id, index)}
                                    className={`p-1 rounded ${
                                      payment.paid
                                        ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20'
                                        : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                  >
                                    {payment.paid ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {editingLoan ? 'Edit Loan' : 'Add Loan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="e.g., Home Loan, Car Loan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principal Amount</label>
                <input
                  type="number"
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  min="0"
                  step="1000"
                  placeholder="e.g., 500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (% per annum)</label>
                <input
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.1"
                  placeholder="e.g., 8.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenure (months)</label>
                <input
                  type="number"
                  value={formData.tenureMonths}
                  onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  min="1"
                  placeholder="e.g., 240 (20 years)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lender (Optional)</label>
                <input
                  type="text"
                  value={formData.lender}
                  onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., HDFC Bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="2"
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {editingLoan ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
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

export default Loans;
