import { useState } from 'react';
import * as supabaseService from '../services/supabaseService';
import { Droplet, Users, Key } from 'lucide-react';

interface OnboardingMultiAccountProps {
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

type OnboardingMode = 'choose' | 'create' | 'join';

export default function OnboardingMultiAccount({ onComplete }: OnboardingMultiAccountProps) {
  const [mode, setMode] = useState<OnboardingMode>('choose');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create household state
  const [householdName, setHouseholdName] = useState('');
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState(PRESET_COLORS[0]);
  const [bottleSize, setBottleSize] = useState('16');

  // Join household state
  const [inviteCode, setInviteCode] = useState('');
  const [joinUserName, setJoinUserName] = useState('');
  const [joinUserColor, setJoinUserColor] = useState(PRESET_COLORS[1]);
  const [joinBottleSize, setJoinBottleSize] = useState('16');

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!householdName.trim() || !userName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const bottleSizeNum = parseFloat(bottleSize);
    if (isNaN(bottleSizeNum) || bottleSizeNum <= 0) {
      setError('Please enter a valid bottle size');
      return;
    }

    setLoading(true);
    try {
      await supabaseService.createHousehold(
        householdName.trim(),
        userName.trim(),
        userColor,
        bottleSizeNum
      );
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to create household');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inviteCode.trim() || !joinUserName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const bottleSizeNum = parseFloat(joinBottleSize);
    if (isNaN(bottleSizeNum) || bottleSizeNum <= 0) {
      setError('Please enter a valid bottle size');
      return;
    }

    setLoading(true);
    try {
      await supabaseService.acceptInvitation(
        inviteCode.trim().toUpperCase(),
        joinUserName.trim(),
        joinUserColor,
        bottleSizeNum
      );
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to join household');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                <Droplet className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
            <p className="text-gray-600">
              Get started by creating a household or joining an existing one
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full py-6 px-6 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-3"
            >
              <Users size={24} />
              <span>Create New Household</span>
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full py-6 px-6 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl shadow-md border-2 border-gray-200 hover:border-primary-300 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Key size={24} />
              <span>Join Existing Household</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                <Users className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Household</h1>
            <p className="text-gray-600">
              Set up your water tracking household
            </p>
          </div>

          <form onSubmit={handleCreateHousehold} className="space-y-6">
            {/* Household Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Household Name
              </label>
              <input
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="e.g. Smith Family"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Your Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Andy"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setUserColor(color)}
                    className={`w-10 h-10 rounded-full transition-all ${
                      userColor === color ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Bottle Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typical Bottle Size (oz)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={bottleSize}
                onChange={(e) => setBottleSize(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Household'}
              </button>

              <button
                type="button"
                onClick={() => setMode('choose')}
                className="w-full py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-2xl border-2 border-gray-200 transition-all"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Join mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <Key className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Household</h1>
          <p className="text-gray-600">
            Enter the invite code you received
          </p>
        </div>

        <form onSubmit={handleJoinHousehold} className="space-y-6">
          {/* Invite Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl font-bold tracking-widest uppercase"
              required
            />
          </div>

          {/* Your Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={joinUserName}
              onChange={(e) => setJoinUserName(e.target.value)}
              placeholder="e.g. Rachel"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setJoinUserColor(color)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    joinUserColor === color ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Bottle Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typical Bottle Size (oz)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              value={joinBottleSize}
              onChange={(e) => setJoinBottleSize(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Household'}
            </button>

            <button
              type="button"
              onClick={() => setMode('choose')}
              className="w-full py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-2xl border-2 border-gray-200 transition-all"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
