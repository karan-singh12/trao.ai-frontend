'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { ValidationError } from '../types/api.types';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  message: string;
  errors?: ValidationError[];
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'error',
  message,
  errors,
  onClose,
}) => {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div
      className={`relative w-full rounded-xl p-4 transition-all duration-200 border ${
        isError
          ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
          : isSuccess
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
          : 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
        )}
        <div className="flex-1 text-sm">
          <p className="font-semibold leading-snug">{message}</p>
          {errors && errors.length > 0 && (
            <ul className="mt-2 space-y-1 list-disc list-inside text-xs opacity-90">
              {errors.map((err, idx) => (
                <li key={idx}>
                  <span className="font-medium capitalize">{err.field}:</span> {err.message}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            type="button"
            className="text-current opacity-60 hover:opacity-100 transition-opacity p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
