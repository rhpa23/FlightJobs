import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ToastMsg {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toast: ToastMsg;
  onDismiss: (id: number) => void;
  duration?: number;
}

const cls: Record<ToastMsg['type'], string> = {
  success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  error: 'bg-red-500/20 border-red-500/40 text-red-300',
  warning: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
  info: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
};

const emoji: Record<ToastMsg['type'], string> = {
  success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss, duration = 4500 }) => {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss, duration]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-2xl text-sm font-medium ${cls[toast.type]}`}
      style={{ animation: 'slideUp 0.25s ease-out' }}
    >
      <span>{emoji[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMsg[];
  onDismiss: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default Toast;
