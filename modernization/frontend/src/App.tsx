import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './store/store';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { SearchJobs } from './pages/SearchJobs';
import { MyJobs } from './pages/MyJobs';
import { Airlines } from './pages/Airlines';
import { Profile } from './pages/Profile';
import { Challenges } from './pages/Challenges';
import { Leaderboards } from './pages/Leaderboards';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';

const App: React.FC = () => {
  return (
    <Provider store={store}>
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
            <Route path="jobs" element={<MyJobs />} />
            <Route path="airlines" element={<Airlines />} />
            <Route path="challenges" element={<Challenges />} />
            <Route path="profile" element={<Profile />} />
            <Route path="leaderboards" element={<Leaderboards />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
