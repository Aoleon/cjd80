'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { HeadsUpChat } from './headup-chat';

export interface CockpitHeadsUpWithChatProps {
  enabled?: boolean;
  project?: string;
  apiBaseUrl?: string;
}

/**
 * CockpitHeadsUp with integrated AI chat
 * This is the enhanced version with chat functionality
 */
export function CockpitHeadsUpWithChat({
  enabled = false,
  project = 'unknown',
  apiBaseUrl = '',
}: CockpitHeadsUpWithChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      setIsOpen(false);
    }
  }, [enabled]);

  if (!enabled) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('headup-overlay-header')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, dragOffset]);

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className="headup-float-button"
          onClick={() => setIsOpen(true)}
          title="Open HeadsUp AI Assistant"
          data-testid="headup-toggle"
        >
          <MessageSquare size={24} />
          <span className="headup-float-badge">AI</span>
        </button>
      )}

      {/* Chat Overlay */}
      {isOpen && (
        <div
          className={`headup-overlay ${isMinimized ? 'headup-overlay-minimized' : ''}`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          data-testid="headup-overlay"
        >
          {/* Header */}
          <div
            className="headup-overlay-header"
            onMouseDown={handleMouseDown}
          >
            <div className="headup-overlay-title">
              <MessageSquare size={16} />
              <span>HeadsUp AI Assistant</span>
            </div>
            <div className="headup-overlay-controls">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="headup-overlay-control-btn"
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="headup-overlay-control-btn"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="headup-overlay-content">
              <HeadsUpChat
                project={project}
                apiBaseUrl={apiBaseUrl}
                onClose={() => setIsOpen(false)}
              />
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .headup-float-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
          z-index: 9998;
        }

        .headup-float-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }

        .headup-float-button:active {
          transform: scale(0.95);
        }

        .headup-float-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .headup-overlay {
          position: fixed;
          width: 400px;
          height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          transition: height 0.3s;
        }

        .headup-overlay-minimized {
          height: auto;
        }

        .headup-overlay-header {
          padding: 12px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: move;
          user-select: none;
        }

        .headup-overlay-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
        }

        .headup-overlay-controls {
          display: flex;
          gap: 8px;
        }

        .headup-overlay-control-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .headup-overlay-control-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .headup-overlay-content {
          flex: 1;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .headup-overlay {
            width: calc(100vw - 32px);
            height: calc(100vh - 100px);
            left: 16px !important;
            top: 16px !important;
          }

          .headup-float-button {
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>
    </>
  );
}
