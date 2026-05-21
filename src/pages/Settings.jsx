import { useState, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, Cloud, CloudOff, Key, History, Save, RefreshCw } from 'lucide-react';
import { dataService } from '../api/dataService';
import { formatDate } from '../utils/helpers';

const Settings = ({ data, onSave, showToast }) => {
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [showCloudSetup, setShowCloudSetup] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [cloudConfig, setCloudConfig] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  useEffect(() => {
    setCloudConfig(dataService.getGitHubConfig());
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoadingBackups(true);
      const backupList = await dataService.listBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('Failed to load backups:', error);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      await dataService.createBackup();
      showToast('✅ Backup created successfully', 'success');
      await loadBackups();
    } catch (error) {
      showToast('❌ Failed to create backup: ' + error.message, 'error');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backupFileName) => {
    if (!confirm(`Restore data from backup ${backupFileName}?\n\nThis will replace all current data!`)) return;

    try {
      const restoredData = await dataService.restoreFromBackup(backupFileName);
      onSave(restoredData, ['accounts', 'transactions', 'categories', 'settings']);
      showToast('✅ Data restored successfully', 'success');
      // Reload page to apply restored data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      showToast('❌ Failed to restore backup: ' + error.message, 'error');
    }
  };

  const handleDeleteBackup = async (backupFileName) => {
    if (!confirm(`Delete backup ${backupFileName}?`)) return;

    try {
      await dataService.deleteBackup(backupFileName);
      showToast('✅ Backup deleted', 'success');
      await loadBackups();
    } catch (error) {
      showToast('❌ Failed to delete backup: ' + error.message, 'error');
    }
  };

  const handleCleanOldBackups = async () => {
    if (!confirm('Delete backups older than 30 days?')) return;

    try {
      const deletedCount = await dataService.deleteOldBackups(30);
      showToast(`✅ Deleted ${deletedCount} old backup(s)`, 'success');
      await loadBackups();
    } catch (error) {
      showToast('❌ Failed to clean backups: ' + error.message, 'error');
    }
  };

  const handleAddCategory = (type) => {
    const newCategory = type === 'income' ? newIncomeCategory : newExpenseCategory;
    if (!newCategory.trim()) return;

    const updatedData = { ...data };
    if (updatedData.categories[type].includes(newCategory)) {
      showToast('Category already exists', 'error');
      return;
    }

    updatedData.categories[type] = [...updatedData.categories[type], newCategory];
    onSave(updatedData);
    showToast('Category added', 'success');

    if (type === 'income') {
      setNewIncomeCategory('');
    } else {
      setNewExpenseCategory('');
    }
  };

  const handleDeleteCategory = (type, category) => {
    if (!confirm(`Delete category "${category}"?`)) return;

    const updatedData = { ...data };
    updatedData.categories[type] = updatedData.categories[type].filter(cat => cat !== category);
    onSave(updatedData);
    showToast('Category deleted', 'success');
  };

  const handleExportYAML = () => {
    const success = dataService.exportYAML(data);
    if (success) {
      showToast('YAML backup exported successfully', 'success');
    } else {
      showToast('Failed to export backup', 'error');
    }
  };

  const handleExportJSON = () => {
    const success = dataService.exportJSON(data);
    if (success) {
      showToast('JSON backup exported successfully', 'success');
    } else {
      showToast('Failed to export backup', 'error');
    }
  };

  const handleImportYAML = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const importedData = await dataService.importYAML(file);
      onSave(importedData);
      showToast('Data imported successfully', 'success');
    } catch (error) {
      showToast('Failed to import data. Invalid YAML format.', 'error');
    }
    e.target.value = '';
  };

  const handleImportJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const importedData = await dataService.importJSON(file);
      onSave(importedData);
      showToast('Data imported successfully', 'success');
    } catch (error) {
      showToast('Failed to import data. Invalid JSON format.', 'error');
    }
    e.target.value = '';
  };

  const handleSetupGitHub = async () => {
    if (!githubToken.trim() || !githubOwner.trim() || !githubRepo.trim()) {
      showToast('Please fill in all GitHub fields', 'error');
      return;
    }

    try {
      const result = await dataService.setupGitHub(githubToken, githubOwner, githubRepo, githubBranch);
      if (result.success) {
        setCloudConfig(dataService.getGitHubConfig());
        setShowCloudSetup(false);
        setGithubToken('');
        setGithubOwner('');
        setGithubRepo('');
        setGithubBranch('main');
        showToast('GitHub sync enabled! Your data is now synced.', 'success');
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleToggleCloudSync = () => {
    if (cloudConfig.enabled) {
      dataService.disableCloudSync();
      showToast('GitHub sync disabled', 'info');
    } else {
      dataService.enableCloudSync();
      showToast('GitHub sync enabled', 'success');
    }
    setCloudConfig(dataService.getGitHubConfig());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage categories, GitHub sync, and data backup</p>
      </div>

      {/* GitHub Sync */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              GitHub Sync
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Sync your data across all devices using GitHub</p>
          </div>
          {cloudConfig && cloudConfig.owner && (
            <button
              onClick={handleToggleCloudSync}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                cloudConfig.enabled
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cloudConfig.enabled ? (
                <>
                  <Cloud className="w-5 h-5" />
                  Enabled
                </>
              ) : (
                <>
                  <CloudOff className="w-5 h-5" />
                  Disabled
                </>
              )}
            </button>
          )}
        </div>

        {!cloudConfig || !cloudConfig.owner ? (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Setup GitHub Sync</h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Create a <strong>private</strong> GitHub repository (e.g., "finance-data")</li>
                <li>Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
                <li>Generate new token with <strong>repo</strong> scope</li>
                <li>Copy the token and fill in the details below</li>
              </ol>
            </div>

            {!showCloudSetup ? (
              <button
                onClick={() => setShowCloudSetup(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Key className="w-5 h-5" />
                Setup GitHub Sync
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Token</label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner (Username)</label>
                    <input
                      type="text"
                      value={githubOwner}
                      onChange={(e) => setGithubOwner(e.target.value)}
                      placeholder="your-username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Repository Name</label>
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="finance-data"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch (optional)</label>
                  <input
                    type="text"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    placeholder="main"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSetupGitHub}
                    className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Enable GitHub Sync
                  </button>
                  <button
                    onClick={() => {
                      setShowCloudSetup(false);
                      setGithubToken('');
                      setGithubOwner('');
                      setGithubRepo('');
                      setGithubBranch('main');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                <strong>✓ GitHub sync is configured!</strong>
              </p>
              <p className="text-sm text-green-700 mt-1">
                Your data automatically syncs to GitHub on every change.
              </p>
              <div className="text-xs text-green-600 mt-2 space-y-1">
                <p>Repository: <strong>{cloudConfig.owner}/{cloudConfig.repo}</strong></p>
                <p>Branch: <strong>{cloudConfig.branch}</strong></p>
                <p>File: <strong>finance-data.json</strong></p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> View your data anytime at{' '}
                <a 
                  href={`https://github.com/${cloudConfig.owner}/${cloudConfig.repo}/blob/${cloudConfig.branch}/finance-data.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  github.com/{cloudConfig.owner}/{cloudConfig.repo}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* GitHub Backup History */}
      {cloudConfig && cloudConfig.owner && (
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 sm:w-6 sm:h-6" />
                Backup History
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Automatic backups stored on GitHub</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadBackups}
                disabled={loadingBackups}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loadingBackups ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Save className="w-4 h-4" />
                {creatingBackup ? 'Creating...' : 'Create Backup'}
              </button>
            </div>
          </div>

          {loadingBackups ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2 text-sm">Loading backups...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No backups found</p>
              <button
                onClick={handleCreateBackup}
                className="mt-3 text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Create your first backup
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {backups.slice(0, 10).map(backup => (
                  <div
                    key={backup.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{backup.name}</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(backup.date)} • {(backup.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestoreBackup(backup.name)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup.name)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {backups.length > 10 && (
                <p className="text-xs text-gray-500 text-center">
                  Showing 10 of {backups.length} backups
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCleanOldBackups}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  🗑️ Clean backups older than 30 days
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Backup & Restore */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Backup & Restore</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">Export your data as a backup file</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleExportYAML}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export YAML
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export JSON
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-gray-600 mb-3 text-sm sm:text-base">Import data from a backup file</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="w-5 h-5" />
                Import YAML
                <input
                  type="file"
                  accept=".yaml,.yml"
                  onChange={handleImportYAML}
                  className="hidden"
                />
              </label>
              <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="w-5 h-5" />
                Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">⚠️ This will replace all current data</p>
          </div>
        </div>
      </div>

      {/* Income Categories */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Income Categories</h2>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newIncomeCategory}
              onChange={(e) => setNewIncomeCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory('income')}
              placeholder="New income category"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={() => handleAddCategory('income')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.categories.income.map(category => (
              <div
                key={category}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <span className="font-medium text-gray-900">{category}</span>
                <button
                  onClick={() => handleDeleteCategory('income', category)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Expense Categories</h2>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newExpenseCategory}
              onChange={(e) => setNewExpenseCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory('expense')}
              placeholder="New expense category"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={() => handleAddCategory('expense')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.categories.expense.map(category => (
              <div
                key={category}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <span className="font-medium text-gray-900">{category}</span>
                <button
                  onClick={() => handleDeleteCategory('expense', category)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">About</h2>
        <div className="space-y-2 text-gray-600 text-sm sm:text-base">
          <p><strong>App:</strong> Track your Finance</p>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Currency:</strong> INR (₹)</p>
          <p><strong>Storage:</strong> Browser localStorage + GitHub sync (optional)</p>
          <p><strong>Cloud Provider:</strong> GitHub</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
