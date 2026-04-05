import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { searchJobs } from '../store/slices/jobsSlice';

export const SearchJobs: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchResults, isLoading } = useAppSelector((state) => state.jobs);
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [range, setRange] = useState(100);
  const [aviationType, setAviationType] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(searchJobs({ departure, arrival, range, aviationType }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Search Jobs</h1>

      {/* Search Form */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="departure" className="block text-sm font-medium text-gray-300">
                Departure ICAO
              </label>
              <input
                id="departure"
                type="text"
                maxLength={4}
                value={departure}
                onChange={(e) => setDeparture(e.target.value.toUpperCase())}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="SBGR"
              />
            </div>
            <div>
              <label htmlFor="arrival" className="block text-sm font-medium text-gray-300">
                Arrival ICAO
              </label>
              <input
                id="arrival"
                type="text"
                maxLength={4}
                value={arrival}
                onChange={(e) => setArrival(e.target.value.toUpperCase())}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="SBGL"
              />
            </div>
          </div>

          <div>
            <label htmlFor="range" className="block text-sm font-medium text-gray-300">
              Range: {range} NM
            </label>
            <input
              id="range"
              type="range"
              min="10"
              max="450"
              value={range}
              onChange={(e) => setRange(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="aviationType" className="block text-sm font-medium text-gray-300">
              Aviation Type
            </label>
            <select
              id="aviationType"
              value={aviationType}
              onChange={(e) => setAviationType(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>General Aviation</option>
              <option value={2}>Air Transport</option>
              <option value={3}>Heavy</option>
              <option value={4}>Cargo</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search Jobs'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searchResults && searchResults.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-white mb-4">
            Search Results ({searchResults.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Distance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pax</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cargo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {searchResults.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-white">
                      {job.departureICAO} → {job.arrivalICAO}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{job.distance} NM</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{job.pax}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{job.cargo} kg</td>
                    <td className="px-4 py-3 text-sm text-green-400">${job.pay.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Accept
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
