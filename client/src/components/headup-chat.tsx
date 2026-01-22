'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface HeadsUpChatProps {
  project?: string;
  apiBaseUrl?: string;
  onClose?: () => void;
}

export function HeadsUpChat({ project, apiBaseUrl = '', onClose }: HeadsUpChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/headsup/chat?appSlug=${encodeURIComponent(project || 'work-hub')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');

      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="headup-chat-container" data-testid="headup-chat">
      {/* Header */}
      <div className="headup-chat-header">
        <div className="headup-chat-title">
          <span className="headup-chat-icon">💬</span>
          <span>AI Assistant</span>
          {project && <span className="headup-chat-project">({project})</span>}
        </div>
        <div className="headup-chat-actions">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="headup-chat-clear-btn"
              data-testid="clear-chat-button"
              title="Clear chat"
            >
              Clear
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="headup-chat-close-btn"
              title="Close chat"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="headup-chat-messages" data-testid="chat-messages">
        {messages.length === 0 && (
          <div className="headup-chat-empty">
            <p>👋 Hello! I'm your HeadsUp AI Assistant.</p>
            <p>Ask me anything about this project!</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`headup-chat-message headup-chat-message-${message.role}`}
            data-testid={`chat-message-${message.role}`}
          >
            <div className="headup-chat-message-avatar">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="headup-chat-message-content">
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="headup-chat-message headup-chat-message-assistant">
            <div className="headup-chat-message-avatar">🤖</div>
            <div className="headup-chat-message-content">
              <Loader2 className="headup-chat-loading-spinner" size={16} />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="headup-chat-error" data-testid="chat-error">
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="headup-chat-input-container">
        <input
          ref={inputRef}
          type="text"
          className="headup-chat-input"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          data-testid="chat-input"
        />
        <button
          onClick={sendMessage}
          className="headup-chat-send-btn"
          disabled={!input.trim() || isLoading}
          data-testid="send-button"
          title="Send message"
        >
          {isLoading ? (
            <Loader2 className="headup-chat-loading-spinner" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>

      <style jsx>{`
        .headup-chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .headup-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .headup-chat-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .headup-chat-icon {
          font-size: 20px;
        }

        .headup-chat-project {
          font-size: 12px;
          opacity: 0.8;
          font-weight: normal;
        }

        .headup-chat-actions {
          display: flex;
          gap: 8px;
        }

        .headup-chat-clear-btn,
        .headup-chat-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 12px;
        }

        .headup-chat-clear-btn:hover,
        .headup-chat-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .headup-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f9fafb;
        }

        .headup-chat-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6b7280;
          text-align: center;
          gap: 8px;
        }

        .headup-chat-message {
          display: flex;
          gap: 12px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .headup-chat-message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .headup-chat-message-user .headup-chat-message-avatar {
          background: #e0e7ff;
        }

        .headup-chat-message-assistant .headup-chat-message-avatar {
          background: #dbeafe;
        }

        .headup-chat-message-content {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .headup-chat-message-user .headup-chat-message-content {
          background: #e0e7ff;
        }

        .headup-chat-loading-spinner {
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .headup-chat-error {
          background: #fee2e2;
          color: #991b1b;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #dc2626;
        }

        .headup-chat-input-container {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .headup-chat-input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .headup-chat-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .headup-chat-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .headup-chat-send-btn {
          padding: 10px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .headup-chat-send-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: scale(1.05);
        }

        .headup-chat-send-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .headup-chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}
