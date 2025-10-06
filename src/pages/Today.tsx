import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserId } from '../types';
import { getTodayTotal, getTodayByUser, getProgressPercent, getBottleSize, getLocalDateString } from '../utils/calculations';
import { formatVolume, getUnitLabel, litersToOz } from '../utils/conversions';
import ProgressRing from '../components/ProgressRing';
import Celebration from '../components/Celebration';
import { Droplet, Plus } from 'lucide-react';

export default function Today() {
  const { state, addIntake } = useApp();
  const [selectedUser, setSelectedUser] = useState<UserId>('rachel');
  const [customAmount, setCustomAmount] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);

  const { settings, entries } = state;
  const todayTotal = getTodayTotal(entries);
  const rachelTotal = getTodayByUser(entries, 'rachel');
  const andyTotal = getTodayByUser(entries, 'andy');

  // Convert goal to oz for calculations
  const goalOz = settings.unit === 'l' ? litersToOz(settings.dailyGoalVolume) : settings.dailyGoalVolume;
  const progressPercent = getProgressPercent(todayTotal, goalOz);
  const bottleSize = getBottleSize(settings, selectedUser);

  // Check for goal completion and trigger celebration
  useEffect(() => {
    if (
      settings.celebrationEnabled &&
      todayTotal >= goalOz &&
      lastTotal < goalOz &&
      !state.celebratedDates.includes(getLocalDateString())
    ) {
      setShowCelebration(true);
    }
    setLastTotal(todayTotal);
  }, [todayTotal, goalOz, lastTotal, settings.celebrationEnabled, state.celebratedDates]);

  const handleAddIntake = (bottleCount: number) => {
    addIntake(selectedUser, bottleCount);
  };

  const handleCustomAdd = () => {
    const amount = parseFloat(customAmount);
    if (!isNaN(amount) && amount > 0) {
      addIntake(selectedUser, amount);
      setCustomAmount('');
    }
  };

  const rachelPercent = todayTotal > 0 ? (rachelTotal / todayTotal) * 100 : 50;
  const andyPercent = todayTotal > 0 ? (andyTotal / todayTotal) * 100 : 50;
  const goalMet = todayTotal >= goalOz;

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Today's Progress</h1>
        <time className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>
        {goalMet && (
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <span className="text-lg" role="img" aria-label="Trophy">🏆</span>
            <span className="font-semibold">Goal Met!</span>
          </div>
        )}
      </header>

      {/* User Selector */}
      <div className="flex gap-3 justify-center" role="group" aria-label="Select user">
        <button
          onClick={() => setSelectedUser('rachel')}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all min-h-[48px] ${
            selectedUser === 'rachel'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300'
          }`}
          aria-pressed={selectedUser === 'rachel'}
        >
          Rachel
        </button>
        <button
          onClick={() => setSelectedUser('andy')}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all min-h-[48px] ${
            selectedUser === 'andy'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
          }`}
          aria-pressed={selectedUser === 'andy'}
        >
          Andy
        </button>
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center py-4">
        <ProgressRing percent={progressPercent} />
      </div>

      {/* Combined Progress Info */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Combined Total</h2>
          <Droplet className="text-primary-500" size={24} aria-hidden="true" />
        </div>
        <div className="text-center mb-4">
          <span className="text-4xl font-bold text-gray-900">
            {formatVolume(todayTotal, settings.unit)}
          </span>
          <span className="text-2xl text-gray-600 ml-2">{getUnitLabel(settings.unit)}</span>
          <span className="text-gray-500 mx-2">/</span>
          <span className="text-2xl text-gray-600">
            {formatVolume(goalOz, settings.unit)} {getUnitLabel(settings.unit)}
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-700"
            style={{ width: `${(rachelTotal / goalOz) * 100}%` }}
            role="progressbar"
            aria-valuenow={rachelTotal}
            aria-valuemin={0}
            aria-valuemax={goalOz}
            aria-label={`Rachel's progress: ${formatVolume(rachelTotal, settings.unit)} ${getUnitLabel(settings.unit)}`}
          />
          <div
            className="bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-700"
            style={{ width: `${(andyTotal / goalOz) * 100}%` }}
            role="progressbar"
            aria-valuenow={andyTotal}
            aria-valuemin={0}
            aria-valuemax={goalOz}
            aria-label={`Andy's progress: ${formatVolume(andyTotal, settings.unit)} ${getUnitLabel(settings.unit)}`}
          />
        </div>

        {/* Legend */}
        <div className="flex justify-around mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-400 to-purple-400" />
            <span className="text-gray-700">
              Rachel {rachelPercent.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
            <span className="text-gray-700">
              Andy {andyPercent.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Add for {selectedUser === 'rachel' ? 'Rachel' : 'Andy'}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Bottle size: {formatVolume(settings.unit === 'l' ? litersToOz(bottleSize) : bottleSize, settings.unit)} {getUnitLabel(settings.unit)}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => handleAddIntake(1)}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[56px] flex items-center justify-center gap-2"
            aria-label="Add one full bottle"
          >
            <Plus size={24} aria-hidden="true" />
            <span>+1 Bottle</span>
          </button>

          <button
            onClick={() => handleAddIntake(0.5)}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[56px] flex items-center justify-center gap-2"
            aria-label="Add half bottle"
          >
            <Plus size={24} aria-hidden="true" />
            <span>+½ Bottle</span>
          </button>

          <div className="flex gap-2">
            <input
              type="number"
              step="0.25"
              min="0"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Custom amount"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[48px]"
              aria-label="Custom bottle amount"
            />
            <button
              onClick={handleCustomAdd}
              disabled={!customAmount || parseFloat(customAmount) <= 0}
              className="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              aria-label="Add custom amount"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Per-Person Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rachel Card */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl shadow-lg p-6 border-2 border-pink-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Rachel</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatVolume(rachelTotal, settings.unit)}
            <span className="text-lg text-gray-600 ml-1">{getUnitLabel(settings.unit)}</span>
          </div>
          <div className="text-sm text-gray-600">
            {rachelPercent.toFixed(1)}% of today's total
          </div>
        </div>

        {/* Andy Card */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-lg p-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Andy</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatVolume(andyTotal, settings.unit)}
            <span className="text-lg text-gray-600 ml-1">{getUnitLabel(settings.unit)}</span>
          </div>
          <div className="text-sm text-gray-600">
            {andyPercent.toFixed(1)}% of today's total
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <Celebration
          onClose={() => {
            setShowCelebration(false);
            const today = getLocalDateString();
            if (!state.celebratedDates.includes(today)) {
              // Mark as celebrated through context
              state.celebratedDates.push(today);
            }
          }}
          soundEnabled={settings.soundEnabled}
        />
      )}
    </div>
  );
}
