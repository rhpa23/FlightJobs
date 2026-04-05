import React from 'react';

export const Challenges: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Challenges</h1>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-white mb-4">Available Challenges</h2>
        <p className="text-gray-400">No challenges available at the moment.</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-white mb-4">My Challenges</h2>
        <p className="text-gray-400">You have no active challenges.</p>
      </div>
    </div>
  );
};
