"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (title: string, message: string, type?: Toast['type'], duration?: number) => void;
  info: (title: string, message: string, duration?: number) => void;
  success: (title: string, message: string, duration?: number) => void;
  warning: (title: string, message: string, duration?: number) => void;
  error: (title: string, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  const isMounted = useRef(true);
  const hasChecked = useRef(false);

  // ✅ Fix: Use setTimeout to break synchronous setState
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    // Use requestAnimationFrame or setTimeout to defer setState
    const timer = setTimeout(() => {
      if (isMounted.current) {
        setMounted(true);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      isMounted.current = false;
    };
  }, []);

  // ✅ Fix: RemoveToast defined before use
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message: string, type: Toast['type'] = 'info', duration: number = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, title, message, type, duration };
      
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const info = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast(title, message, 'info', duration);
    },
    [showToast]
  );

  const success = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast(title, message, 'success', duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast(title, message, 'warning', duration);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast(title, message, 'error', duration);
    },
    [showToast]
  );

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, info, success, warning, error, removeToast }}>
      {children}
      
      {mounted && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl border shadow-lg transition-all duration-300 animate-in slide-in-from-right ${getToastStyles(toast.type)}`}
              role="alert"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold">{toast.title}</h4>
                  <p className="text-xs mt-0.5 opacity-90">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-xs opacity-60 hover:opacity-100 transition"
                  aria-label="Close notification"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;