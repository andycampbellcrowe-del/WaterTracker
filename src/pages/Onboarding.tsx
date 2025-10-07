import { useState } from 'react';
import { Droplet, Plus, X } from 'lucide-react';

interface OnboardingProps {
  profileId?: string; // Optional since no longer used
  onComplete: () => void;
}

const PRESET_COLORS = [
  '#ec4899', // pink
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [users, setUsers] = useState<Array<{ name: string; color: string; bottleSize: string }>>([
    { name: '', color: PRESET_COLORS[0], bottleSize: '16' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addUser = () => {
    const nextColorIndex = users.length % PRESET_COLORS.length;
    setUsers([...users, { name: '', color: PRESET_COLORS[nextColorIndex], bottleSize: '16' }]);
  };

  const removeUser = (index: number) => {
    if (users.length > 1) {
      setUsers(users.filter((_, i) => i !== index));
    }
  };

  const updateUser = (index: number, field: 'name' | 'color' | 'bottleSize', value: string) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    setUsers(newUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (users.some(u => !u.name.trim())) {
      setError('Please enter names for all users');
      return;
    }

    if (users.some(u => isNaN(parseFloat(u.bottleSize)) || parseFloat(u.bottleSize) <= 0)) {
      setError('Please enter valid bottle sizes');
      return;
    }

    setLoading(true);
    try {
      // Note: This old onboarding is no longer used
      // The multi-account onboarding (OnboardingMultiAccount.tsx) is used instead
      console.warn('Old onboarding called - should use OnboardingMultiAccount instead');
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to create users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <Droplet className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Household</h1>
          <p className="text-gray-600">
            Add the people who will be tracking water together
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Users */}
          {users.map((user, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-2xl p-4 relative">
              {users.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUser(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Remove user"
                >
                  <X size={16} className="text-red-600" />
                </button>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => updateUser(index, 'name', e.target.value)}
                    placeholder="e.g. Rachel"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateUser(index, 'color', color)}
                        className={`w-10 h-10 rounded-full transition-all ${
                          user.color === color ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typical Bottle Size (oz)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={user.bottleSize}
                    onChange={(e) => updateUser(index, 'bottleSize', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add User Button */}
          <button
            type="button"
            onClick={addUser}
            className="w-full py-4 px-6 border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 rounded-2xl transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-primary-600 font-medium"
          >
            <Plus size={20} />
            <span>Add Another Person</span>
          </button>

          {error && (
            <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Start Tracking'}
          </button>
        </form>
      </div>
    </div>
  );
}
