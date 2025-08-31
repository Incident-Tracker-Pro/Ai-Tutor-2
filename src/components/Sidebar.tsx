import React, { useState } from 'react';
import { Plus, MessageSquare, Settings, Trash2, Bot, ChevronDown, X } from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  settings: { selectedModel: 'google' | 'zhipu' };
  onModelChange: (model: 'google' | 'zhipu') => void;
  onCloseSidebar: () => void;
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
}: SidebarProps) {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  return (
    <div
      className="w-64 bg-[var(--color-sidebar)] flex flex-col h-full border-r border-[var(--color-border)] sidebar transition-transform duration-300 ease-in-out fixed md:static z-50"
    >
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">AI Tutor</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onCloseSidebar}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={onNewConversation}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          New chat
        </button>
        <div className="relative mt-3">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-sm font-semibold"
          >
            <span>{settings.selectedModel === 'google' ? 'Google Gemini' : 'ZhipuAI'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {modelDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-lg border border-[var(--color-border)]">
              <button
                onClick={() => {
                  onModelChange('google');
                  setModelDropdownOpen(false);
                }}
                className="block w-full px-4 py-2 text-left hover:bg-gray-300 dark:hover:bg-gray-700 text-[var(--color-text-primary)] transition-colors font-semibold"
              >
                Google Gemini
              </button>
              <button
                onClick={() => {
                  onModelChange('zhipu');
                  setModelDropdownOpen(false);
                }}
                className="block w-full px-4 py-2 text-left hover:bg-gray-300 dark:hover:bg-gray-700 text-[var(--color-text-primary)] transition-colors font-semibold"
              >
                ZhipuAI
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center text-[var(--color-text-secondary)] mt-8 px-4">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-secondary)]" />
              <p className="text-sm font-semibold">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentConversationId === conversation.id
                      ? 'bg-gray-200 dark:bg-gray-800 border-l-4 border-gray-600 dark:border-gray-400'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0 text-[var(--color-text-secondary)]" />
                  <span className="flex-1 text-sm font-semibold text-[var(--color-text-primary)] truncate">
                    {conversation.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-[var(--color-text-secondary)]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
