import { useState } from 'react';
import { Plus, Edit2, Trash2, Building2, TrendingUp, Wallet, Users } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { balanceEngine } from '../utils/balanceEngine';

const Accounts = ({ data, onSave, showToast }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    balance: '',
    notes: '',
    target_amount: '',
    start_date: '',
    duration_months: '',
    payments: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let updatedData = { ...data };

    if (editingAccount) {
      updatedData.accounts = data.accounts.map(acc =>
        acc.id === editingAccount.id
          ? {
              ...acc,
              ...formData,
              balance: parseFloat(formData.balance),
              target_amount: formData.type === 'chit_fund' ? parseFloat(formData.target_amount) : undefined,
              duration_months: formData.type === 'chit_fund' ? parseInt(formData.duration_months) : undefined,
              start_date: formData.type === 'chit_fund' ? formData.start_date : undefined,
              payments: formData.type === 'chit_fund' ? (acc.payments || []) : undefined
            }
          : acc
      );
      showToast('Account updated', 'success');
    } else {
      const newAccount = {
        id: balanceEngine.generateId('acc'),
        ...formData,
        balance: parseFloat(formData.balance),
        target_amount: formData.type === 'chit_fund' ? parseFloat(formData.target_amount) : undefined,
        duration_months: formData.type === 'chit_fund' ? parseInt(formData.duration_months) : undefined,
        start_date: formData.type === 'chit_fund' ? formData.start_date : undefined,
        payments: formData.type === 'chit_fund' ? [] : undefined
      };
      updatedData.accounts = [...data.accounts, newAccount];
      showToast('Account added', 'success');
    }

    onSave(updatedData);
    closeModal();
  };

  const handleDelete = (account) => {
    const hasTransactions = data.transactions.some(
      txn => txn.from_account === account.id || txn.to_account === account.id
    );

    if (hasTransactions) {
      if (!confirm('This account has linked transactions. Deleting it may cause data inconsistency. Continue?')) {
        return;
      }
    } else {
      if (!confirm('Delete this account?')) return;
    }

    const updatedData = {
      ...data,
      accounts: data.accounts.filter(acc => acc.id !== account.id)
    };

    onSave(updatedData);
    showToast('Account deleted', 'success');
  };

  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        notes: account.notes || '',
        target_amount: account.target_amount?.toString() || '',
        start_date: account.start_date || '',
        duration_months: account.duration_months?.toString() || '',
        payments: account.payments || []
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        type: 'bank',
        balance: '',
        notes: '',
        target_amount: '',
        start_date: '',
        duration_months: '',
        payments: []
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  const getAccountIcon = (type) => {
    const icons = {
      bank: Building2,
      investment: TrendingUp,
      wallet: Wallet,
      chit_fund: Users
    };
    return icons[type] || Wallet;
  };

  const getAccountColor = (type) => {
    const colors = {
      bank: 'bg-blue-100 text-blue-700 border-blue-200',
      investment: 'bg-green-100 text-green-700 border-green-200',
      wallet: 'bg-purple-100 text-purple-700 border-purple-200',
      chit_fund: 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your bank accounts, investments, and wallets</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.accounts.map(account => {
          const Icon = getAccountIcon(account.type);
          return (
            <div
              key={account.id}
              className={`rounded-lg p-4 sm:p-6 border-2 ${getAccountColor(account.type)} hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">{account.name}</h3>
                    <p className="text-xs sm:text-sm opacity-75 capitalize">{account.type.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs sm:text-sm opacity-75 mb-1">Current Balance</p>
                <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(account.balance)}</p>
              </div>

              {account.type === 'chit_fund' && (
                <div className="mb-4 pt-4 border-t border-current opacity-50">
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div>
                      <p className="opacity-75">Target</p>
                      <p className="font-semibold text-xs sm:text-sm">{formatCurrency(account.target_amount)}</p>
                    </div>
                    <div>
                      <p className="opacity-75">Duration</p>
                      <p className="font-semibold text-xs sm:text-sm">{account.duration_months} months</p>
                    </div>
                  </div>
                </div>
              )}

              {account.notes && (
                <p className="text-xs sm:text-sm opacity-75 mb-4">{account.notes}</p>
              )}

              <div className="flex gap-2 pt-4 border-t border-current opacity-50">
                <button
                  onClick={() => openModal(account)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white px-3 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(account)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white px-3 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {editingAccount ? 'Edit Account' : 'Add Account'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="e.g., SBI Savings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="bank">Bank</option>
                  <option value="investment">Investment</option>
                  <option value="wallet">Wallet</option>
                  <option value="chit_fund">Chit Fund</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {formData.type === 'chit_fund' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (Maturity Value)</label>
                    <input
                      type="number"
                      value={formData.target_amount}
                      onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g., 100000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Amount you'll receive at maturity</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
                    <input
                      type="number"
                      value={formData.duration_months}
                      onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      min="1"
                      placeholder="e.g., 20"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Note:</strong> Current Balance = Total paid so far. Add payments from the Chit Fund page.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder="Optional notes"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {editingAccount ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
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

export default Accounts;
