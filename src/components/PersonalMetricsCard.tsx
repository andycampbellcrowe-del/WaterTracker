import { Droplet, Heart, Dumbbell, TrendingUp, CheckCircle2 } from 'lucide-react';
import { HouseholdUser } from '../types';
import { formatVolume, getUnitLabel } from '../utils/conversions';

interface PersonalMetricsCardProps {
  user: HouseholdUser;
  waterTotal: number;
  waterGoal: number;
  waterPercent: number;
  cardioHours: number;
  cardioGoal: number;
  cardioPercent: number;
  strengthHours: number;
  strengthGoal: number;
  strengthPercent: number;
  unit: 'oz' | 'l';
}

export default function PersonalMetricsCard({
  user,
  waterTotal,
  waterGoal,
  waterPercent,
  cardioHours,
  cardioGoal,
  cardioPercent,
  strengthHours,
  strengthGoal,
  strengthPercent,
  unit,
}: PersonalMetricsCardProps) {
  // Count completed goals
  const waterComplete = waterPercent >= 100;
  const cardioComplete = cardioPercent >= 100;
  const strengthComplete = strengthPercent >= 100;
  const goalsComplete = [waterComplete, cardioComplete, strengthComplete].filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
            style={{ backgroundColor: user.color }}
          >
            {user.displayName[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Progress</h2>
            <p className="text-xs text-gray-500">Personal metrics for today/week</p>
          </div>
        </div>
        {goalsComplete > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>{goalsComplete}/3</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Water - Today's Goal */}
        <div className="col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-700">Water Today</h3>
            </div>
            {waterComplete && (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatVolume(waterTotal, unit)}
            </span>
            <span className="text-lg text-gray-600">
              / {formatVolume(waterGoal, unit)} {getUnitLabel(unit)}
            </span>
          </div>

          <div className="relative w-full h-3 bg-blue-100 rounded-full overflow-hidden mb-1">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                waterComplete
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              style={{ width: `${Math.min(waterPercent, 100)}%` }}
            />
          </div>

          <div className="flex justify-end">
            <span className={`text-sm font-bold ${waterComplete ? 'text-green-600' : 'text-gray-600'}`}>
              {Math.round(waterPercent)}%
            </span>
          </div>
        </div>

        {/* Cardio - This Week */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 border border-red-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-semibold text-gray-700">Cardio</h3>
            </div>
            {cardioComplete && (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
          </div>

          <div className="mb-2">
            <div className="text-lg font-bold text-gray-900">
              {cardioHours.toFixed(1)}
              <span className="text-xs text-gray-600 ml-1">/ {cardioGoal}h</span>
            </div>
          </div>

          <div className="relative w-full h-2.5 bg-red-100 rounded-full overflow-hidden mb-1">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                cardioComplete
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}
              style={{ width: `${Math.min(cardioPercent, 100)}%` }}
            />
          </div>

          <div className="flex justify-end">
            <span className={`text-xs font-bold ${cardioComplete ? 'text-green-600' : 'text-gray-600'}`}>
              {Math.round(cardioPercent)}%
            </span>
          </div>
        </div>

        {/* Strength - This Week */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-semibold text-gray-700">Strength</h3>
            </div>
            {strengthComplete && (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
          </div>

          <div className="mb-2">
            <div className="text-lg font-bold text-gray-900">
              {strengthHours.toFixed(1)}
              <span className="text-xs text-gray-600 ml-1">/ {strengthGoal}h</span>
            </div>
          </div>

          <div className="relative w-full h-2.5 bg-purple-100 rounded-full overflow-hidden mb-1">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                strengthComplete
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(strengthPercent, 100)}%` }}
            />
          </div>

          <div className="flex justify-end">
            <span className={`text-xs font-bold ${strengthComplete ? 'text-green-600' : 'text-gray-600'}`}>
              {Math.round(strengthPercent)}%
            </span>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      {goalsComplete === 3 && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-green-700">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-semibold">All goals complete! Keep it up! 🎉</span>
        </div>
      )}
      {goalsComplete > 0 && goalsComplete < 3 && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">{3 - goalsComplete} goal{3 - goalsComplete !== 1 ? 's' : ''} remaining</span>
        </div>
      )}
    </div>
  );
}
