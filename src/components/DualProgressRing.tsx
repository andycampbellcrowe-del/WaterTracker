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
  const strokeWidth = 16;
  const gap = 8;

  // Calculate ring positions - each user gets their own complete ring
  const rings = users.map((_, index) => {
    const offset = index * (strokeWidth + gap);
    const radius = (size / 2) - strokeWidth / 2 - offset;
    const circumference = 2 * Math.PI * radius;
    return { radius, circumference };
  });

  // Goal is complete when ALL users reach 100%
  const totalComplete = totalPercent >= 100;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Render each user's ring */}
        {users.map((userStat, index) => {
          const { radius, circumference } = rings[index];
          const userPercent = Math.min(userStat.percent, 100);
          const progressOffset = circumference - (userPercent / 100) * circumference;

          return (
            <g key={userStat.user.id}>
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
              />

              {/* Progress ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={userStat.user.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </g>
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

        {/* Combined progress (smaller) */}
        <div className="mt-2 px-3 py-1 bg-gray-100 rounded-full">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">
              {users.filter(u => u.percent >= 100).length} of {users.length} complete
            </span>
          </div>
        </div>
      </div>

      {/* Individual completion indicators */}
      {users.map((userStat, index) => {
        if (userStat.percent < 100) return null;
        const { radius } = rings[index];
        // Position at top of each ring
        const x = size / 2;
        const y = size / 2 - radius;

        return (
          <div
            key={userStat.user.id}
            className="absolute w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
            style={{
              backgroundColor: userStat.user.color,
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <span className="text-white text-sm font-bold">✓</span>
          </div>
        );
      })}

      {/* Overall goal completion indicator (all users must complete) */}
      {totalComplete && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg animate-bounce">
          Everyone Met Their Goal! 🎉
        </div>
      )}
    </div>
  );
}
