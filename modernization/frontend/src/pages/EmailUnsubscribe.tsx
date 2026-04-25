import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BellSlashIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { authApi } from '../services/api';

export const EmailUnsubscribe: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing unsubscribe token.');
      setShowConfirm(false);
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;

    setStatus('loading');
    try {
      const response = await authApi.unsubscribeEmail(token);
      setStatus('success');
      setMessage(response.message || 'You have been successfully unsubscribed from all email notifications.');
      setShowConfirm(false);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to process your request. Please try again later.');
      setShowConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e293b]/60 backdrop-blur-lg rounded-2xl border border-[#22b8eb]/20 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img src="/logo192.png" alt="FlightJobs" className="h-14 w-14 opacity-40" />
          </div>
          <div className="mx-auto w-16 h-16 bg-[#22b8eb]/10 rounded-full flex items-center justify-center mb-6">
            {status === 'success' ? (
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
            ) : status === 'error' ? (
              <ExclamationCircleIcon className="w-8 h-8 text-red-400" />
            ) : (
              <BellSlashIcon className="w-8 h-8 text-[#22b8eb]" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            {status === 'success' 
              ? 'Unsubscribed!' 
              : status === 'error' 
                ? 'Oops!' 
                : 'Unsubscribe from Emails'}
          </h1>

          <p className="text-[#94a3b8] mb-6">
            {status === 'success' 
              ? message 
              : status === 'error' 
                ? message 
                : 'Click the button below to unsubscribe from all FlightJobs email notifications, including license expiration warnings and airline debt alerts.'}
          </p>

          {showConfirm && token && (
            <div className="space-y-4">
              <div className="bg-[#22b8eb]/5 border border-[#22b8eb]/20 rounded-lg p-4 text-left">
                <p className="text-sm text-[#94a3b8] mb-2">You will no longer receive:</p>
                <ul className="text-sm text-[#cbd5e1] space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#22b8eb] rounded-full"></span>
                    License expiration warnings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#22b8eb] rounded-full"></span>
                    Airline debt alerts
                  </li>
                </ul>
              </div>

              <button
                onClick={handleUnsubscribe}
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-[#22b8eb] to-[#0ea5e9] hover:from-[#1ca8d8] hover:to-[#0d94d8] text-[#0f172a] font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Processing...' : 'Confirm Unsubscribe'}
              </button>

              <p className="text-xs text-[#64748b]">
                You can re-enable notifications anytime in your Profile settings.
              </p>
            </div>
          )}

          {status === 'success' && (
            <a
              href="/"
              className="inline-block mt-4 text-[#22b8eb] hover:text-[#1ca8d8] transition-colors"
            >
              Return to FlightJobs →
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
