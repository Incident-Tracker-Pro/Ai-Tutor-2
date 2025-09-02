import React, { useState, useEffect, useContext, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SettingsModal } from './components/SettingsModal';
import { InstallPrompt } from './components/InstallPrompt';
import { Conversation, Message, APISettings } from './types';
import { aiService } from './services/aiService';
import { storageUtils } from './utils/storage';
import { generateId, generateConversationTitle } from './utils/helpers';
import { usePWA } from './hooks/usePWA';
import { Menu } from 'lucide-react';
import { LanguageContext } from './contexts/LanguageContext';

const defaultSettings: APISettings = {
  googleApiKey: '',
  zhipuApiKey: '',
  mistralApiKey: '',
  selectedModel: 'google',
};

function App() {
  const { selectedLanguage } = useContext(LanguageContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<APISettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [sidebarFolded, setSidebarFolded] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { isInstallable, isInstalled, installApp, dismissInstallPrompt } = usePWA();
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const savedConversations = storageUtils.getConversations();
    const savedSettings = storageUtils.getSettings();
    setConversations(savedConversations);
    setSettings(savedSettings);
    if (savedConversations.length > 0) {
      setCurrentConversationId(savedConversations[0].id);
    }
    aiService.updateSettings(savedSettings, selectedLanguage);

    const savedSidebarFolded = localStorage.getItem('ai-tutor-sidebar-folded');
    if (savedSidebarFolded) {
      setSidebarFolded(JSON.parse(savedSidebarFolded));
    }
  }, [selectedLanguage]);

  useEffect(() => {
    storageUtils.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('ai-tutor-sidebar-folded', JSON.stringify(sidebarFolded));
  }, [sidebarFolded]);

  const handleModelChange = (model: 'google' | 'zhipu' | 'mistral-small' | 'mistral-codestral') => {
    const newSettings = { ...settings, selectedModel: model };
    setSettings(newSettings);
    storageUtils.saveSettings(newSettings);
    aiService.updateSettings(newSettings, selectedLanguage);
  };

  const handleToggleFold = () => {
    setSidebarFolded(!sidebarFolded);
  };

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const hasApiKey = settings.googleApiKey || settings.zhipuApiKey || settings.mistralApiKey;

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: generateId(),
      title: selectedLanguage === 'en' ? 'New Chat' : 'नवीन चॅट',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleSaveSettings = (newSettings: APISettings) => {
    setSettings(newSettings);
    storageUtils.saveSettings(newSettings);
    aiService.updateSettings(newSettings, selectedLanguage);
    setIsSettingsOpen(false);
  };

  const handleInstallApp = async () => {
    const success = await installApp();
    if (success) {
      console.log('App installed successfully');
    }
  };
  
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setStreamingMessage(null);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!hasApiKey) {
      setIsSettingsOpen(true);
      return;
    }

    let targetConversationId = currentConversationId;
    if (!targetConversationId) {
      const newConversation: Conversation = { id: generateId(), title: generateConversationTitle(content), messages: [], createdAt: new Date(), updatedAt: new Date() };
      setConversations(prev => [newConversation, ...prev]);
      targetConversationId = newConversation.id;
      setCurrentConversationId(targetConversationId);
    }

    const userMessage: Message = { id: generateId(), content, role: 'user', timestamp: new Date() };
    setConversations(prev => prev.map(conv => {
      if (conv.id === targetConversationId) {
        const updatedMessages = [...conv.messages, userMessage];
        const updatedTitle = conv.messages.length === 0 ? generateConversationTitle(content) : conv.title;
        return { ...conv, title: updatedTitle, messages: updatedMessages, updatedAt: new Date() };
      }
      return conv;
    }));

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const assistantMessage: Message = { id: generateId(), content: '', role: 'assistant', timestamp: new Date(), model: settings.selectedModel };
      setStreamingMessage(assistantMessage);

      const conversationHistory = conversations.find(c => c.id === targetConversationId)?.messages || [];
      const messages = [...conversationHistory, userMessage].map(msg => ({ role: msg.role, content: msg.content }));

      let fullResponse = '';
      for await (const chunk of aiService.generateStreamingResponse(messages, selectedLanguage, abortControllerRef.current.signal)) {
        fullResponse += chunk;
        setStreamingMessage(prev => prev ? { ...prev, content: fullResponse } : null);
      }

      const finalAssistantMessage: Message = { ...assistantMessage, content: fullResponse };
      setConversations(prev => prev.map(conv => (conv.id === targetConversationId) ? { ...conv, messages: [...conv.messages, finalAssistantMessage], updatedAt: new Date() } : conv));
    } catch (error: any) {
      if (error.name !== 'AbortError') console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setStreamingMessage(null);
      abortControllerRef.current = null;
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        return { ...conv, messages: conv.messages.map(msg => msg.id === messageId ? { ...msg, content: newContent } : msg), updatedAt: new Date() };
      }
      return conv;
    }));
  };

  const handleRegenerateResponse = async (messageId: string) => {
    // ...
  };

  return (
    <div className="h-screen flex bg-[var(--color-bg)] text-[var(--color-text-primary)] relative overflow-hidden">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        isSidebarFolded={sidebarFolded}
      />
      
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onOpenSettings={() => setIsSettingsOpen(prev => !prev)}
          settings={settings}
          onModelChange={handleModelChange}
          onCloseSidebar={() => setSidebarOpen(false)}
          isFolded={sidebarFolded}
          onToggleFold={handleToggleFold}
        />
      )}

      <div className="flex-1 flex flex-col relative">
        {!sidebarOpen && (
            <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 p-2 bg-[var(--color-card)] rounded-lg z-10 shadow-md hover:bg-[var(--color-border)] transition-colors"
            title={selectedLanguage === 'en' ? 'Open sidebar' : 'साइडबार उघडा'}
            >
            <Menu className="w-5 h-5 text-[var(--color-text-secondary)]" />
            </button>
        )}

        <ChatArea
          messages={currentConversation?.messages || []}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          streamingMessage={streamingMessage}
          hasApiKey={hasApiKey}
          model={settings.selectedModel}
          onEditMessage={handleEditMessage}
          onRegenerateResponse={handleRegenerateResponse}
          onStopGenerating={handleStopGenerating}
        />
      </div>

      {isInstallable && !isInstalled && (
        <InstallPrompt
          onInstall={handleInstallApp}
          onDismiss={dismissInstallPrompt}
        />
      )}
    </div>
  );
}

export default App;
