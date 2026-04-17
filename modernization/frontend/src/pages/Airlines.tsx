import React, { useEffect, useState, useCallback } from 'react';
import {
  BuildingOfficeIcon,
  UsersIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  StarIcon,
  PlusIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchAirlines,
  fetchMyAirline,
  fetchAirlinePilots,
  fetchAirlineStats,
  fetchAirlineFbos,
  createAirline,
  updateAirline,
  joinAirline,
  leaveAirline,
  payDebt,
  fetchAvailableFbos,
  hireFbo,
  Airline,
  AvailableFbo,
} from '../store/slices/airlinesSlice';
import { fetchMyStats } from '../store/slices/statisticsSlice';
import { Modal } from '../components/ui/Modal';
import { Tooltip } from '../components/ui/Tooltip';
import { AirlineCardComponent } from '../components/ui/AirlineCard';
import { IconSelector, renderIcon } from '../components/ui/IconMapper';
import { ToastContainer, ToastMsg } from '../components/Toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
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
  ChartTooltip,
  Legend,
  Filler
);

// Country flags mapping
const getCountryFlag = (country: string): string => {
  const flags: Record<string, string> = {
    'United States': '🇺🇸',
    'Brazil': '🇧🇷',
    'United Kingdom': '🇬🇧',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Japan': '🇯🇵',
    'China': '🇨🇳',
    'India': '🇮🇳',
    'Russia': '🇷🇺',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Portugal': '🇵🇹',
    'Mexico': '🇲🇽',
    'Argentina': '🇦🇷',
    'Netherlands': '🇳🇱',
    'Sweden': '🇸🇪',
    'Norway': '🇳🇴',
    'Finland': '🇫🇮',
  };
  return flags[country] || '🌍';
};

const AIRLINE_PRICE = 40000;

interface AirlineFormData {
  name: string;
  description: string;
  country: string;
  score: number;
  requireCertificates: boolean;
  selectedIcon: string;
}

const initialFormData: AirlineFormData = {
  name: '',
  description: '',
  country: '',
  score: 0,
  requireCertificates: true,
  selectedIcon: '✈️',
};

export const Airlines: React.FC = () => {
  const dispatch = useAppDispatch();
  const { airlines, userAirline, pilots, fbos, airlineStats, availableFbos, isLoading } = useAppSelector((state) => state.airlines);
  const { myStats } = useAppSelector((state) => state.statistics);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPilotsModal, setShowPilotsModal] = useState(false);
  const [showPayDebtModal, setShowPayDebtModal] = useState(false);
  const [showFboModal, setShowFboModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showHireConfirm, setShowHireConfirm] = useState(false);
  const [selectedFbo, setSelectedFbo] = useState<AvailableFbo | null>(null);
  const [fboSearchTerm, setFboSearchTerm] = useState('');

  const [formData, setFormData] = useState<AirlineFormData>(initialFormData);
  const [editingAirlineId, setEditingAirlineId] = useState<number | null>(null);
  const [selectedAirlineForPilots, setSelectedAirlineForPilots] = useState<Airline | null>(null);

  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToast = useCallback((message: string, type: ToastMsg['type'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    dispatch(fetchAirlines());
    dispatch(fetchMyAirline());
    dispatch(fetchMyStats());
  }, [dispatch]);

  useEffect(() => {
    if (userAirline) {
      dispatch(fetchAirlineStats(userAirline.id));
      dispatch(fetchAirlinePilots(userAirline.id));
      dispatch(fetchAirlineFbos(userAirline.id));
    }
  }, [dispatch, userAirline]);

  const handleViewPilots = useCallback(async (id: number) => {
    const airline = airlines.find((a) => a.id === id);
    if (airline) {
      setSelectedAirlineForPilots(airline);
      await dispatch(fetchAirlinePilots(id));
      setShowPilotsModal(true);
    }
  }, [airlines, dispatch]);

  const handleEdit = useCallback((id: number) => {
    const airline = airlines.find((a) => a.id === id);
    if (airline) {
      setEditingAirlineId(id);
      // Check if logo is an SVG icon name (starts with uppercase and ends with Icon)
      const isIconName = airline.logo && /^[A-Z][a-zA-Z]*Icon$/.test(airline.logo);
      setFormData({
        name: airline.name,
        description: airline.description,
        country: airline.country,
        score: airline.score,
        requireCertificates: airline.requireCertificates ?? true,
        selectedIcon: (isIconName && airline.logo) || 'BuildingOfficeIcon',
      });
      setShowEditModal(true);
    }
  }, [airlines]);

  const handleCreate = useCallback(() => {
    if ((myStats?.bankBalance ?? 0) < AIRLINE_PRICE) {
      addToast('You don\'t have enough bank balance to buy a new airline (F$ 40,000 required).', 'error');
      return;
    }
    setEditingAirlineId(null);
    setFormData(initialFormData);
    setShowCreateModal(true);
  }, [myStats, addToast]);

  const handleJoin = useCallback(async (id: number) => {
    const airline = airlines.find((a) => a.id === id);
    if (airline) {
      const userScore = myStats?.pilotScore ?? 0;
      if (userScore < airline.score) {
        addToast(`You need ${airline.score} pilot score to join this airline. Your score: ${userScore}`, 'error');
        return;
      }
      await dispatch(joinAirline(id));
      addToast(`You joined ${airline.name}!`, 'success');
      dispatch(fetchAirlines());
      dispatch(fetchMyAirline());
    }
  }, [airlines, myStats, dispatch, addToast]);

  const handleExit = useCallback(async (id: number) => {
    await dispatch(leaveAirline(id));
    setShowExitConfirm(false);
    addToast('You left the airline successfully.', 'info');
    dispatch(fetchAirlines());
    dispatch(fetchMyAirline());
  }, [dispatch, addToast]);

  const handleSubmitCreate = useCallback(async () => {
    if (!formData.name || !formData.description || !formData.country) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(createAirline({
        name: formData.name,
        description: formData.description,
        country: formData.country,
        score: formData.score,
        requireCertificates: formData.requireCertificates,
      })).unwrap();
      setShowCreateModal(false);
      setFormData(initialFormData);
      addToast('Airline created successfully!', 'success');
      dispatch(fetchAirlines());
      dispatch(fetchMyAirline());
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to create airline.';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, dispatch, addToast]);

  const handleSubmitEdit = useCallback(async () => {
    if (!formData.name || !formData.description || !formData.country || editingAirlineId === null) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(updateAirline({
        id: editingAirlineId,
        data: {
          name: formData.name,
          description: formData.description,
          country: formData.country,
          score: formData.score,
          requireCertificates: formData.requireCertificates,
          logo: formData.selectedIcon,
        },
      })).unwrap();
      setShowEditModal(false);
      addToast('Airline updated successfully!', 'success');
      dispatch(fetchAirlines());
      dispatch(fetchMyAirline());
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to update airline.';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingAirlineId, dispatch, addToast]);

  const handlePayDebt = useCallback(async () => {
    if (!userAirline) {
      addToast('No airline found.', 'error');
      return;
    }
    const amount = userAirline.bankDebt ?? 0;
    if (amount <= 0) {
      addToast('No debt to pay.', 'error');
      return;
    }
    if (amount > (myStats?.bankBalance ?? 0)) {
      addToast('You don\'t have enough bank balance.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(payDebt({ id: userAirline.id, amount })).unwrap();
      setShowPayDebtModal(false);
      addToast('Debt paid successfully!', 'success');
      dispatch(fetchMyAirline());
      dispatch(fetchMyStats());
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to pay debt.';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [userAirline, myStats, dispatch, addToast]);

  const handleOpenFboModal = useCallback(async () => {
    if (!userAirline) {
      addToast('No airline found.', 'error');
      return;
    }
    setFboSearchTerm('');
    await dispatch(fetchAvailableFbos({ icao: '', airlineId: userAirline.id }));
    setShowFboModal(true);
  }, [userAirline, dispatch]);

  const handleFboSearch = useCallback(async () => {
    if (!userAirline) return;
    await dispatch(fetchAvailableFbos({ icao: fboSearchTerm, airlineId: userAirline.id }));
  }, [fboSearchTerm, userAirline, dispatch]);

  const handleOpenHireConfirm = useCallback((fbo: AvailableFbo) => {
    setSelectedFbo(fbo);
    setShowHireConfirm(true);
  }, []);

  const handleHireFbo = useCallback(async () => {
    if (!selectedFbo) return;
    setIsSubmitting(true);
    try {
      await dispatch(hireFbo(selectedFbo.icao)).unwrap();
      setShowHireConfirm(false);
      setShowFboModal(false);
      setSelectedFbo(null);
      addToast('FBO hired successfully!', 'success');
      dispatch(fetchMyAirline());
      dispatch(fetchAirlineFbos(userAirline?.id || 0));
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to hire FBO.';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedFbo, dispatch, userAirline]);

  // Check if user has an airline (either as owner or pilot)
  const hasAirline = !!userAirline;

  // Sort airlines: user's airline first, then by score descending
  const sortedAirlines = [...airlines].sort((a, b) => {
    if (userAirline && a.id === userAirline.id) return -1;
    if (userAirline && b.id === userAirline.id) return 1;
    return b.score - a.score;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BuildingOfficeIcon className="h-7 w-7 text-indigo-400" />
              Airlines
            </h1>
            <p className="text-gray-400 mt-1">
              Manage your virtual airline or join an existing one
            </p>
          </div>
          {!hasAirline && (
            <button
              onClick={handleCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Buy Airline (F$ {AIRLINE_PRICE.toLocaleString()})
            </button>
          )}
        </div>
      </div>

      {/* User's Airline Details */}
      {userAirline && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-blue-500/30">
          {/* Airline Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="h-20 w-20 bg-gray-700/50 rounded-xl flex items-center justify-center text-4xl">
                {userAirline.logo ? (
                  // Check if logo is an SVG icon name (starts with uppercase and ends with Icon)
                  /^[A-Z][a-zA-Z]*Icon$/.test(userAirline.logo) ? (
                    <div className="h-20 w-20 flex items-center justify-center">
                      {renderIcon(userAirline.logo, 'h-10 w-10 text-gray-400')}
                    </div>
                  ) : (
                    <img
                      src={userAirline.logo}
                      alt={userAirline.name}
                      className="h-full w-full object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  )
                ) : (
                  <span>✈️</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{userAirline.name}</h2>
                  <span className="text-2xl" title={userAirline.country}>
                    {getCountryFlag(userAirline.country)}
                  </span>
                </div>
                <p className="text-gray-400 mt-1">{userAirline.description}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bank Balance */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <BanknotesIcon className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-400">Bank Balance</span>
              </div>
              <p className="text-xl font-bold text-green-400">
                F$ {userAirline.bankBalance?.toLocaleString() ?? '0'}
              </p>
            </div>

            {/* Bank Debt */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <span className="text-sm text-gray-400">Bank Debt</span>
                <Tooltip content={`Maturity: ${userAirline.debtMaturityDate ? new Date(userAirline.debtMaturityDate).toLocaleDateString() : 'N/A'}`} />
              </div>
              <p className={`text-xl font-bold ${userAirline.bankDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                F$ {userAirline.bankDebt?.toLocaleString() ?? '0'}
              </p>
            </div>

            {/* Pilots Hired */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <UsersIcon className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-400">Pilots Hired</span>
                <Tooltip
                  content={
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-400">Owner:</span>
                        <p className="font-bold text-white">{userAirline?.owner?.userName || 'Unknown'}</p>
                      </div>
                      {pilots && pilots.length > 0 && (
                        <div>
                          <span className="text-gray-400">Pilots:</span>
                          <ul className="mt-1 space-y-1">
                            {pilots.map((pilot) => (
                              <li key={pilot.id} className="text-sm text-gray-300">
                                {pilot.userName || pilot.email}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  }
                />
              </div>
              <p className="text-xl font-bold text-blue-400">
                {pilots?.length ?? 0}
              </p>
            </div>

            {/* FBOs */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <BuildingOfficeIcon className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400">FBOs</span>
                <Tooltip
                  position="bottom"
                  content={
                    <div className="space-y-2">
                      {fbos && fbos.length > 0 ? (
                        <div>
                          <span className="text-gray-400">FBOs Hired:</span>
                          <p className="text-sm text-gray-300 mt-1">
                            {fbos.map((fbo) => fbo.icao).join(', ')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No FBOs hired yet.</p>
                      )}
                    </div>
                  }
                />
              </div>
              <p className="text-xl font-bold text-purple-400">
                {userAirline.fboCount ?? 0}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6">
            <div className="flex flex-wrap gap-3">
              {userAirline.alowEdit && (
                <button
                  onClick={() => handleEdit(userAirline.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all text-sm font-medium"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Airline
                </button>
              )}
              {userAirline.alowEdit && (
                <button
                  onClick={handleOpenFboModal}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all text-sm font-medium"
                >
                  <BuildingOfficeIcon className="h-4 w-4" />
                  Manage FBOs
                </button>
              )}
              {userAirline.bankDebt > 0 && (
                <button
                  onClick={() => setShowPayDebtModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-all text-sm font-medium"
                >
                  <BanknotesIcon className="h-4 w-4" />
                  Pay Debt
                </button>
              )}
              {userAirline.alowExit && (
                <button
                  onClick={() => setShowExitConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all text-sm font-medium"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Exit Airline
                </button>
              )}
            </div>
          </div>

          {/* Earnings Chart */}
          {airlineStats?.monthlyEarnings && airlineStats.monthlyEarnings.data.length > 0 && (
            <div className="p-6 border-t border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <ChartBarIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Monthly Earnings</h3>
                    <p className="text-sm text-gray-400">Last 3 months performance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total (3 months)</p>
                  <p className="text-xl font-bold text-green-400">
                    F$ {airlineStats.monthlyEarnings.total.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="h-64">
                <Line
                  data={{
                    labels: airlineStats.monthlyEarnings.labels,
                    datasets: [
                      {
                        label: 'Earnings (F$)',
                        data: airlineStats.monthlyEarnings.data,
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
                      legend: { display: false },
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
                        grid: { color: 'rgba(75, 85, 99, 0.2)' },
                        ticks: { color: 'rgb(156, 163, 175)' },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(75, 85, 99, 0.2)' },
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
        </div>
      )}

      {/* Available Airlines List - Only show if user has no airline */}
      {!hasAirline && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Available Airlines
            </h2>
            <span className="text-sm text-gray-400">
              {sortedAirlines.length} airline{sortedAirlines.length !== 1 ? 's' : ''}
            </span>
          </div>

          {sortedAirlines.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 text-center">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No airlines available yet.</p>
              <p className="text-gray-500 text-sm mt-2">Be the first to create an airline!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAirlines.map((airline) => (
                <AirlineCardComponent
                  key={airline.id}
                  airline={airline}
                  isUserAirline={false}
                  onJoin={handleJoin}
                  onEdit={handleEdit}
                  onExit={() => setShowExitConfirm(true)}
                  onViewPilots={handleViewPilots}
                  onManageFbo={undefined}
                  onPayDebt={undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Airline Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData(initialFormData);
        }}
        title="Create Your Airline"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setFormData(initialFormData);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Create (F$ {AIRLINE_PRICE.toLocaleString()})
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Airline Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter airline name"
              maxLength={20}
              minLength={2}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.name.length}/20 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe your airline"
              maxLength={250}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/250 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Country *
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter country"
              maxLength={35}
              minLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Minimum Pilot Score
            </label>
            <input
              type="number"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min={0}
              max={9999}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum score required for pilots to join</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requireCertificates"
              checked={formData.requireCertificates}
              onChange={(e) => setFormData({ ...formData, requireCertificates: e.target.checked })}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="requireCertificates" className="text-sm text-gray-300">
              Require certificates for pilots
            </label>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-400 font-medium">Cost: F$ {AIRLINE_PRICE.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">
                  This amount will be deducted from your bank balance.
                </p>
                <p className="text-xs text-gray-400">
                  Your balance: F$ {(myStats?.bankBalance ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Airline Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setFormData(initialFormData);
        }}
        title="Edit Your Airline"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowEditModal(false);
                setFormData(initialFormData);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Airline Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter airline name"
              maxLength={20}
              minLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe your airline"
              maxLength={250}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Country *
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter country"
              maxLength={35}
              minLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Minimum Pilot Score
            </label>
            <input
              type="number"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min={0}
              max={9999}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editRequireCertificates"
              checked={formData.requireCertificates}
              onChange={(e) => setFormData({ ...formData, requireCertificates: e.target.checked })}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="editRequireCertificates" className="text-sm text-gray-300">
              Require certificates for pilots
            </label>
          </div>

          <IconSelector
            selectedIcon={formData.selectedIcon}
            onSelect={(iconName) => setFormData({ ...formData, selectedIcon: iconName })}
          />
        </div>
      </Modal>

      {/* Pilots Hired Modal */}
      <Modal
        isOpen={showPilotsModal}
        onClose={() => setShowPilotsModal(false)}
        title={`Pilots Hired - ${selectedAirlineForPilots?.name ?? ''}`}
        size="lg"
      >
        {pilots.length === 0 ? (
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No pilots hired yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {pilots.map((pilot) => (
              <li
                key={pilot.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-sm text-blue-400 font-medium">
                      {(pilot.userName ?? pilot.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white">
                    {pilot.userName ?? pilot.email}
                    {selectedAirlineForPilots?.owner?.id === pilot.id && (
                      <span className="ml-2 text-xs text-yellow-400">(Owner)</span>
                    )}
                  </span>
                </div>
                {pilot.pilotScore != null && (
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">{pilot.pilotScore}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Pay Debt Modal */}
      <Modal
        isOpen={showPayDebtModal}
        onClose={() => {
          setShowPayDebtModal(false);
        }}
        title="Pay Airline Debt"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowPayDebtModal(false);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handlePayDebt}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <BanknotesIcon className="h-4 w-4" />
                  Pay Debt
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Invoice Info */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Invoice Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Total Debt:</span>
                <p className="text-red-400 font-medium">
                  F$ {userAirline?.bankDebt?.toLocaleString() ?? '0'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Maturity Date:</span>
                <p className="text-white font-medium">
                  {userAirline?.debtMaturityDate
                    ? new Date(userAirline.debtMaturityDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Your Balance:</span>
                <p className="text-green-400 font-medium">
                  F$ {(myStats?.bankBalance ?? 0).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Balance After Payment:</span>
                <p className="text-white font-medium">
                  F$ {((myStats?.bankBalance ?? 0) - (userAirline?.bankDebt ?? 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Payment Amount
            </label>
            <input
              type="text"
              value={`F$ ${(userAirline?.bankDebt ?? 0).toLocaleString()}`}
              readOnly
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-600 text-white cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Full debt amount will be deducted from airline balance
            </p>
          </div>
        </div>
      </Modal>

      {/* FBO Management Modal */}
      <Modal
        isOpen={showFboModal}
        onClose={() => setShowFboModal(false)}
        title="FBO Management"
        size="2xl"
      >
        <div className="space-y-4">
          {/* Search Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={fboSearchTerm}
                onChange={(e) => setFboSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFboSearch()}
                placeholder="Search by airport ICAO..."
                className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={handleFboSearch}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
            >
              Search
            </button>
          </div>

          {/* FBOs Table */}
          <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-800">
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium w-1/4">Airport Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Elevation</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Runway Size</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Score Increase</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Fuel Price %</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Ground Crew %</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">FBO Price</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : availableFbos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      No FBOs found. Try a different search term.
                    </td>
                  </tr>
                ) : (
                  availableFbos.map((fbo: AvailableFbo) => (
                    <tr
                      key={fbo.icao}
                      className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-white">
                        <div className="font-medium">{fbo.name}</div>
                        <div className="text-xs text-gray-400">{fbo.icao}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{fbo.elevation.toLocaleString()} ft</td>
                      <td className="py-3 px-4 text-gray-300">{fbo.runwaySize.toLocaleString()} ft</td>
                      <td className="py-3 px-4 text-gray-300">+{fbo.scoreIncrease}</td>
                      <td className="py-3 px-4 text-green-400">{(fbo.fuelPriceDiscount * 100).toFixed(0)}%</td>
                      <td className="py-3 px-4 text-green-400">{(fbo.groundCrewDiscount * 100).toFixed(0)}%</td>
                      <td className="py-3 px-4 text-white font-medium">F$ {fbo.price.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {fbo.isHired ? (
                          <span className="text-green-400 text-sm">Hired</span>
                        ) : (
                          <button
                            onClick={() => handleOpenHireConfirm(fbo)}
                            disabled={fbo.availability <= 0}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                          >
                            Hire
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            * Airports are ordered by most frequent destinations from completed jobs
          </p>
        </div>
      </Modal>

      {/* Hire FBO Confirmation Modal */}
      <Modal
        isOpen={showHireConfirm}
        onClose={() => setShowHireConfirm(false)}
        title="Confirm FBO Hire"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowHireConfirm(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleHireFbo}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Hiring...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Confirm Hire
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            Only the owner is permitted to hire FBOs. Your airline has F$ {userAirline?.bankBalance?.toLocaleString() || '0'} in bank balance to hire FBOs. 
            <br />
            <b>Do you really want to hire this FBO?</b>
          </p>
          
          {selectedFbo && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Airport:</span>
                  <p className="text-white font-medium">{selectedFbo.name} ({selectedFbo.icao})</p>
                </div>
                <div>
                  <span className="text-gray-400">Price:</span>
                  <p className="text-white font-medium">F$ {selectedFbo.price.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Score Increase:</span>
                  <p className="text-white font-medium">+{selectedFbo.scoreIncrease}</p>
                </div>
                <div>
                  <span className="text-gray-400">Fuel Discount:</span>
                  <p className="text-white font-medium">{(selectedFbo.fuelPriceDiscount * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <span className="text-gray-400">Ground Crew Discount:</span>
                  <p className="text-white font-medium">{(selectedFbo.groundCrewDiscount * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <span className="text-gray-400">Availability:</span>
                  <p className="text-white font-medium">{selectedFbo.availability} slots</p>
                </div>
              </div>
            </div>
          )}

          {userAirline && userAirline.bankBalance < (selectedFbo?.price || 0) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">
                  Insufficient funds. You need F$ {((selectedFbo?.price || 0) - userAirline.bankBalance).toLocaleString()} more.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Exit Airline"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowExitConfirm(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => userAirline && handleExit(userAirline.id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Confirm Exit
            </button>
          </div>
        }
      >
        <p className="text-gray-400">
          Are you sure you want to exit <span className="text-white font-medium">{userAirline?.name}</span>?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This will remove all your airline certificates and you'll need to re-apply to join.
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
