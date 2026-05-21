export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getAccountTypeIcon = (type) => {
  const icons = {
    bank: 'Building2',
    investment: 'TrendingUp',
    wallet: 'Wallet',
    chit_fund: 'Users'
  };
  return icons[type] || 'CircleDollarSign';
};

export const getAccountTypeColor = (type) => {
  const colors = {
    bank: 'bg-blue-100 text-blue-700',
    investment: 'bg-green-100 text-green-700',
    wallet: 'bg-purple-100 text-purple-700',
    chit_fund: 'bg-orange-100 text-orange-700'
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

export const exportToCSV = (data, filename) => {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'application/pdf') return '📄';
  return '📎';
};
