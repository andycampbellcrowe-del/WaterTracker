import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTodayTotal, getTodayByUserId, getProgressPercent, getLocalDateString } from '../utils/calculations';
import { formatVolume, getUnitLabel, litersToOz } from '../utils/conversions';
import DualProgressRing from '../components/DualProgressRing';
import Celebration from '../components/Celebration';
import { Droplet, Plus, Minus } from 'lucide-react';

export default function Today() {
  const { state, addIntake } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);

  const { settings, entries, users, currentUser } = state;

  // Auto-select current user by default
  useEffect(() => {
    if (currentUser && !selectedUserId) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser, selectedUserId]);

  const todayTotal = getTodayTotal(entries);

  // Convert goal to oz for calculations
  const goalOz = settings.unit === 'l' ? litersToOz(settings.dailyGoalVolume) : settings.dailyGoalVolume;
  const progressPercent = getProgressPercent(todayTotal, goalOz);

  // Calculate each user's totals and percentages
  const userStats = users.map(user => {
    const total = getTodayByUserId(entries, user.id);
    const percent = getProgressPercent(total, goalOz);
    return { user, total, percent };
  });

  const selectedUser = users.find(u => u.id === selectedUserId);
  const bottleSize = selectedUser?.bottleSizeOz || 16;

  // Check for goal completion and trigger celebration
  useEffect(() => {
    if (
      settings.celebrationEnabled &&
      todayTotal >= goalOz &&
      lastTotal < goalOz &&
      !state.celebratedDates.includes(getLocalDateString())
    ) {
      setShowCelebration(true);
    }
    setLastTotal(todayTotal);
  }, [todayTotal, goalOz, lastTotal, settings.celebrationEnabled, state.celebratedDates]);

  const handleAddIntake = (bottleCount: number) => {
    if (!selectedUserId) return;
    const volumeOz = bottleSize * bottleCount;
    addIntake(selectedUserId, volumeOz);
  };

  const handleCustomAdd = () => {
    if (!selectedUserId) return;
    const amount = parseFloat(customAmount);
    if (!isNaN(amount) && amount > 0) {
      addIntake(selectedUserId, amount * bottleSize);
      setCustomAmount('');
    }
  };

  const goalMet = todayTotal >= goalOz;

  if (users.length === 0) {
    return (
      <div className="py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <header className="text-center">
        {currentUser && (
          <p className="text-lg text-gray-600 mb-2">
            Welcome back, <span className="font-semibold" style={{ color: currentUser.color }}>{currentUser.displayName}</span>!
          </p>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Today's Progress</h1>
        <time className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>
        {goalMet && (
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <span className="text-lg" role="img" aria-label="Trophy">🏆</span>
            <span className="font-semibold">Goal Met!</span>
          </div>
        )}
      </header>

      {/* User Selector */}
      <div className="flex gap-3 justify-center flex-wrap" role="group" aria-label="Select user">
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => setSelectedUserId(user.id)}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all min-h-[48px] ${
              selectedUserId === user.id
                ? 'text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border-2 hover:shadow-md'
            }`}
            style={{
              backgroundColor: selectedUserId === user.id ? user.color : undefined,
              borderColor: selectedUserId === user.id ? user.color : '#e5e7eb'
            }}
            aria-pressed={selectedUserId === user.id}
          >
            {user.displayName}
          </button>
        ))}
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center py-4">
        <DualProgressRing
          totalPercent={progressPercent}
          users={userStats}
        />
      </div>

      {/* Combined Progress Info */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Combined Total</h2>
          <Droplet className="text-primary-500" size={24} aria-hidden="true" />
        </div>
        <div className="text-center mb-4">
          <span className="text-4xl font-bold text-gray-900">
            {formatVolume(todayTotal, settings.unit)}
          </span>
          <span className="text-2xl text-gray-600 ml-2">{getUnitLabel(settings.unit)}</span>
          <span className="text-gray-500 mx-2">/</span>
          <span className="text-2xl text-gray-600">
            {formatVolume(goalOz, settings.unit)} {getUnitLabel(settings.unit)}
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden flex">
          {userStats.map((stat) => {
            const widthPercent = (stat.total / goalOz) * 100;
            return (
              <div
                key={stat.user.id}
                className="transition-all duration-700"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: stat.user.color
                }}
                role="progressbar"
                aria-valuenow={stat.total}
                aria-valuemin={0}
                aria-valuemax={goalOz}
                aria-label={`${stat.user.displayName}'s progress: ${formatVolume(stat.total, settings.unit)} ${getUnitLabel(settings.unit)}`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-around mt-4 text-sm flex-wrap gap-2">
          {userStats.map(stat => {
            const userPercent = todayTotal > 0 ? (stat.total / todayTotal) * 100 : 100 / users.length;
            return (
              <div key={stat.user.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: stat.user.color }}
                />
                <span className="text-gray-700">
                  {stat.user.displayName} {userPercent.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Buttons */}
      {selectedUser && (
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Add for {selectedUser.displayName}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Bottle size: {formatVolume(settings.unit === 'l' ? bottleSize / 33.814 : bottleSize, settings.unit)} {getUnitLabel(settings.unit)}
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={() => handleAddIntake(1)}
                className="flex-1 py-4 px-6 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[56px] flex items-center justify-center gap-2"
                style={{ backgroundColor: selectedUser.color }}
                aria-label="Add one full bottle"
              >
                <Plus size={24} aria-hidden="true" />
                <span>+1 Bottle</span>
              </button>

              <button
                onClick={() => handleAddIntake(-1)}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[56px] flex items-center justify-center gap-2"
                aria-label="Remove one full bottle"
              >
                <Minus size={24} aria-hidden="true" />
                <span>-1 Bottle</span>
              </button>
            </div>

            <button
              onClick={() => handleAddIntake(0.5)}
              className="w-full py-4 px-6 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[56px] flex items-center justify-center gap-2 opacity-80 hover:opacity-100"
              style={{ backgroundColor: selectedUser.color }}
              aria-label="Add half bottle"
            >
              <Plus size={24} aria-hidden="true" />
              <span>+½ Bottle</span>
            </button>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.25"
                min="0"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Custom amount"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[48px]"
                aria-label="Custom bottle amount"
              />
              <button
                onClick={handleCustomAdd}
                disabled={!customAmount || parseFloat(customAmount) <= 0}
                className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                aria-label="Add custom amount"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-Person Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userStats.map(stat => (
          <div
            key={stat.user.id}
            className="bg-gradient-to-br rounded-3xl shadow-lg p-6 border-2"
            style={{
              backgroundColor: `${stat.user.color}10`,
              borderColor: `${stat.user.color}40`
            }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{stat.user.displayName}</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatVolume(stat.total, settings.unit)}
              <span className="text-lg text-gray-600 ml-1">{getUnitLabel(settings.unit)}</span>
            </div>
            <div className="text-sm text-gray-600">
              {stat.percent.toFixed(1)}% of goal
            </div>
          </div>
        ))}
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <Celebration
          onClose={() => {
            setShowCelebration(false);
            const today = getLocalDateString();
            if (!state.celebratedDates.includes(today)) {
              state.celebratedDates.push(today);
            }
          }}
          soundEnabled={settings.soundEnabled}
        />
      )}
    </div>
  );
}
