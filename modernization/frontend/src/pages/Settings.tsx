import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>

      {/* Account Settings */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-white mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              placeholder="pilot@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              placeholder="••••••••"
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-white mb-4">Notification Preferences</h2>
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="rounded bg-gray-700 border-gray-600 text-blue-600" defaultChecked />
            <span className="ml-2 text-sm text-gray-300">License expiration alerts</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded bg-gray-700 border-gray-600 text-blue-600" defaultChecked />
            <span className="ml-2 text-sm text-gray-300">New job notifications</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded bg-gray-700 border-gray-600 text-blue-600" />
            <span className="ml-2 text-sm text-gray-300">Marketing emails</span>
          </label>
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
    </div>
  );
};
