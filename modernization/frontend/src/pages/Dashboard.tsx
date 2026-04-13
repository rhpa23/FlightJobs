import React, { useEffect, useState, useCallback } from 'react';
import { InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyStats } from '../store/slices/statisticsSlice';
import { fetchPendingJobs, fetchActiveJob, deleteJob } from '../store/slices/jobsSlice';
import { fetchMyAirline } from '../store/slices/airlinesSlice';
import { ToastContainer, ToastMsg } from '../components/Toast';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myStats, isLoading } = useAppSelector((state) => state.statistics);
  const { pendingJobs, currentJob } = useAppSelector((state) => state.jobs);
  const { userAirline } = useAppSelector((state) => state.airlines);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const addToast = useCallback((message: string, type: ToastMsg['type'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    dispatch(fetchMyStats());
    dispatch(fetchPendingJobs());
    dispatch(fetchActiveJob());
    dispatch(fetchMyAirline());
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, {user?.userName || user?.email || 'Pilot'}!
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662.5.5 0 00-.223.67.5.5 0 00.662.223 3.535 3.535 0 011.237-.47v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582a2.305 2.305 0 01.567-.267V6.092a4.535 4.535 0 00-1.676-.662.5.5 0 00-.223-.67.5.5 0 00-.662.223 3.535 3.535 0 01-1.237.47v1.698a2.305 2.305 0 01.567.267C8.07 8.34 8 8.566 8 8.68c0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267v1.698a4.535 4.535 0 001.676.662.5.5 0 00.223.67.5.5 0 00.662-.223 3.535 3.535 0 011.237-.47v-1.698a2.305 2.305 0 01-.567-.267C11.93 8.66 12 8.434 12 8.32c0-.114-.07-.34-.433-.582a2.305 2.305 0 01-.567-.267V6.092a4.535 4.535 0 00-1.676-.662z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Bank Balance</dt>
                <dd className="text-lg font-medium text-white">
                  ${myStats?.bankBalance != null ? myStats.bankBalance.toLocaleString() : '0'}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Pilot Score</dt>
                <dd className="text-lg font-medium text-white">
                  {myStats?.pilotScore != null ? myStats.pilotScore.toLocaleString() : '0'}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.293a1 1 0 00-1.414 0L10 10.586 8.707 9.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Total Flights</dt>
                <dd className="text-lg font-medium text-white">
                  {myStats?.numberFlights != null ? myStats.numberFlights.toLocaleString() : '0'}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Flight Hours</dt>
                <dd className="text-lg font-medium text-white">
                  {myStats?.flightTimeTotal || '0h'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Current Job */}
      {currentJob && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Current Flight</h2>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-lg transition-colors"
              title="Delete current job"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Route</p>
              <p className="text-lg font-medium text-white">
                {currentJob.departureICAO} → {currentJob.arrivalICAO}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                Pax
                <span className="relative group">
                  <InformationCircleIcon className="w-4 h-4 text-gray-500 cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Weight for each pax: {currentJob.paxWeight} {myStats?.weightUnit || ''}
                  </span>
                </span>
              </p>
              <p className="text-lg font-medium text-white">{currentJob.pax || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                Total payload
                <span className="relative group">
                  <InformationCircleIcon className="w-4 h-4 text-gray-500 cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    (Pax * PaxWeight) + CargoWeight
                  </span>
                </span>
              </p>
              <p className="text-lg font-medium text-green-400">{currentJob.pax != null && currentJob.cargo != null ? ((currentJob.pax * currentJob.paxWeight) + currentJob.cargo).toLocaleString()  + ' ' + (myStats?.weightUnit || '') : '0'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Distance</p>
              <p className="text-lg font-medium text-white">{currentJob.distance} NM</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Cargo</p>
              <p className="text-lg font-medium text-white">{currentJob.cargo + ' ' + (myStats?.weightUnit || '')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Payment</p>
              <p className="text-lg font-medium text-green-400">${currentJob.pay != null ? currentJob.pay.toLocaleString() : '0'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Jobs */}
      {pendingJobs && pendingJobs.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-white mb-4">Pending Jobs ({pendingJobs.length})</h2>
          <div className="space-y-3">
            {pendingJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    {job.departureICAO} → {job.arrivalICAO}
                  </p>
                  <p className="text-sm text-gray-400">
                    {job.distance} NM • ${job.pay != null ? job.pay.toLocaleString() : '0'}
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Start Flight
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Airline Info */}
      {userAirline && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-white mb-4">My Airline</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-white">{userAirline.name}</p>
              <p className="text-sm text-gray-400">{userAirline.country}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Salary</p>
              <p className="text-lg font-medium text-green-400">${userAirline.salary != null ? userAirline.salary.toLocaleString() : '0'}/hr</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && currentJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete the current job from{' '}
              <span className="text-white">{currentJob.departureICAO}</span> to{' '}
              <span className="text-white">{currentJob.arrivalICAO}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await dispatch(deleteJob(currentJob.id));
                  setShowConfirmModal(false);
                  addToast('Job removed successfully', 'success');
                  dispatch(fetchActiveJob());
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
