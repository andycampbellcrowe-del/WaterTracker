import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Dumbbell, Heart, Trash2 } from 'lucide-react';
import QuickAddWorkout from '../components/QuickAddWorkout';
import type { WorkoutType } from '../types';

export default function Workouts() {
  const { state, addWorkout, deleteWorkoutEntry } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [workoutType, setWorkoutType] = useState<WorkoutType>('cardio');
  const [durationHours, setDurationHours] = useState(0.25);
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const { users, currentUser, workoutEntries } = state;

  // Auto-select current user by default
  useEffect(() => {
    if (currentUser && !selectedUserId) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser, selectedUserId]);

  // Get current week's start (Sunday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Filter entries for this week
  const thisWeekEntries = workoutEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });

  // Calculate stats per user
  const userStats = users.map(user => {
    const userEntries = thisWeekEntries.filter(e => e.householdUserId === user.id);
    const cardioHours = userEntries
      .filter(e => e.workoutType === 'cardio')
      .reduce((sum, e) => sum + e.durationHours, 0);
    const strengthHours = userEntries
      .filter(e => e.workoutType === 'strength')
      .reduce((sum, e) => sum + e.durationHours, 0);

    const cardioPercent = user.weeklyCardioGoalHours > 0
      ? Math.round((cardioHours / user.weeklyCardioGoalHours) * 100)
      : 0;
    const strengthPercent = user.weeklyStrengthGoalHours > 0
      ? Math.round((strengthHours / user.weeklyStrengthGoalHours) * 100)
      : 0;

    return {
      user,
      cardioHours,
      strengthHours,
      cardioPercent,
      strengthPercent,
      entries: userEntries
    };
  });

  const handleQuickAddWorkout = async (workoutType: WorkoutType, durationHours: number) => {
    if (!selectedUserId) return;
    try {
      await addWorkout(selectedUserId, workoutType, durationHours);
    } catch (error) {
      alert('Failed to add workout. Please try again.');
    }
  };

  const handleAddWorkout = async () => {
    if (!selectedUserId || durationHours <= 0) return;

    try {
      await addWorkout(selectedUserId, workoutType, durationHours, notes || undefined);
      setNotes('');
      setDurationHours(0.25);
      setShowAddForm(false);
    } catch (error) {
      alert('Failed to add workout. Please try again.');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Delete this workout entry?')) return;
    try {
      await deleteWorkoutEntry(entryId);
    } catch (error) {
      alert('Failed to delete entry. Please try again.');
    }
  };

  const formatDuration = (hours: number): string => {
    if (hours === 1) return '1 hr';
    return `${hours} hrs`;
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
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Workout Tracking</h1>
        <p className="text-sm text-gray-600">
          Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </header>

      {/* Weekly Progress by User */}
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Progress</h2>
        <div className="space-y-4">
          {userStats.map(({ user, cardioHours, strengthHours, cardioPercent, strengthPercent }) => (
            <div key={user.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: user.color }}
                >
                  {user.displayName[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
                </div>
              </div>

              {/* Cardio Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-700">Cardio</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDuration(cardioHours)} / {formatDuration(user.weeklyCardioGoalHours)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(cardioPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Strength Progress */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Strength</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDuration(strengthHours)} / {formatDuration(user.weeklyStrengthGoalHours)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(strengthPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Add Workout Section */}
      {!showAddForm && selectedUserId && (
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <QuickAddWorkout
            selectedUser={users.find(u => u.id === selectedUserId)}
            onAddWorkout={handleQuickAddWorkout}
            onCustomWorkout={() => setShowAddForm(true)}
          />
        </section>
      )}

      {/* Add Workout Form */}
      {showAddForm && (
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Log Workout</h2>

          {/* User Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Who worked out?</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Workout Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Workout Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWorkoutType('cardio')}
                className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
                  workoutType === 'cardio'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className="w-5 h-5" />
                Cardio
              </button>
              <button
                onClick={() => setWorkoutType('strength')}
                className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
                  workoutType === 'strength'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Dumbbell className="w-5 h-5" />
                Strength
              </button>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (hours, in 0.25 increments)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={durationHours}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0.25) {
                    setDurationHours(Math.round(val * 4) / 4);
                  }
                }}
                min="0.25"
                step="0.25"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-600">{formatDuration(durationHours)}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setDurationHours(0.25)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                0.25
              </button>
              <button
                onClick={() => setDurationHours(0.5)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                0.5
              </button>
              <button
                onClick={() => setDurationHours(1)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                1
              </button>
              <button
                onClick={() => setDurationHours(1.5)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                1.5
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., 5K run, chest and triceps, yoga class..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWorkout}
              disabled={!selectedUserId || durationHours <= 0 || (durationHours * 4) % 1 !== 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg"
            >
              Add Workout
            </button>
          </div>
        </section>
      )}

      {/* Recent Workouts */}
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Workouts</h2>
        {thisWeekEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No workouts logged this week yet.</p>
        ) : (
          <div className="space-y-3">
            {thisWeekEntries.map(entry => {
              const user = users.find(u => u.id === entry.householdUserId);
              if (!user) return null;

              return (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.displayName[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {entry.workoutType === 'cardio' ? (
                          <Heart className="w-4 h-4 text-red-500" />
                        ) : (
                          <Dumbbell className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="font-medium text-gray-900 capitalize">
                          {entry.workoutType}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-600">{formatDuration(entry.durationHours)}</span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-500 mt-1">{entry.notes}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(entry.timestamp).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
