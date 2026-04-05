import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchScoreLeaderboard, fetchFlightsLeaderboard, fetchEarningsLeaderboard } from '../store/slices/statisticsSlice';

export const Leaderboards: React.FC = () => {
  const dispatch = useAppDispatch();
  const { scoreLeaderboard, flightsLeaderboard, earningsLeaderboard, isLoading } = useAppSelector((state) => state.statistics);
  const [activeTab, setActiveTab] = useState<'score' | 'flights' | 'earnings'>('score');

  useEffect(() => {
    dispatch(fetchScoreLeaderboard());
    dispatch(fetchFlightsLeaderboard());
    dispatch(fetchEarningsLeaderboard());
  }, [dispatch]);

  const getLeaderboardData = () => {
    switch (activeTab) {
      case 'score':
        return scoreLeaderboard;
      case 'flights':
        return flightsLeaderboard;
      case 'earnings':
        return earningsLeaderboard;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Leaderboards</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('score')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'score'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Score
        </button>
        <button
          onClick={() => setActiveTab('flights')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'flights'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Flights
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'earnings'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Earnings
        </button>
      </div>

      {/* Leaderboard Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pilot</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {getLeaderboardData().map((entry: any, index) => (
                <tr key={index} className="hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-white">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {entry.user?.firstName} {entry.user?.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-400">
                    {activeTab === 'earnings'
                      ? `$${entry.statistics?.bankBalance?.toLocaleString() || 0}`
                      : entry.statistics?.[activeTab === 'score' ? 'pilotScore' : 'numberFlights']?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
