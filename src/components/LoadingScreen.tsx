import React from 'react';
import { useAppStore } from '../stores/app-store';

export const LoadingScreen: React.FC = () => {
  const { loading } = useAppStore();

  if (!loading.isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 border border-green-500/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          
          <h3 className="text-lg font-semibold text-white mb-2">
            {loading.stage || 'Ladataan...'}
          </h3>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${loading.progress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-400">
            {loading.progress}% valmis
          </p>
          
          {loading.error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-200 text-sm">
              {loading.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};