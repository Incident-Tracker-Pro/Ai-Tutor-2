import React, { useState, useEffect, useRef, useContext } from 'react';
import { X, Settings, Key, Bot, Sparkles, Download, Upload, Languages } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSaveSettings(localSettings);
    localStorage.setItem('ai-tutor-language', selectedLanguage);
    onClose();
  };

  const handleExportData = () => {
    const conversations = storageUtils.getConversations();
    const data = {
      conversations,
      settings: storageUtils.getSettings(),
      language: selectedLanguage,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tutor-data-${new Date().toISOString()}.json`;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-[var(--color-card)] rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-content open">
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-[var(--color-text-secondary)]" />
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {selectedLanguage === 'en' ? 'Settings' : 'सेटिंग्ज'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)] rounded-lg transition-colors smooth-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              {selectedLanguage === 'en' ? 'Select AI Model' : 'एआय मॉडेल निवडा'}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-sidebar)] transition-colors smooth-button">
                <input
                  type="radio"
                  name="model"
                  value="google"
                  checked={localSettings.selectedModel === 'google'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                  className="text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <Sparkles className="w-5 h-5 text-[var(--color-text-secondary)]" />
                <div>
                  <div className="font-semibold text-[var(--color-text-primary)]">Google Gemini</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">Gemma-3-27b-it</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-sidebar)] transition-colors smooth-button">
                <input
                  type="radio"
                  name="model"
                  value="zhipu"
                  checked={localSettings.selectedModel === 'zhipu'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                  className="text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <Bot className="w-5 h-5 text-[var(--color-text-secondary)]" />
                <div>
                  <div className="font-semibold text-[var(--color-text-primary)]">ZhipuAI</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">GLM-4.5-Flash</div>
                </div>
              </label>
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              {selectedLanguage === 'en' ? 'Select Language' : 'भाषा निवडा'}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-sidebar)] transition-colors smooth-button">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={selectedLanguage === 'en'}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'mr')}
                  className="text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <Languages className="w-5 h-5 text-[var(--color-text-secondary)]" />
                <div className="font-semibold text-[var(--color-text-primary)]">English</div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-sidebar)] transition-colors smooth-button">
                <input
                  type="radio"
                  name="language"
                  value="mr"
                  checked={selectedLanguage === 'mr'}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'mr')}
                  className="text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <Languages className="w-5 h-5 text-[var(--color-text-secondary)]" />
                <div className="font-semibold text-[var(--color-text-primary)]">मराठी</div>
              </label>
            </div>
          </div>

          {/* Google API Key Input */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              {selectedLanguage === 'en' ? 'Google AI API Key' : 'गूगल एआय एपीआय की'}
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
              <input
                type="password"
                value={localSettings.googleApiKey}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, googleApiKey: e.target.value }))}
                placeholder={selectedLanguage === 'en' ? 'Enter your Google AI API key' : 'आपली गूगल एआय एपीआय की टाका'}
                className="w-full pl-10 pr-3 py-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent bg-[var(--color-card)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] transition-all duration-200 chat-input"
              />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {selectedLanguage === 'en' ? (
                <>
                  Get your API key from{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                    Google AI Studio
                  </a>
                </>
              ) : (
                <>
                  आपली एपीआय की येथून मिळवा{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                    गूगल एआय स्टुडिओ
                  </a>
                </>
              )}
            </p>
          </div>

          {/* ZhipuAI API Key Input */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              {selectedLanguage === 'en' ? 'ZhipuAI API Key' : 'झिपूएआय एपीआय की'}
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
              <input
                type="password"
                value={localSettings.zhipuApiKey}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, zhipuApiKey: e.target.value }))}
                placeholder={selectedLanguage === 'en' ? 'Enter your ZhipuAI API key' : 'आपली झिपूएआय एपीआय की टाका'}
                className="w-full pl-10 pr-3 py-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent bg-[var(--color-card)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] transition-all duration-200 chat-input"
              />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {selectedLanguage === 'en' ? (
                <>
                  Get your API key from{' '}
                  <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                    ZhipuAI Platform
                  </a>
                </>
              ) : (
                <>
                  आपली एपीआय की येथून मिळवा{' '}
                  <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                    झिपूएआय प्लॅटफॉर्म
                  </a>
                </>
              )}
            </p>
          </div>

          {/* Import/Export Data */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
              {selectedLanguage === 'en' ? 'Data Management' : 'डेटा व्यवस्थापन'}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 p-3 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-sidebar)] transition-colors smooth-button text-[var(--color-text-primary)] font-medium"
              >
                <Download className="w-5 h-5 text-[var(--color-text-secondary)]" />
                {selectedLanguage === 'en' ? 'Export Data' : 'डेटा निर्यात करा'}
              </button>
              <button
                onClick={triggerFileInput}
                className="flex items-center justify-center gap-2 p-3 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-sidebar)] transition-colors smooth-button text-[var(--color-text-primary)] font-medium"
              >
                <Upload className="w-5 h-5 text-[var(--color-text-secondary)]" />
                {selectedLanguage === 'en' ? 'Import Data' : 'डेटा आयात करा'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportData}
                accept=".json"
                className="hidden"
              />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {selectedLanguage === 'en'
                ? 'Export or import your conversations and settings as a JSON file.'
                : 'आपल्या संभाषण आणि सेटिंग्ज JSON फाइल म्हणून निर्यात किंवा आयात करा.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-sidebar)] rounded-lg transition-colors font-semibold smooth-button"
          >
            {selectedLanguage === 'en' ? 'Cancel' : 'रद्द करा'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold smooth-button"
            disabled={!localSettings.googleApiKey && !localSettings.zhipuApiKey}
          >
            {selectedLanguage === 'en' ? 'Save Settings' : 'सेटिंग्ज जतन करा'}
          </button>
        </div>
      </div>
    </div>
  );
}
