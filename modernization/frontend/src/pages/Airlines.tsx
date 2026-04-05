import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAirlines, createAirline, joinAirline } from '../store/slices/airlinesSlice';

export const Airlines: React.FC = () => {
  const dispatch = useAppDispatch();
  const { airlines, isLoading } = useAppSelector((state) => state.airlines);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAirlineName, setNewAirlineName] = useState('');
  const [newAirlineCountry, setNewAirlineCountry] = useState('');

  useEffect(() => {
    dispatch(fetchAirlines());
  }, [dispatch]);

  const handleCreateAirline = () => {
    dispatch(createAirline({ name: newAirlineName, country: newAirlineCountry, score: 0 }));
    setShowCreateModal(false);
    setNewAirlineName('');
    setNewAirlineCountry('');
  };

  const handleJoinAirline = (id: number) => {
    dispatch(joinAirline(id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Airlines</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Airline
        </button>
      </div>

      {/* Airlines List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {airlines.map((airline) => (
            <div key={airline.id} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">{airline.name}</h3>
                <span className="text-sm text-gray-400">{airline.country}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Score: <span className="text-white">{airline.score}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Salary: <span className="text-green-400">${airline.salary}/hr</span>
                </p>
                <button
                  onClick={() => handleJoinAirline(airline.id)}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-medium text-white mb-4">Create New Airline</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  value={newAirlineName}
                  onChange={(e) => setNewAirlineName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  placeholder="My Airline"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Country</label>
                <input
                  type="text"
                  value={newAirlineCountry}
                  onChange={(e) => setNewAirlineCountry(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  placeholder="United States"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateAirline}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
