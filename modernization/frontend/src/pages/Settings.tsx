import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyStats, updateNotificationPreferences, updateWeightUnit } from '../store/slices/statisticsSlice';
import { ToastContainer, ToastMsg } from '../components/Toast';
import { usersApi } from '../services/api';

export const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myStats, isLoading } = useAppSelector((state) => state.statistics);
  const { user } = useAppSelector((state) => state.auth);

  const [licenseWarning, setLicenseWarning] = useState(false);
  const [airlineBillsWarning, setAirlineBillsWarning] = useState(false);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingWeightUnit, setIsSavingWeightUnit] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  // Account Settings state
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [userNameError, setUserNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  useEffect(() => {
    dispatch(fetchMyStats());
  }, [dispatch]);

  useEffect(() => {
    if (myStats) {
      setLicenseWarning(myStats.sendLicenseWarning ?? false);
      setAirlineBillsWarning(myStats.sendAirlineBillsWarning ?? false);
      setWeightUnit(myStats.weightUnit === 'lbs' ? 'lbs' : 'kg');
    }
  }, [myStats]);

  // Load userName from auth user
  useEffect(() => {
    if (user?.userName) {
      setUserName(user.userName);
    }
  }, [user]);

  const addToast = useCallback((message: string, type: ToastMsg['type'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      await dispatch(updateNotificationPreferences({
        sendLicenseWarning: licenseWarning,
        sendAirlineBillsWarning: airlineBillsWarning,
      })).unwrap();
      addToast('Notification preferences saved successfully!', 'success');
    } catch {
      addToast('Error saving notification preferences', 'error');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleSaveWeightUnit = async () => {
    setIsSavingWeightUnit(true);
    try {
      await dispatch(updateWeightUnit(weightUnit)).unwrap();
      addToast('Weight unit saved successfully!', 'success');
    } catch {
      addToast('Error saving weight unit', 'error');
    } finally {
      setIsSavingWeightUnit(false);
    }
  };

  // Validation functions
  const validateUserName = (value: string): boolean => {
    if (value.length < 3) {
      setUserNameError('UserName must be at least 3 characters');
      return false;
    }
    setUserNameError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) return true; // Password is optional
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    if (!hasUpperCase || !hasNumber) {
      setPasswordError('Password must contain at least one uppercase letter and one number');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSaveAccount = async () => {
    if (!user?.id) {
      addToast('User not found', 'error');
      return;
    }

    const isUserNameValid = validateUserName(userName);
    const isPasswordValid = validatePassword(password);

    if (!isUserNameValid || !isPasswordValid) {
      return;
    }

    setIsSavingAccount(true);
    try {
      const data: { userName?: string; password?: string } = {};
      if (userName !== user.userName) {
        data.userName = userName;
      }
      if (password) {
        data.password = password;
      }

      if (Object.keys(data).length === 0) {
        addToast('No changes to save', 'info');
        setIsSavingAccount(false);
        return;
      }

      await usersApi.updateUser(user.id, data);
      addToast('Account settings saved successfully!', 'success');
      setPassword(''); // Clear password after successful save
    } catch (err: any) {
      if (err?.response?.data?.message?.includes('duplicate') || err?.response?.status === 409) {
        addToast('This UserName is already taken', 'error');
      } else {
        addToast('Error saving account settings', 'error');
      }
    } finally {
      setIsSavingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>

      {/* Account Settings */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-white mb-4">Account Settings</h2>
        <div className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-600 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* UserName */}
          <div>
            <label className="block text-sm font-medium text-gray-300">UserName</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (userNameError) validateUserName(e.target.value);
              }}
              onBlur={() => validateUserName(userName)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md bg-gray-700 text-white ${
                userNameError ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Your username"
            />
            {userNameError && (
              <p className="text-xs text-red-400 mt-1">{userNameError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
              }}
              onBlur={() => validatePassword(password)}
              className={`mt-1 block w-full px-3 py-2 border rounded-md bg-gray-700 text-white ${
                passwordError ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Leave blank to keep current password"
            />
            {passwordError && (
              <p className="text-xs text-red-400 mt-1">{passwordError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Password must contain at least one uppercase letter and one number
            </p>
          </div>

          <button
            onClick={handleSaveAccount}
            disabled={isSavingAccount || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingAccount ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-white mb-4">Notification Preferences</h2>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded bg-gray-700 border-gray-600 text-blue-600"
              checked={licenseWarning}
              onChange={(e) => setLicenseWarning(e.target.checked)}
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-300">License expiration alerts</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded bg-gray-700 border-gray-600 text-blue-600"
              checked={airlineBillsWarning}
              onChange={(e) => setAirlineBillsWarning(e.target.checked)}
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-300">Airline bills alerts</span>
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSaveNotifications}
            disabled={isSavingNotifications || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingNotifications ? 'Saving...' : 'Save Notifications'}
          </button>
        </div>
      </div>

      {/* Weight Unit Preference */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-white mb-4">Weight Unit</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select your preferred weight unit
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="weightUnit"
                  value="kg"
                  checked={weightUnit === 'kg'}
                  onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
                  disabled={isLoading}
                  className="text-blue-600 bg-gray-700 border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-300">Kilograms (kg)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="weightUnit"
                  value="lbs"
                  checked={weightUnit === 'lbs'}
                  onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
                  disabled={isLoading}
                  className="text-blue-600 bg-gray-700 border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-300">Pounds (lbs)</span>
              </label>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSaveWeightUnit}
            disabled={isSavingWeightUnit || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingWeightUnit ? 'Saving...' : 'Save Weight Unit'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900 bg-opacity-30 p-6 rounded-lg border border-red-800">
        <h2 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Delete Account
        </button>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
