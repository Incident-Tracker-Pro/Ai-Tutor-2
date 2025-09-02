import React, { useState, useEffect, useContext } from 'react';
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
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [sidebarFolded, setSidebarFolded] = useState(false);
  const { isInstallable, isInstalled, installApp, dismissInstallPrompt } = usePWA();

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
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('ai-tutor-sidebar-folded', JSON.stringify(sidebarFolded));
  }, [sidebarFolded]);

  const handleModelChange = (model: 'google' | 'zhipu' | 'mistral-small' | 'mistral-codestral') => {
    const newSettings = { ...settings, selectedModel: model };
    setSettings(newSettings);
    storageUtils.saveSettings(newSettings);
    aiService.updateSettings(newSettings, selectedLanguage);
  };

  const handleToggleSidebarFold = () => {
    setSidebarFolded(!sidebarFolded);
  };

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const hasApiKey = settings.googleApiKey || settings.zhipuApiKey || settings.mistralApiKey;

  const handleNewConversation = (isDocumentChat: boolean = false) => {
    const newConversation: Conversation = {
      id: generateId(),
      title: isDocumentChat
        ? (selectedLanguage === 'en' ? 'New Document Chat' : 'नवीन दस्तऐवज चॅट')
        : (selectedLanguage === 'en' ? 'New Chat' : 'नवीन चॅट'),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDocumentChat,
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleSaveSettings = (newSettings: APISettings) => {
    setSettings(newSettings);
    storageUtils.saveSettings(newSettings);
    aiService.updateSettings(newSettings, selectedLanguage);
  };

  const handleInstallApp = async () => {
    const success = await installApp();
    if (success) {
      console.log('App installed successfully');
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ');
    }
    return text;
  };

  const handleFileUpload = async (file: File) => {
    if (!currentConversationId) return;

    let content = '';
    if (file.type === 'application/pdf') {
      content = await extractTextFromPDF(file);
    } else {
      content = await file.text();
    }

    setConversations(prev =>
      prev.map(conv =>
        conv.id === currentConversationId
          ? {
              ...conv,
              documentName: file.name,
              messages: [
                ...conv.messages,
                {
                  id: generateId(),
                  content: `${selectedLanguage === 'en' ? 'Document uploaded:' : 'दस्तऐवज अपलोड केले:'} **${file.name}**\n\n${selectedLanguage === 'en' ? 'You can now ask questions about this document.' : 'तुम्ही आता या दस्तऐवजाबद्दल प्रश्न विचारण्यास सुरुवात करू शकता.'}`,
                  role: 'assistant',
                  timestamp: new Date(),
                },
              ],
            }
          : conv
      )
    );
  };

  const handleSendMessage = async (content: string) => {
    if (!hasApiKey) {
      setIsSettingsOpen(true);
      return;
    }

    let targetConversationId = currentConversationId;
    if (!targetConversationId) {
      const newConversation: Conversation = {
        id: generateId(),
        title: generateConversationTitle(content),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations(prev => [newConversation, ...prev]);
      targetConversationId = newConversation.id;
      setCurrentConversationId(targetConversationId);
    }

    const userMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === targetConversationId) {
        const updatedMessages = [...conv.messages, userMessage];
        const updatedTitle = conv.messages.length === 0 ? generateConversationTitle(content) : conv.title;
        return {
          ...conv,
          title: updatedTitle,
          messages: updatedMessages,
          updatedAt: new Date(),
        };
      }
      return conv;
    }));

    setIsLoading(true);

    try {
      const assistantMessage: Message = {
        id: generateId(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        model: settings.selectedModel,
      };

      setStreamingMessage(assistantMessage);

      const conversationHistory = currentConversation
        ? [...currentConversation.messages, userMessage]
        : [userMessage];

      const documentContext = currentConversation?.isDocumentChat
        ? `Use the following document context to answer the user's questions:\n\n${currentConversation.messages.find(m => m.role === 'assistant')?.content || ''}`
        : undefined;

      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullResponse = '';
      for await (const chunk of aiService.generateStreamingResponse(messages, selectedLanguage, documentContext)) {
        fullResponse += chunk;
        setStreamingMessage(prev => prev ? { ...prev, content: fullResponse } : null);
      }

      const finalAssistantMessage: Message = {
        ...assistantMessage,
        content: fullResponse,
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === targetConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, finalAssistantMessage],
            updatedAt: new Date(),
          };
        }
        return conv;
      }));

      setStreamingMessage(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setStreamingMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        return {
          ...conv,
          messages: conv.messages.map(msg =>
            msg.id === messageId ? { ...msg, content: newContent } : msg
          ),
          updatedAt: new Date(),
        };
      }
      return conv;
    }));
  };

  const handleRegenerateResponse = async (messageId: string) => {
    if (!currentConversation) return;

    const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex <= 0) return;

    const userMessage = currentConversation.messages[messageIndex - 1];
    const updatedMessages = currentConversation.messages.slice(0, messageIndex);

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        return {
          ...conv,
          messages: updatedMessages,
          updatedAt: new Date(),
        };
      }
      return conv;
    }));

    setIsLoading(true);

    try {
      const assistantMessage: Message = {
        id: generateId(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        model: settings.selectedModel,
      };

      setStreamingMessage(assistantMessage);

      const documentContext = currentConversation.isDocumentChat
        ? `Use the following document context to answer the user's questions:\n\n${currentConversation.messages.find(m => m.role === 'assistant')?.content || ''}`
        : undefined;

      const messages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullResponse = '';
      for await (const chunk of aiService.generateStreamingResponse(messages, selectedLanguage, documentContext)) {
        fullResponse += chunk;
        setStreamingMessage(prev => prev ? { ...prev, content: fullResponse } : null);
      }

      const finalAssistantMessage: Message = {
        ...assistantMessage,
        content: fullResponse,
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...updatedMessages, finalAssistantMessage],
            updatedAt: new Date(),
          };
        }
        return conv;
      }));

      setStreamingMessage(null);
    } catch (error) {
      console.error('Error regenerating response:', error);
      setStreamingMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settings={settings}
          onModelChange={handleModelChange}
          onCloseSidebar={() => setSidebarOpen(false)}
          isFolded={sidebarFolded}
          onToggleFold={handleToggleSidebarFold}
        />
      )}

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 p-2 bg-gray-600 dark:bg-gray-700 rounded-lg z-50 shadow-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          title={selectedLanguage === 'en' ? 'Open sidebar' : 'साइडबार उघडा'}
        >
          <Menu className="w-5 h-5 text-white" />
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
        currentConversation={currentConversation}
        onFileUpload={handleFileUpload}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

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
