import React, { useState, useEffect } from 'react';
import { X, Settings, Key, Bot, Sparkles } from 'lucide-react';
import { APISettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: APISettings;
  onSaveSettings: (settings: APISettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSaveSettings }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<APISettings>(settings);

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-700">API Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select AI Model
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="model"
                  value="google"
                  checked={localSettings.selectedModel === 'google'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                  className="text-blue-600"
                />
                <Sparkles className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-700">Google Gemini</div>
                  <div className="text-sm text-gray-500">Gemma-3-27b-it</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="model"
                  value="zhipu"
                  checked={localSettings.selectedModel === 'zhipu'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                  className="text-purple-600"
                />
                <Bot className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-semibold text-gray-700">ZhipuAI</div>
                  <div className="text-sm text-gray-500">GLM-4.5-Flash</div>
                </div>
              </label>
            </div>
          </div>

          {/* Google API Key Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Google AI API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={localSettings.googleApiKey}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, googleApiKey: e.target.value }))}
                placeholder="Enter your Google AI API key"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
                Google AI Studio
              </a>
            </p>
          </div>

          {/* ZhipuAI API Key Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ZhipuAI API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={localSettings.zhipuApiKey}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, zhipuApiKey: e.target.value }))}
                placeholder="Enter your ZhipuAI API key"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from{' '}
              <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
                ZhipuAI Platform
              </a>
            </p>
          </div>
        </div>

        {/* Save and Cancel Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            disabled={!localSettings.googleApiKey && !localSettings.zhipuApiKey}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
