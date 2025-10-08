import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import Today from './pages/Today';
import Household from './pages/Household';
import Workouts from './pages/Workouts';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';
import OnboardingMultiAccount from './pages/OnboardingMultiAccount';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { loading: appLoading, needsOnboarding, refreshData } = useApp();

  const loading = authLoading || appLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (needsOnboarding) {
    return <OnboardingMultiAccount onComplete={refreshData} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Today />} />
          <Route path="household" element={<Household />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
