import React from 'react';
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { HouseholdUser, WorkoutEntry } from '../../types';
import { getWeekStart, getWorkoutsForWeek } from '../../utils/workoutCalculations';
import { Heart, Dumbbell } from 'lucide-react';

interface WorkoutChartProps {
  entries: WorkoutEntry[];
  users: HouseholdUser[];
  weeksToShow?: number;
}

export default function WorkoutChart({ entries, users, weeksToShow = 4 }: WorkoutChartProps) {
  // Generate data for the last N weeks
  const chartData = [];
  const now = new Date();

  for (let i = weeksToShow - 1; i >= 0; i--) {
    const weekStart = getWeekStart(new Date(now));
    weekStart.setDate(weekStart.getDate() - (i * 7));

    const weekEntries = getWorkoutsForWeek(entries, weekStart);

    const data: any = {
      weekLabel: weekStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      weekStart: weekStart.toISOString(),
    };

    // Calculate total goal for this week
    let totalGoal = 0;
    users.forEach(user => {
      totalGoal += user.weeklyCardioGoalHours + user.weeklyStrengthGoalHours;

      // Calculate hours for each user and workout type
      const userCardio = weekEntries
        .filter(e => e.householdUserId === user.id && e.workoutType === 'cardio')
        .reduce((sum, e) => sum + e.durationHours, 0);

      const userStrength = weekEntries
        .filter(e => e.householdUserId === user.id && e.workoutType === 'strength')
        .reduce((sum, e) => sum + e.durationHours, 0);

      data[`${user.displayName}_cardio`] = userCardio;
      data[`${user.displayName}_strength`] = userStrength;
    });

    data.goal = totalGoal;

    chartData.push(data);
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    const totalHours = payload.reduce((sum: number, p: any) => {
      if (p.dataKey !== 'goal') {
        return sum + (p.value || 0);
      }
      return sum;
    }, 0);

    const goalHours = payload.find((p: any) => p.dataKey === 'goal')?.value || 0;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-2">
          {users.map(user => {
            const cardioKey = `${user.displayName}_cardio`;
            const strengthKey = `${user.displayName}_strength`;
            const cardio = payload.find((p: any) => p.dataKey === cardioKey)?.value || 0;
            const strength = payload.find((p: any) => p.dataKey === strengthKey)?.value || 0;
            const total = cardio + strength;

            if (total === 0) return null;

            return (
              <div key={user.id} className="border-l-4 pl-2" style={{ borderColor: user.color }}>
                <p className="font-medium text-sm text-gray-900">{user.displayName}</p>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Heart size={12} className="text-red-500" />
                    {cardio.toFixed(1)} hrs
                  </span>
                  <span className="flex items-center gap-1">
                    <Dumbbell size={12} className="text-purple-600" />
                    {strength.toFixed(1)} hrs
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Total: {total.toFixed(1)} hrs</p>
              </div>
            );
          })}

          {/* Total and goal */}
          <div className="border-t pt-2 mt-2">
            <p className="text-sm font-semibold text-gray-900">
              Total: {totalHours.toFixed(1)} / {goalHours.toFixed(1)} hrs
              <span className="text-xs ml-2 text-gray-600">
                ({goalHours > 0 ? ((totalHours / goalHours) * 100).toFixed(0) : 0}%)
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Workout Hours</h2>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="weekLabel"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Stacked bars for each user's cardio and strength */}
          {users.map((user, index) => (
            <React.Fragment key={user.id}>
              {/* Cardio bar (lighter shade) */}
              <Bar
                dataKey={`${user.displayName}_cardio`}
                stackId="a"
                fill={`${user.color}cc`}
                name={`${user.displayName} Cardio`}
                radius={[0, 0, 0, 0]}
              />
              {/* Strength bar (full color) */}
              <Bar
                dataKey={`${user.displayName}_strength`}
                stackId="a"
                fill={user.color}
                name={`${user.displayName} Strength`}
                radius={index === users.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
              />
            </React.Fragment>
          ))}

          {/* Goal line */}
          <Line
            type="monotone"
            dataKey="goal"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Goal"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
