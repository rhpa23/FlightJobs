import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyStats } from '../store/slices/statisticsSlice';

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myStats, isLoading } = useAppSelector((state) => state.statistics);

  useEffect(() => {
    dispatch(fetchMyStats());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Profile</h1>

      {/* User Info */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white">
              {(user?.userName || user?.email || 'P')?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-medium text-white">
              {user?.userName || user?.email || 'Piloto'}
            </h2>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {myStats && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-white mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Bank Balance</p>
              <p className="text-lg font-medium text-green-400">${myStats.bankBalance?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Pilot Score</p>
              <p className="text-lg font-medium text-white">{myStats.pilotScore?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Flights</p>
              <p className="text-lg font-medium text-white">{myStats.numberFlights?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Flight Hours</p>
              <p className="text-lg font-medium text-white">{myStats.flightTimeTotal || '0'}</p>
            </div>
          </div>
        </div>
      )}

      {/* License Management Placeholder */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-white mb-4">Licenses</h2>
        <p className="text-gray-400">License management coming soon...</p>
      </div>
    </div>
  );
};
