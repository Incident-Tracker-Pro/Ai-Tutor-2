import React, { useState, useEffect } from 'react';
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
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'mr'>('en');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
    // Load saved language preference
    const savedLanguage = localStorage.getItem('ai-tutor-language') as 'en' | 'mr';
    if (savedLanguage === 'en' || savedLanguage === 'mr') {
      setSelectedLanguage(savedLanguage);
    }
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
      language: selectedLanguage
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tutor-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate imported data
      if (data.conversations && Array.isArray(data.conversations)) {
        const validatedConversations: Conversation[] = data.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        storageUtils.saveConversations(validatedConversations);
      }

      if (data.settings && typeof data.settings === 'object') {
        const validatedSettings: APISettings = {
          ...settings,
          ...data.settings,
          selectedModel: data.settings.selectedModel === 'google' || data.settings.selectedModel === 'zhipu' 
            ? data.settings.selectedModel 
            : settings.selectedModel
        };
        storageUtils.saveSettings(validatedSettings);
        setLocalSettings(validatedSettings);
      }

      if (data.language === 'en' || data.language === 'mr') {
        setSelectedLanguage(data.language);
        localStorage.setItem('ai-tutor-language', data.language);
      }

      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Failed to import data. Please check the file format.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLanguageChange = (language: 'en' | 'mr') => {
    setSelectedLanguage(language);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-[var(--color-card)] rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto pwa-safe-area">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {selectedLanguage === 'en' ? 'Settings' : 'सेटिंग्ज'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors smooth-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              {selectedLanguage === 'en' ? 'Select AI Model' : 'एआय मॉडेल निवडा'}
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-sidebar)] transition-colors">
                <input
                  type="radio"
                  name="model"
                  value="google"
                  checked={localSettings.selectedModel === 'google'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                  className="text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <Sparkles className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <div>
                  <div className="font-semibold text-[var(--color-text-primary)]">Google Gemini</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">Gemma-3-27b-it</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-sidebar)] transition-colors">
                <input
                  type="radio"
                  name="model"
                  value="zhipu"
                  checked={localSettings.selectedModel === 'zhipu'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, selectedModel: e.target.value as 'google' | 'zhipu' }))}
                  className="text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <Bot className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <div>
                  <div className="font-semibold text-[var(--color-text-primary)]">ZhipuAI</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">GLM-4.5-Flash</div>
                </div>
              </label>
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              {selectedLanguage === 'en' ? 'Select Language' : 'भाषा निवडा'}
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-sidebar)] transition-colors">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={selectedLanguage === 'en'}
                  onChange={() => handleLanguageChange('en')}
                  className="text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <Languages className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <div>
                  <div className="font-semibold text-[var(--color-text-primary)]">English</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-sidebar)] transition-colors">
                <input
                  type="radio"
                  name="language"
                  value="mr"
                  checked={selectedLanguage === 'mr'}
                  onChange={() => handleLanguageChange('mr')}
                  className="text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <Languages className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <div>
                  <div className="font-semibold text-[var(--color-text-primary)]">मराठी</div>
                </div>
              </label>
            </div>
          </div>

          {/* Google API Key Input */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              {selectedLanguage === 'en' ? 'Google AI API Key' : 'Google AI API की'}
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                type="password"
                value={localSettings.googleApiKey}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, googleApiKey: e.target.value }))}
                placeholder={selectedLanguage === 'en' ? 'Enter your Google AI API key' : 'तुमची Google AI API की प्रविष्ट करा'}
                className="w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent bg-[var(--color-card)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] transition-colors smooth-button"
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
                  तुमची API की{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                    Google AI Studio
                  </a> वरून मिळवा
                </>
              )}
            </p>
          </div>

          {/* ZhipuAI API Key Input */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              {selectedLanguage === 'en' ? 'ZhipuAI API Key' : 'ZhipuAI API की'}
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                type="password"
                value={localSettings.zhipuApiKey}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, zhipuApiKey: e.target.value }))}
                placeholder={selectedLanguage === 'en' ? 'Enter your ZhipuAI API key' : 'तुमची ZhipuAI API की प्रविष्ट करा'}
                className="w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent bg-[var(--color-card)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] transition-colors smooth-button"
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
                  तुमची API की{' '}
                  <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                    ZhipuAI Platform
                  </a> वरून मिळवा
                </>
              )}
            </p>
          </div>

          {/* Data Export/Import */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              {selectedLanguage === 'en' ? 'Data Management' : 'डेटा व्यवस्थापन'}
            </label>
            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-blue-700 transition-colors smooth-button"
              >
                <Download className="w-4 h-4" />
                {selectedLanguage === 'en' ? 'Export Data' : 'डेटा निर्यात करा'}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-blue-700 transition-colors smooth-button"
              >
                <Upload className="w-4 h-4" />
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
                ? 'Export or import your conversations and settings as JSON'
                : 'तुमच्या संभाषण आणि सेटिंग्ज JSON म्हणून निर्यात किंवा आयात करा'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-sidebar)] rounded-lg transition-colors font-semibold smooth-button"
          >
            {selectedLanguage === 'en' ? 'Cancel' : 'रद्द करा'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed font-semibold smooth-button"
            disabled={!localSettings.googleApiKey && !localSettings.zhipuApiKey}
          >
            {selectedLanguage === 'en' ? 'Save Settings' : 'सेटिंग्ज जतन करा'}
          </button>
        </div>
      </div>
    </div>
  );
}
