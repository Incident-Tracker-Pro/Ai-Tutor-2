import React, { useState, useRef } from 'react';
import { X, Settings, Key, Bot, Sparkles, Download, Upload, Languages, Shield, Database, Palette, Eye, EyeOff, ExternalLink } from 'lucide-react';

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showApiKeys, setShowApiKeys] = useState({
    google: false,
    zhipu: false,
    mistral: false
  });
  const [settings, setSettings] = useState({
    selectedModel: 'google',
    googleApiKey: '',
    zhipuApiKey: '',
    mistralApiKey: ''
  });
  const fileInputRef = useRef(null);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleModelChange = (model) => {
    setSettings(prev => ({ ...prev, selectedModel: model }));
  };

  const handleApiKeyChange = (provider, value) => {
    setSettings(prev => ({ ...prev, [`${provider}ApiKey`]: value }));
  };

  const toggleApiKeyVisibility = (provider) => {
    setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleExportData = () => {
    const data = {
      conversations: [],
      settings,
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
          setSettings(data.settings);
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
    { id: 'general', icon: Palette, label: 'General', color: 'from-purple-500 to-pink-500' },
    { id: 'api', icon: Shield, label: 'API Keys', color: 'from-blue-500 to-cyan-500' },
    { id: 'data', icon: Database, label: 'Data', color: 'from-green-500 to-teal-500' },
  ];

  const models = [
    {
      id: 'google',
      name: 'Google Gemini',
      model: 'Gemma-3-27b-it',
      icon: Sparkles,
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      description: 'Advanced conversational AI'
    },
    {
      id: 'zhipu',
      name: 'ZhipuAI',
      model: 'GLM-4.5-Flash',
      icon: Bot,
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      description: 'Fast and efficient processing'
    },
    {
      id: 'mistral-small',
      name: 'Mistral Small',
      model: 'mistral-small-latest',
      icon: Bot,
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      description: 'Lightweight and quick'
    },
    {
      id: 'mistral-codestral',
      name: 'Codestral',
      model: 'codestral-latest',
      icon: Bot,
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      description: 'Code-specialized model'
    }
  ];

  const apiProviders = [
    {
      id: 'google',
      name: 'Google AI',
      icon: Sparkles,
      color: 'blue',
      url: 'https://aistudio.google.com/app/apikey',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      id: 'zhipu',
      name: 'ZhipuAI',
      icon: Bot,
      color: 'purple',
      url: 'https://open.bigmodel.cn/',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'mistral',
      name: 'Mistral',
      icon: Bot,
      color: 'green',
      url: 'https://console.mistral.ai/api-keys',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl">
        {/* Animated Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                <Settings className="w-7 h-7 animate-spin" style={{animationDuration: '8s'}} />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text">
                  Settings
                </h2>
                <p className="text-white/90 text-sm font-medium">
                  Customize your AI experience
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-110 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-5 font-medium transition-all duration-300 relative group ${
                activeTab === tab.id
                  ? 'text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-900/50'
              }`}
              style={{
                transitionDelay: `${index * 50}ms`
              }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-110`
                  : 'bg-gray-200 dark:bg-gray-700 group-hover:scale-105'
              }`}>
                <tab.icon className="w-4 h-4" />
              </div>
              <span className="font-semibold">{tab.label}</span>
              {activeTab === tab.id && (
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r ${tab.color} rounded-full`} />
              )}
            </button>
          ))}
        </div>

        {/* Enhanced Tab Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh] bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800">
          {activeTab === 'general' && (
            <div className="space-y-10">
              {/* AI Model Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Models</h3>
                    <p className="text-gray-600 dark:text-gray-400">Choose your preferred AI model</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {models.map((model, index) => (
                    <label 
                      key={model.id} 
                      className="group cursor-pointer"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <div className={`relative p-6 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                        settings.selectedModel === model.id
                          ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}>
                        <input
                          type="radio"
                          name="model"
                          value={model.id}
                          checked={settings.selectedModel === model.id}
                          onChange={() => handleModelChange(model.id)}
                          className="absolute top-4 right-4 w-5 h-5 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex items-center gap-4 mb-3">
                          <div className={`w-12 h-12 bg-gradient-to-r ${model.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            <model.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{model.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{model.model}</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{model.description}</p>
                        {settings.selectedModel === model.id && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-2xl pointer-events-none" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Languages className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Language</h3>
                    <p className="text-gray-600 dark:text-gray-400">Select your preferred language</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { code: 'en', name: 'English', flag: '🇺🇸', gradient: 'from-blue-500 to-indigo-500' },
                    { code: 'mr', name: 'मराठी', flag: '🇮🇳', gradient: 'from-orange-500 to-red-500' }
                  ].map((lang, index) => (
                    <label key={lang.code} className="group cursor-pointer">
                      <div className={`p-6 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                        selectedLanguage === lang.code
                          ? 'border-indigo-400 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300'
                      }`}>
                        <input
                          type="radio"
                          name="language"
                          value={lang.code}
                          checked={selectedLanguage === lang.code}
                          onChange={() => handleLanguageChange(lang.code)}
                          className="absolute top-4 right-4 w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${lang.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                            {lang.flag}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white text-lg">{lang.name}</div>
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
            <div className="space-y-8">
              {apiProviders.map((provider, index) => (
                <div key={provider.id} className="space-y-4" style={{animationDelay: `${index * 150}ms`}}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${provider.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <provider.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{provider.name} API Key</h3>
                      <p className="text-gray-600 dark:text-gray-400">Enter your API key for {provider.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Key className="w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                      </div>
                      <input
                        type={showApiKeys[provider.id] ? "text" : "password"}
                        value={settings[`${provider.id}ApiKey`]}
                        onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                        placeholder={`Enter your ${provider.name} API key`}
                        className="w-full pl-12 pr-14 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => toggleApiKeyVisibility(provider.id)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showApiKeys[provider.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className={`bg-gradient-to-r from-${provider.color}-50 to-${provider.color}-100 dark:from-${provider.color}-900/20 dark:to-${provider.color}-800/20 border border-${provider.color}-200 dark:border-${provider.color}-800 rounded-xl p-4`}>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`text-${provider.color}-800 dark:text-${provider.color}-300`}>
                          Get your API key from
                        </span>
                        <a 
                          href={provider.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`inline-flex items-center gap-1 font-semibold text-${provider.color}-700 dark:text-${provider.color}-400 hover:text-${provider.color}-800 dark:hover:text-${provider.color}-300 transition-colors`}
                        >
                          {provider.name} Platform
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Data Management</h3>
                    <p className="text-gray-600 dark:text-gray-400">Export or import your data</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={handleExportData}
                    className="group relative overflow-hidden p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-green-400 hover:bg-gradient-to-r from-green-50 to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Download className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-900 dark:text-white">Export Data</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Download your conversations and settings</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={triggerFileInput}
                    className="group relative overflow-hidden p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-purple-400 hover:bg-gradient-to-r from-purple-50 to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-900 dark:text-white">Import Data</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upload your backup file to restore</div>
                      </div>
                    </div>
                  </button>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Important Note</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Your data is stored locally in your browser. Regular backups are recommended to prevent data loss.
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
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <button
            onClick={() => setIsOpen(false)}
            className="px-8 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 font-semibold hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Save logic here
              setIsOpen(false);
            }}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl transition-all duration-200 font-semibold hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={!settings.googleApiKey && !settings.zhipuApiKey && !settings.mistralApiKey}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
