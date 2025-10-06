# Water Tracker

A responsive web application where **Rachel** and **Andy** track water intake toward a **single shared daily goal**. Features a clean, modern UI with smooth colors, rounded buttons, and full WCAG AA accessibility compliance.

## Features

### Core Functionality
- **Shared Daily Goal**: One global daily goal for both users
- **Flexible Units**: Switch between ounces (oz) and liters (L) with automatic conversion
- **Individual Bottle Tracking**: Rachel and Andy can each configure their own bottles per goal, with personalized bottle sizes
- **Real-time Progress**: Progress ring and stacked progress bars showing combined and individual contributions
- **Celebration**: Visual confetti and optional sound when goal is met

### Pages
- **Today**: Log intake, view progress, quick-add buttons
- **History & KPIs**: Week/Month/Year tabs with charts and statistics
  - Days Goal Met (count + %)
  - Average Daily Intake (combined + per person)
  - Streaks (current + longest)
  - Contribution Split (% Rachel vs % Andy)
  - Peak Day
- **Settings**: Configure goal, units, bottles, preferences, and manage data

### Data Management
- Local storage persistence
- Export data to JSON
- Import data from JSON
- Reset all data (with confirmation)
- Includes 30 days of demo data on first load

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Recharts** for beautiful charts
- **Tailwind CSS** for styling
- **Canvas Confetti** for celebrations
- **Lucide React** for icons

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

## Design Philosophy

- **Mobile-First**: Optimized for touch and small screens
- **Accessibility**: WCAG AA compliant with proper ARIA labels, keyboard navigation, and focus states
- **Smooth Colors**: Soothing gradients with blue, cyan, pink, and purple tones
- **Easy Interaction**: Large touch targets (≥44×44px), rounded buttons, smooth animations
- **Clear Typography**: Accessible font sizes and contrast ratios

## Usage

1. **Set Your Goal**: Go to Settings and configure your daily goal, unit, and bottles per goal
2. **Log Intake**: On the Today page, select Rachel or Andy and use quick-add buttons
3. **Track Progress**: Watch the progress ring fill and see individual contributions
4. **Celebrate**: Reach your goal together and enjoy the celebration!
5. **Review History**: Check the History page for insights and trends

## Data Model

All data is stored locally in your browser's localStorage:

```typescript
type AppState = {
  settings: {
    unit: "oz" | "l";
    dailyGoalVolume: number;
    rachelBottlesPerGoal: number;
    andyBottlesPerGoal: number;
    celebrationEnabled: boolean;
    soundEnabled: boolean;
  };
  entries: Array<{
    id: string;
    user: "rachel" | "andy";
    volumeOz: number; // always stored in oz
    timestamp: string; // ISO
  }>;
  celebratedDates: string[];
};
```

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

Built with ❤️ to help Rachel and Andy stay hydrated together! 💧
