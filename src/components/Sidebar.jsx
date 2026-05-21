import { LayoutDashboard, ArrowLeftRight, Wallet, Users, Target, CreditCard, BarChart3, Settings, Upload, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import RateLimitBadge from './RateLimitBadge';

const Sidebar = ({ currentPage, onNavigate, unsavedChanges, onSync, onLogout, isSyncing, darkMode, onToggleDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'chitfund', label: 'Chit Fund', icon: Users },
    { id: 'budget', label: 'Budget', icon: Target },
    { id: 'loans', label: 'Loans & EMI', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gray-900 dark:bg-gray-950 text-white min-h-screen p-4 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-400">₹ Track your Finance</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your money</p>
        </div>

        {/* Reload Button */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg mb-3 font-semibold transition-colors
            ${isSyncing 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
            }
          `}
        >
          <Upload className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Reloading...' : 'Reload from GitHub'}
        </button>

        {/* Rate Limit Badge */}
        <div className="mb-4">
          <RateLimitBadge />
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-800 dark:bg-gray-900 hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors font-semibold mb-3"
        >
          {darkMode ? (
            <>
              <Sun className="w-5 h-5" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              Dark Mode
            </>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors font-semibold mt-4"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-800 dark:border-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-600 text-center">
            Secured with PIN • Direct GitHub Access
          </p>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
