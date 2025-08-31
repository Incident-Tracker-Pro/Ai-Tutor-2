import React from 'react';
import { Download, X } from 'lucide-react';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center overflow-hidden">
          <img 
            src="/robot.png" 
            alt="AI Tutor" 
            className="w-6 h-6 object-contain"
            onError={(e) => {
              // Fallback to a simple icon if robot.png fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="w-5 h-5 bg-blue-600 dark:bg-blue-400 rounded hidden"></div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            Install AI Tutor
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            Add to your home screen for quick access and offline usage
          </p>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={onInstall}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
              Install
            </button>
            <button
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1.5 text-xs font-medium transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
