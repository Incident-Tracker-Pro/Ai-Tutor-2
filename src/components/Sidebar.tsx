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
  onCloseSidebar,
  isFolded = false,
  onToggleFold,
}: SidebarProps) {
  const { selectedLanguage } = useContext(LanguageContext);
  return (
    <div
      className={`${
        isFolded ? 'w-16' : 'w-64'
      } bg-[var(--color-sidebar)] flex flex-col h-full border-r border-[var(--color-border)] sidebar transition-all duration-300 ease-in-out fixed md:static z-50`}
    >
      <div className="p-4 border-b border-[var(--color-border)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isFolded && (
              <h1
                className={`text-lg font-bold text-[var(--color-text-primary)] ${
                  selectedLanguage === 'mr' ? 'font-bold' : ''
                }`}
              >
                {selectedLanguage === 'en' ? 'AI Tutor' : 'एआय शिक्षक'}
              </h1>
            )}
          </div>
          <div className="flex gap-1 items-center">
            <button
              onClick={onOpenSettings}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-card)] rounded-lg transition-colors"
              title={selectedLanguage === 'en' ? 'Settings' : 'सेटिंग्ज'}
            >
              <Settings className="w-4 h-4" />
            </button>
            {onToggleFold && (
              <button
                onClick={onToggleFold}
                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-card)] rounded-lg transition-colors hidden md:block"
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
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-card)] rounded-lg transition-colors md:hidden"
              title={selectedLanguage === 'en' ? 'Close sidebar' : 'साइडबार बंद करा'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={onNewConversation}
          className={`w-full flex items-center ${isFolded ? 'justify-center' : ''} gap-2 px-3 py-2 bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] rounded-lg transition-colors text-[var(--color-accent-text)] shadow-sm font-semibold`}
        >
          <Plus className="w-4 h-4" />
          {!isFolded && (
            <span className={selectedLanguage === 'mr' ? 'font-bold' : ''}>
              {selectedLanguage === 'en' ? 'New chat' : 'नवीन चॅट'}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center text-[var(--color-text-secondary)] mt-8 px-4">
              <MessageSquare
                className={`${isFolded ? 'w-5 h-5' : 'w-8 h-8'} mx-auto mb-2 text-[var(--color-text-secondary)]`}
              />
              {!isFolded && (
                <p className={`text-sm font-medium ${selectedLanguage === 'mr' ? 'font-semibold' : ''}`}>
                  {selectedLanguage === 'en' ? 'No conversations yet' : 'अद्याप कोणतेही संभाषण नाही'}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-2 ${
                    isFolded ? 'justify-center p-2' : 'p-3'
                  } rounded-lg cursor-pointer transition-colors ${
                    currentConversationId === conversation.id
                      ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent-text)]'
                      : 'hover:bg-[var(--color-card)] text-[var(--color-text-primary)]'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                  title={isFolded ? conversation.title : undefined}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  {!isFolded && (
                    <>
                      <span
                        className={`flex-1 text-sm font-semibold truncate ${
                          selectedLanguage === 'mr' ? 'font-bold' : ''
                        }`}
                      >
                        {conversation.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                          currentConversationId === conversation.id
                            ? 'hover:bg-black/10'
                            : 'hover:bg-red-900/30 text-red-400'
                        }`}
                        title={selectedLanguage === 'en' ? 'Delete conversation' : 'संभाषण हटवा'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
