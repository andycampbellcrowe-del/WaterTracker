import { HouseholdUser } from '../types';

interface UserStat {
  user: HouseholdUser;
  total: number;
  percent: number;
}

interface DualProgressRingProps {
  totalPercent: number;
  users: UserStat[];
  size?: number;
}

export default function DualProgressRing({
  totalPercent,
  users,
  size = 240,
}: DualProgressRingProps) {
  const innerStrokeWidth = 18;  // Thick for individual progress
  const outerStrokeWidth = 10;  // Thinner for group total
  const gap = 12;

  // Inner ring for individual progress (thick)
  const innerRadius = (size - innerStrokeWidth) / 2 - outerStrokeWidth - gap;
  const innerCircumference = 2 * Math.PI * innerRadius;

  // Outer ring for total progress (thinner)
  const outerRadius = (size - outerStrokeWidth) / 2;
  const outerCircumference = 2 * Math.PI * outerRadius;

  // Calculate offsets
  const totalGoalPercent = Math.min(totalPercent, 100);
  const totalOffset = outerCircumference - (totalGoalPercent / 100) * outerCircumference;

  // Determine completion states
  const totalComplete = totalPercent >= 100;

  // Calculate segments for each user
  const segmentSize = innerCircumference / users.length;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Outer ring background (group total) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={outerRadius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={outerStrokeWidth}
        />

        {/* Group total progress (outer ring, thinner, grey) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={outerRadius}
          fill="none"
          stroke="#6b7280"
          strokeWidth={outerStrokeWidth}
          strokeDasharray={outerCircumference}
          strokeDashoffset={totalOffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Inner ring background (individual progress) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerRadius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={innerStrokeWidth}
        />

        {/* Individual user progress segments */}
        {users.map((userStat, index) => {
          const userPercent = Math.min(userStat.percent, 100);
          const startAngle = (index / users.length) * 360;
          const userOffset = innerCircumference - (userPercent / 100) * segmentSize;

          return (
            <circle
              key={userStat.user.id}
              cx={size / 2}
              cy={size / 2}
              r={innerRadius}
              fill="none"
              stroke={userStat.user.color}
              strokeWidth={innerStrokeWidth}
              strokeDasharray={`${segmentSize} ${innerCircumference - segmentSize}`}
              strokeDashoffset={userOffset - (index * segmentSize)}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{
                transformOrigin: 'center',
                transform: `rotate(${startAngle}deg)`
              }}
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Individual progress (main emphasis) */}
        {users.length <= 3 ? (
          <div className="flex items-center gap-3 mb-1 flex-wrap justify-center">
            {users.map((userStat) => {
              return (
                <div key={userStat.user.id} className="text-center">
                  <div
                    className={`text-xl font-bold transition-colors duration-500`}
                    style={{ color: userStat.user.color }}
                  >
                    {Math.round(userStat.percent)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{userStat.user.displayName}</div>
                </div>
              );
            })}
          </div>
        ) : (
          // If more than 3 users, show compact view
          <div className="text-center mb-1">
            <div className="text-sm text-gray-600 mb-1">{users.length} people tracking</div>
            <div className="flex gap-1 justify-center flex-wrap max-w-[150px]">
              {users.map(userStat => (
                <div
                  key={userStat.user.id}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: userStat.user.color }}
                  title={`${userStat.user.displayName}: ${Math.round(userStat.percent)}%`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Total progress (smaller) */}
        <div className="mt-2 px-3 py-1 bg-gray-100 rounded-full">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Combined:</span>
            <span className={`text-sm font-semibold transition-colors duration-500 ${
              totalComplete ? 'text-green-600' : 'text-gray-700'
            }`}>
              {Math.round(totalGoalPercent)}%
            </span>
          </div>
        </div>
      </div>

      {/* Individual completion indicators */}
      {users.map((userStat, index) => {
        if (userStat.percent < 100) return null;
        const angle = ((index / users.length) * 360) - 90; // -90 to start from top
        const radius = size / 2 - 20;
        const x = size / 2 + radius * Math.cos((angle * Math.PI) / 180);
        const y = size / 2 + radius * Math.sin((angle * Math.PI) / 180);

        return (
          <div
            key={userStat.user.id}
            className="absolute w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: userStat.user.color,
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        );
      })}

      {/* Overall goal completion indicator */}
      {totalComplete && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg animate-bounce">
          Goal Met! 🎉
        </div>
      )}
    </div>
  );
}
