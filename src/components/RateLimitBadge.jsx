import { useEffect, useState } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import { dataService } from '../api/dataService';

const RateLimitBadge = () => {
  const [rateLimit, setRateLimit] = useState(null);

  useEffect(() => {
    updateRateLimit();
    const interval = setInterval(updateRateLimit, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const updateRateLimit = () => {
    const limit = dataService.getRateLimit();
    setRateLimit(limit);
  };

  if (!rateLimit) return null;

  const percentage = (rateLimit.remaining / rateLimit.total) * 100;
  const isLow = percentage < 20;
  const isCritical = percentage < 10;

  const getColor = () => {
    if (isCritical) return 'bg-red-100 text-red-800 border-red-300';
    if (isLow) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getTimeUntilReset = () => {
    const minutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
    return minutes;
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getColor()} transition-colors`}>
      {isCritical ? (
        <AlertTriangle className="w-4 h-4" />
      ) : (
        <Activity className="w-4 h-4" />
      )}
      <div className="flex flex-col">
        <span className="text-xs font-semibold">
          API: {rateLimit.remaining}/{rateLimit.total}
        </span>
        <span className="text-xs opacity-75">
          Resets in {getTimeUntilReset()}m
        </span>
      </div>
    </div>
  );
};

export default RateLimitBadge;
