import { Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { IntakeEntry, WorkoutEntry, HouseholdUser, AppSettings } from '../../types';
import { getDayStats } from '../../utils/calculations';
import { getWorkoutsForWeek, getWeekStart } from '../../utils/workoutCalculations';
import { litersToOz } from '../../utils/conversions';

interface CombinedMetricsChartProps {
  intakeEntries: IntakeEntry[];
  workoutEntries: WorkoutEntry[];
  users: HouseholdUser[];
  settings: AppSettings;
  weeksToShow?: number;
}

export default function CombinedMetricsChart({
  intakeEntries,
  workoutEntries,
  users,
  settings,
  weeksToShow = 4
}: CombinedMetricsChartProps) {
  const goalOz = settings.unit === 'l' ? litersToOz(settings.dailyGoalVolume) : settings.dailyGoalVolume;

  // Generate data for the last N weeks
  const chartData = [];
  const now = new Date();

  for (let i = weeksToShow - 1; i >= 0; i--) {
    const weekStart = getWeekStart(new Date(now));
    weekStart.setDate(weekStart.getDate() - (i * 7));

    // Calculate average daily water for this week
    let totalWaterOz = 0;
    let dayCount = 0;

    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + d);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const dayStats = getDayStats(intakeEntries, dateStr, goalOz, users);
      totalWaterOz += dayStats.totalVolume;
      dayCount++;
    }

    const avgDailyWater = dayCount > 0 ? totalWaterOz / dayCount : 0;

    // Calculate total workout hours for this week
    const weekWorkouts = getWorkoutsForWeek(workoutEntries, weekStart);
    const totalWorkoutHours = weekWorkouts.reduce((sum, e) => sum + e.durationHours, 0);

    // Calculate combined goal for workouts
    const totalWorkoutGoal = users.reduce(
      (sum, user) => sum + user.weeklyCardioGoalHours + user.weeklyStrengthGoalHours,
      0
    );

    chartData.push({
      weekLabel: weekStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      waterOz: settings.unit === 'l' ? avgDailyWater / 33.814 : avgDailyWater,
      waterGoal: settings.unit === 'l' ? goalOz / 33.814 : goalOz,
      workoutHours: totalWorkoutHours,
      workoutGoal: totalWorkoutGoal
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    const water = payload.find((p: any) => p.dataKey === 'waterOz')?.value || 0;
    const waterGoal = payload.find((p: any) => p.dataKey === 'waterGoal')?.value || 0;
    const workout = payload.find((p: any) => p.dataKey === 'workoutHours')?.value || 0;
    const workoutGoal = payload.find((p: any) => p.dataKey === 'workoutGoal')?.value || 0;

    const waterPercent = waterGoal > 0 ? ((water / waterGoal) * 100).toFixed(0) : 0;
    const workoutPercent = workoutGoal > 0 ? ((workout / workoutGoal) * 100).toFixed(0) : 0;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-2">
          <div className="border-l-4 border-blue-500 pl-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Water (avg/day):</span> {water.toFixed(1)} {settings.unit === 'l' ? 'L' : 'oz'}
            </p>
            <p className="text-xs text-gray-500">
              {waterPercent}% of daily goal
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Workouts (total):</span> {workout.toFixed(1)} hrs
            </p>
            <p className="text-xs text-gray-500">
              {workoutPercent}% of weekly goal
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Combined Health Metrics</h2>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData}>
          <defs>
            {/* Gradients for area fills */}
            <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="workoutGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* Dual Y-Axes */}
          <YAxis
            yAxisId="water"
            orientation="left"
            tick={{ fill: '#3b82f6', fontSize: 12 }}
            label={{
              value: settings.unit === 'l' ? 'Liters' : 'Ounces',
              angle: -90,
              position: 'insideLeft',
              fill: '#3b82f6'
            }}
          />
          <YAxis
            yAxisId="workout"
            orientation="right"
            tick={{ fill: '#a855f7', fontSize: 12 }}
            label={{
              value: 'Hours',
              angle: 90,
              position: 'insideRight',
              fill: '#a855f7'
            }}
          />

          <XAxis
            dataKey="weekLabel"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            payload={[
              { value: 'Water Intake (avg/day)', type: 'line', color: '#3b82f6' },
              { value: 'Workout Hours (total)', type: 'line', color: '#a855f7' }
            ]}
          />

          {/* Water area */}
          <Area
            yAxisId="water"
            type="monotone"
            dataKey="waterOz"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#waterGradient)"
            name="Water Intake"
          />

          {/* Workout area */}
          <Area
            yAxisId="workout"
            type="monotone"
            dataKey="workoutHours"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#workoutGradient)"
            name="Workout Hours"
          />

          {/* Goal lines */}
          <Line
            yAxisId="water"
            type="monotone"
            dataKey="waterGoal"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          <Line
            yAxisId="workout"
            type="monotone"
            dataKey="workoutGoal"
            stroke="#a855f7"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
