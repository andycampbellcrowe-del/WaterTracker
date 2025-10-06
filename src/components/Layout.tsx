import { NavLink, Outlet } from 'react-router-dom';
import { Home, BarChart3, Settings } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 shadow-lg"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-around items-center h-20">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-all min-w-[60px] min-h-[60px] ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                }`
              }
              aria-label="Today"
            >
              {({ isActive }) => (
                <>
                  <Home size={24} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                  <span className="text-xs font-medium">Today</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-all min-w-[60px] min-h-[60px] ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                }`
              }
              aria-label="History"
            >
              {({ isActive }) => (
                <>
                  <BarChart3 size={24} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                  <span className="text-xs font-medium">History</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-all min-w-[60px] min-h-[60px] ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                }`
              }
              aria-label="Settings"
            >
              {({ isActive }) => (
                <>
                  <Settings size={24} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                  <span className="text-xs font-medium">Settings</span>
                </>
              )}
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
}
