import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DateRange } from '../types';
import { getStatsForRange, calculateKPIs } from '../utils/calculations';
import { formatVolume, getUnitLabel, litersToOz } from '../utils/conversions';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { TrendingUp, Award, Flame, Users, Trophy } from 'lucide-react';

export default function History() {
  const { state } = useApp();
  const [selectedRange, setSelectedRange] = useState<DateRange>('week');
  const { settings, entries, users } = state;

  const goalOz = settings.unit === 'l' ? litersToOz(settings.dailyGoalVolume) : settings.dailyGoalVolume;

  const stats = useMemo(() => getStatsForRange(entries, selectedRange, goalOz, users), [entries, selectedRange, goalOz, users]);
  const kpis = useMemo(() => calculateKPIs(stats, users), [stats, users]);

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

      {/* Chart */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Intake</h2>
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

      {/* KPI Cards */}
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

      {/* Peak Day */}
      {kpis.peakDay && (
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
    </div>
  );
}
