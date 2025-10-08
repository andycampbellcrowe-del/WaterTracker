import { WorkoutUserStat } from '../utils/workoutCalculations';
import { Heart, Dumbbell, CheckCircle2, TrendingUp } from 'lucide-react';

interface WorkoutProgressRingProps {
  users: WorkoutUserStat[];
  combinedPercent: number;
  size?: number;
}

export default function WorkoutProgressRing({
  users,
}: WorkoutProgressRingProps) {
  // Calculate overall completion stats
  const totalUsers = users.length;
  const usersWithCardioComplete = users.filter(u => u.cardioPercent >= 100).length;
  const usersWithStrengthComplete = users.filter(u => u.strengthPercent >= 100).length;
  const usersWithBothGoalsComplete = users.filter(
    u => u.cardioPercent >= 100 && u.strengthPercent >= 100
  ).length;

  const allGoalsComplete = usersWithBothGoalsComplete === totalUsers && totalUsers > 0;

  // Calculate totals for summary
  const totalCardioHours = users.reduce((sum, u) => sum + u.cardioHours, 0);
  const totalStrengthHours = users.reduce((sum, u) => sum + u.strengthHours, 0);
  const totalGoalCardioHours = users.reduce((sum, u) => sum + u.user.weeklyCardioGoalHours, 0);
  const totalGoalStrengthHours = users.reduce((sum, u) => sum + u.user.weeklyStrengthGoalHours, 0);
  const totalHours = totalCardioHours + totalStrengthHours;
  const totalGoalHours = totalGoalCardioHours + totalGoalStrengthHours;

  return (
    <div className="space-y-4 w-full">
      {/* Overall Summary Card */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-5 shadow-sm border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Weekly Progress
          </h3>
          {allGoalsComplete && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Goals Met!
            </div>
          )}
          {!allGoalsComplete && usersWithBothGoalsComplete > 0 && (
            <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-sm">
              {usersWithBothGoalsComplete} Crushed It!
            </div>
          )}
        </div>

        {/* Goal Completion Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
            <Heart className="w-4 h-4 text-red-500" />
            <div>
              <div className="font-bold text-gray-900">{usersWithCardioComplete}/{totalUsers}</div>
              <div className="text-gray-600">Cardio Goal</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
            <Dumbbell className="w-4 h-4 text-purple-600" />
            <div>
              <div className="font-bold text-gray-900">{usersWithStrengthComplete}/{totalUsers}</div>
              <div className="text-gray-600">Strength Goal</div>
            </div>
          </div>
        </div>

        {/* Individual Quick View */}
        <div className="mt-3 pt-3 border-t border-purple-200/50">
          <div className="text-xs font-semibold text-gray-600 mb-2">Individual Progress</div>
          <div className="space-y-1.5">
            {users.map(user => (
              <div key={user.user.id} className="flex items-center justify-between bg-white/40 rounded-lg px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: user.user.color }}
                  />
                  <span className="text-xs font-medium text-gray-700">{user.user.displayName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span className={`text-xs font-semibold ${user.cardioPercent >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                      {Math.round(user.cardioPercent)}%
                    </span>
                    {user.cardioPercent >= 100 && (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-purple-600" />
                    <span className={`text-xs font-semibold ${user.strengthPercent >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                      {Math.round(user.strengthPercent)}%
                    </span>
                    {user.strengthPercent >= 100 && (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Hours Breakdown */}
        <div className="mt-3 pt-3 border-t border-purple-200/50">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600" />
              <span className="text-gray-700 font-medium">Cardio: {totalCardioHours.toFixed(1)} hrs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" />
              <span className="text-gray-700 font-medium">Strength: {totalStrengthHours.toFixed(1)} hrs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual User Cards */}
      <div className="space-y-3">
        {users.map((userStat) => {
          const cardioComplete = userStat.cardioPercent >= 100;
          const strengthComplete = userStat.strengthPercent >= 100;
          const bothComplete = cardioComplete && strengthComplete;

          // Cap displayed percentage at 100% for visual bar, but show actual number
          const cardioBarPercent = Math.min(userStat.cardioPercent, 100);
          const strengthBarPercent = Math.min(userStat.strengthPercent, 100);

          return (
            <div
              key={userStat.user.id}
              className={`rounded-2xl p-4 transition-all duration-300 ${
                bothComplete
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-md'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              {/* User Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: userStat.user.color }}
                  />
                  <h4 className="font-semibold text-gray-900">{userStat.user.displayName}</h4>
                  {bothComplete && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 animate-pulse" />
                  )}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {userStat.totalHours.toFixed(1)} hrs total
                </div>
              </div>

              {/* Cardio Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-medium text-gray-700">Cardio</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600">
                      {userStat.cardioHours.toFixed(1)} / {userStat.user.weeklyCardioGoalHours} hrs
                    </span>
                    <span className={`text-xs font-bold transition-colors duration-300 ${
                      cardioComplete ? 'text-green-600' : 'text-gray-700'
                    }`}>
                      {Math.round(userStat.cardioPercent)}%
                    </span>
                    {cardioComplete && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="relative w-full h-2.5 bg-red-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                      cardioComplete
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${cardioBarPercent}%` }}
                  />
                  {/* Overflow indicator for >100% */}
                  {userStat.cardioPercent > 100 && (
                    <div className="absolute top-0 right-0 h-full w-1 bg-green-600 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Strength Progress */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-medium text-gray-700">Strength</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600">
                      {userStat.strengthHours.toFixed(1)} / {userStat.user.weeklyStrengthGoalHours} hrs
                    </span>
                    <span className={`text-xs font-bold transition-colors duration-300 ${
                      strengthComplete ? 'text-green-600' : 'text-gray-700'
                    }`}>
                      {Math.round(userStat.strengthPercent)}%
                    </span>
                    {strengthComplete && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="relative w-full h-2.5 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                      strengthComplete
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600'
                    }`}
                    style={{ width: `${strengthBarPercent}%` }}
                  />
                  {/* Overflow indicator for >100% */}
                  {userStat.strengthPercent > 100 && (
                    <div className="absolute top-0 right-0 h-full w-1 bg-green-600 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Both goals complete message */}
              {bothComplete && (
                <div className="mt-2 pt-2 border-t border-green-200 flex items-center justify-center gap-1.5">
                  <span className="text-xs font-semibold text-green-700">
                    Both goals completed!
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {users.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
          <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No workout data yet this week</p>
        </div>
      )}
    </div>
  );
}
