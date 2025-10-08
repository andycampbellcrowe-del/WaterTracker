import { Droplet, Dumbbell, Activity } from 'lucide-react';

export type MetricView = 'water' | 'workouts' | 'combined';

interface MetricSelectorProps {
  selected: MetricView;
  onSelect: (view: MetricView) => void;
}

export default function MetricSelector({ selected, onSelect }: MetricSelectorProps) {
  const options: Array<{ value: MetricView; label: string; icon: typeof Droplet }> = [
    { value: 'water', label: 'Water', icon: Droplet },
    { value: 'workouts', label: 'Workouts', icon: Dumbbell },
    { value: 'combined', label: 'Combined', icon: Activity },
  ];

  return (
    <div
      className="flex gap-2 justify-center bg-white border-2 border-gray-300 rounded-full p-1 max-w-md mx-auto"
      role="group"
      aria-label="Select metric view"
    >
      {options.map(option => {
        const Icon = option.icon;
        const isSelected = selected === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`flex-1 px-6 py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px] ${
              isSelected
                ? option.value === 'water'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : option.value === 'workouts'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
            aria-pressed={isSelected}
          >
            <Icon size={20} />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
