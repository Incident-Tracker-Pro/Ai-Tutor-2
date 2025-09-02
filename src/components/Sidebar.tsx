import React, { useContext } from 'react';
import {
  Plus,
  MessageSquare,
  Settings,
  Trash2,
  Bot,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Brain,
  Cloud,
  Terminal,
} from 'lucide-react';
import { Conversation } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  settings: { selectedModel: 'google' | 'zhipu' | 'mistral-small' | 'mistral-codestral' };
  onModelChange: (model: 'google' | 'zhipu' | 'mistral-small' | 'mistral-codestral') => void;
  onCloseSidebar: () => void;
  isFolded?: boolean;
  onToggleFold?: () => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onOpenSettings,
  settings,
  onModelChange,
  onCloseSidebar,
  isFolded = false,
  onToggleFold,
}: SidebarProps) {
  const { selectedLanguage } = useContext(LanguageContext);

  const modelConfig = {
    google: {
      icon: Sparkles,
      name: 'Gemma',
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600'
    },
    zhipu: {
      icon: Brain,
      name: 'ZhipuAI',
      color: 'purple',
      gradient: 'from-purple-500 to-violet-600'
    },
    'mistral-small': {
      icon: Cloud,
      name: 'Mistral',
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    'mistral-codestral': {
      icon: Terminal,
      name: 'Codestral',
      color: 'orange',
      gradient: 'from-orange-500 to-amber-600'
    }
  };

  return (
    <div
      className={`${
        isFolded ? 'w-16' : 'w-72'
      } bg-white dark:bg-gray-900 flex flex-col h-full border-r border-gray-200 dark:border-gray-800 sidebar transition-all duration-300 ease-in-out fixed md:static z-50 shadow-lg md:shadow-none`}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <img
                src="/robot.png"
                alt="AI Tutor"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Bot className="w-5 h-5 text-white hidden" />
            </div>
            {!isFolded && (
              <h1
                className={`text-xl font-bold text-gray-900 dark:text-white ${
                  selectedLanguage === 'mr' ? 'font-black' : ''
                }`}
              >
                {selectedLanguage === 'en' ? 'AI Tutor' : 'एआय शिक्षक'}
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {!isFolded && (
              <button
                onClick={onOpenSettings}
                className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:shadow-sm"
                title={selectedLanguage === 'en' ? 'Settings' : 'सेटिंग्ज'}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            {onToggleFold && (
              <button
                onClick={onToggleFold}
                className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:shadow-sm hidden md:block"
                title={
                  selectedLanguage === 'en'
                    ? isFolded
                      ? 'Expand sidebar'
                      : 'Collapse sidebar'
                    : isFolded
                    ? 'साइडबार विस्तृत करा'
                    : 'साइडबार संकुचित करा'
                }
              >
                {isFolded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={onCloseSidebar}
              className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:shadow-sm md:hidden"
              title={selectedLanguage === 'en' ? 'Close sidebar' : 'साइडबार बंद करा'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isFolded ? (
          <>
            {/* New Chat Button */}
            <button
              onClick={onNewConversation}
              className={`w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-200 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] mb-6 ${
                selectedLanguage === 'mr' ? 'font-bold text-shadow' : ''
              }`}
              style={
                selectedLanguage === 'mr'
                  ? { textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }
                  : {}
              }
            >
              <Plus className="w-5 h-5" />
              <span className={selectedLanguage === 'mr' ? 'font-bold' : ''}>
                {selectedLanguage === 'en' ? 'New Chat' : 'नवीन चॅट'}
              </span>
            </button>

            {/* AI Model Selection */}
            <div className="space-y-3">
              <p
                className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 ${
                  selectedLanguage === 'mr' ? 'font-bold' : ''
                }`}
              >
                {selectedLanguage === 'en' ? 'AI Model' : 'एआय मॉडेल'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(modelConfig).map(([key, config]) => {
                  const IconComponent = config.icon;
                  const isSelected = settings.selectedModel === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => onModelChange(key as any)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 border ${
                        isSelected
                          ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg border-transparent`
                          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:shadow-md'
                      } hover:scale-105 active:scale-95`}
                      title={config.name}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className={`text-xs font-medium ${selectedLanguage === 'mr' ? 'font-semibold' : ''}`}>
                        {config.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Folded State */
          <div className="space-y-3">
            <button
              onClick={onNewConversation}
              className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-200 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              title={selectedLanguage === 'en' ? 'New chat' : 'नवीन चॅट'}
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
              title={selectedLanguage === 'en' ? 'Settings' : 'सेटिंग्ज'}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-12 px-4">
            <MessageSquare
              className={`${isFolded ? 'w-6 h-6' : 'w-12 h-12'} mx-auto mb-3 opacity-50`}
            />
            {!isFolded && (
              <p className={`text-sm font-medium ${selectedLanguage === 'mr' ? 'font-semibold' : ''}`}>
                {selectedLanguage === 'en' ? 'No conversations yet' : 'अद्याप कोणतेही संभाषण नाही'}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation, index) => (
              <div
                key={conversation.id}
                className={`group flex items-center gap-3 ${
                  isFolded ? 'justify-center p-3' : 'p-3'
                } rounded-xl cursor-pointer transition-all duration-200 ${
                  currentConversationId === conversation.id
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 shadow-sm'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm'
                } hover:scale-[1.02] active:scale-[0.98]`}
                onClick={() => onSelectConversation(conversation.id)}
                title={isFolded ? conversation.title : undefined}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  currentConversationId === conversation.id
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                } transition-all duration-200`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                
                {!isFolded && (
                  <>
                    <span
                      className={`flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 truncate ${
                        selectedLanguage === 'mr' ? 'font-semibold' : ''
                      } ${
                        currentConversationId === conversation.id ? 'text-blue-700 dark:text-blue-300' : ''
                      }`}
                    >
                      {conversation.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conversation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                      title={selectedLanguage === 'en' ? 'Delete conversation' : 'संभाषण हटवा'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
