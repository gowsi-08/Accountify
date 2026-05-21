import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const SyncIndicator = ({ lastSyncTime, syncStatus }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastSyncTime) return;

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSyncTime) / 1000);
      if (seconds < 60) {
        setTimeAgo('just now');
      } else if (seconds < 3600) {
        setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      } else {
        setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  const getStatusDisplay = () => {
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: 'Syncing...',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      case 'synced':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: `Synced ${timeAgo}`,
          color: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Sync failed',
          color: 'text-red-600 bg-red-50 border-red-200'
        };
      case 'offline':
        return {
          icon: <CloudOff className="w-4 h-4" />,
          text: 'Offline',
          color: 'text-gray-600 bg-gray-50 border-gray-200'
        };
      default:
        return {
          icon: <Cloud className="w-4 h-4" />,
          text: 'Not synced',
          color: 'text-gray-600 bg-gray-50 border-gray-200'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${status.color}`}>
      {status.icon}
      <span className="font-medium">{status.text}</span>
    </div>
  );
};

export default SyncIndicator;
