import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { SocialLinks } from '../SocialLinks';
import { PayPalDonation } from '../PayPalDonation';
import { AVATARS } from '../../constants/avatars';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarOpen }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myStats } = useAppSelector((state) => state.statistics);

  const selectedAvatar = myStats?.logo ? parseInt(myStats.logo) : 1;
  const avatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="text-gray-400 hover:text-white focus:outline-none transition-colors"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
          <Link to="/" className="ml-4 flex items-center space-x-3 group">
            <img
              src="/logo1478.png"
              alt="FlightJobs Logo"
              className="h-10 w-36 object-contain group-hover:scale-105 transition-transform"
            />
            {/* <span className="text-xl font-bold text-white tracking-tight">
              Flight<span className="text-blue-400">Jobs</span>
            </span> */}
          </Link>
        </div>

        {/* Social Links - Desktop */}
        <div className="hidden md:flex items-center">
          <SocialLinks />
        </div>

        <div className="flex items-center space-x-4">
          {/* PayPal Donation */}
          <div className="hidden sm:block">
            <PayPalDonation />
          </div>

          {user && (
            <>
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  {user.userName || user.email || 'Pilot'}
                </span>
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-lg`}
                  >
                    {avatar.icon}
                  </div>
                </button>
                <div className="absolute right-0 top-6 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm text-gray-400">Logged in as</p>
                    <p className="text-sm font-medium text-white truncate">
                      {user.userName || user.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <UserCircleIcon className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <div className="border-t border-gray-700 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
