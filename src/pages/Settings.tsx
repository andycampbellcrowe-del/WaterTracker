import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getUnitLabel } from '../utils/conversions';
import { Download, Save, LogOut, Copy, Trash2, Users as UsersIcon } from 'lucide-react';

const PRESET_COLORS = [
  '#ec4899', '#3b82f6', '#10b981', '#f59e0b',
  '#8b5cf6', '#ef4444', '#06b6d4', '#f97316',
];

const RESET_PASSWORD = 'AndyDrinksWater';

export default function Settings() {
  const { state, updateSettings, exportData, resetData, updateUser, deleteUserFromHousehold, getInviteCode } = useApp();
  const { signOut, user } = useAuth();
  const { settings, users, currentUser, household } = state;

  const [localSettings, setLocalSettings] = useState(settings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // User editing (only for yourself or if you're owner)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ displayName: '', color: '', bottleSizeOz: '' });

  const inviteCode = getInviteCode();
  const isOwner = currentUser?.isOwner || false;

  const handleSave = async () => {
    await updateSettings(localSettings);
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

  const handleReset = async () => {
    if (resetPassword === RESET_PASSWORD) {
      await resetData();
      setShowResetConfirm(false);
      setResetPassword('');
      alert('Data reset successfully!');
    } else {
      alert('Incorrect password!');
      setResetPassword('');
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const handleCopyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const startEditUser = (userId: string) => {
    // Can only edit yourself, or if you're owner, anyone
    if (userId !== currentUser?.id && !isOwner) {
      alert('You can only edit your own profile');
      return;
    }

    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setEditingUserId(userId);
      setEditForm({
        displayName: userToEdit.displayName,
        color: userToEdit.color,
        bottleSizeOz: userToEdit.bottleSizeOz.toString()
      });
    }
  };

  const saveEditUser = async () => {
    if (!editingUserId) return;
    try {
      await updateUser(editingUserId, {
        displayName: editForm.displayName,
        color: editForm.color,
        bottleSizeOz: parseFloat(editForm.bottleSizeOz)
      });
      setEditingUserId(null);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isOwner) {
      alert('Only the household owner can delete users');
      return;
    }

    if (userId === currentUser?.id) {
      alert('You cannot delete yourself!');
      return;
    }

    if (confirm('Are you sure you want to remove this user from the household? Their data will remain but they will lose access.')) {
      try {
        await deleteUserFromHousehold(userId);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings);

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your household and preferences</p>
      </header>

      {/* Household Info */}
      {household && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-lg p-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <UsersIcon className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Household: {household.name}</h2>
          </div>

          {isOwner && inviteCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite Code (share with others to join)
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-white border-2 border-purple-300 rounded-2xl text-center">
                  <span className="text-2xl font-bold tracking-widest text-purple-900">
                    {inviteCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyInviteCode}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-2xl transition-all flex items-center gap-2"
                >
                  {copiedCode ? (
                    <>
                      <span>✓</span>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Others can join your household by using this code during sign up
              </p>
            </div>
          )}

          {!isOwner && (
            <div className="p-4 bg-white rounded-2xl border-2 border-purple-200">
              <p className="text-sm text-gray-700">
                <strong>Your Role:</strong> Member
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Contact the household owner for the invite code to add more people
              </p>
            </div>
          )}
        </div>
      )}

      {/* Your Profile */}
      {currentUser && (
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>

          {editingUserId === currentUser.id ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditForm({ ...editForm, color })}
                      className={`w-10 h-10 rounded-full transition-all ${
                        editForm.color === color ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bottle Size (oz)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={editForm.bottleSizeOz}
                  onChange={(e) => setEditForm({ ...editForm, bottleSizeOz: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveEditUser}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingUserId(null)}
                  className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full"
                  style={{ backgroundColor: currentUser.color }}
                />
                <div>
                  <div className="font-semibold text-lg">{currentUser.displayName}</div>
                  <div className="text-sm text-gray-600">
                    Bottle: {currentUser.bottleSizeOz} oz
                  </div>
                  {currentUser.isOwner && (
                    <div className="text-xs text-purple-600 font-medium mt-1">
                      👑 Household Owner
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => startEditUser(currentUser.id)}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-xl transition-all"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      )}

      {/* Other Household Members */}
      {users.filter(u => u.id !== currentUser?.id).length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Other Members</h2>

          <div className="space-y-3">
            {users.filter(u => u.id !== currentUser?.id).map(member => (
              <div key={member.id} className="border-2 border-gray-200 rounded-2xl p-4">
                {editingUserId === member.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                      placeholder="Name"
                    />
                    <div className="flex gap-2">
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setEditForm({ ...editForm, color })}
                          className={`w-8 h-8 rounded-full ${editForm.color === color ? 'ring-4 ring-gray-400' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="number"
                      value={editForm.bottleSizeOz}
                      onChange={(e) => setEditForm({ ...editForm, bottleSizeOz: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                      placeholder="Bottle Size (oz)"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditUser}
                        className="flex-1 py-2 bg-green-500 text-white rounded-xl"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUserId(null)}
                        className="flex-1 py-2 bg-gray-300 text-gray-800 rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full"
                        style={{ backgroundColor: member.color }}
                      />
                      <div>
                        <div className="font-semibold">{member.displayName}</div>
                        <div className="text-sm text-gray-600">
                          Bottle: {member.bottleSizeOz} oz
                        </div>
                        {member.isOwner && (
                          <div className="text-xs text-purple-600 font-medium">
                            👑 Owner
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isOwner && (
                        <>
                          <button
                            onClick={() => startEditUser(member.id)}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(member.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isOwner && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              Only the household owner can edit or remove members
            </p>
          )}
        </div>
      )}

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
              className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all ${
                localSettings.unit === 'oz'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ounces (oz)
            </button>
            <button
              onClick={() => setLocalSettings({ ...localSettings, unit: 'l' })}
              className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all ${
                localSettings.unit === 'l'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
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
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="text-gray-600 font-medium w-12">
              {getUnitLabel(localSettings.unit)}
            </span>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Celebration</label>
              <p className="text-xs text-gray-500">Show confetti when goal is met</p>
            </div>
            <button
              onClick={() =>
                setLocalSettings({
                  ...localSettings,
                  celebrationEnabled: !localSettings.celebrationEnabled
                })
              }
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
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

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Sound</label>
              <p className="text-xs text-gray-500">Play sound on celebration</p>
            </div>
            <button
              onClick={() =>
                setLocalSettings({
                  ...localSettings,
                  soundEnabled: !localSettings.soundEnabled
                })
              }
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
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
            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <Save size={24} />
            <span>Save Changes</span>
          </button>
        )}
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>

        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <Download size={24} />
            <span>Export Data (JSON)</span>
          </button>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 size={24} />
              <span>Reset All Data</span>
            </button>
          ) : (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
              <p className="text-sm text-red-900 font-semibold mb-3">
                Enter password to reset all household data:
              </p>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 border-2 border-red-300 rounded-xl mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetPassword('');
                  }}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>

        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-600 mb-1">Logged in as:</p>
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-4 px-6 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl shadow-md transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut size={24} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
