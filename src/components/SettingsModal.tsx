import React, { useState, useEffect, useRef, useContext } from 'react';
import { X, Settings, Key, Bot, Sparkles, Download, Upload, Languages, Shield, Database, Palette } from 'lucide-react';
import { APISettings } from '../types';
import { storageUtils } from '../utils/storage';
import { LanguageContext } from '../contexts/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: APISettings;
  onSaveSettings: (settings: APISettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSaveSettings }: SettingsModalProps) {
  const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext);
  const [localSettings, setLocalSettings] = useState<APISettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'data'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleLanguageChange = (language: 'en' | 'mr') => {
    setSelectedLanguage(language);
    localStorage.setItem('ai-tutor-language', language);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleExportData = () => {
    const conversations = storageUtils.getConversations();
    const data = {
      conversations,
      settings: storageUtils.getSettings(),
      language: selectedLanguage,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tutor-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.conversations) {
          storageUtils.saveConversations(data.conversations);
        }
        if (data.settings) {
          setLocalSettings(data.settings);
          storageUtils.saveSettings(data.settings);
        }
        if (data.language) {
          setSelectedLanguage(data.language);
          localStorage.setItem('ai-tutor-language', data.language);
        }
        alert(selectedLanguage === 'en' ? 'Data imported successfully!' : 'डेटा यशस्वीपणे आयात केला!');
      } catch (error) {
        console.error('Error importing data:', error);
        alert(selectedLanguage === 'en' ? 'Failed to import data. Please ensure the file is valid.' : 'डेटा आयात करण्यात अयशस्वी. कृपया फाइल वैध आहे याची खात्री करा.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general' as const, icon: Palette, label: selectedLanguage === 'en' ? 'General' : 'सामान्य' },
    { id: 'api' as const, icon: Shield, label: selectedLanguage === 'en' ? 'API Keys' : 'API की' },
    { id: 'data' as const, icon: Database, label: selectedLanguage === 'en' ? 'Data' : 'डेटा' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {selectedLanguage === 'en' ? 'Settings' : 'सेटिंग्ज'}
                </h2>
                <p className="text-white/80 text-sm">
                  {selectedLanguage === 'en' ? 'Customize your AI Tutor experience' : 'आपला एआय शिक्षक अनुभव सानुकूलित करा'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-900/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className={selectedLanguage === 'mr' ? 'font-semibold' : ''}>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-600 dark:bg-gray-400" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'general' && (
            <div className="space-y-8">
              {/* AI Model Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedLanguage === 'en' ? 'AI Model' : 'एआय मॉडेल'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`group cursor-pointer transition-all duration-200 hover:shadow-md`}>
                    <div className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${
                      localSettings.selectedModel === 'google' 
                        ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                    }`}>
                      <input
                        type="radio"
                        name="model"
                        value="google"
                        checked={localSettings.selectedModel === 'google'}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                        className="w-4 h-4 text-gray-600 focus:ring-gray-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">Google Gemini</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Gemma-3-27b-it</div>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className={`group cursor-pointer transition-all duration-200 hover:shadow-md`}>
                    <div className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${
                      localSettings.selectedModel === 'zhipu' 
                        ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                    }`}>
                      <input
                        type="radio"
                        name="model"
                        value="zhipu"
                        checked={localSettings.selectedModel === 'zhipu'}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                        className="w-4 h-4 text-gray-600 focus:ring-gray-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">ZhipuAI</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">GLM-4.5-Flash</div>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedLanguage === 'en' ? 'Language' : 'भाषा'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`group cursor-pointer transition-all duration-200 hover:shadow-md`}>
                    <div className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${
                      selectedLanguage === 'en' 
                        ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                    }`}>
                      <input
                        type="radio"
                        name="language"
                        value="en"
                        checked={selectedLanguage === 'en'}
                        onChange={() => handleLanguageChange('en')}
                        className="w-4 h-4 text-gray-600 focus:ring-gray-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          EN
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">English</span>
                      </div>
                    </div>
                  </label>

                  <label className={`group cursor-pointer transition-all duration-200 hover:shadow-md`}>
                    <div className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${
                      selectedLanguage === 'mr' 
                        ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                    }`}>
                      <input
                        type="radio"
                        name="language"
                        value="mr"
                        checked={selectedLanguage === 'mr'}
                        onChange={() => handleLanguageChange('mr')}
                        className="w-4 h-4 text-gray-600 focus:ring-gray-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          मर
                        </div>
                        <span className={`font-medium text-gray-900 dark:text-gray-100 ${selectedLanguage === 'mr' ? 'font-semibold' : ''}`}>
                          मराठी
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-8">
              {/* Google API Key */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedLanguage === 'en' ? 'Google AI API Key' : 'गूगल एआय एपीआय की'}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key className="w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={localSettings.googleApiKey}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, googleApiKey: e.target.value }))}
                      placeholder={selectedLanguage === 'en' ? 'Enter your Google AI API key' : 'आपली गूगल एआय एपीआय की टाका'}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    />
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {selectedLanguage === 'en' ? (
                        <>
                          Get your API key from{' '}
                          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline">
                            Google AI Studio
                          </a>
                        </>
                      ) : (
                        <>
                          आपली एपीआय की येथून मिळवा{' '}
                          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline">
                            गूगल एआय स्टुडिओ
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* ZhipuAI API Key */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedLanguage === 'en' ? 'ZhipuAI API Key' : 'झिपूएआय एपीआय की'}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key className="w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={localSettings.zhipuApiKey}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, zhipuApiKey: e.target.value }))}
                      placeholder={selectedLanguage === 'en' ? 'Enter your ZhipuAI API key' : 'आपली झिपूएआय एपीआय की टाका'}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    />
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      {selectedLanguage === 'en' ? (
                        <>
                          Get your API key from{' '}
                          <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline">
                            ZhipuAI Platform
                          </a>
                        </>
                      ) : (
                        <>
                          आपली एपीआय की येथून मिळवा{' '}
                          <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline">
                            झिपूएआय प्लॅटफॉर्म
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedLanguage === 'en' ? 'Data Management' : 'डेटा व्यवस्थापन'}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleExportData}
                    className="group flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedLanguage === 'en' ? 'Export Data' : 'डेटा निर्यात करा'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedLanguage === 'en' ? 'Download your conversations' : 'आपले संभाषण डाउनलोड करा'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={triggerFileInput}
                    className="group flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedLanguage === 'en' ? 'Import Data' : 'डेटा आयात करा'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedLanguage === 'en' ? 'Upload your backup file' : 'आपली बॅकअप फाइल अपलोड करा'}
                      </div>
                    </div>
                  </button>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>{selectedLanguage === 'en' ? 'Note:' : 'टीप:'}</strong>{' '}
                    {selectedLanguage === 'en'
                      ? 'Your data is stored locally in your browser. Regular backups are recommended.'
                      : 'आपला डेटा आपल्या ब्राउझरमध्ये स्थानिक पातळीवर संग्रहीत आहे. नियमित बॅकअप घेण्याची शिफारस केली जाते.'}
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportData}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
          >
            {selectedLanguage === 'en' ? 'Cancel' : 'रद्द करा'}
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white rounded-xl transition-all duration-200 font-semibold ${
              !localSettings.googleApiKey && !localSettings.zhipuApiKey
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg hover:scale-105'
            }`}
            disabled={!localSettings.googleApiKey && !localSettings.zhipuApiKey}
          >
            {selectedLanguage === 'en' ? 'Save Settings' : 'सेटिंग्ज जतन करा'}
          </button>
        </div>
      </div>
    </div>
  );
}
