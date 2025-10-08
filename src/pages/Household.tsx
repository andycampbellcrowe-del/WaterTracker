import { useApp } from '../context/AppContext';
import { getTodayByUserId, getProgressPercent, getTodayTotal } from '../utils/calculations';
import { formatVolume, getUnitLabel, litersToOz } from '../utils/conversions';
import { getWeeklyWorkoutStats, getCombinedWorkoutPercent, getWeekStart } from '../utils/workoutCalculations';
import DualProgressRing from '../components/DualProgressRing';
import WorkoutProgressRing from '../components/WorkoutProgressRing';
import { Droplet, Dumbbell, Users, TrendingUp, Award } from 'lucide-react';

export default function Household() {
  const { state } = useApp();
  const { settings, entries, users, workoutEntries } = state;

  const goalOz = settings.unit === 'l' ? litersToOz(settings.dailyGoalVolume) : settings.dailyGoalVolume;
  const todayTotal = getTodayTotal(entries);
  const weekStart = getWeekStart();

  // Calculate each user's water totals and percentages
  const userStats = users.map(user => {
    const total = getTodayByUserId(entries, user.id);
    const percent = getProgressPercent(total, goalOz);
    return { user, total, percent };
  });

  // Water completion stats
  const usersWhoMetGoal = userStats.filter(stat => stat.total >= goalOz).length;
  const progressPercent = users.length > 0 ? (usersWhoMetGoal / users.length) * 100 : 0;

  // Workout stats
  const workoutStats = getWeeklyWorkoutStats(workoutEntries, users);
  const combinedWorkoutPercent = getCombinedWorkoutPercent(workoutEntries, users);
  const usersWithBothWorkoutGoals = workoutStats.filter(s => s.cardioPercent >= 100 && s.strengthPercent >= 100).length;

  // Overall household achievements
  const allWaterGoalsMet = users.length > 0 && usersWhoMetGoal === users.length;
  const allWorkoutGoalsMet = users.length > 0 && usersWithBothWorkoutGoals === users.length;
  const perfectDay = allWaterGoalsMet && allWorkoutGoalsMet;

  if (users.length === 0) {
    return (
      <div className="py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading household...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <header className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Household Overview</h1>
        </div>
        <p className="text-gray-600">How everyone is doing today and this week</p>
        {perfectDay && (
          <div className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg">
            <Award className="w-5 h-5" />
            <span className="font-bold">Perfect Day! All goals met! 🎉</span>
          </div>
        )}
      </header>

      {/* Summary Stats Card */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl shadow-lg p-6 border-2 border-purple-100">
        <div className="grid grid-cols-2 gap-4">
          {/* Water Stats */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Droplet className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-gray-900">Water Today</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {usersWhoMetGoal}<span className="text-xl text-gray-600">/{users.length}</span>
            </div>
            <p className="text-sm text-gray-600">completed daily goal</p>
            {allWaterGoalsMet && (
              <div className="mt-2 text-xs font-semibold text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Everyone met their goal!
              </div>
            )}
          </div>

          {/* Workout Stats */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Workouts Week</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {usersWithBothWorkoutGoals}<span className="text-xl text-gray-600">/{users.length}</span>
            </div>
            <p className="text-sm text-gray-600">completed both goals</p>
            {allWorkoutGoalsMet && (
              <div className="mt-2 text-xs font-semibold text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Everyone crushed it!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Water Progress Section */}
      <section className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <Droplet className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">Water Progress Today</h2>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center py-4 mb-6">
          <DualProgressRing
            totalPercent={progressPercent}
            users={userStats}
          />
        </div>

        {/* Combined Total */}
        <div className="text-center mb-6 pb-6 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Combined Total</p>
          <div>
            <span className="text-4xl font-bold text-gray-900">
              {formatVolume(todayTotal, settings.unit)}
            </span>
            <span className="text-2xl text-gray-600 ml-2">{getUnitLabel(settings.unit)}</span>
            <span className="text-gray-400 mx-2">/</span>
            <span className="text-2xl text-gray-600">
              {formatVolume(goalOz * users.length, settings.unit)} {getUnitLabel(settings.unit)}
            </span>
          </div>
        </div>

        {/* Individual Progress Bars */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Individual Progress</h3>
          {userStats.map((stat) => (
            <div key={stat.user.id}>
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stat.user.color }}
                  />
                  <span className="font-semibold text-gray-900">{stat.user.displayName}</span>
                </div>
                <span className="text-gray-600 font-medium">
                  {formatVolume(stat.total, settings.unit)} / {formatVolume(goalOz, settings.unit)} {getUnitLabel(settings.unit)}
                </span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${Math.min(stat.percent, 100)}%`,
                    backgroundColor: stat.user.color
                  }}
                  role="progressbar"
                  aria-valuenow={stat.total}
                  aria-valuemin={0}
                  aria-valuemax={goalOz}
                  aria-label={`${stat.user.displayName}'s progress: ${stat.percent.toFixed(1)}%`}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className={`text-sm font-bold ${stat.percent >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                  {stat.percent.toFixed(1)}%
                </span>
                {stat.percent >= 100 && (
                  <span className="text-xs font-semibold text-green-600">✓ Goal met!</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workout Progress Section */}
      <section className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Workout Progress This Week</h2>
          </div>
          <span className="text-sm text-gray-600">
            Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Workout Progress Display */}
        <WorkoutProgressRing
          users={workoutStats}
          combinedPercent={combinedWorkoutPercent}
          size={240}
        />
      </section>

      {/* Individual User Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 px-2">Individual Breakdowns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map(user => {
            const waterStat = userStats.find(s => s.user.id === user.id);
            const workoutStat = workoutStats.find(s => s.user.id === user.id);
            const waterComplete = waterStat && waterStat.percent >= 100;
            const workoutsComplete = workoutStat && workoutStat.cardioPercent >= 100 && workoutStat.strengthPercent >= 100;
            const allComplete = waterComplete && workoutsComplete;

            return (
              <div
                key={user.id}
                className={`rounded-3xl p-5 transition-all ${
                  allComplete
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-md'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.displayName[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{user.displayName}</h3>
                    {allComplete && (
                      <p className="text-xs font-semibold text-green-700">All goals complete! 🎉</p>
                    )}
                  </div>
                  {allComplete && (
                    <Award className="w-6 h-6 text-green-600" />
                  )}
                </div>

                {/* Water mini */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-700">Water</span>
                    </div>
                    <span className={`text-sm font-bold ${waterComplete ? 'text-green-600' : 'text-gray-600'}`}>
                      {waterStat ? Math.round(waterStat.percent) : 0}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {waterStat ? formatVolume(waterStat.total, settings.unit) : 0} / {formatVolume(goalOz, settings.unit)} {getUnitLabel(settings.unit)}
                  </p>
                </div>

                {/* Workouts mini */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Dumbbell className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-700">Workouts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Cardio</p>
                      <p className={`font-bold ${workoutStat && workoutStat.cardioPercent >= 100 ? 'text-green-600' : 'text-gray-900'}`}>
                        {workoutStat ? Math.round(workoutStat.cardioPercent) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Strength</p>
                      <p className={`font-bold ${workoutStat && workoutStat.strengthPercent >= 100 ? 'text-green-600' : 'text-gray-900'}`}>
                        {workoutStat ? Math.round(workoutStat.strengthPercent) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
