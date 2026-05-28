import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

const PINLogin = ({ onLogin, lockInfo }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    const result = onLogin(pin);
    if (!result.success) {
      setError(result.error);
      setAttempts(prev => prev + 1);
      setPin('');
    }
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
  };

  if (lockInfo && lockInfo.locked) {
    const remainingTime = Math.ceil((lockInfo.lockedUntil - Date.now()) / 60000);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Locked</h1>
            <p className="text-gray-600 mb-6">
              Too many failed attempts. Please try again in:
            </p>
            <div className="text-5xl font-bold text-red-600 mb-6">
              {remainingTime} min
            </div>
            <p className="text-sm text-gray-500">
              The app will automatically unlock after the time expires.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter PIN</h1>
          <p className="text-gray-600">Enter your 4-digit PIN to access your finance data</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={pin}
              onChange={handlePinChange}
              className="w-full px-4 py-4 text-center text-3xl tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••"
              maxLength="4"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Unlock
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {4 - attempts} attempts remaining before lockout
          </p>
        </div>
      </div>
    </div>
  );
};

export default PINLogin;
