import React, { useState, useEffect, useRef } from 'react';
import { X, Settings, Key, Bot, Sparkles, Download, Upload, Languages } from 'lucide-react';
import { APISettings } from '../types';
import { storageUtils } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: APISettings;
  onSaveSettings: (settings: APISettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSaveSettings }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<APISettings>(settings);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleExportData = () => {
    try {
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
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-tutor-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate the imported data structure
        if (data.conversations && data.settings) {
          storageUtils.saveConversations(data.conversations);
          storageUtils.saveSettings(data.settings);
          
          // Update local settings to reflect changes
          setLocalSettings(data.settings);
          onSaveSettings(data.settings);
          
          setImportStatus('success');
          // Reload the page to reflect the imported data
          setTimeout(() => window.location.reload(), 1000);
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        setImportStatus('error');
      }
      
      setTimeout(() => setImportStatus('idle'), 3000);
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
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              <Languages className="w-4 h-4 inline mr-2" />
              Language
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={localSettings.language === 'en'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, language: e.target.value as 'en' | 'mr' }))}
                  className="text-blue-600 dark:text-blue-400"
                />
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">English</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="language"
                  value="mr"
                  checked={localSettings.language === 'mr'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, language: e.target.value as 'en' | 'mr' }))}
                  className="text-blue-600 dark:text-blue-400"
                />
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">Marathi</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">मराठी</div>
                </div>
              </label>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Data Management
            </label>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-white"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportData}
                accept=".json"
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-800 dark:text-gray-200 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Import Data
              </label>
              
              {importStatus === 'success' && (
                <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                  Data imported successfully! Page will reload.
                </div>
              )}
              
              {importStatus === 'error' && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                  Error importing data. Please check the file format.
                </div>
              )}
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              AI Model
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
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
                  <div className="font-medium text-gray-800 dark:text-gray-200">Google Gemini</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Gemma-3-27b-it</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
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
                  <div className="font-medium text-gray-800 dark:text-gray-200">ZhipuAI</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">GLM-4.5-Flash</div>
                </div>
              </label>
            </div>
          </div>

          {/* API Key Inputs */}
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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

        {/* Save and Cancel Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-300 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed font-medium"
            disabled={!localSettings.googleApiKey && !localSettings.zhipuApiKey}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
