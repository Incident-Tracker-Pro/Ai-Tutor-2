import React, { useState, useContext } from 'react';
import {
  Plus,
  MessageSquare,
  Settings,
  Trash2,
  Bot,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations by time periods
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const groupedConversations = {
    today: filteredConversations.filter(conv => new Date(conv.updatedAt) >= today),
    yesterday: filteredConversations.filter(conv => {
      const date = new Date(conv.updatedAt);
      return date >= yesterday && date < today;
    }),
    lastWeek: filteredConversations.filter(conv => {
      const date = new Date(conv.updatedAt);
      return date >= lastWeek && date < yesterday;
    }),
    older: filteredConversations.filter(conv => new Date(conv.updatedAt) < lastWeek),
  };

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'google': return <Sparkles className="w-3 h-3 text-blue-500" />;
      case 'zhipu': return <Brain className="w-3 h-3 text-purple-500" />;
      case 'mistral-small': return <Cloud className="w-3 h-3 text-green-500" />;
      case 'mistral-codestral': return <Terminal className="w-3 h-3 text-orange-500" />;
      default: return <MessageSquare className="w-3 h-3 text-gray-400" />;
    }
  };

  const renderConversationGroup = (title: string, conversations: Conversation[]) => {
    if (conversations.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        {!isFolded && (
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-3">
            {title}
          </h3>
        )}
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative flex items-center gap-3 ${
                isFolded ? 'justify-center p-2 mx-1' : 'px-3 py-2 mx-2'
              } rounded-lg cursor-pointer transition-all duration-200 ${
                currentConversationId === conversation.id
                  ? 'bg-gray-800 border-l-2 border-blue-500'
                  : 'hover:bg-gray-800/50'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
              title={isFolded ? conversation.title : undefined}
            >
              {/* Model Icon */}
              <div className="flex-shrink-0">
                {getModelIcon(conversation.messages[conversation.messages.length - 1]?.model || 'google')}
              </div>
              
              {!isFolded && (
                <>
                  <span className="flex-1 text-sm text-white truncate font-medium">
                    {conversation.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all duration-200"
                    title={selectedLanguage === 'en' ? 'Delete conversation' : 'संभाषण हटवा'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${
        isFolded ? 'w-12' : 'w-80'
      } bg-black flex flex-col h-full sidebar transition-all duration-300 ease-in-out fixed md:static z-50 border-r border-gray-800`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img
              src="/robot.png"
              alt="AI Tutor"
              className="w-6 h-6 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <Bot className="w-6 h-6 text-gray-400 hidden" />
            {!isFolded && (
              <h1 className="text-lg font-bold text-white">
                {selectedLanguage === 'en' ? 'Home Workspace' : 'होम वर्कस्पेस'}
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {!isFolded && (
              <button
                onClick={onOpenSettings}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title={selectedLanguage === 'en' ? 'Settings' : 'सेटिंग्ज'}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            
            {onToggleFold && (
              <button
                onClick={onToggleFold}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors hidden md:block"
                title={
                  selectedLanguage === 'en'
                    ? isFolded ? 'Expand sidebar' : 'Collapse sidebar'
                    : isFolded ? 'साइडबार विस्तृत करा' : 'साइडबार संकुचित करा'
                }
              >
                {isFolded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
            
            <button
              onClick={onCloseSidebar}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors md:hidden"
              title={selectedLanguage === 'en' ? 'Close sidebar' : 'साइडबार बंद करा'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        {!isFolded ? (
          <button
            onClick={onNewConversation}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors font-medium mb-4"
          >
            <Plus className="w-4 h-4" />
            <span>{selectedLanguage === 'en' ? 'New Chat' : 'नवीन चॅट'}</span>
          </button>
        ) : (
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center p-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors mb-4"
            title={selectedLanguage === 'en' ? 'New chat' : 'नवीन चॅट'}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {/* Search Box */}
        {!isFolded && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={selectedLanguage === 'en' ? 'Search chats...' : 'चॅट शोधा...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors"
            />
          </div>
        )}

        {/* Collapsed Settings */}
        {isFolded && (
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-center p-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors"
            title={selectedLanguage === 'en' ? 'Settings' : 'सेटिंग्ज'}
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-400 mt-8 px-4">
            <MessageSquare className={`${isFolded ? 'w-5 h-5' : 'w-8 h-8'} mx-auto mb-2`} />
            {!isFolded && (
              <p className="text-sm">
                {selectedLanguage === 'en' ? 'No conversations yet' : 'अद्याप कोणतेही संभाषण नाही'}
              </p>
            )}
          </div>
        ) : (
          <div className="py-2">
            {renderConversationGroup(
              selectedLanguage === 'en' ? 'Today' : 'आज',
              groupedConversations.today
            )}
            {renderConversationGroup(
              selectedLanguage === 'en' ? 'Yesterday' : 'काल',
              groupedConversations.yesterday
            )}
            {renderConversationGroup(
              selectedLanguage === 'en' ? 'Previous 7 days' : 'मागील ७ दिवस',
              groupedConversations.lastWeek
            )}
            {renderConversationGroup(
              selectedLanguage === 'en' ? 'Older' : 'जुने',
              groupedConversations.older
            )}
          </div>
        )}
      </div>
    </div>
  );
}
