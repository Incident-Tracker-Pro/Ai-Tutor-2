import React, { useEffect, useRef, useState } from 'react';
import { Bot } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Message } from '../types';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  streamingMessage?: Message | null;
  hasApiKey: boolean;
}

export function ChatArea({ messages, onSendMessage, isLoading, streamingMessage, hasApiKey }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, isTyping]);

  const allMessages = streamingMessage ? [...messages, streamingMessage] : messages;

  const handleEdit = (messageId: string, content: string) => {
    setEditMessageId(messageId);
    setEditContent(content);
  };

  const handleSaveEdit = (messageId: string) => {
    if (editContent.trim()) {
      onSendMessage(`[EDIT:${messageId}] ${editContent}`);
      setEditMessageId(null);
      setEditContent('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {allMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              How can I help you today?
            </h2>
            <p className="text-gray-600 mb-6">
              I'm your AI tutor, ready to help you learn and answer any questions you might have.
            </p>
            {!hasApiKey && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                <p className="text-sm text-yellow-800">
                  <strong>Setup Required:</strong> Please configure your API keys in Settings to start chatting.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {allMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={streamingMessage?.id === message.id}
                isTyping={isTyping}
                onEdit={handleEdit}
                editMessageId={editMessageId}
                editContent={editContent}
                onSaveEdit={handleSaveEdit}
              />
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500 mt-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                <span>Typing...</span>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      )}
      <div className="border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            disabled={!hasApiKey}
            onTyping={(typing) => setIsTyping(typing)}
          />
        </div>
      </div>
    </div>
  );
}
