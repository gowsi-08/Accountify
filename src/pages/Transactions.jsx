import { useState } from 'react';
import { Plus, Edit2, Trash2, Filter, Search, X, Tag, Calendar, DollarSign, Paperclip, Upload, Download, Eye, FileText, Image as ImageIcon } from 'lucide-react';
import { formatCurrency, formatDate, formatFileSize, getFileIcon } from '../utils/helpers';
import { balanceEngine } from '../utils/balanceEngine';
import { dataService } from '../api/dataService';

const Transactions = ({ data, onSave, showToast }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [viewingAttachments, setViewingAttachments] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  
  // Tag input
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    from_account: '',
    to_account: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: [],
    attachments: []
  });

  // Get all unique tags from transactions
  const getAllTags = () => {
    const tagsSet = new Set();
    data.transactions.forEach(txn => {
      if (txn.tags && Array.isArray(txn.tags)) {
        txn.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  };

  const allTags = getAllTags();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let updatedData = { ...data };
    let updatedAccounts = [...data.accounts];

    if (editingTransaction) {
      // Reverse old transaction
      updatedAccounts = balanceEngine.reverseTransaction(updatedAccounts, editingTransaction);
      
      // Apply new transaction
      const newTransaction = {
        ...editingTransaction,
        ...formData,
        amount: parseFloat(formData.amount)
      };
      updatedAccounts = balanceEngine.applyTransaction(updatedAccounts, newTransaction);
      
      // Update transaction in list
      updatedData.transactions = data.transactions.map(txn =>
        txn.id === editingTransaction.id ? newTransaction : txn
      );
    } else {
      // New transaction
      const newTransaction = {
        id: balanceEngine.generateId('txn'),
        ...formData,
        amount: parseFloat(formData.amount)
      };
      updatedAccounts = balanceEngine.applyTransaction(updatedAccounts, newTransaction);
      updatedData.transactions = [...data.transactions, newTransaction];
    }

    updatedData.accounts = updatedAccounts;
    onSave(updatedData, ['transactions', 'accounts']);
    showToast(editingTransaction ? 'Transaction updated' : 'Transaction added', 'success');
    closeModal();
  };

  const handleDelete = (transaction) => {
    if (!confirm('Delete this transaction?')) return;

    let updatedAccounts = balanceEngine.reverseTransaction([...data.accounts], transaction);
    const updatedData = {
      ...data,
      accounts: updatedAccounts,
      transactions: data.transactions.filter(txn => txn.id !== transaction.id)
    };

    onSave(updatedData, ['transactions', 'accounts']);
    showToast('Transaction deleted', 'success');
  };

  const openModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        ...transaction,
        tags: transaction.tags || [],
        attachments: transaction.attachments || []
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        type: 'income',
        amount: '',
        from_account: '',
        to_account: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        tags: [],
        attachments: []
      });
    }
    setTagInput('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const transactionId = editingTransaction?.id || 'temp_' + Date.now();
      const attachment = await dataService.uploadAttachment(file, transactionId);
      
      setFormData({
        ...formData,
        attachments: [...(formData.attachments || []), attachment]
      });
      
      showToast('✅ File uploaded successfully', 'success');
    } catch (error) {
      showToast('❌ ' + error.message, 'error');
    } finally {
      setUploadingFile(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleDeleteAttachment = async (attachment, index) => {
    if (!confirm('Delete this attachment?')) return;

    try {
      await dataService.deleteAttachment(attachment.fileName, attachment.sha);
      
      const updatedAttachments = formData.attachments.filter((_, i) => i !== index);
      setFormData({ ...formData, attachments: updatedAttachments });
      
      showToast('Attachment deleted', 'success');
    } catch (error) {
      showToast('Failed to delete attachment: ' + error.message, 'error');
    }
  };

  const handleViewAttachments = (transaction) => {
    setViewingAttachments(transaction);
    setShowAttachmentModal(true);
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const downloadUrl = await dataService.downloadAttachment(attachment.fileName);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      showToast('Failed to download attachment: ' + error.message, 'error');
    }
  };

  const clearFilters = () => {
    setFilterType('all');
    setSearchQuery('');
    setFilterCategory('all');
    setFilterAccount('all');
    setFilterTag('all');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
  };

  const filteredTransactions = data.transactions
    .filter(txn => {
      // Type filter
      if (filterType !== 'all' && txn.type !== filterType) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDescription = txn.description?.toLowerCase().includes(query);
        const matchesCategory = txn.category?.toLowerCase().includes(query);
        const matchesAmount = txn.amount.toString().includes(query);
        if (!matchesDescription && !matchesCategory && !matchesAmount) return false;
      }
      
      // Category filter
      if (filterCategory !== 'all' && txn.category !== filterCategory) return false;
      
      // Account filter
      if (filterAccount !== 'all') {
        if (txn.from_account !== filterAccount && txn.to_account !== filterAccount) return false;
      }
      
      // Tag filter
      if (filterTag !== 'all') {
        if (!txn.tags || !txn.tags.includes(filterTag)) return false;
      }
      
      // Date range filter
      if (dateFrom && txn.date < dateFrom) return false;
      if (dateTo && txn.date > dateTo) return false;
      
      // Amount range filter
      if (amountMin && txn.amount < parseFloat(amountMin)) return false;
      if (amountMax && txn.amount > parseFloat(amountMax)) return false;
      
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const getTransactionColor = (type) => {
    return type === 'income' ? 'text-green-600' : type === 'expense' ? 'text-red-600' : 'text-blue-600';
  };

  const activeFiltersCount = [
    filterType !== 'all',
    searchQuery,
    filterCategory !== 'all',
    filterAccount !== 'all',
    filterTag !== 'all',
    dateFrom,
    dateTo,
    amountMin,
    amountMax
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {filteredTransactions.length} of {data.transactions.length} transactions
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by description, category, or amount..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <X className="w-5 h-5" />
              Clear
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                {[...data.categories.income, ...data.categories.expense].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account</label>
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Accounts</option>
                {data.accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            {allTags.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tag</label>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount Min</label>
              <input
                type="number"
                value={amountMin}
                onChange={(e) => setAmountMin(e.target.value)}
                placeholder="Min amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount Max</label>
              <input
                type="number"
                value={amountMax}
                onChange={(e) => setAmountMax(e.target.value)}
                placeholder="Max amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Files</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    {data.transactions.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{formatDate(txn.date)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        txn.type === 'income' ? 'bg-green-100 text-green-800' :
                        txn.type === 'expense' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{txn.description || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{txn.category || '-'}</td>
                    <td className="px-6 py-4">
                      {txn.tags && txn.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {txn.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {txn.attachments && txn.attachments.length > 0 ? (
                        <button
                          onClick={() => handleViewAttachments(txn)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium"
                        >
                          <Paperclip className="w-3 h-3" />
                          {txn.attachments.length}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${getTransactionColor(txn.type)}`}>
                      {txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(txn)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(txn)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {(formData.type === 'expense' || formData.type === 'transfer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                  <select
                    value={formData.from_account}
                    onChange={(e) => setFormData({ ...formData, from_account: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select account</option>
                    {data.accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {(formData.type === 'income' || formData.type === 'transfer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                  <select
                    value={formData.to_account}
                    onChange={(e) => setFormData({ ...formData, to_account: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select account</option>
                    {data.accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.type !== 'transfer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {(formData.type === 'income' ? data.categories.income : data.categories.expense).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags <span className="text-gray-500 font-normal">(e.g., tax-deductible, business, vacation)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium bg-purple-100 text-purple-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments <span className="text-gray-500 font-normal">(Images & PDFs, max 5MB)</span>
                </label>
                
                {/* Upload Button */}
                <div className="mb-2">
                  <label className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploadingFile 
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                      : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                  }`}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                    {uploadingFile ? (
                      <>
                        <Upload className="w-4 h-4 text-gray-500 animate-spin" />
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">Upload Receipt/Document</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Attachments List */}
                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-lg">{getFileIcon(attachment.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{attachment.originalName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(attachment)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(attachment, index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {editingTransaction ? 'Update' : 'Add'}
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

      {/* Attachment Viewer Modal */}
      {showAttachmentModal && viewingAttachments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Attachments - {viewingAttachments.description || 'Transaction'}
              </h2>
              <button
                onClick={() => setShowAttachmentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewingAttachments.attachments && viewingAttachments.attachments.length > 0 ? (
              <div className="space-y-3">
                {viewingAttachments.attachments.map((attachment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-3xl">{getFileIcon(attachment.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{attachment.originalName}</h3>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                            <span>{formatFileSize(attachment.size)}</span>
                            <span>•</span>
                            <span>{new Date(attachment.uploadDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>

                    {/* Preview for images */}
                    {attachment.type.startsWith('image/') && attachment.downloadUrl && (
                      <div className="mt-3">
                        <img
                          src={attachment.downloadUrl}
                          alt={attachment.originalName}
                          className="max-w-full h-auto rounded-lg border border-gray-200"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Paperclip className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No attachments for this transaction</p>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => setShowAttachmentModal(false)}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
