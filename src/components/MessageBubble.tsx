// ... (all your existing imports and interface)

export function MessageBubble({
  message,
  isStreaming = false,
  model,
  onEditMessage,
  onRegenerateResponse
}: MessageBubbleProps) {
  // ... (all your existing state and refs)

  // Use the model stored in the message for assistant messages, fallback to current model
  const displayModel = isUser ? undefined : (message.model || model);

  // ... (all your existing handlers: handleCopy, handleEdit, handleSaveEdit, handleCancelEdit, handleRegenerate)

  // ... (all your existing useEffects)

  return (
    <div
      ref={bubbleRef}
      className={`flex gap-3 mb-2 ${isUser ? 'justify-end' : 'justify-start'} group transition-all duration-300 ease-out`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
      )}

      <div
        className={`relative max-w-[80%] p-4 rounded-xl bg-gray-200 dark:bg-gray-300 ${
          isUser ? 'text-black font-semibold' : 'text-black font-medium'
        }`}
      >
        {/* Only show model name for assistant messages and use the stored model */}
        {!isUser && displayModel && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
            {displayModel === 'google' ? 'Google Gemini' : 'ZhipuAI'}
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
              placeholder="Edit your message..."
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                disabled={editContent.trim() === message.content || !editContent.trim()}
              >
                <Save className="w-3 h-3" />
                Save
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Press Ctrl+Enter to save, Escape to cancel
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

        {/* Action buttons - Only show for non-editing, non-streaming messages with content */}
        {!isEditing && !isStreaming && message.content.length > 0 && (
          <div className={`absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
            {/* Regenerate button - Only for assistant messages */}
            {!isUser && onRegenerateResponse && (
              <button
                onClick={handleRegenerate}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                title="Regenerate response"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            )}
            {/* Edit button - Available for all messages */}
            {onEditMessage && (
              <button
                onClick={handleEdit}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                title="Edit message"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {/* Copy button - Only for assistant messages */}
            {!isUser && (
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
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
