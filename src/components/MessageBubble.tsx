import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Smile, Sparkles, Copy, Check, Edit2, RefreshCcw, Save, X } from 'lucide-react';
import { Message } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  model?: 'google' | 'zhipu' | 'mistral-small' | 'mistral-codestral';
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateResponse?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isStreaming = false,
  model,
  onEditMessage,
  onRegenerateResponse
}: MessageBubbleProps) {
  const { selectedLanguage } = useContext(LanguageContext);
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isEditing, setIsEditing] = useState(message.isEditing || false);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout>();

  const displayModel = isUser ? undefined : (
    message.model ||
    (model === 'mistral-small' ? 'Misty Ma\'am' :
     model === 'mistral-codestral' ? 'Cody Sir' :
     model === 'google' ? 'Gemma Ma\'am' : 'Zhipu Sir')
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, [message.content]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditContent(message.content);
  }, [message.content]);

  const handleSaveEdit = useCallback(() => {
    if (editContent.trim() !== message.content && onEditMessage) {
      onEditMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  }, [editContent, message.content, message.id, onEditMessage]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent(message.content);
  }, [message.content]);

  const handleRegenerate = useCallback(() => {
    if (onRegenerateResponse) {
      onRegenerateResponse(message.id);
    }
  }, [message.id, onRegenerateResponse]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (bubbleRef.current) {
      bubbleRef.current.style.transform = 'translateY(20px)';
      bubbleRef.current.style.opacity = '0';
      const timeout = setTimeout(() => {
        if (bubbleRef.current) {
          bubbleRef.current.style.transform = 'translateY(0)';
          bubbleRef.current.style.opacity = '1';
        }
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <div
      ref={bubbleRef}
      className={`flex gap-3 mb-2 ${isUser ? 'justify-end' : 'justify-start'} group transition-all duration-300 ease-out`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          {model === 'google' && <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
          {model === 'zhipu' && <Smile className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
          {model === 'mistral-small' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
              <path d="M12 2a3 3 0 0 0-3 3c0 1.5-1.5 3-3 3s-3-1.5-3-3a3 3 0 0 0-3 3c0 1.5 1.5 3 3 3s3 1.5 3 3a3 3 0 0 0 3 3c0 1.5 1.5 3 3 3s3-1.5 3-3a3 3 0 0 0 3-3c0-1.5-1.5-3-3-3s-3 1.5-3 3a3 3 0 0 1-3 3z"></path>
            </svg>
          )}
          {model === 'mistral-codestral' && (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
              <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"></path>
            </svg>
          )}
        </div>
      )}
      <div
        className={`relative max-w-[80%] p-4 rounded-xl bg-gray-200 dark:bg-gray-300 ${
          isUser ? 'text-black font-semibold' : 'text-black font-medium'
        }`}
      >
        {!isUser && displayModel && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
            {displayModel}
          </div>
        )}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[100px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black font-medium"
              placeholder={selectedLanguage === 'en' ? 'Edit your message...' : 'आपला संदेश संपादित करा...'}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                <X className="w-3 h-3" />
                {selectedLanguage === 'en' ? 'Cancel' : 'रद्द करा'}
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                disabled={editContent.trim() === message.content || !editContent.trim()}
              >
                <Save className="w-3 h-3" />
                {selectedLanguage === 'en' ? 'Save' : 'जतन करा'}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedLanguage === 'en'
                ? 'Press Ctrl+Enter to save, Escape to cancel'
                : 'जतन करण्यासाठी Ctrl+Enter दाबा, रद्द करण्यासाठी Escape दाबा'}
            </p>
          </div>
        ) : (
          <div className={`prose prose-base max-w-none leading-relaxed ${isUser ? 'font-semibold' : ''}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md my-2"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-300 dark:bg-gray-600 px-1.5 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-4">
                      <table className="border-collapse border border-gray-300 dark:border-gray-600 w-full">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-600 font-medium">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return <td className="border border-gray-300 dark:border-gray-600 p-2">{children}</td>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse ml-1"></span>
            )}
          </div>
        )}
        {!isEditing && !isStreaming && message.content.length > 0 && (
          <div className={`absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
            {!isUser && onRegenerateResponse && (
              <button
                onClick={handleRegenerate}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                title={selectedLanguage === 'en' ? 'Regenerate response' : 'प्रतिसाद पुन्हा तयार करा'}
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            )}
            {onEditMessage && (
              <button
                onClick={handleEdit}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                title={selectedLanguage === 'en' ? 'Edit message' : 'संदेश संपादित करा'}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {!isUser && (
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                title={selectedLanguage === 'en' ? 'Copy message' : 'संदेश कॉपी करा'}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-600 dark:bg-gray-500">
          <Smile className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
