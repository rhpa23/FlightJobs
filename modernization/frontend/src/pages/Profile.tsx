import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  UserIcon,
  CameraIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  ArrowUpTrayIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilmIcon,
  TrashIcon,
  BanknotesIcon,
  AcademicCapIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  MapPinIcon,
  CubeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyStats } from '../store/slices/statisticsSlice';
import {
  fetchLogbook,
  deleteLogbookJob,
  fetchLicenses,
  fetchLicenseItems,
  purchaseLicenseItem,
  transferFunds,
  fetchGraduations,
  setSelectedLicenseExpense,
} from '../store/slices/profileSlice';
import { Modal } from '../components/ui/Modal';
import { Tooltip } from '../components/ui/Tooltip';
import { ToastContainer, ToastMsg } from '../components/Toast';

// Predefined avatars (using heroicons as placeholder avatars)
const AVATARS = [
  { id: 1, name: 'Pilot', icon: '✈️', color: 'from-blue-500 to-blue-700' },
  { id: 2, name: 'Captain', icon: '👨‍✈️', color: 'from-green-500 to-green-700' },
  { id: 3, name: 'Commander', icon: '🎖️', color: 'from-yellow-500 to-yellow-700' },
  { id: 4, name: 'Officer', icon: '🛡️', color: 'from-purple-500 to-purple-700' },
  { id: 5, name: 'Hero', icon: '⭐', color: 'from-red-500 to-red-700' },
  { id: 6, name: 'Ace', icon: '🏆', color: 'from-orange-500 to-orange-700' },
  { id: 7, name: 'Eagle', icon: '🦅', color: 'from-teal-500 to-teal-700' },
  { id: 8, name: 'Falcon', icon: '🦇', color: 'from-indigo-500 to-indigo-700' },
  { id: 9, name: 'Hawk', icon: '🔥', color: 'from-pink-500 to-pink-700' },
  { id: 10, name: 'Phoenix', icon: '🌟', color: 'from-cyan-500 to-cyan-700' },
];

// Graduation data (from legacy system)
const GRADUATIONS = [
  { name: 'ATP Senior Commander', minHours: 5000, maxHours: null },
  { name: 'ATP Commander', minHours: 4000, maxHours: 4999 },
  { name: 'ATP Senior Captain', minHours: 3500, maxHours: 3999 },
  { name: 'ATP Captain', minHours: 3000, maxHours: 3499 },
  { name: 'ATP First Officer', minHours: 1500, maxHours: 1999 },
  { name: 'Commercial Senior Commander', minHours: 1000, maxHours: 1499 },
  { name: 'Commercial Commander', minHours: 750, maxHours: 999 },
  { name: 'Commercial Senior Captain', minHours: 540, maxHours: 749 },
  { name: 'Commercial Captain', minHours: 430, maxHours: 539 },
  { name: 'Commercial First Officer', minHours: 360, maxHours: 429 },
  { name: 'Senior Captain', minHours: 250, maxHours: 359 },
  { name: 'Captain', minHours: 160, maxHours: 249 },
  { name: 'First Officer', minHours: 80, maxHours: 159 },
  { name: 'Flight Officer', minHours: 40, maxHours: 79 },
  { name: 'Junior Flight Officer', minHours: 0, maxHours: 39 },
];

// Format currency
const formatCurrency = (value: number): string => {
  const neg = value < 0;
  const absValue = Math.abs(value);
  return `${neg ? '-' : ''}F$${absValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// Format hours from string like "123h 45m" to number
const parseFlightHours = (timeStr: string): number => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)h\s*(\d+)?m?/);
  if (match) {
    return parseInt(match[1]) + (parseInt(match[2] || '0') / 60);
  }
  return 0;
};

// Get current graduation based on flight hours
const getCurrentGraduation = (flightHours: number) => {
  for (const grad of GRADUATIONS) {
    if (grad.maxHours === null && flightHours >= grad.minHours) return grad;
    if (flightHours >= grad.minHours && (grad.maxHours === null || flightHours <= grad.maxHours)) {
      return grad;
    }
  }
  return GRADUATIONS[GRADUATIONS.length - 1];
};

interface LogbookFilters {
  departure: string;
  arrival: string;
  modelDescription: string;
}

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myStats, isLoading: statsLoading } = useAppSelector((state) => state.statistics);
  const { logbook, licenses, graduations, currentBankBalance, isLoading } = useAppSelector((state) => state.profile);

  // Local state
  const [selectedAvatar, setSelectedAvatar] = useState<number>(1);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [selectedJobVideo, setSelectedJobVideo] = useState<number | null>(null);
  const [selectedLicenseExpense, setSelectedLicenseExpenseLocal] = useState<number | null>(null);
  const [transferPercent, setTransferPercent] = useState<number>(10);
  const [filters, setFilters] = useState<LogbookFilters>({
    departure: '',
    arrival: '',
    modelDescription: '',
  });
  const [sortOrder, setSortOrder] = useState<string>('Date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const addToast = useCallback((message: string, type: ToastMsg['type'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchMyStats());
    dispatch(fetchLicenses());
    dispatch(fetchGraduations());
  }, [dispatch]);

  // Fetch logbook when filters or page changes
  useEffect(() => {
    dispatch(
      fetchLogbook({
        pageNumber: currentPage,
        pageSize: pageSize,
        sortOrder: sortOrder === sortDirection ? sortOrder : `${sortOrder}_${sortDirection}`,
        departureFilter: filters.departure || undefined,
        arrivalFilter: filters.arrival || undefined,
        modelDescriptionFilter: filters.modelDescription || undefined,
      })
    );
  }, [dispatch, currentPage, pageSize, sortOrder, sortDirection, filters]);

  // Fetch license items when expense is selected
  useEffect(() => {
    if (selectedLicenseExpense) {
      dispatch(fetchLicenseItems(selectedLicenseExpense));
    }
  }, [dispatch, selectedLicenseExpense]);

  // Calculate transfer projections
  const transferProjections = useMemo(() => {
    if (!myStats) return null;
    const pilotBalance = myStats.bankBalance || 0;
    const tax = pilotBalance * 0.15;
    const transferAmount = pilotBalance * (transferPercent / 100);
    const pilotProjection = pilotBalance - transferAmount - tax;
    const airlineProjection = (myStats.airline?.bankBalance || 0) + transferAmount;
    return {
      pilotBalance,
      tax,
      transferAmount,
      pilotProjection,
      airlineProjection,
    };
  }, [myStats, transferPercent]);

  // Get current graduation
  const currentGraduation = useMemo(() => {
    const hours = myStats ? parseFlightHours(myStats.flightTimeTotal || '0') : 0;
    return getCurrentGraduation(hours);
  }, [myStats]);

  // Handle sort
  const handleSort = (column: string) => {
    if (sortOrder === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOrder(column);
      setSortDirection('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (sortOrder !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 inline" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 inline" />
    );
  };

  // Handle delete job
  const handleDeleteJob = async (jobId: number) => {
    await dispatch(deleteLogbookJob(jobId));
    addToast('Flight removed from logbook', 'success');
    dispatch(fetchLogbook({ pageNumber: currentPage, sortOrder }));
  };

  // Handle purchase license item
  const handlePurchaseLicenseItem = async (itemId: number) => {
    const result = await dispatch(purchaseLicenseItem(itemId));
    if (purchaseLicenseItem.fulfilled.match(result)) {
      addToast('License item purchased successfully!', 'success');
      // Refresh licenses to get updated state
      dispatch(fetchLicenses());
      if (selectedLicenseExpense) {
        dispatch(fetchLicenseItems(selectedLicenseExpense));
      }
    }
  };

  // Handle transfer
  const handleTransfer = async () => {
    const result = await dispatch(transferFunds(transferPercent));
    if (transferFunds.fulfilled.match(result)) {
      addToast('Funds transferred successfully!', 'success');
      setShowTransferModal(false);
      dispatch(fetchMyStats());
    }
  };

  // Handle avatar selection
  const handleSelectAvatar = async (avatarId: number) => {
    setSelectedAvatar(avatarId);
    setShowAvatarModal(false);
    addToast('Avatar updated successfully!', 'success');
  };

  // Remove filters
  const removeFilters = () => {
    setFilters({ departure: '', arrival: '', modelDescription: '' });
    setCurrentPage(1);
  };

  // Loading state
  if (statsLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative group">
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br ${AVATARS[selectedAvatar - 1].color} flex items-center justify-center text-4xl cursor-pointer hover:opacity-90 transition-opacity`}
                onClick={() => setShowAvatarModal(true)}
              >
                {AVATARS[selectedAvatar - 1].icon}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <CameraIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Pilot Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <UserIcon className="h-7 w-7 text-blue-400" />
              {user?.userName || user?.email || 'Pilot'}
            </h1>
            <p className="text-gray-400 mt-1">{user?.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-300">{currentGraduation?.name}</span>
                <Tooltip
                  content={`Current graduation based on ${myStats?.flightTimeTotal || '0'} flight hours`}
                  position="top"
                />
              </div>
              <button
                onClick={() => setShowGraduationModal(true)}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                View Graduations
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Bank Balance</p>
              <p className="text-xl font-bold text-green-400">
                {formatCurrency(myStats?.bankBalance || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pilot Score</p>
              <p className="text-xl font-bold text-white">
                {myStats?.pilotScore?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Flights</p>
              <p className="text-xl font-bold text-white">
                {myStats?.numberFlights?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAvatarModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <CameraIcon className="w-4 h-4" />
          Change Avatar
        </button>
        <button
          onClick={() => setShowTransferModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          disabled={!myStats?.airline}
        >
          <ArrowUpTrayIcon className="w-4 h-4" />
          Transfer to Airline
        </button>
        <button
          onClick={() => setShowGraduationModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          <AcademicCapIcon className="w-4 h-4" />
          Graduations
        </button>
        <button
          onClick={() => setShowLicenseModal(true)}
          className={`relative flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
            licenses.expenses.some((e) => new Date(e.maturityDate) < new Date())
              ? 'bg-red-600 hover:bg-red-500 animate-pulse'
              : 'bg-yellow-600 hover:bg-yellow-500'
          }`}
        >
          <ShieldCheckIcon className="w-4 h-4" />
          Licenses
          {licenses.expenses.some((e) => new Date(e.maturityDate) < new Date()) && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          )}
        </button>
      </div>

      {/* Flight Logbook */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BookOpenIcon className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Flight Logbook</h2>
              <span className="text-sm text-gray-400">({logbook.totalCount} flights)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
              >
                <FunnelIcon className="w-4 h-4" />
                Filter
              </button>
              {(filters.departure || filters.arrival || filters.modelDescription) && (
                <button
                  onClick={removeFilters}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
                  title="Remove filters"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Logbook Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-white"
                  onClick={() => handleSort('Date')}
                >
                  Date {getSortIcon('Date')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-white"
                  onClick={() => handleSort('DepartureICAO')}
                >
                  Departure {getSortIcon('DepartureICAO')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-white"
                  onClick={() => handleSort('ArrivalICAO')}
                >
                  Arrival {getSortIcon('ArrivalICAO')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-white"
                  onClick={() => handleSort('Model')}
                >
                  Aircraft {getSortIcon('Model')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-white"
                  onClick={() => handleSort('Distance')}
                >
                  Distance {getSortIcon('Distance')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-white"
                  onClick={() => handleSort('Pax')}
                >
                  Pax {getSortIcon('Pax')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-white"
                  onClick={() => handleSort('Cargo')}
                >
                  Cargo {getSortIcon('Cargo')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Payload
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide cursor-pointer hover:text-white"
                  onClick={() => handleSort('Pay')}
                >
                  Pay {getSortIcon('Pay')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Flight Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Fuel Used
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {logbook.entries.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
                    {logbook.isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        Loading logbook...
                      </div>
                    ) : (
                      'No flights in logbook yet. Complete a flight to see it here.'
                    )}
                  </td>
                </tr>
              ) : (
                logbook.entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-300">
                      {new Date(entry.endTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3 text-gray-500" />
                        <span className="text-white font-mono">{entry.departureICAO}</span>
                        <span className="text-gray-500 text-xs">
                          ({new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3 text-gray-500" />
                        <span className="text-white font-mono">{entry.arrivalICAO}</span>
                        <span className="text-gray-500 text-xs">
                          ({new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {entry.modelDescription} - {entry.modelName}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{entry.distance} NM</td>
                    <td className="px-4 py-3 text-gray-300">{entry.pax}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {entry.cargo} {myStats?.weightUnit || 'kg'}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {entry.payloadDisplay} {myStats?.weightUnit || 'kg'}
                    </td>
                    <td className="px-4 py-3 text-green-400 font-medium">
                      F$ {entry.pay?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{entry.flightTime}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {entry.usedFuelWeightDisplay} {myStats?.weightUnit || 'kg'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedJobVideo(entry.id);
                            setShowVideoModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                          title="View video"
                        >
                          <FilmIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(entry.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Remove from logbook"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {logbook.totalCount > 0 && (
          <div className="p-4 border-t border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-300">
                Page {currentPage} of {Math.ceil(logbook.totalCount / pageSize)}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(logbook.totalCount / pageSize), p + 1))}
                disabled={currentPage >= Math.ceil(logbook.totalCount / pageSize)}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* License Management Modal */}
      <Modal
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        title="License Management"
        size="2xl"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Manage your pilot licenses and purchase required items before expiration.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* License Expenses List */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                License Requirements
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {licenses.expenses.length === 0 ? (
                  <p className="text-gray-400 text-sm">No license requirements found.</p>
                ) : (
                  licenses.expenses.map((expense) => {
                    const isOverdue = new Date(expense.maturityDate) < new Date();
                    return (
                      <div
                        key={expense.id}
                        onClick={() => setSelectedLicenseExpenseLocal(expense.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedLicenseExpense === expense.id
                            ? 'bg-blue-600/20 border border-blue-500/50'
                            : 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isOverdue ? (
                              <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                            ) : (
                              <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            )}
                            <span className={`font-medium ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                              {expense.name}
                            </span>
                          </div>
                          <span className={`text-sm ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                            Due: {new Date(expense.maturityDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {licenses.expenses.some((e) => new Date(e.maturityDate) < new Date()) && (
                <p className="text-xs text-red-400 mt-2">
                  * License requirements in red are overdue. Purchase all items to update.
                </p>
              )}
            </div>

            {/* License Items */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                {selectedLicenseExpense
                  ? licenses.expenses.find((e) => e.id === selectedLicenseExpense)?.name
                  : 'Select a License'}
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {!selectedLicenseExpense ? (
                  <p className="text-gray-400 text-sm">Select a license requirement to view items.</p>
                ) : licenses.selectedExpense?.items?.length === 0 ? (
                  <p className="text-gray-400 text-sm">No items found for this license.</p>
                ) : (
                  licenses.selectedExpense?.items?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-gray-700/50 rounded-lg border border-gray-600"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <ShieldCheckIcon className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.name}</p>
                          <p className="text-lg font-bold text-green-400">{formatCurrency(item.price)}</p>
                          {item.isBought ? (
                            <div className="flex items-center gap-1 text-green-400 text-xs">
                              <CheckCircleIcon className="w-3 h-3" />
                              Purchased
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePurchaseLicenseItem(item.id)}
                              className="mt-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                            >
                              Buy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Avatar Selection Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Select Avatar"
        size="lg"
      >
        <div className="grid grid-cols-5 gap-4">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelectAvatar(avatar.id)}
              className={`p-4 rounded-xl transition-all ${
                selectedAvatar === avatar.id
                  ? 'ring-2 ring-blue-500 bg-blue-500/20'
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              <div
                className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-3xl`}
              >
                {avatar.icon}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">{avatar.name}</p>
            </button>
          ))}
        </div>
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Logbook Filter"
        size="md"
        footer={
          <div className="flex items-center justify-between">
            <button
              onClick={removeFilters}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Remove Filter
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setShowFilterModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Departure</label>
              <input
                type="text"
                value={filters.departure}
                onChange={(e) => setFilters((f) => ({ ...f, departure: e.target.value.toUpperCase().slice(0, 4) }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none uppercase"
                placeholder="ICAO"
                maxLength={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Arrival</label>
              <input
                type="text"
                value={filters.arrival}
                onChange={(e) => setFilters((f) => ({ ...f, arrival: e.target.value.toUpperCase().slice(0, 4) }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none uppercase"
                placeholder="ICAO"
                maxLength={4}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Aircraft Name</label>
            <input
              type="text"
              value={filters.modelDescription}
              onChange={(e) => setFilters((f) => ({ ...f, modelDescription: e.target.value.toUpperCase().slice(0, 20) }))}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none uppercase"
              placeholder="Aircraft model"
              maxLength={20}
            />
          </div>
        </div>
      </Modal>

      {/* Video Modal */}
      <Modal
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setSelectedJobVideo(null);
        }}
        title="Flight Video"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Add a video link from your flight to share with your airline.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Video URL</label>
            <input
              type="url"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="Describe your flight..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowVideoModal(false);
                setSelectedJobVideo(null);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Transfer Funds to Airline"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowTransferModal(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleTransfer}
              disabled={!myStats?.airline || (myStats?.bankBalance || 0) <= 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Transfer
            </button>
          </div>
        }
      >
        {transferProjections && (
          <div className="space-y-4">
            {/* Pilot Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Pilot Bank Balance</p>
                <p className="text-lg font-semibold text-green-400">
                  {formatCurrency(transferProjections.pilotBalance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  Bank Costs & Tax (15%)
                  <Tooltip content="A 15% tax is applied on transfers to the airline" position="top" />
                </p>
                <p className="text-lg font-semibold text-red-400">
                  {formatCurrency(transferProjections.tax)}
                </p>
              </div>
            </div>

            {/* Transfer Percent */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Transfer Percentage (0-100%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={transferPercent}
                onChange={(e) => setTransferPercent(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-400">0%</span>
                <span className="text-lg font-bold text-white">{transferPercent}%</span>
                <span className="text-sm text-gray-400">100%</span>
              </div>
            </div>

            {/* Projections */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Pilot Balance After Transfer</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(transferProjections.pilotProjection)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Airline Balance After Transfer</p>
                <p className="text-lg font-semibold text-green-400">
                  {formatCurrency(transferProjections.airlineProjection)}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-sm text-blue-300">
                <strong>Transfer Summary:</strong> F${' '}
                {transferProjections.transferAmount.toFixed(2)} will be transferred to your airline.
                A tax of F$ {transferProjections.tax.toFixed(2)} will be deducted from your balance.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Graduation Modal */}
      <Modal
        isOpen={showGraduationModal}
        onClose={() => setShowGraduationModal(false)}
        title="Pilot Graduations"
        size="lg"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 text-sm font-medium text-gray-400 pb-2 border-b border-gray-700">
            <span>Graduation Name</span>
            <span>Flight Hours</span>
          </div>
          {GRADUATIONS.map((grad, index) => {
            const isCurrent = currentGraduation?.name === grad.name;
            return (
              <div
                key={index}
                className={`grid grid-cols-2 gap-2 py-2 px-3 rounded-lg ${
                  isCurrent ? 'bg-blue-500/20 border border-blue-500/50' : ''
                }`}
              >
                <span className={`font-medium ${isCurrent ? 'text-blue-400' : 'text-white'}`}>
                  {grad.name}
                  {isCurrent && (
                    <span className="ml-2 text-xs text-blue-300">(Current)</span>
                  )}
                </span>
                <span className="text-gray-400">
                  {grad.maxHours !== null ? `${grad.minHours} - ${grad.maxHours}` : `${grad.minHours}+`}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
