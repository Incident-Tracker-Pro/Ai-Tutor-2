import React, { useState, useEffect } from 'react';
import { X, Settings, Key, Bot, Sparkles, Eye, EyeOff } from 'lucide-react';
import { APISettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: APISettings;
  onSaveSettings: (settings: APISettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSaveSettings }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<APISettings>(settings);
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [showZhipuKey, setShowZhipuKey] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Model Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Model</h3>
            <div className="grid grid-cols-1 gap-3">
              <label className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                localSettings.selectedModel === 'google'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700'
              }`}>
                <input
                  type="radio"
                  name="model"
                  value="google"
                  checked={localSettings.selectedModel === 'google'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                  className="sr-only"
                />
                <div className={`p-3 rounded-xl ${
                  localSettings.selectedModel === 'google' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Google Gemini</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gemma-3-27b-it</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Advanced reasoning and analysis</p>
                </div>
                {localSettings.selectedModel === 'google' && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </label>
              
              <label className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                localSettings.selectedModel === 'zhipu'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-700'
              }`}>
                <input
                  type="radio"
                  name="model"
                  value="zhipu"
                  checked={localSettings.selectedModel === 'zhipu'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                  className="sr-only"
                />
                <div className={`p-3 rounded-xl ${
                  localSettings.selectedModel === 'zhipu' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">ZhipuAI</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">GLM-4.5-Flash</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Fast and efficient responses</p>
                </div>
                {localSettings.selectedModel === 'zhipu' && (
                  <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* API Keys Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Keys</h3>
            <div className="space-y-6">
              {/* Google API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Google AI API Key
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Key className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showGoogleKey ? "text" : "password"}
                    value={localSettings.googleApiKey}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, googleApiKey: e.target.value }))}
                    placeholder="Enter your Google AI API key"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleKey(!showGoogleKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showGoogleKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Get your API key from{' '}
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              {/* ZhipuAI API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ZhipuAI API Key
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Key className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showZhipuKey ? "text" : "password"}
                    value={localSettings.zhipuApiKey}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, zhipuApiKey: e.target.value }))}
                    placeholder="Enter your ZhipuAI API key"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowZhipuKey(!showZhipuKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showZhipuKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Get your API key from{' '}
                  <a 
                    href="https://open.bigmodel.cn/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    ZhipuAI Platform
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium shadow-sm"
            disabled={!localSettings.googleApiKey && !localSettings.zhipuApiKey}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
