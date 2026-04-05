import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPendingJobs, fetchActiveJob, activateJob, deleteJob } from '../store/slices/jobsSlice';

export const MyJobs: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pendingJobs, currentJob, isLoading } = useAppSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchPendingJobs());
    dispatch(fetchActiveJob());
  }, [dispatch]);

  const handleActivateJob = (id: number) => {
    dispatch(activateJob(id));
  };

  const handleDeleteJob = (id: number) => {
    dispatch(deleteJob(id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">My Jobs</h1>

      {/* Current Active Job */}
      {currentJob && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-white mb-4">Active Flight</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Route</p>
              <p className="text-lg font-medium text-white">
                {currentJob.departureICAO} → {currentJob.arrivalICAO}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Distance</p>
              <p className="text-lg font-medium text-white">{currentJob.distance} NM</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Payment</p>
              <p className="text-lg font-medium text-green-400">${currentJob.pay.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Aircraft</p>
              <p className="text-lg font-medium text-white">{currentJob.modelName || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Jobs */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-white mb-4">
          Pending Jobs ({pendingJobs?.length || 0})
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : pendingJobs && pendingJobs.length > 0 ? (
          <div className="space-y-3">
            {pendingJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    {job.departureICAO} → {job.arrivalICAO}
                  </p>
                  <p className="text-sm text-gray-400">
                    {job.distance} NM • ${job.pay.toLocaleString()} • {job.pax} Pax
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleActivateJob(job.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No pending jobs. Search for new flights!</p>
        )}
      </div>
    </div>
  );
};
