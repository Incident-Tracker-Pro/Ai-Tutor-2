import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Smile, Sparkles, Copy, Check, Edit2, RefreshCcw, Save, X } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  model?: 'google' | 'zhipu';
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
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isEditing, setIsEditing] = useState(message.isEditing || false);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout>();

  // Use the model stored in the message for assistant messages, fallback to current model
  const displayModel = isUser ? undefined : (message.model || model);

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

  // Auto-resize textarea with smooth transitions
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 300);
      textarea.style.height = `${newHeight}px`;
      textarea.focus();
    }
  }, [isEditing, editContent]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Smooth entrance animation
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
      className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'} group transition-all duration-300 ease-out`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 transition-all duration-200 hover:scale-105">
          <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
      )}

      <div
        className={`relative max-w-[80%] transition-all duration-200 ${
          isUser
            ? 'bg-gray-200 dark:bg-gray-300 text-black font-semibold rounded-2xl rounded-br-md'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 dark:border-gray-700'
        } ${isEditing ? 'ring-2 ring-blue-500/30' : ''} ${showActions ? 'shadow-lg' : ''}`}
      >
        {/* Model indicator for assistant messages */}
        {!isUser && displayModel && (
          <div className="px-4 pt-3 pb-1">
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
              displayModel === 'google'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
            }`}>
              {displayModel === 'google' ? (
                <>
                  <Sparkles className="w-3 h-3" />
                  Google Gemini
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  ZhipuAI
                </>
              )}
            </div>
          </div>
        )}

        <div className="p-4">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full min-h-[100px] max-h-[300px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium transition-all duration-200"
                placeholder="Edit your message..."
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-95"
                  disabled={editContent.trim() === message.content || !editContent.trim()}
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Press <kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+Enter</kbd> to save, <kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">Escape</kbd> to cancel
              </p>
            </div>
          ) : (
            <div className={`prose prose-base max-w-none leading-relaxed transition-all duration-200 ${
              isUser
                ? 'prose-invert font-semibold'
                : 'prose-gray dark:prose-invert'
            }`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="my-3 rounded-lg overflow-hidden shadow-sm">
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="!m-0 !bg-gray-900"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={`px-1.5 py-0.5 rounded text-sm font-medium transition-colors duration-200 ${
                        isUser
                          ? 'bg-blue-400/30 text-blue-100'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`} {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="border-collapse w-full">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className="border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800 text-left font-semibold">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return <td className="border-b border-gray-200 dark:border-gray-700 p-3">{children}</td>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <div className="inline-flex items-center gap-1 mt-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">AI is typing...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!isEditing && !isStreaming && message.content.length > 0 && (
          <div className={`absolute top-2 right-2 flex gap-1 transition-all duration-200 ${
            showActions ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-1 pointer-events-none'
          }`}>
            {!isUser && onRegenerateResponse && (
              <button
                onClick={handleRegenerate}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Regenerate response"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            )}
            {onEditMessage && (
              <button
                onClick={handleEdit}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Edit message"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {!isUser && (
              <button
                onClick={handleCopy}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Copy message"
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
