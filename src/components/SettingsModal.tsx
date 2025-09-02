import React, { useState, useRef } from 'react';
import { X, Settings, Key, Bot, Sparkles, Download, Upload, Languages, Shield, Database, Palette, Check, Globe, Zap } from 'lucide-react';

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedModel, setSelectedModel] = useState('google');
  const [apiKeys, setApiKeys] = useState({
    google: '',
    zhipu: '',
    mistral: ''
  });
  const fileInputRef = useRef(null);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  const handleApiKeyChange = (provider, value) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const handleExportData = () => {
    const data = {
      conversations: [],
      settings: { selectedModel, apiKeys },
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

  const handleImportData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        if (data.settings) {
          setSelectedModel(data.settings.selectedModel || 'google');
          setApiKeys(data.settings.apiKeys || { google: '', zhipu: '', mistral: '' });
        }
        if (data.language) {
          setSelectedLanguage(data.language);
        }
        alert('Data imported successfully!');
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Failed to import data. Please ensure the file is valid.');
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
    { id: 'general', icon: Palette, label: 'General', color: 'from-violet-500 to-purple-600' },
    { id: 'api', icon: Shield, label: 'API Keys', color: 'from-emerald-500 to-teal-600' },
    { id: 'data', icon: Database, label: 'Data', color: 'from-blue-500 to-cyan-600' },
  ];

  const models = [
    {
      id: 'google',
      name: 'Google Gemini',
      description: 'Gemma-3-27b-it',
      icon: Sparkles,
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      accent: 'blue'
    },
    {
      id: 'zhipu',
      name: 'ZhipuAI',
      description: 'GLM-4.5-Flash',
      icon: Zap,
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      accent: 'purple'
    },
    {
      id: 'mistral-small',
      name: 'Mistral Small',
      description: 'mistral-small-latest',
      icon: Bot,
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      accent: 'green'
    },
    {
      id: 'mistral-codestral',
      name: 'Codestral',
      description: 'codestral-latest',
      icon: Bot,
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      accent: 'orange'
    }
  ];

  const apiProviders = [
    {
      id: 'google',
      name: 'Google AI',
      icon: Sparkles,
      color: 'blue',
      url: 'https://aistudio.google.com/app/apikey',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'zhipu',
      name: 'ZhipuAI',
      icon: Zap,
      color: 'purple',
      url: 'https://open.bigmodel.cn/',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'mistral',
      name: 'Mistral AI',
      icon: Bot,
      color: 'green',
      url: 'https://console.mistral.ai/api-keys',
      gradient: 'from-green-500 to-emerald-600'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20 dark:border-gray-700/50">
        
        {/* Animated Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-pulse opacity-90"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
          <div className="relative p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text">
                    Settings
                  </h2>
                  <p className="text-white/80 text-lg mt-1">
                    Customize your AI experience
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all duration-300 hover:rotate-90 border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-6 font-medium transition-all duration-500 relative flex-1 group ${
                activeTab === tab.id
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-110`
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:scale-105'
              }`}>
                <tab.icon className="w-5 h-5" />
              </div>
              <span className="text-lg">{tab.label}</span>
              {activeTab === tab.id && (
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.color} rounded-t-full transition-all duration-500`} />
              )}
            </button>
          ))}
        </div>

        {/* Enhanced Tab Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh] bg-gradient-to-br from-gray-50/50 to-white/80 dark:from-gray-900/50 dark:to-gray-800/80">
          
          {activeTab === 'general' && (
            <div className="space-y-12 animate-fadeIn">
              
              {/* AI Model Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      AI Model
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">Choose your preferred AI assistant</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {models.map((model, index) => (
                    <label 
                      key={model.id}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                        selectedModel === model.id
                          ? `border-${model.accent}-400 dark:border-${model.accent}-500 shadow-xl shadow-${model.accent}-500/20`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity">
                          <div className={`w-full h-full bg-gradient-to-r ${model.gradient}`}></div>
                        </div>
                        <div className="relative p-6">
                          <div className="flex items-center gap-4">
                            <input
                              type="radio"
                              name="model"
                              value={model.id}
                              checked={selectedModel === model.id}
                              onChange={() => handleModelChange(model.id)}
                              className="sr-only"
                            />
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-r ${model.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                              <model.icon className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-900 dark:text-white">
                                {model.name}
                              </div>
                              <div className="text-gray-600 dark:text-gray-300 text-sm">
                                {model.description}
                              </div>
                            </div>
                            {selectedModel === model.id && (
                              <div className={`w-8 h-8 bg-${model.accent}-500 rounded-full flex items-center justify-center animate-bounce`}>
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Language
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">Select your preferred language</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { code: 'en', name: 'English', flag: '🇺🇸', gradient: 'from-blue-500 to-purple-600' },
                    { code: 'mr', name: 'मराठी', flag: '🇮🇳', gradient: 'from-orange-500 to-red-600' }
                  ].map((lang, index) => (
                    <label 
                      key={lang.code}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                        selectedLanguage === lang.code
                          ? 'border-emerald-400 dark:border-emerald-500 shadow-xl shadow-emerald-500/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity">
                          <div className={`w-full h-full bg-gradient-to-r ${lang.gradient}`}></div>
                        </div>
                        <div className="relative p-6">
                          <div className="flex items-center gap-4">
                            <input
                              type="radio"
                              name="language"
                              value={lang.code}
                              checked={selectedLanguage === lang.code}
                              onChange={() => handleLanguageChange(lang.code)}
                              className="sr-only"
                            />
                            <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                              {lang.flag}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-900 dark:text-white">
                                {lang.name}
                              </div>
                            </div>
                            {selectedLanguage === lang.code && (
                              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-10 animate-fadeIn">
              {apiProviders.map((provider, index) => (
                <div 
                  key={provider.id}
                  className="space-y-4"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${provider.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <provider.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {provider.name} API Key
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">Enter your API key for {provider.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Key className="w-5 h-5 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
                      </div>
                      <input
                        type="password"
                        value={apiKeys[provider.id] || ''}
                        onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                        placeholder={`Enter your ${provider.name} API key`}
                        className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 backdrop-blur-sm"
                      />
                    </div>
                    
                    <div className={`bg-gradient-to-r ${provider.gradient} p-0.5 rounded-xl`}>
                      <div className="bg-white dark:bg-gray-900 rounded-[11px] p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Get your API key from{' '}
                          <a 
                            href={provider.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`font-semibold text-${provider.color}-600 dark:text-${provider.color}-400 hover:underline transition-colors`}
                          >
                            {provider.name} Platform →
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Data Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">Export and import your data</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <button
                  onClick={handleExportData}
                  className="group relative overflow-hidden p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Download className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Export Data
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Download your conversations and settings as a backup file
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={triggerFileInput}
                  className="group relative overflow-hidden p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Import Data
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Upload a backup file to restore your conversations and settings
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-300/50 dark:border-amber-600/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold text-sm">!</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-1">Important Note</h4>
                    <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">
                      Your data is stored locally in your browser. We recommend creating regular backups to prevent data loss. 
                      Clearing browser data will remove all conversations and settings.
                    </p>
                  </div>
                </div>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportData}
                accept=".json"
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="flex justify-end gap-4 p-8 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm">
          <button
            onClick={() => setIsOpen(false)}
            className="px-8 py-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-300 font-semibold backdrop-blur-sm hover:scale-105"
          >
            Cancel
          </button>
          <button
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl transition-all duration-300 font-semibold hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 backdrop-blur-sm border border-white/20"
          >
            Save Settings
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
