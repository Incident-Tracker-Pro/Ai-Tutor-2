import React, { useState } from 'react';
import {
  X,
  Bot,
  Languages,
  Database,
  Key,
  Sparkles,
  Brain,
  Cloud,
  Terminal,
  ChevronDown,
  ChevronUp,
  Upload,
  Download,
} from 'lucide-react';
import { Settings as APISettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: APISettings;
  onSave: (settings: APISettings) => void;
  selectedLanguage: 'en' | 'mr';
  onLanguageChange: (lang: 'en' | 'mr') => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  selectedLanguage,
  onLanguageChange,
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<APISettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'apiKeys' | 'data'>('general');
  const [apiCollapse, setApiCollapse] = useState<{ [k: string]: boolean }>({
    google: true,
    zhipu: false,
    mistral: false,
  });

  if (!isOpen) return null;

  const handleLanguageChange = (lang: 'en' | 'mr') => {
    setLocalSettings((prev) => ({ ...prev, language: lang }));
    onLanguageChange(lang);
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const modelOptions = [
    { id: 'google', name: 'Gemma', sub: 'gemma-3-27b-it', color: 'from-blue-500 to-purple-600', icon: <Sparkles className="w-5 h-5 text-white" /> },
    { id: 'zhipu', name: 'ZhipuAI', sub: 'GLM-4.5-Flash', color: 'from-purple-500 to-pink-600', icon: <Brain className="w-5 h-5 text-white" /> },
    { id: 'mistral-small', name: 'Mistral Small', sub: 'mistral-small-latest', color: 'from-green-500 to-emerald-600', icon: <Cloud className="w-5 h-5 text-white" /> },
    { id: 'mistral-codestral', name: 'Codestral', sub: 'codestral-latest', color: 'from-orange-500 to-amber-600', icon: <Terminal className="w-5 h-5 text-white" /> },
  ];

  const apiProviders = [
    { id: 'google', label: 'Google AI Studio' },
    { id: 'zhipu', label: 'ZhipuAI' },
    { id: 'mistral', label: 'Mistral' },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {selectedLanguage === 'en' ? 'Settings' : 'सेटिंग्ज'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'general', label: selectedLanguage === 'en' ? 'General' : 'सामान्य' },
            { id: 'apiKeys', label: selectedLanguage === 'en' ? 'API Keys' : 'API कीज' },
            { id: 'data', label: selectedLanguage === 'en' ? 'Data' : 'डेटा' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* General */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              {/* Models */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedLanguage === 'en' ? 'AI Model' : 'एआय मॉडेल'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {modelOptions.map((model) => (
                    <label key={model.id} className="cursor-pointer group">
                      <div
                        className={`flex items-center gap-4 p-4 border rounded-xl transition-all ${
                          localSettings.selectedModel === model.id
                            ? 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900 shadow-md'
                            : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="model"
                          value={model.id}
                          checked={localSettings.selectedModel === model.id}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              selectedModel: e.target.value as APISettings['selectedModel'],
                            }))
                          }
                          className="hidden"
                        />
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                          {model.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{model.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{model.sub}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedLanguage === 'en' ? 'Language' : 'भाषा'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'en', label: 'English', tag: 'EN', gradient: 'from-blue-500 to-green-500' },
                    { id: 'mr', label: 'मराठी', tag: 'मर', gradient: 'from-orange-500 to-red-500' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id as 'en' | 'mr')}
                      className={`p-4 border rounded-xl flex items-center gap-3 transition ${
                        selectedLanguage === lang.id
                          ? 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-900 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${lang.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                        {lang.tag}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* API Keys */}
          {activeTab === 'apiKeys' && (
            <div className="space-y-6">
              {apiProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <button
                    onClick={() =>
                      setApiCollapse((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))
                    }
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {provider.label}
                      </span>
                    </div>
                    {apiCollapse[provider.id] ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {apiCollapse[provider.id] && (
                    <div className="px-6 pb-6">
                      <input
                        type="password"
                        value={(localSettings.apiKeys as any)[provider.id] || ''}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            apiKeys: {
                              ...prev.apiKeys,
                              [provider.id]: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        placeholder={`Enter ${provider.label} API Key`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Data Management */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Export */}
              <button className="w-full flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedLanguage === 'en' ? 'Export Data' : 'डेटा एक्सपोर्ट करा'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedLanguage === 'en' ? 'Save your chats locally' : 'तुमचे चॅट्स सेव्ह करा'}
                  </div>
                </div>
              </button>

              {/* Import */}
              <button className="w-full flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedLanguage === 'en' ? 'Import Data' : 'डेटा इम्पोर्ट करा'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedLanguage === 'en' ? 'Restore saved chats' : 'सेव्ह केलेले चॅट्स रिस्टोर करा'}
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
            {selectedLanguage === 'en' ? 'Cancel' : 'रद्द करा'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {selectedLanguage === 'en' ? 'Save' : 'सेव्ह करा'}
          </button>
        </div>
      </div>
    </div>
  );
}
