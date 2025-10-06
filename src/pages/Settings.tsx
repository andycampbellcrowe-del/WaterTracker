import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getBottleSize } from '../utils/calculations';
import { formatVolume, getUnitLabel } from '../utils/conversions';
import { Download, Upload, Trash2, Info, Save } from 'lucide-react';

export default function Settings() {
  const { state, updateSettings, exportData, importData, resetData } = useApp();
  const { settings } = state;

  const [localSettings, setLocalSettings] = useState(settings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState('');

  const rachelBottleSize = getBottleSize(localSettings, 'rachel');
  const andyBottleSize = getBottleSize(localSettings, 'andy');

  const handleSave = () => {
    updateSettings(localSettings);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water-tracker-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportError('');
        setLocalSettings(state.settings);
        alert('Data imported successfully!');
      } else {
        setImportError('Invalid file format. Please upload a valid JSON export.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
    setLocalSettings({
      unit: 'oz',
      dailyGoalVolume: 128,
      rachelBottlesPerGoal: 8,
      andyBottlesPerGoal: 8,
      celebrationEnabled: true,
      soundEnabled: true
    });
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings);

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings & Data</h1>
        <p className="text-gray-600">Configure your tracking preferences</p>
      </header>

      {/* Goal Settings */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Goal Configuration</h2>

        {/* Unit Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Measurement Unit
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setLocalSettings({ ...localSettings, unit: 'oz' })}
              className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all min-h-[48px] ${
                localSettings.unit === 'oz'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={localSettings.unit === 'oz'}
            >
              Ounces (oz)
            </button>
            <button
              onClick={() => setLocalSettings({ ...localSettings, unit: 'l' })}
              className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all min-h-[48px] ${
                localSettings.unit === 'l'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={localSettings.unit === 'l'}
            >
              Liters (L)
            </button>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="mb-6">
          <label htmlFor="dailyGoal" className="block text-sm font-medium text-gray-700 mb-2">
            Daily Goal Volume
          </label>
          <div className="flex items-center gap-2">
            <input
              id="dailyGoal"
              type="number"
              step={localSettings.unit === 'oz' ? '1' : '0.1'}
              min="1"
              value={localSettings.dailyGoalVolume}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  dailyGoalVolume: parseFloat(e.target.value) || 0
                })
              }
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[48px]"
              aria-label="Daily goal volume"
            />
            <span className="text-gray-600 font-medium w-12">
              {getUnitLabel(localSettings.unit)}
            </span>
          </div>
        </div>

        {/* Bottles Per Goal - Rachel */}
        <div className="mb-6">
          <label htmlFor="rachelBottlesPerGoal" className="block text-sm font-medium text-gray-700 mb-2">
            Rachel's Bottles Per Goal
            <button
              className="ml-2 inline-flex items-center text-primary-500 hover:text-primary-600"
              title="Number of bottles Rachel needs to drink to reach the daily goal"
              aria-label="Information about Rachel's bottles per goal"
            >
              <Info size={16} aria-hidden="true" />
            </button>
          </label>
          <input
            id="rachelBottlesPerGoal"
            type="number"
            min="1"
            step="1"
            value={localSettings.rachelBottlesPerGoal}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                rachelBottlesPerGoal: parseInt(e.target.value) || 1
              })
            }
            className="w-full px-4 py-3 border-2 border-pink-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent min-h-[48px]"
            aria-label="Rachel's bottles per goal"
          />
          <div className="mt-2 p-3 bg-pink-50 rounded-xl">
            <p className="text-sm text-pink-900">
              <strong>Rachel's Bottle Size:</strong>{' '}
              {formatVolume(localSettings.unit === 'l' ? rachelBottleSize : rachelBottleSize, localSettings.unit)}{' '}
              {getUnitLabel(localSettings.unit)} per bottle
            </p>
          </div>
        </div>

        {/* Bottles Per Goal - Andy */}
        <div className="mb-6">
          <label htmlFor="andyBottlesPerGoal" className="block text-sm font-medium text-gray-700 mb-2">
            Andy's Bottles Per Goal
            <button
              className="ml-2 inline-flex items-center text-primary-500 hover:text-primary-600"
              title="Number of bottles Andy needs to drink to reach the daily goal"
              aria-label="Information about Andy's bottles per goal"
            >
              <Info size={16} aria-hidden="true" />
            </button>
          </label>
          <input
            id="andyBottlesPerGoal"
            type="number"
            min="1"
            step="1"
            value={localSettings.andyBottlesPerGoal}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                andyBottlesPerGoal: parseInt(e.target.value) || 1
              })
            }
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px]"
            aria-label="Andy's bottles per goal"
          />
          <div className="mt-2 p-3 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-900">
              <strong>Andy's Bottle Size:</strong>{' '}
              {formatVolume(localSettings.unit === 'l' ? andyBottleSize : andyBottleSize, localSettings.unit)}{' '}
              {getUnitLabel(localSettings.unit)} per bottle
            </p>
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <button
            onClick={handleSave}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[56px] flex items-center justify-center gap-2"
            aria-label="Save settings"
          >
            <Save size={24} aria-hidden="true" />
            <span>Save Changes</span>
          </button>
        )}
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>

        <div className="space-y-4">
          {/* Celebration Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="celebration" className="text-sm font-medium text-gray-700">
                Enable Celebration
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Show confetti when daily goal is met
              </p>
            </div>
            <button
              id="celebration"
              role="switch"
              aria-checked={localSettings.celebrationEnabled}
              onClick={() =>
                setLocalSettings({
                  ...localSettings,
                  celebrationEnabled: !localSettings.celebrationEnabled
                })
              }
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                localSettings.celebrationEnabled ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  localSettings.celebrationEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="sound" className="text-sm font-medium text-gray-700">
                Enable Sound
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Play sound on celebration
              </p>
            </div>
            <button
              id="sound"
              role="switch"
              aria-checked={localSettings.soundEnabled}
              onClick={() =>
                setLocalSettings({
                  ...localSettings,
                  soundEnabled: !localSettings.soundEnabled
                })
              }
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                localSettings.soundEnabled ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  localSettings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {hasChanges && (
          <button
            onClick={handleSave}
            className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[56px] flex items-center justify-center gap-2"
            aria-label="Save preferences"
          >
            <Save size={24} aria-hidden="true" />
            <span>Save Changes</span>
          </button>
        )}
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>

        <div className="space-y-3">
          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[56px] flex items-center justify-center gap-2"
            aria-label="Export data"
          >
            <Download size={24} aria-hidden="true" />
            <span>Export Data (JSON)</span>
          </button>

          {/* Import */}
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              aria-label="Import data file"
            />
            <div className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[56px] flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={24} aria-hidden="true" />
              <span>Import Data (JSON)</span>
            </div>
          </label>

          {importError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800" role="alert">
              {importError}
            </div>
          )}

          {/* Reset */}
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 min-h-[56px] flex items-center justify-center gap-2"
              aria-label="Reset all data"
            >
              <Trash2 size={24} aria-hidden="true" />
              <span>Reset All Data</span>
            </button>
          ) : (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
              <p className="text-sm text-red-900 font-semibold mb-3">
                Are you sure? This will delete all entries and reset settings!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all min-h-[48px]"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all min-h-[48px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
        <p className="text-sm text-gray-700">
          Water Tracker helps Rachel and Andy reach their shared daily hydration goal together.
          All data is stored locally in your browser.
        </p>
      </div>
    </div>
  );
}
