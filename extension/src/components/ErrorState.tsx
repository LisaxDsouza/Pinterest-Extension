import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-3 my-4">
      <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 text-red-600 rounded-full">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-red-900 text-sm">Couldn't find matching products</h3>
        <p className="text-xs text-red-600 mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
