import React, { useEffect, useState, useCallback } from 'react';
import {
  InformationCircleIcon,
  TrashIcon,
  BanknotesIcon,
  StarIcon,
  PaperAirplaneIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CubeIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyStats, fetchMonthlyEarnings } from '../store/slices/statisticsSlice';
import { fetchPendingJobs, fetchActiveJob, deleteJob, activateJob } from '../store/slices/jobsSlice';
import { fetchMyAirline } from '../store/slices/airlinesSlice';
import { ToastContainer, ToastMsg } from '../components/Toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myStats, monthlyEarnings, isLoading } = useAppSelector((state) => state.statistics);
  const { pendingJobs, currentJob } = useAppSelector((state) => state.jobs);
  const { userAirline } = useAppSelector((state) => state.airlines);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<typeof pendingJobs[0] | null>(null);
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
    dispatch(fetchMonthlyEarnings());
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
      {/* Welcome Section with App Summary */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <PaperAirplaneIcon className="h-7 w-7 text-blue-400" />
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Welcome back, <span className="text-blue-400 font-medium">{user?.userName || user?.email || 'Pilot'}</span>!
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50">
            <InformationCircleIcon className="h-4 w-4 flex-shrink-0" />
            <span className="max-w-md">
              FlightJobs is an aviation career platform for flight simulators.
              Complete aviation jobs, earn rewards, work for a virtual airline and build your career as a virtual pilot.
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bank Balance */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700/50 hover:border-green-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <BanknotesIcon className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Bank Balance</p>
                <p className="text-xl font-bold text-white">
                  F$ {myStats?.bankBalance != null ? myStats.bankBalance.toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pilot Score */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700/50 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <StarIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pilot Score</p>
                <p className="text-xl font-bold text-white">
                  {myStats?.pilotScore != null ? myStats.pilotScore.toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Flights */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700/50 hover:border-yellow-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                <PaperAirplaneIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Flights</p>
                <p className="text-xl font-bold text-white">
                  {myStats?.numberFlights != null ? myStats.numberFlights.toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Hours */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700/50 hover:border-purple-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <ClockIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Flight Hours</p>
                <p className="text-xl font-bold text-white">
                  {myStats?.flightTimeTotal || '0h'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Job - Modern Design */}
      {currentJob && (
        <div className="bg-gradient-to-br from-blue-900/20 to-gray-800 rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MapPinIcon className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Current Flight</h2>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete current job"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-start gap-3">
              <ArrowPathIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Route</p>
                <p className="text-lg font-semibold text-white">
                  {currentJob.departureICAO} <span className="text-blue-400">→</span> {currentJob.arrivalICAO}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UsersIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
                  Pax
                  <span className="relative group">
                    <InformationCircleIcon className="w-3.5 h-3.5 text-gray-600 cursor-help" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
                      Weight for each pax: {currentJob.paxWeight} {myStats?.weightUnit || ''}
                    </span>
                  </span>
                </p>
                <p className="text-lg font-semibold text-white">{currentJob.pax || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CubeIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
                  Total Payload
                  <span className="relative group">
                    <InformationCircleIcon className="w-3.5 h-3.5 text-gray-600 cursor-help" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
                      (Pax * PaxWeight) + CargoWeight
                    </span>
                  </span>
                </p>
                <p className="text-lg font-semibold text-green-400">
                  {currentJob.pax != null && currentJob.cargo != null ? ((currentJob.pax * currentJob.paxWeight) + currentJob.cargo).toLocaleString() + ' ' + (myStats?.weightUnit || '') : '0'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.894-.447L15 4m0 13V4m0 0L9 7" />
              </svg>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Distance</p>
                <p className="text-lg font-semibold text-white">{currentJob.distance} NM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CubeIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Cargo</p>
                <p className="text-lg font-semibold text-white">{currentJob.cargo + ' ' + (myStats?.weightUnit || '')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BanknotesIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Payment</p>
                <p className="text-lg font-semibold text-green-400">F$ {currentJob.pay != null ? currentJob.pay.toLocaleString() : '0'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Jobs - Modern Design */}
      {pendingJobs && pendingJobs.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <BriefcaseIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Pending Jobs</h2>
            <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full">
              {pendingJobs.length}
            </span>
          </div>
          <div className="space-y-3">
            {pendingJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-800/80 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <ArrowPathIcon className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {job.departureICAO} <span className="text-gray-500">→</span> {job.arrivalICAO}
                    </p>
                    <p className="text-sm text-gray-400">
                      {job.distance} NM • F$ {job.pay != null ? job.pay.toLocaleString() : '0'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setShowActivateModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Activate
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Airline Info - Modern Design */}
      {userAirline && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <BuildingOfficeIcon className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">My Airline</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-indigo-400">{userAirline.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{userAirline.name}</p>
                <p className="text-sm text-gray-400">{userAirline.country}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Salary/Hour</p>
              <p className="text-xl font-bold text-green-400">F$ {userAirline.salary != null ? userAirline.salary.toLocaleString() : '0'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Modern Design */}
      {showConfirmModal && currentJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <TrashIcon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Confirm Cancellation</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Are you sure you want to cancel the current flight from{' '}
                <span className="text-white font-medium">{currentJob.departureICAO}</span> to{' '}
                <span className="text-white font-medium">{currentJob.arrivalICAO}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await dispatch(deleteJob(currentJob.id));
                    setShowConfirmModal(false);
                    addToast('Flight cancelled successfully', 'success');
                    dispatch(fetchActiveJob());
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activate Confirmation Modal - Modern Design */}
      {showActivateModal && selectedJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ArrowPathIcon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Confirm Activation</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Do you want to activate the job from{' '}
                <span className="text-white font-medium">{selectedJob.departureICAO}</span> to{' '}
                <span className="text-white font-medium">{selectedJob.arrivalICAO}</span>?
                <br /><br />
                <span className="text-sm text-gray-500">This will become your current flight.</span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowActivateModal(false);
                    setSelectedJob(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await dispatch(activateJob(selectedJob.id));
                    setShowActivateModal(false);
                    setSelectedJob(null);
                    addToast('Job activated successfully', 'success');
                    dispatch(fetchPendingJobs());
                    dispatch(fetchActiveJob());
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Ganhos Mensais */}
      {monthlyEarnings && monthlyEarnings.labels.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Monthly Earnings</h2>
                <p className="text-sm text-gray-400">Last 6 months performance</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Month Goal</p>
              <p className="text-xl font-bold text-green-400">
                F$ {monthlyEarnings.monthGoal.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-400">
              Total of 6 months:{' '}
              <span className="text-white font-semibold">
                F$ {monthlyEarnings.totalSixMonths.toLocaleString()}
              </span>
            </p>
          </div>

          <div className="h-64">
            <Line
              data={{
                labels: monthlyEarnings.labels,
                datasets: [
                  {
                    label: 'Earnings (F$)',
                    data: monthlyEarnings.data,
                    borderColor: 'rgb(96, 165, 250)',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(96, 165, 250)',
                    pointBorderColor: 'rgb(59, 130, 246)',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: 'rgb(156, 163, 175)',
                    bodyColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgba(75, 85, 99, 0.5)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                      label: (context) => {
                        const value = context.parsed.y;
                        return `F$ ${value != null ? value.toLocaleString() : '0'}`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: 'rgba(75, 85, 99, 0.2)',
                    },
                    ticks: {
                      color: 'rgb(156, 163, 175)',
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(75, 85, 99, 0.2)',
                    },
                    ticks: {
                      color: 'rgb(156, 163, 175)',
                      callback: (value) => `F$ ${Number(value).toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
