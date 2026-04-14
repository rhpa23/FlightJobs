import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './store/store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchProfile } from './store/slices/authSlice';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { SearchJobs } from './pages/SearchJobs';
import { Airlines } from './pages/Airlines';
import { Profile } from './pages/Profile';
import { Leaderboards } from './pages/Leaderboards';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [token, user, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="search" element={<SearchJobs />} />
            <Route path="airlines" element={<Airlines />} />
            <Route path="profile" element={<Profile />} />
            <Route path="leaderboards" element={<Leaderboards />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
