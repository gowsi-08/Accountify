import { useState } from 'react';
import { Lock, Shield } from 'lucide-react';

const PINSetup = ({ onSetup }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (!/^\d+$/.test(pin)) {
      setError('PIN must contain only numbers');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    onSetup(pin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Security PIN</h1>
          <p className="text-gray-600">Create a 4-digit PIN to secure your finance data</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 4-Digit PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 4))}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••"
              maxLength="4"
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm PIN
            </label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.slice(0, 4))}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••"
              maxLength="4"
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Setup PIN
          </button>
        </form>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> Remember your PIN! It will be required every time you open the app.
            After 4 wrong attempts, the app will be locked for 1 hour.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PINSetup;
