import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import PINSetup from './components/PINSetup';
import PINLogin from './components/PINLogin';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import ChitFund from './pages/ChitFund';
import Budget from './pages/Budget';
import Loans from './pages/Loans';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { dataService } from './api/dataService';
import { config } from './config';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [authState, setAuthState] = useState('checking');
  const [unsavedChanges, setUnsavedChanges] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  // Reload data when page changes to ensure fresh data
  useEffect(() => {
    if (authState === 'authenticated' && data) {
      console.log('📄 Page changed, reloading data from GitHub...');
      loadData(false, false);
    }
  }, [currentPage]);

  // No caching - direct GitHub access

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Load dark mode preference from data
    if (data?.settings?.darkMode) {
      setDarkMode(data.settings.darkMode);
    }
  }, [data?.settings?.darkMode]);

  const initializeApp = async () => {
    try {
      // Auto-setup GitHub if configured
      if (config.github.autoSetup && config.github.token && config.github.owner && config.github.repo) {
        const existingConfig = dataService.getGitHubConfig();
        if (!existingConfig || !existingConfig.token) {
          console.log('Auto-configuring GitHub...');
          try {
            await dataService.setupGitHub(
              config.github.token,
              config.github.owner,
              config.github.repo,
              config.github.branch
            );
            console.log('✅ GitHub auto-configured');
          } catch (error) {
            console.error('❌ GitHub auto-setup failed:', error.message);
          }
        }
      }

      // Auto-setup PIN if configured
      if (config.security.autoSetup && config.security.pin) {
        const existingAuth = dataService.getAuthData();
        if (!existingAuth) {
          console.log('Auto-configuring PIN...');
          dataService.setupPIN(config.security.pin);
          console.log('✅ PIN auto-configured');
        }
      }

      await checkAuth();
    } catch (error) {
      console.error('Initialization error:', error);
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    if (dataService.isAuthenticated()) {
      setAuthState('authenticated');
      loadData(false, true); // isInitialLoad = true
      return;
    }

    const authData = dataService.getAuthData();
    
    if (!authData) {
      setAuthState('setup');
    } else {
      setAuthState('login');
    }
    
    setLoading(false);
  };

  const handlePINSetup = (pin) => {
    dataService.setupPIN(pin);
    dataService.setAuthenticated();
    setAuthState('authenticated');
    loadData(false, true); // isInitialLoad = true
    showToast('PIN setup successful!', 'success');
  };

  const handlePINLogin = async (pin) => {
    const result = dataService.verifyPIN(pin);
    if (result.success) {
      dataService.setAuthenticated();
      setAuthState('authenticated');
      setLoading(true); // Show loading state while data loads
      await loadData(false, true); // isInitialLoad = true
      showToast('Welcome back!', 'success');
      return { success: true };
    } else {
      return result;
    }
  };

  const loadData = async (showSuccessToast = false, isInitialLoad = false) => {
    setLoading(true);
    try {
      console.log('📥 Loading data from GitHub...');
      const fetchedData = await dataService.loadAllDataFromGitHub();
      setData(fetchedData);
      setUnsavedChanges(0);
      console.log('✅ Data loaded successfully');
      if (showSuccessToast) {
        showToast('✅ Data loaded from GitHub', 'success');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      
      // Only show error toast if it's not the initial load after login
      if (!isInitialLoad) {
        showToast('❌ Failed to load data: ' + error.message, 'error');
      } else {
        console.log('Setting up with default data structure...');
      }
      
      // Set empty data structure so app can still work
      setData({
        accounts: [],
        transactions: [],
        categories: {
          income: ['Salary', 'Freelance', 'Interest', 'Dividend', 'Rental', 'Other Income'],
          expense: ['Food', 'Transport', 'Bills & Utilities', 'Shopping', 'Medical', 'Entertainment', 'Investment', 'Other Expense']
        },
        settings: {
          currency: 'INR',
          theme: 'light',
          darkMode: false,
          budgets: {},
          loans: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData, changedSections = []) => {
    try {
      // Save sequentially to avoid 409 conflicts
      if (changedSections.includes('accounts') || changedSections.length === 0) {
        await dataService.saveAccounts(newData.accounts);
      }
      if (changedSections.includes('transactions') || changedSections.length === 0) {
        await dataService.saveTransactions(newData.transactions);
      }
      if (changedSections.includes('categories') || changedSections.length === 0) {
        await dataService.saveCategories(newData.categories);
      }
      if (changedSections.includes('settings') || changedSections.length === 0) {
        await dataService.saveSettings(newData.settings);
      }
      
      // Reload fresh data from GitHub after every save
      console.log('🔄 Reloading fresh data from GitHub...');
      const freshData = await dataService.loadAllDataFromGitHub();
      setData(freshData);
      
      showToast('✅ Saved to GitHub', 'success');
    } catch (error) {
      console.error('Failed to save data:', error);
      showToast('❌ Failed to save to GitHub: ' + error.message, 'error');
      // Reload from GitHub on error to get correct state
      try {
        const freshData = await dataService.loadAllDataFromGitHub();
        setData(freshData);
      } catch (reloadError) {
        console.error('Failed to reload after error:', reloadError);
      }
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (data) {
      const updatedData = {
        ...data,
        settings: {
          ...data.settings,
          darkMode: newDarkMode
        }
      };
      saveData(updatedData, ['settings']);
      showToast(`${newDarkMode ? '🌙 Dark' : '☀️ Light'} mode enabled`, 'success');
    }
  };

  const handleSync = async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      console.log('🔄 Reloading from GitHub...');
      const fetchedData = await dataService.loadAllDataFromGitHub();
      setData(fetchedData);
      setUnsavedChanges(0);
      showToast('✅ Data reloaded from GitHub!', 'success');
    } catch (error) {
      console.error('Reload failed:', error);
      showToast('❌ Reload failed: ' + error.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    dataService.logout();
    setAuthState('login');
    setData(null);
    setUnsavedChanges(0);
    showToast('👋 Logged out successfully', 'info');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  if (authState === 'setup') {
    return <PINSetup onSetup={handlePINSetup} />;
  }

  if (authState === 'login') {
    const authData = dataService.getAuthData();
    const lockInfo = authData && authData.lockedUntil && Date.now() < authData.lockedUntil
      ? { locked: true, lockedUntil: authData.lockedUntil }
      : null;
    
    return <PINLogin onLogin={handlePINLogin} lockInfo={lockInfo} />;
  }

  if (loading || authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your finances...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load data. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    const pageProps = { data, onSave: saveData, showToast };

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'transactions':
        return <Transactions {...pageProps} />;
      case 'accounts':
        return <Accounts {...pageProps} />;
      case 'chitfund':
        return <ChitFund {...pageProps} />;
      case 'budget':
        return <Budget {...pageProps} />;
      case 'loans':
        return <Loans {...pageProps} />;
      case 'reports':
        return <Reports {...pageProps} />;
      case 'settings':
        return <Settings {...pageProps} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        unsavedChanges={unsavedChanges}
        onSync={handleSync}
        onLogout={handleLogout}
        isSyncing={isSyncing}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      <main className="flex-1 p-4 lg:p-8 overflow-auto lg:ml-0 ml-0">
        <div className="lg:hidden h-16" /> {/* Spacer for mobile menu button */}
        {renderPage()}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}

export default App;
