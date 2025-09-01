import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Bot, 
  Sparkles, 
  Trash2, 
  Download,
  Upload,
  Shield,
  Palette,
  Volume2,
  Globe,
  Zap,
  Database,
  AlertTriangle,
  CheckCircle,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { APISettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: APISettings;
  onSaveSettings: (settings: APISettings) => void;
}

type SettingsTab = 'api' | 'appearance' | 'data' | 'advanced';

export function SettingsModal({ isOpen, onClose, settings, onSaveSettings }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<APISettings>(settings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('api');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState('en');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [dataCleared, setDataCleared] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleClearAllData = () => {
    if (showClearConfirm) {
      // Clear all localStorage data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ai-tutor-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      setDataCleared(true);
      setShowClearConfirm(false);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setDataCleared(false);
        window.location.reload(); // Reload to reflect changes
      }, 2000);
    } else {
      setShowClearConfirm(true);
    }
  };

  const exportData = () => {
    const data = {
      conversations: localStorage.getItem('ai-tutor-conversations') || '[]',
      settings: localStorage.getItem('ai-tutor-settings') || '{}',
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tutor-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.conversations) {
          localStorage.setItem('ai-tutor-conversations', data.conversations);
        }
        if (data.settings) {
          localStorage.setItem('ai-tutor-settings', data.settings);
        }
        alert('Data imported successfully! Please refresh the page.');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'api', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'data', label: 'Data', icon: <Database className="w-4 h-4" /> },
    { id: 'advanced', label: 'Advanced', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Customize your AI Tutor experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    AI Model Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="relative">
                      <input
                        type="radio"
                        name="model"
                        value="google"
                        checked={localSettings.selectedModel === 'google'}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        localSettings.selectedModel === 'google'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <Sparkles className="w-6 h-6 text-blue-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Google Gemini</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Gemma-3-27b-it</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Advanced reasoning and creative tasks</p>
                      </div>
                    </label>

                    <label className="relative">
                      <input
                        type="radio"
                        name="model"
                        value="zhipu"
                        checked={localSettings.selectedModel === 'zhipu'}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        localSettings.selectedModel === 'zhipu'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <Bot className="w-6 h-6 text-purple-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">ZhipuAI</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">GLM-4.5-Flash</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fast responses and coding assistance</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* API Key Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Google AI API Key
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={localSettings.googleApiKey}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, googleApiKey: e.target.value }))}
                        placeholder="Enter your Google AI API key"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Get your API key from{' '}
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Google AI Studio
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ZhipuAI API Key
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={localSettings.zhipuApiKey}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, zhipuApiKey: e.target.value }))}
                        placeholder="Enter your ZhipuAI API key"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Get your API key from{' '}
                      <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                        ZhipuAI Platform
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                    Theme & Display
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                      { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
                      { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> }
                    ].map((themeOption) => (
                      <button
                        key={themeOption.value}
                        onClick={() => setTheme(themeOption.value as any)}
                        className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                          theme === themeOption.value
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {themeOption.icon}
                          <span className="text-sm font-medium">{themeOption.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Language</h4>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="zh">中文</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Sound Effects</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Play sounds for interactions</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-600" />
                    Data Management
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={exportData}
                    className="flex items-center gap-3 p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <Download className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <h4 className="font-semibold text-green-800 dark:text-green-400">Export Data</h4>
                      <p className="text-sm text-green-600 dark:text-green-500">Download all conversations</p>
                    </div>
                  </button>

                  <label className="flex items-center gap-3 p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-400">Import Data</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-500">Restore from backup</p>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Auto-save Conversations</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save chat history</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Clear Data Section */}
                <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800 dark:text-red-400">Danger Zone</h4>
                      <p className="text-sm text-red-600 dark:text-red-500">
                        This action will permanently delete all conversations, settings, and data.
                      </p>
                    </div>
                  </div>

                  {dataCleared ? (
                    <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 dark:text-green-400 font-medium">All data cleared successfully!</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {showClearConfirm && (
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                          <p className="text-yellow-800 dark:text-yellow-400 text-sm font-medium mb-2">
                            Are you absolutely sure? This cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleClearAllData}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                              Yes, delete everything
                            </button>
                            <button
                              onClick={() => setShowClearConfirm(false)}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleClearAllData}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Data
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    Advanced Settings
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Performance Mode</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Optimize for faster responses at the cost of some features
                    </p>
                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
                      <option>Balanced</option>
                      <option>Performance</option>
                      <option>Quality</option>
                    </select>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Response Length</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Control the typical length of AI responses
                    </p>
                    <div className="flex gap-2">
                      {['Concise', 'Balanced', 'Detailed'].map((length) => (
                        <button
                          key={length}
                          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          {length}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Debug Mode</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Show detailed information about AI responses
                    </p>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            AI Tutor v1.0.0
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium shadow-lg"
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
