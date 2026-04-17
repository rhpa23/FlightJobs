import React from 'react';
import {
  BuildingOfficeIcon,
  UsersIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { Tooltip } from './Tooltip';
import { renderIcon, ICON_OPTIONS } from './IconMapper';
import { Airline } from '../../store/slices/airlinesSlice';

interface AirlineCardProps {
  airline: Airline;
  isUserAirline?: boolean;
  onJoin?: (id: number) => void;
  onEdit?: (id: number) => void;
  onExit?: (id: number) => void;
  onViewPilots?: (id: number) => void;
  onManageFbo?: (id: number) => void;
  onPayDebt?: (id: number) => void;
}

// Country flags mapping (simplified)
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

// Função para obter um ícone aleatório
const getRandomIcon = (): string => {
  const randomIndex = Math.floor(Math.random() * ICON_OPTIONS.length);
  return ICON_OPTIONS[randomIndex].name;
};

export const AirlineCardComponent: React.FC<AirlineCardProps> = ({
  airline,
  isUserAirline = false,
  onJoin,
  onEdit,
  onExit,
  onViewPilots,
  onManageFbo,
  onPayDebt,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const flag = getCountryFlag(airline.country);

  return (
    <div
      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border transition-all hover:shadow-lg ${
        isUserAirline
          ? 'border-blue-500/50 shadow-blue-500/20'
          : 'border-gray-700/50 hover:border-gray-600'
      }`}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 bg-gray-700/50 rounded-lg flex items-center justify-center overflow-hidden">
            {airline.logo ? (
              // Check if logo is an SVG icon name (starts with uppercase and ends with Icon)
              /^[A-Z][a-zA-Z]*Icon$/.test(airline.logo) ? (
                renderIcon(airline.logo, 'h-7 w-7 text-gray-400')
              ) : imageError ? (
                renderIcon(getRandomIcon(), 'h-7 w-7 text-gray-400')
              ) : (
                <img
                  src={airline.logo}
                  alt={airline.name}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              )
            ) : (
              <BuildingOfficeIcon className="h-7 w-7 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white truncate">
                {airline.name}
              </h3>
              <span className="text-xl" title={airline.country}>
                {flag}
              </span>
            </div>
            <Tooltip content={airline.description || ''}>
              <p className="text-sm text-gray-400 truncate">
                {airline.description && airline.description.length > 50
                  ? `${airline.description.slice(0, 50)}...`
                  : airline.description || ''}
              </p>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 space-y-3">
        {/* Owner */}
        {airline.owner && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Owner</span>
            <span className="text-sm text-white font-medium">
              {airline.owner.userName}
            </span>
          </div>
        )}

        {/* Bank Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BanknotesIcon className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">Balance</span>
          </div>
          <span className="text-sm text-green-400 font-medium">
            F$ {airline.bankBalance?.toLocaleString() ?? '0'}
          </span>
        </div>

        {/* Bank Debt */}
        {airline.bankDebt != null && airline.bankDebt > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
              <span className="text-sm text-gray-400">Debt</span>
            </div>
            <span className="text-sm text-red-400 font-medium">
              F$ {airline.bankDebt.toLocaleString()}
            </span>
          </div>
        )}

        {/* Pilots Hired */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <UsersIcon className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">Pilots</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white font-medium">
              {airline.pilots?.length ?? 0}
            </span>
            {onViewPilots && (
              <button
                onClick={() => onViewPilots(airline.id)}
                className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all"
                title="View pilots"
              >
                <UsersIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* FBOs */}
        {airline.fboCount != null && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BuildingOfficeIcon className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">FBOs</span>
            </div>
            <span className="text-sm text-white font-medium">
              {airline.fboCount}
            </span>
          </div>
        )}

        {/* Minimum Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Min Score</span>
          </div>
          <span className="text-sm text-white font-medium">
            {airline.score}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 border-t border-gray-700/50">
        <div className="flex gap-2">
          {isUserAirline && airline.alowEdit && (
            <>
              <button
                onClick={() => onEdit?.(airline.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all text-sm font-medium"
                title="Edit airline"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              {onManageFbo && (
                <button
                  onClick={() => onManageFbo(airline.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all text-sm font-medium"
                  title="Manage FBOs"
                >
                  <BuildingOfficeIcon className="h-4 w-4" />
                  FBOs
                </button>
              )}
              {airline.bankDebt != null && airline.bankDebt > 0 && onPayDebt && (
                <button
                  onClick={() => onPayDebt(airline.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-all text-sm font-medium"
                  title="Pay debt"
                >
                  <BanknotesIcon className="h-4 w-4" />
                  Pay Debt
                </button>
              )}
            </>
          )}

          {isUserAirline && airline.alowExit && onExit && (
            <button
              onClick={() => onExit(airline.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all text-sm font-medium"
              title="Exit airline"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Exit
            </button>
          )}

          {!isUserAirline && onJoin && (
            <button
              onClick={() => onJoin(airline.id)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all text-sm font-medium"
              title="Join airline"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-6h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
