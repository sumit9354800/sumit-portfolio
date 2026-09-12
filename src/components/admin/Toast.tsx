import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between p-3.5 border shadow-2xl font-mono text-xs max-w-md w-80 sm:w-96 transition-all ${
        toast.type === 'success'
          ? 'bg-[#0E1710] border-[#1E3B24] text-[#9DE8AF]'
          : toast.type === 'error'
          ? 'bg-[#1C0E0E] border-[#3B1E1E] text-[#E89D9D]'
          : 'bg-[#111111] border-[#2A2A2A] text-white'
      }`}
    >
      <div className="flex items-center space-x-2.5">
        {toast.type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 shrink-0" />
        )}
        <span className="leading-snug">{toast.text}</span>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="ml-3 p-1 text-[#888888] hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
