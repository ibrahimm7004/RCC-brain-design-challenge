"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Bot, User, Copy, RotateCcw, Check } from 'lucide-react';
import clsx from 'clsx';

type AnimationStyle = 'claude' | 'chatgpt' | 'gemini' | 'smooth';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  onRetry?: () => void;
  isStreaming?: boolean;
  messageId?: string;
  animationStyle?: AnimationStyle;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  onRetry,
  isStreaming = false,
  messageId,
  animationStyle = 'smooth'
}) => {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [displayedStable, setDisplayedStable] = useState('');
  const [fadingChunk, setFadingChunk] = useState('');
  const [fadeOn, setFadeOn] = useState(true);
  const displayedContent = useMemo(() => displayedStable + fadingChunk, [displayedStable, fadingChunk]);

  const contentRef = useRef(content);
  contentRef.current = content;

  const displayedRef = useRef(displayedContent);
  displayedRef.current = displayedContent;
  useEffect(() => {
    displayedRef.current = displayedStable + fadingChunk;
  }, [displayedStable, fadingChunk]);
  contentRef.current = content;

  useEffect(() => {
    // User messages render instantly
    if (isUser) {
      setDisplayedStable(content);
      setFadingChunk('');
      setFadeOn(false);
      return;
    }

    // Fresh start for a new assistant message
    setDisplayedStable('');
    setFadingChunk('');
    setFadeOn(false);

    let cancelled = false;
    let tickTimer: number | null = null;
    let mergeTimer: number | null = null;
    let rafId: number | null = null;

    const baseDelay = () => {
      switch (animationStyle) {
        case 'claude':
          return 20; // Fast words
        case 'chatgpt':
          return 18; // Brisk small bursts
        case 'gemini':
          return 60; // Deliberate, let fade read well
        case 'smooth':
        default:
          return 14; // Fast, silky char-by-char
      }
    };

    const nextChunk = (remaining: string) => {
      switch (animationStyle) {
        case 'claude': {
          // Word-by-word, pretty fast
          const m = remaining.match(/^\s*\S+/);
          return m ? m[0] : remaining;
        }
        case 'chatgpt': {
          // Classic brisk feel: 2–4 chars per tick (variable), continuous stream
          const n = 2 + Math.floor(Math.random() * 3); // 2..4
          return remaining.slice(0, n);
        }
        case 'gemini': {
          // Chunk-by-chunk: 1–3 words
          const m = remaining.match(/^\s*\S+(?:\s+\S+){0,2}/);
          return m ? m[0] : remaining;
        }
        case 'smooth':
        default: {
          // Char-by-char, fast pace
          return remaining.slice(0, 1);
        }
      }
    };

    const punctuationPause = (chunk: string) => {
      const last = chunk.trim().slice(-1);
      let extra = 0;
      if (/[\.!?]/.test(last)) extra += 170;
      if (/[;:]/.test(last)) extra += 100;
      if (/\n/.test(chunk)) extra += 150;
      return extra;
    };

    const tick = () => {
      if (cancelled) return;
      const target = contentRef.current || '';
      const current = displayedRef.current || '';

      if (current.length >= target.length) {
        return; // Complete
      }

      const remaining = target.slice(current.length);
      const chunk = nextChunk(remaining);

      if (animationStyle === 'gemini') {
        // Fade-in the chunk, then merge it into the stable text
        const fadeDuration = 200; // ms
        setFadingChunk(chunk);
        setFadeOn(false);
        rafId = requestAnimationFrame(() => setFadeOn(true));

        mergeTimer = window.setTimeout(() => {
          setDisplayedStable(prev => prev + chunk);
          setFadingChunk('');
          setFadeOn(false);
        }, fadeDuration);

        const jitter = Math.random() * 25;
        const extra = punctuationPause(chunk);
        tickTimer = window.setTimeout(tick, fadeDuration + baseDelay() + jitter + extra);
        return;
      }

      // Non-Gemini styles: append directly
      setDisplayedStable(prev => prev + chunk);
      const jitter = Math.random() * 20;
      const extra = punctuationPause(chunk);
      tickTimer = window.setTimeout(tick, baseDelay() + jitter + extra);
    };

    // Kick off
    tickTimer = window.setTimeout(tick, 200);

    return () => {
      cancelled = true;
      if (tickTimer) window.clearTimeout(tickTimer);
      if (mergeTimer) window.clearTimeout(mergeTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [animationStyle, isUser, messageId, content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const bubbleClasses = clsx(
    'inline-block max-w-full p-4 rounded-2xl shadow-sm',
    {
      'bg-primary-gradient text-white rounded-br-lg': isUser,
      'bg-white dark:bg-charcoal text-charcoal dark:text-off-white rounded-bl-lg': !isUser,
    }
  );

  const getCursorAnimation = () => {
    // Show cursor if streaming and not fully displayed
    if (!isStreaming || displayedContent.length >= content.length) return '';

    switch (animationStyle) {
      case 'claude':
        return 'after:content-["▍"] after:ml-0.5 after:animate-pulse after:text-sage after:font-bold';
      case 'chatgpt':
        return 'after:content-["█"] after:ml-0.5 after:animate-pulse after:text-clay-red';
      case 'gemini':
        return 'after:content-["●"] after:ml-0.5 after:animate-bounce after:text-sand';
      case 'smooth':
        return 'after:content-["|"] after:ml-0.5 after:animate-pulse after:text-medium-gray after:transition-all after:duration-75 after:ease-in-out';
      default:
        return 'after:content-["|"] after:ml-0.5 after:animate-pulse after:text-medium-gray';
    }
  };

  return (
    <div className={`group w-full py-3`} role="article" aria-labelledby={`message-${messageId}`}>
      <div className="max-w-4xl mx-auto px-6">
        <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isUser ? 'bg-primary-gradient' : 'bg-secondary-gradient'} text-white`}>
            {isUser ? <User size={18} /> : <Bot size={18} />}
          </div>
          <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <span className="font-semibold text-sm text-charcoal dark:text-off-white">{isUser ? 'You' : 'Oracle Assistant'}</span>
              <span className="text-xs text-medium-gray">{timestamp}</span>
            </div>
            <div className={`${isUser ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-full p-4 rounded-2xl shadow-sm ${isUser
                ? 'bg-primary-gradient text-white rounded-br-lg'
                : 'bg-white dark:bg-charcoal text-charcoal dark:text-off-white rounded-bl-lg'
                }`}>
                <div className={`leading-relaxed whitespace-pre-wrap ${getCursorAnimation()}`}>
                  {/* Render the stable, already-animated part of the message */}
                  <span>{displayedStable}</span>
                  
                  {/* Render the new chunk with the fade-in effect for Gemini */}
                  {fadingChunk && (
                    <span className={fadeOn ? 'animate-fade-in-word' : 'opacity-0'}>
                      {fadingChunk}
                    </span>
                  )}
                  
                  {/* Show "Thinking..." placeholder only if there's no content yet */}
                  {displayedContent.length === 0 && isStreaming && (
                    <span className="opacity-60">Thinking...</span>
                  )}
                </div>
              </div>
            </div>
            {!isStreaming && content && (
              <div className={`mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isUser ? 'text-right' : 'text-left'}`}>
                <div className="inline-flex items-center gap-1">
                  <button onClick={handleCopy}
                    aria-label={copied ? "Message copied" : `Copy assistant's message`}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-medium-gray hover:text-charcoal dark:hover:text-off-white rounded-md hover:bg-light-gray dark:hover:bg-charcoal/50">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  {!isUser && onRetry && (
                    <button
                      onClick={onRetry}
                      aria-label="Retry generating this response"
                      className="flex items-center gap-1 px-2 py-1 text-xs text-medium-gray hover:text-charcoal dark:hover:text-off-white rounded-md hover:bg-light-gray dark:hover:bg-charcoal/50">
                      <RotateCcw size={12} />
                      <span>
                        Retry
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};