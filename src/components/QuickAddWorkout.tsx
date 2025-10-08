import { Heart, Dumbbell } from 'lucide-react';
import type { WorkoutType, HouseholdUser } from '../types';

interface QuickAddWorkoutProps {
  selectedUser: HouseholdUser | undefined;
  onAddWorkout: (workoutType: WorkoutType, durationHours: number) => void;
  onCustomWorkout?: () => void;
}

export default function QuickAddWorkout({
  selectedUser,
  onAddWorkout,
  onCustomWorkout
}: QuickAddWorkoutProps) {
  if (!selectedUser) {
    return (
      <div className="text-center text-gray-500 py-4">
        Please select a user to log workouts
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900">
        Quick Log for {selectedUser.displayName}
      </h3>

      {/* 2x2 Grid of Quick-Add Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cardio 30min */}
        <button
          onClick={() => onAddWorkout('cardio', 0.5)}
          className="py-4 px-4 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[64px] flex flex-col items-center justify-center gap-1"
          aria-label="Log 30 minute cardio workout"
        >
          <Heart className="w-6 h-6" />
          <span className="text-sm">Cardio</span>
          <span className="text-xs opacity-90">30 min</span>
        </button>

        {/* Cardio 1hr */}
        <button
          onClick={() => onAddWorkout('cardio', 1)}
          className="py-4 px-4 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[64px] flex flex-col items-center justify-center gap-1"
          aria-label="Log 1 hour cardio workout"
        >
          <Heart className="w-6 h-6" />
          <span className="text-sm">Cardio</span>
          <span className="text-xs opacity-90">1 hr</span>
        </button>

        {/* Strength 30min */}
        <button
          onClick={() => onAddWorkout('strength', 0.5)}
          className="py-4 px-4 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[64px] flex flex-col items-center justify-center gap-1"
          aria-label="Log 30 minute strength workout"
        >
          <Dumbbell className="w-6 h-6" />
          <span className="text-sm">Strength</span>
          <span className="text-xs opacity-90">30 min</span>
        </button>

        {/* Strength 1hr */}
        <button
          onClick={() => onAddWorkout('strength', 1)}
          className="py-4 px-4 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[64px] flex flex-col items-center justify-center gap-1"
          aria-label="Log 1 hour strength workout"
        >
          <Dumbbell className="w-6 h-6" />
          <span className="text-sm">Strength</span>
          <span className="text-xs opacity-90">1 hr</span>
        </button>
      </div>

      {/* Custom Workout Button (Optional) */}
      {onCustomWorkout && (
        <button
          onClick={onCustomWorkout}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <span>+ Custom Workout</span>
        </button>
      )}
    </div>
  );
}
