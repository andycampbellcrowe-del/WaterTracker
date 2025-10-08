import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DateRange } from '../types';
import { getStatsForRange, calculateKPIs } from '../utils/calculations';
import { calculateWorkoutKPIs } from '../utils/workoutCalculations';
import { formatVolume, getUnitLabel, litersToOz } from '../utils/conversions';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { TrendingUp, Award, Flame, Users, Trophy, Calendar, Activity, Scale, Dumbbell, Heart } from 'lucide-react';
import MetricSelector, { MetricView } from '../components/MetricSelector';
import WorkoutChart from '../components/charts/WorkoutChart';
import CombinedMetricsChart from '../components/charts/CombinedMetricsChart';

export default function History() {
  const { state } = useApp();
  const [selectedRange, setSelectedRange] = useState<DateRange>('week');
  const [selectedMetric, setSelectedMetric] = useState<MetricView>('combined');
  const { settings, entries, users, workoutEntries } = state;

  const goalOz = settings.unit === 'l' ? litersToOz(settings.dailyGoalVolume) : settings.dailyGoalVolume;

  const stats = useMemo(() => getStatsForRange(entries, selectedRange, goalOz, users), [entries, selectedRange, goalOz, users]);
  const kpis = useMemo(() => calculateKPIs(stats, users), [stats, users]);
  const workoutKpis = useMemo(() => calculateWorkoutKPIs(workoutEntries, users), [workoutEntries, users]);

  const chartData = stats.map(stat => {
    const data: any = {
      date: new Date(stat.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      Goal: settings.unit === 'l' ? parseFloat(formatVolume(goalOz, 'l', 2)) : goalOz,
    };

    // Add each user's volume dynamically
    users.forEach(user => {
      const volume = stat.userVolumes[user.id] || 0;
      data[user.displayName] = settings.unit === 'l' ? parseFloat(formatVolume(volume, 'l', 2)) : volume;
    });

    return data;
  });

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">History & KPIs</h1>
        <p className="text-gray-600">Track your progress over time</p>
      </header>

      {/* Metric Selector */}
      <MetricSelector selected={selectedMetric} onSelect={setSelectedMetric} />

      {/* Range Selector */}
      <div className="flex gap-2 justify-center" role="group" aria-label="Select time range">
        {(['week', 'month', 'year'] as DateRange[]).map(range => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all capitalize min-h-[48px] ${
              selectedRange === range
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300'
            }`}
            aria-pressed={selectedRange === range}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Chart - Conditional based on metric */}
      {selectedMetric === 'water' && (
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Water Intake</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                label={{ value: getUnitLabel(settings.unit), angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {users.map((user, index) => (
                <Bar
                  key={user.id}
                  dataKey={user.displayName}
                  stackId="a"
                  fill={user.color}
                  radius={index === users.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
              <Line
                type="monotone"
                dataKey="Goal"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedMetric === 'workouts' && (
        <WorkoutChart entries={workoutEntries} users={users} weeksToShow={selectedRange === 'week' ? 4 : selectedRange === 'month' ? 12 : 52} />
      )}

      {selectedMetric === 'combined' && (
        <CombinedMetricsChart
          intakeEntries={entries}
          workoutEntries={workoutEntries}
          users={users}
          settings={settings}
          weeksToShow={selectedRange === 'week' ? 4 : selectedRange === 'month' ? 12 : 52}
        />
      )}

      {/* KPI Cards - Water View */}
      {selectedMetric === 'water' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Days Goal Met */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Days Goal Met</h3>
            <Trophy className="text-green-600" size={24} aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {kpis.daysGoalMet} <span className="text-lg text-gray-600">/ {kpis.totalDays}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {kpis.daysGoalMetPercent.toFixed(1)}% success rate
          </div>
        </div>

        {/* Average Daily Intake */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Avg Daily Intake</h3>
            <TrendingUp className="text-blue-600" size={24} aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatVolume(kpis.avgDailyIntake, settings.unit)}
            <span className="text-lg text-gray-600 ml-1">{getUnitLabel(settings.unit)}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1 space-y-1">
            {users.map(user => (
              <div key={user.id}>
                {user.displayName}: {formatVolume(kpis.userAverages[user.id] || 0, settings.unit)} {getUnitLabel(settings.unit)}
              </div>
            ))}
          </div>
        </div>

        {/* Streaks */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-lg p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Streaks</h3>
            <Flame className="text-orange-600" size={24} aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-sm text-gray-600">Current Streak</div>
              <div className="text-2xl font-bold text-gray-900">
                {kpis.currentStreak} {kpis.currentStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Longest Streak</div>
              <div className="text-2xl font-bold text-gray-900">
                {kpis.longestStreak} {kpis.longestStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Split */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-lg p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Contribution Split</h3>
            <Users className="text-purple-600" size={24} aria-hidden="true" />
          </div>
          <div className="space-y-3">
            {users.map(user => {
              const userPercent = kpis.userPercentages[user.id] || 0;
              return (
                <div key={user.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{user.displayName}</span>
                    <span className="text-gray-900 font-semibold">{userPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${userPercent}%`,
                        backgroundColor: user.color
                      }}
                      role="progressbar"
                      aria-valuenow={userPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${user.displayName} contributed ${userPercent.toFixed(1)}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}

      {/* Peak Day - Water View */}
      {selectedMetric === 'water' && kpis.peakDay && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl shadow-lg p-6 border-2 border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Peak Day</h3>
            <Award className="text-yellow-600" size={24} aria-hidden="true" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatVolume(kpis.peakDay.volume, settings.unit)} {getUnitLabel(settings.unit)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {new Date(kpis.peakDay.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            <div className="text-5xl" role="img" aria-label="Star">⭐</div>
          </div>
        </div>
      )}

      {/* KPI Cards - Workout View */}
      {selectedMetric === 'workouts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekly Hours */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Hours</h3>
              <Dumbbell className="text-purple-600" size={24} aria-hidden="true" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {workoutKpis.totalHours.toFixed(1)} <span className="text-lg text-gray-600">hrs</span>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {workoutKpis.combinedPercent.toFixed(1)}% of goal
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Cardio: {workoutKpis.totalCardioHours.toFixed(1)} hrs ({workoutKpis.cardioPercent.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-purple-600" />
                <span>Strength: {workoutKpis.totalStrengthHours.toFixed(1)} hrs ({workoutKpis.strengthPercent.toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          {/* Workout Consistency */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Workout Days</h3>
              <Calendar className="text-green-600" size={24} aria-hidden="true" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {workoutKpis.workoutDays} <span className="text-lg text-gray-600">/ {workoutKpis.totalDays}</span>
            </div>
            <div className="text-sm text-gray-600">
              {workoutKpis.consistencyPercent.toFixed(1)}% consistency
            </div>
          </div>

          {/* Cardio vs Strength Balance */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-3xl shadow-lg p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Workout Balance</h3>
              <Scale className="text-orange-600" size={24} aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    Cardio
                  </span>
                  <span className="font-semibold">{workoutKpis.cardioPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-red-500 rounded-full transition-all"
                    style={{ width: `${workoutKpis.cardioPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-purple-600" />
                    Strength
                  </span>
                  <span className="font-semibold">{workoutKpis.strengthPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-purple-600 rounded-full transition-all"
                    style={{ width: `${workoutKpis.strengthPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Workout Streaks */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl shadow-lg p-6 border-2 border-red-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Workout Streaks</h3>
              <Flame className="text-red-600" size={24} aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Current Streak</div>
                <div className="text-2xl font-bold text-gray-900">
                  {workoutKpis.currentStreak} {workoutKpis.currentStreak === 1 ? 'week' : 'weeks'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Longest Streak</div>
                <div className="text-2xl font-bold text-gray-900">
                  {workoutKpis.longestStreak} {workoutKpis.longestStreak === 1 ? 'week' : 'weeks'}
                </div>
              </div>
            </div>
          </div>

          {/* Most Active Day */}
          {workoutKpis.mostActiveDay && (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-3xl shadow-lg p-6 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Most Active Day</h3>
                <Award className="text-yellow-600" size={24} aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {workoutKpis.mostActiveDay.dayName}
              </div>
              <div className="text-sm text-gray-600">
                {workoutKpis.mostActiveDay.avgHours.toFixed(1)} hrs average
              </div>
            </div>
          )}

          {/* Household Contribution */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-3xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Team Contribution</h3>
              <Users className="text-blue-600" size={24} aria-hidden="true" />
            </div>
            <div className="space-y-3">
              {workoutKpis.userContributions.map(contrib => (
                <div key={contrib.user.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{contrib.user.displayName}</span>
                    <span className="text-gray-900 font-semibold">
                      {contrib.totalHours.toFixed(1)} hrs ({contrib.percent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${contrib.percent}%`,
                        backgroundColor: contrib.user.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards - Combined View */}
      {selectedMetric === 'combined' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overall Health Score */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Health Score</h3>
              <Activity className="text-green-600" size={24} aria-hidden="true" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {((kpis.daysGoalMetPercent + workoutKpis.combinedPercent) / 2).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 mb-4">Composite score</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Water:</span>
                <span className="font-semibold">{kpis.daysGoalMetPercent.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Workouts:</span>
                <span className="font-semibold">{workoutKpis.combinedPercent.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Water Streaks */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-3xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Water Streaks</h3>
              <Flame className="text-blue-600" size={24} aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600">Current</div>
                <div className="text-2xl font-bold text-gray-900">
                  {kpis.currentStreak} {kpis.currentStreak === 1 ? 'day' : 'days'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Longest</div>
                <div className="text-2xl font-bold text-gray-900">
                  {kpis.longestStreak} {kpis.longestStreak === 1 ? 'day' : 'days'}
                </div>
              </div>
            </div>
          </div>

          {/* Workout Streaks */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-3xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Workout Streaks</h3>
              <Flame className="text-purple-600" size={24} aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600">Current</div>
                <div className="text-2xl font-bold text-gray-900">
                  {workoutKpis.currentStreak} {workoutKpis.currentStreak === 1 ? 'week' : 'weeks'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Longest</div>
                <div className="text-2xl font-bold text-gray-900">
                  {workoutKpis.longestStreak} {workoutKpis.longestStreak === 1 ? 'week' : 'weeks'}
                </div>
              </div>
            </div>
          </div>

          {/* Consistency Summary */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-3xl shadow-lg p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Consistency</h3>
              <TrendingUp className="text-orange-600" size={24} aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Water Goals Met</span>
                  <span className="font-semibold">{kpis.daysGoalMetPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full transition-all"
                    style={{ width: `${kpis.daysGoalMetPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Workout Days</span>
                  <span className="font-semibold">{workoutKpis.consistencyPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-purple-500 rounded-full transition-all"
                    style={{ width: `${workoutKpis.consistencyPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
