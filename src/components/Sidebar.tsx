import React, { useState } from 'react';
import { Plus, MessageSquare, Settings, Trash2, Bot, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
  return (
    <div
      className={`${
        isFolded ? 'w-16' : 'w-64'
      } bg-[var(--color-sidebar)] flex flex-col h-full border-r border-[var(--color-border)] sidebar transition-all duration-300 ease-in-out fixed md:static z-50`}
    >
      <div className="p-4 border-b border-[var(--color-border)]">
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
            <Bot className="w-6 h-6 text-gray-600 dark:text-gray-400 hidden" />
            {!isFolded && (
              <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">AI Tutor</h1>
            )}
          </div>
          <div className="flex gap-1">
            {!isFolded && (
              <button
                onClick={onOpenSettings}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            {onToggleFold && (
              <button
                onClick={onToggleFold}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors hidden md:block"
                title={isFolded ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isFolded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={onCloseSidebar}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors md:hidden"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {!isFolded && (
          <>
            <button
              onClick={onNewConversation}
              className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white border border-blue-600 shadow-sm font-medium mb-3"
            >
              <Plus className="w-4 h-4" />
              New chat
            </button>
            
            {/* Model Selector */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider px-1">
                AI Model
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onModelChange('google')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    settings.selectedModel === 'google'
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border-2 border-transparent text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-medium">Gemini</span>
                </button>
                <button
                  onClick={() => onModelChange('zhipu')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    settings.selectedModel === 'zhipu'
                      ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border-2 border-transparent text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span className="text-xs font-medium">ZhipuAI</span>
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* Folded state buttons */}
        {isFolded && (
          <div className="space-y-3">
            <button
              onClick={onNewConversation}
              className="w-full flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white border border-blue-600 shadow-sm"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-sm"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center text-[var(--color-text-secondary)] mt-8 px-4">
              <MessageSquare className={`${isFolded ? 'w-5 h-5' : 'w-8 h-8'} mx-auto mb-2 text-[var(--color-text-secondary)]`} />
              {!isFolded && (
                <p className="text-sm font-medium">No conversations yet</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-2 ${isFolded ? 'justify-center p-2' : 'p-3'} rounded-lg cursor-pointer transition-colors ${
                    currentConversationId === conversation.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                  title={isFolded ? conversation.title : undefined}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0 text-[var(--color-text-secondary)]" />
                  {!isFolded && (
                    <>
                      <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {conversation.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded transition-all"
                        title="Delete conversation"
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
