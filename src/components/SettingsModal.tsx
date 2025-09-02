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
  isSidebarFolded: boolean;
}

export function SettingsModal({ isOpen, onClose, settings, onSaveSettings, isSidebarFolded }: SettingsModalProps) {
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

  const sidebarWidth = isSidebarFolded ? '4rem' : '16rem';

  const tabs = [
    { id: 'general' as const, icon: Palette, label: selectedLanguage === 'en' ? 'General' : 'सामान्य' },
    { id: 'api' as const, icon: Shield, label: selectedLanguage === 'en' ? 'API Keys' : 'API की' },
    { id: 'data' as const, icon: Database, label: selectedLanguage === 'en' ? 'Data' : 'डेटा' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      {/* Settings Panel */}
      <div
        className={`fixed top-0 bottom-0 z-40 w-full max-w-md bg-[var(--color-sidebar)] border-r border-[var(--color-border)] shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ left: sidebarWidth }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <h2 className="text-xl font-bold">
                  {selectedLanguage === 'en' ? 'Settings' : 'सेटिंग्ज'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-card)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'text-[var(--color-text-primary)] bg-[var(--color-sidebar)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-sidebar)]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className={selectedLanguage === 'mr' ? 'font-semibold' : ''}>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-text-primary)]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'general' && (
              <div className="space-y-8">
                {/* AI Model Selection in Settings - this is a copy of what's in sidebar for consistency */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      {selectedLanguage === 'en' ? 'AI Model' : 'एआय मॉडेल'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'google', name: 'Google Gemini', sub: 'Gemma-3-27b-it', icon: Sparkles, color: 'from-blue-500 to-purple-600' },
                      { id: 'zhipu', name: 'ZhipuAI', sub: 'GLM-4.5-Flash', icon: Bot, color: 'from-purple-500 to-pink-600' },
                      { id: 'mistral-small', name: 'Mistral Small', sub: 'mistral-small-latest', icon: Bot, color: 'from-green-500 to-emerald-600' },
                      { id: 'mistral-codestral', name: 'Codestral', sub: 'codestral-latest', icon: Bot, color: 'from-orange-500 to-amber-600' },
                    ].map(model => (
                      <label key={model.id} className="group cursor-pointer">
                        <div className={`p-4 border rounded-xl transition-colors h-full ${localSettings.selectedModel === model.id ? 'border-gray-500 bg-[var(--color-card)]' : 'border-[var(--color-border)] bg-transparent hover:bg-[var(--color-card)]'}`}>
                          <div className="flex items-center gap-4">
                            <input
                              type="radio"
                              name="model"
                              value={model.id}
                              checked={localSettings.selectedModel === model.id}
                              onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as any }))}
                              className="w-4 h-4 text-gray-600 focus:ring-gray-500 border-gray-600 bg-gray-700"
                            />
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-10 h-10 bg-gradient-to-br ${model.color} rounded-lg flex items-center justify-center`}>
                                <model.icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-[var(--color-text-primary)]">{model.name}</div>
                                <div className="text-sm text-[var(--color-text-secondary)]">{model.sub}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Languages className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      {selectedLanguage === 'en' ? 'Language' : 'भाषा'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="group cursor-pointer">
                      <div className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${selectedLanguage === 'en' ? 'border-gray-500 bg-[var(--color-card)]' : 'border-[var(--color-border)] bg-transparent hover:bg-[var(--color-card)]'}`}>
                        <input
                          type="radio"
                          name="language"
                          value="en"
                          checked={selectedLanguage === 'en'}
                          onChange={() => handleLanguageChange('en')}
                          className="w-4 h-4 text-gray-600 focus:ring-gray-500 border-gray-600 bg-gray-700"
                        />
                         <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">EN</div>
                          <span className="font-medium text-[var(--color-text-primary)]">English</span>
                        </div>
                      </div>
                    </label>
                     <label className="group cursor-pointer">
                      <div className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${selectedLanguage === 'mr' ? 'border-gray-500 bg-[var(--color-card)]' : 'border-[var(--color-border)] bg-transparent hover:bg-[var(--color-card)]'}`}>
                        <input
                          type="radio"
                          name="language"
                          value="mr"
                          checked={selectedLanguage === 'mr'}
                          onChange={() => handleLanguageChange('mr')}
                          className="w-4 h-4 text-gray-600 focus:ring-gray-500 border-gray-600 bg-gray-700"
                        />
                         <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">मर</div>
                          <span className={`font-medium text-[var(--color-text-primary)] ${selectedLanguage === 'mr' ? 'font-semibold' : ''}`}>मराठी</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* API & Data Tabs remain visually the same, just inherit the new theme */}
            {activeTab === 'api' && (
              <div className="space-y-8">
              {/* Google API Key */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {selectedLanguage === 'en' ? 'Google AI API Key' : 'गूगल एआय एपीआय की'}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key className="w-5 h-5 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={localSettings.googleApiKey}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, googleApiKey: e.target.value }))}
                      placeholder={selectedLanguage === 'en' ? 'Enter your Google AI API key' : 'आपली गूगल एआय एपीआय की टाका'}
                      className="w-full pl-12 pr-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-[var(--color-card)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] transition-all duration-200"
                    />
                  </div>
                  <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-300">
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
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {selectedLanguage === 'en' ? 'ZhipuAI API Key' : 'झिपूएआय एपीआय की'}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key className="w-5 h-5 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={localSettings.zhipuApiKey}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, zhipuApiKey: e.target.value }))}
                      placeholder={selectedLanguage === 'en' ? 'Enter your ZhipuAI API key' : 'आपली झिपूएआय एपीआय की टाका'}
                      className="w-full pl-12 pr-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-[var(--color-card)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] transition-all duration-200"
                    />
                  </div>
                  <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-3">
                    <p className="text-sm text-purple-300">
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

              {/* Mistral API Key */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {selectedLanguage === 'en' ? 'Mistral API Key' : 'मिस्ट्रल एपीआय की'}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Key className="w-5 h-5 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={localSettings.mistralApiKey}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, mistralApiKey: e.target.value }))}
                      placeholder={selectedLanguage === 'en' ? 'Enter your Mistral API key' : 'आपली मिस्ट्रल एपीआय की टाका'}
                      className="w-full pl-12 pr-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-[var(--color-card)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] transition-all duration-200"
                    />
                  </div>
                  <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                    <p className="text-sm text-green-300">
                      {selectedLanguage === 'en' ? (
                        <>
                          Get your API key from{' '}
                          <a href="https://console.mistral.ai/api-keys" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline">
                            Mistral La Plateforme
                          </a>
                        </>
                      ) : (
                        <>
                          आपली एपीआय की येथून मिळवा{' '}
                          <a href="https://console.mistral.ai/api-keys" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline">
                            मिस्ट्रल ला प्लॅटफॉर्म
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
                  <Database className="w-5 h-5 text-[var(--color-text-secondary)]" />
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {selectedLanguage === 'en' ? 'Data Management' : 'डेटा व्यवस्थापन'}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleExportData}
                    className="group flex flex-col items-center gap-3 p-6 border-2 border-dashed border-[var(--color-border)] rounded-xl hover:border-gray-500 hover:bg-[var(--color-card)] transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-[var(--color-text-primary)]">
                        {selectedLanguage === 'en' ? 'Export Data' : 'डेटा निर्यात करा'}
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)]">
                        {selectedLanguage === 'en' ? 'Download your conversations' : 'आपले संभाषण डाउनलोड करा'}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={triggerFileInput}
                    className="group flex flex-col items-center gap-3 p-6 border-2 border-dashed border-[var(--color-border)] rounded-xl hover:border-gray-500 hover:bg-[var(--color-card)] transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-[var(--color-text-primary)]">
                        {selectedLanguage === 'en' ? 'Import Data' : 'डेटा आयात करा'}
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)]">
                        {selectedLanguage === 'en' ? 'Upload your backup file' : 'आपली बॅकअप फाइल अपलोड करा'}
                      </div>
                    </div>
                  </button>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-300">
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
          <div className="flex justify-end gap-3 p-6 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
            <button
              onClick={onClose}
              className="px-6 py-3 text-[var(--color-text-primary)] hover:bg-[var(--color-card)] rounded-xl transition-colors font-medium"
            >
              {selectedLanguage === 'en' ? 'Cancel' : 'रद्द करा'}
            </button>
            <button
              onClick={handleSave}
              className={`px-6 py-3 bg-[var(--color-accent-bg)] text-[var(--color-accent-text)] rounded-xl transition-all duration-200 font-semibold ${
                !localSettings.googleApiKey && !localSettings.zhipuApiKey && !localSettings.mistralApiKey
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg hover:bg-[var(--color-accent-bg-hover)]'
              }`}
            >
              {selectedLanguage === 'en' ? 'Save Settings' : 'सेटिंग्ज जतन करा'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
