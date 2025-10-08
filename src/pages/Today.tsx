import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTodayTotal, getTodayByUserId, getProgressPercent, getLocalDateString } from '../utils/calculations';
import { formatVolume, getUnitLabel, litersToOz } from '../utils/conversions';
import { getWeeklyWorkoutStats } from '../utils/workoutCalculations';
import PersonalMetricsCard from '../components/PersonalMetricsCard';
import Celebration from '../components/Celebration';
import { Droplet, Plus, Minus, Dumbbell, Heart } from 'lucide-react';

export default function Today() {
  const { state, addIntake, addWorkout } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const { settings, entries, users, currentUser, workoutEntries } = state;

  // Auto-select current user by default
  useEffect(() => {
    if (currentUser && !selectedUserId) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser, selectedUserId]);

  const todayTotal = getTodayTotal(entries);

  // Convert goal to oz for calculations (per person)
  const goalOz = settings.unit === 'l' ? litersToOz(settings.dailyGoalVolume) : settings.dailyGoalVolume;

  // Calculate each user's totals and percentages (each user has their own goal)
  const userStats = users.map(user => {
    const total = getTodayByUserId(entries, user.id);
    const percent = getProgressPercent(total, goalOz);
    return { user, total, percent };
  });

  const selectedUser = users.find(u => u.id === selectedUserId);
  const bottleSize = selectedUser?.bottleSizeOz || 16;

  // Workout calculations
  const workoutStats = getWeeklyWorkoutStats(workoutEntries, users);

  // Check for goal completion and trigger celebration (all users must meet their individual goals)
  const allUsersMetGoal = users.length > 0 && userStats.every(stat => stat.total >= goalOz);
  useEffect(() => {
    if (
      settings.celebrationEnabled &&
      allUsersMetGoal &&
      lastTotal < goalOz * users.length &&
      !state.celebratedDates.includes(getLocalDateString())
    ) {
      setShowCelebration(true);
    }
    setLastTotal(todayTotal);
  }, [todayTotal, goalOz, lastTotal, settings.celebrationEnabled, state.celebratedDates, allUsersMetGoal, users.length]);

  const handleAddIntake = (bottleCount: number) => {
    if (!selectedUserId) return;
    const volumeOz = bottleSize * bottleCount;

    // Prevent going into negative: if removing water, cap at current total
    if (volumeOz < 0) {
      const currentUserTotal = getTodayByUserId(entries, selectedUserId);
      if (currentUserTotal + volumeOz < 0) {
        // Cap the removal to prevent negative total
        addIntake(selectedUserId, -currentUserTotal);
        return;
      }
    }

    addIntake(selectedUserId, volumeOz);
  };

  const handleCustomAdd = () => {
    if (!selectedUserId) return;
    const amount = parseFloat(customAmount);
    if (!isNaN(amount) && amount > 0) {
      addIntake(selectedUserId, amount);
      setCustomAmount('');
    }
  };

  const handleQuickAddWorkout = async (workoutType: 'cardio' | 'strength', durationHours: number) => {
    if (!selectedUserId) return;
    try {
      await addWorkout(selectedUserId, workoutType, durationHours);
    } catch (error) {
      alert('Failed to add workout. Please try again.');
    }
  };

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
      {/* Header - Personal Welcome */}
      <header className="text-center">
        {currentUser && (
          <p className="text-2xl text-gray-900 mb-1">
            👋 Welcome back, <span className="font-bold" style={{ color: currentUser.color }}>{currentUser.displayName}</span>!
          </p>
        )}
        <time className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </time>
      </header>

      {/* Quick Actions Panel - At Top! */}
      {selectedUser && (
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl shadow-lg p-6 border-2 border-purple-100">
          <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">🚀 Quick Actions</h2>
          <p className="text-sm text-gray-600 mb-5 text-center">Log water or workouts instantly</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Water Section */}
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Droplet className="text-blue-500" size={22} />
                <h3 className="text-base font-bold text-gray-900">Water</h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleAddIntake(1)}
                  className="w-full py-4 px-6 text-white font-bold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[56px] flex items-center justify-center gap-2 text-lg"
                  style={{ backgroundColor: selectedUser.color }}
                  aria-label="Add one full bottle"
                >
                  <Plus size={24} aria-hidden="true" />
                  <span>Add 1 Bottle</span>
                </button>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Custom oz"
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px]"
                      aria-label="Custom ounces amount"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                      oz
                    </span>
                  </div>
                  <button
                    onClick={handleCustomAdd}
                    disabled={!customAmount || parseFloat(customAmount) <= 0}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                    aria-label="Add custom amount"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowRemoveConfirm(true)}
                    disabled={!customAmount || parseFloat(customAmount) <= 0}
                    className="px-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px]"
                    aria-label="Remove custom amount"
                    title="Remove water"
                  >
                    <Minus size={18} aria-hidden="true" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Your bottle: {formatVolume(settings.unit === 'l' ? bottleSize / 33.814 : bottleSize, settings.unit)} {getUnitLabel(settings.unit)}
                </p>
              </div>
            </div>

            {/* Workout Section */}
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="text-purple-600" size={22} />
                <h3 className="text-base font-bold text-gray-900">Workouts</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Cardio 30min */}
                <button
                  onClick={() => handleQuickAddWorkout('cardio', 0.5)}
                  className="py-3 px-2 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 flex flex-col items-center justify-center gap-1"
                  aria-label="Log 30 minute cardio workout"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-xs">Cardio</span>
                  <span className="text-xs opacity-90">30min</span>
                </button>

                {/* Cardio 1hr */}
                <button
                  onClick={() => handleQuickAddWorkout('cardio', 1)}
                  className="py-3 px-2 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 flex flex-col items-center justify-center gap-1"
                  aria-label="Log 1 hour cardio workout"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-xs">Cardio</span>
                  <span className="text-xs opacity-90">1hr</span>
                </button>

                {/* Strength 30min */}
                <button
                  onClick={() => handleQuickAddWorkout('strength', 0.5)}
                  className="py-3 px-2 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 flex flex-col items-center justify-center gap-1"
                  aria-label="Log 30 minute strength workout"
                >
                  <Dumbbell className="w-5 h-5" />
                  <span className="text-xs">Strength</span>
                  <span className="text-xs opacity-90">30min</span>
                </button>

                {/* Strength 1hr */}
                <button
                  onClick={() => handleQuickAddWorkout('strength', 1)}
                  className="py-3 px-2 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 flex flex-col items-center justify-center gap-1"
                  aria-label="Log 1 hour strength workout"
                >
                  <Dumbbell className="w-5 h-5" />
                  <span className="text-xs">Strength</span>
                  <span className="text-xs opacity-90">1hr</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Personal Metrics Card - Your Progress */}
      {currentUser && selectedUser && (
        <PersonalMetricsCard
          user={currentUser}
          waterTotal={getTodayByUserId(entries, currentUser.id)}
          waterGoal={goalOz}
          waterPercent={getProgressPercent(getTodayByUserId(entries, currentUser.id), goalOz)}
          cardioHours={workoutStats.find(s => s.user.id === currentUser.id)?.cardioHours || 0}
          cardioGoal={currentUser.weeklyCardioGoalHours}
          cardioPercent={workoutStats.find(s => s.user.id === currentUser.id)?.cardioPercent || 0}
          strengthHours={workoutStats.find(s => s.user.id === currentUser.id)?.strengthHours || 0}
          strengthGoal={currentUser.weeklyStrengthGoalHours}
          strengthPercent={workoutStats.find(s => s.user.id === currentUser.id)?.strengthPercent || 0}
          unit={settings.unit}
        />
      )}

      {/* Remove Confirmation Dialog */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Remove Water?</h3>
            <p className="text-gray-600 mb-6">
              This will remove {customAmount} oz from {selectedUser?.displayName}'s total.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const amount = parseFloat(customAmount);
                  if (!isNaN(amount) && amount > 0) {
                    addIntake(selectedUserId, -amount);
                    setCustomAmount('');
                  }
                  setShowRemoveConfirm(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-2xl transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

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
