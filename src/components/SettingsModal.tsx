import React, { useState, useEffect, useRef } from 'react';
import { X, Settings, Key, Bot, Sparkles, Download, Upload, Languages } from 'lucide-react';
import { APISettings, Conversation } from '../types';
import { storageUtils } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: APISettings;
  onSaveSettings: (settings: APISettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSaveSettings }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<APISettings>(settings);
  const [activeTab, setActiveTab] = useState<'api' | 'data' | 'language'>('api');
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleExportData = () => {
    const conversations = storageUtils.getConversations();
    const settings = storageUtils.getSettings();
    
    const data = {
      conversations,
      settings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ai-tutor-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportError('');
    setImportSuccess(false);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate the imported data structure
        if (!data.conversations || !data.settings) {
          throw new Error('Invalid file format');
        }
        
        // Save the imported data
        storageUtils.saveConversations(data.conversations);
        storageUtils.saveSettings(data.settings);
        
        setImportSuccess(true);
        setTimeout(() => {
          window.location.reload(); // Reload to apply changes
        }, 1500);
      } catch (error) {
        console.error('Error importing data:', error);
        setImportError('Failed to import data. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 dark:border-gray-700">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'api'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              API Settings
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'data'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Data Management
            </button>
            <button
              onClick={() => setActiveTab('language')}
              className={`px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'language'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Language
            </button>
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {/* API Settings Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Select AI Model
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="radio"
                      name="model"
                      value="google"
                      checked={localSettings.selectedModel === 'google'}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <Sparkles className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">Google Gemini</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Gemma-3-27b-it</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="radio"
                      name="model"
                      value="zhipu"
                      checked={localSettings.selectedModel === 'zhipu'}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <Bot className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">ZhipuAI</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">GLM-4.5-Flash</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Google AI API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={localSettings.googleApiKey}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, googleApiKey: e.target.value }))}
                    placeholder="Enter your Google AI API key"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Get your API key from{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Google AI Studio
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  ZhipuAI API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={localSettings.zhipuApiKey}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, zhipuApiKey: e.target.value }))}
                    placeholder="Enter your ZhipuAI API key"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Get your API key from{' '}
                  <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    ZhipuAI Platform
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Export Data</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Export all your conversations and settings to a backup file.
                </p>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Import Data</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  Import conversations and settings from a backup file.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportData}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors mb-2"
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </button>
                
                {importError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">{importError}</p>
                )}
                
                {importSuccess && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                    Data imported successfully! Page will reload shortly.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Select Language
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="radio"
                      name="language"
                      value="en"
                      checked={localSettings.language === 'en'}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, language: e.target.value as 'en' | 'mr' }))}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <Languages className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">English</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">English</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="radio"
                      name="language"
                      value="mr"
                      checked={localSettings.language === 'mr'}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, language: e.target.value as 'en' | 'mr' }))}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <Languages className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">Marathi</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">मराठी</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save and Cancel Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-300 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed font-semibold"
            disabled={!localSettings.googleApiKey && !localSettings.zhipuApiKey}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
