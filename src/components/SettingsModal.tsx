import React, { useState, useEffect } from 'react';
import { X, Settings, Key, Bot, Sparkles, Check } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-5 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure your AI preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* AI Model Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Model</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred AI assistant</p>
            </div>
            
            <div className="grid gap-3">
              <label className="relative group cursor-pointer">
                <input
                  type="radio"
                  name="model"
                  value="google"
                  checked={localSettings.selectedModel === 'google'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                  className="sr-only"
                />
                <div className={`flex items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200 ${
                  localSettings.selectedModel === 'google'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    localSettings.selectedModel === 'google'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Google Gemini</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gemma-3-27b-it</p>
                  </div>
                  {localSettings.selectedModel === 'google' && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </label>

              <label className="relative group cursor-pointer">
                <input
                  type="radio"
                  name="model"
                  value="zhipu"
                  checked={localSettings.selectedModel === 'zhipu'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                  className="sr-only"
                />
                <div className={`flex items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200 ${
                  localSettings.selectedModel === 'zhipu'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    localSettings.selectedModel === 'zhipu'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">ZhipuAI</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">GLM-4.5-Flash</p>
                  </div>
                  {localSettings.selectedModel === 'zhipu' && (
                    <Check className="w-5 h-5 text-purple-500" />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">API Configuration</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Secure your API keys to enable AI features</p>
            </div>

            {/* Google API Key */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <label className="font-medium text-gray-900 dark:text-white">Google AI API Key</label>
              </div>
              
              <div className="relative">
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showGoogleKey ? "text" : "password"}
                  value={localSettings.googleApiKey}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, googleApiKey: e.target.value }))}
                  placeholder="Enter your Google AI API key"
                  className="w-full pl-12 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowGoogleKey(!showGoogleKey)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showGoogleKey ? 'Hide' : 'Show'}
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Get your API key from</span>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Google AI Studio
                </a>
              </div>
            </div>

            {/* ZhipuAI API Key */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <label className="font-medium text-gray-900 dark:text-white">ZhipuAI API Key</label>
              </div>
              
              <div className="relative">
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showZhipuKey ? "text" : "password"}
                  value={localSettings.zhipuApiKey}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, zhipuApiKey: e.target.value }))}
                  placeholder="Enter your ZhipuAI API key"
                  className="w-full pl-12 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowZhipuKey(!showZhipuKey)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showZhipuKey ? 'Hide' : 'Show'}
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Get your API key from</span>
                <a 
                  href="https://open.bigmodel.cn/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  ZhipuAI Platform
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium shadow-lg"
              disabled={!localSettings.googleApiKey && !localSettings.zhipuApiKey}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
