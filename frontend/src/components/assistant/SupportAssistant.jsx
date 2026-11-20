import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { assistantService } from '../../services/store.service.js';
import { siteConfig } from '../../config/site.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';

const GREETING =
  "Hi, I'm the Sharon Glow assistant. Ask me about our oils, delivery, payment or how ordering works.";

const SUGGESTIONS = [
  'What oils do you sell?',
  'How much is delivery?',
  'How do I pay?',
  'Track my order',
];

export function SupportAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    inputRef.current?.focus();

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    const node = scrollRef.current;

    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, isSending, isOpen]);

  async function sendQuestion(question) {
    const text = question.trim();

    if (!text || isSending) {
      return;
    }

    const conversation = [...messages, { role: 'user', content: text }];

    setMessages(conversation);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const { reply } = await assistantService.chat(conversation.slice(-8));
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, 'Our assistant could not answer just now. Please try again.'),
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendQuestion(input);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={false}
        className="fixed bottom-22 right-5 z-40 flex items-center gap-2 rounded-full bg-forest px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ivory shadow-soft transition hover:-translate-y-0.5 hover:bg-forest-light"
      >
        <Sparkles className="size-4 text-gold" aria-hidden="true" />
        Ask us
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Shop assistant"
      className="fixed bottom-4 left-3 right-3 z-50 flex h-[min(30rem,calc(100vh-7rem))] flex-col overflow-hidden rounded-[1.75rem] border border-forest/10 bg-surface shadow-2xl sm:bottom-5 sm:left-auto sm:right-5 sm:w-[23rem]"
    >
      <header className="flex items-center justify-between gap-3 border-b border-forest/10 bg-forest px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-ivory/10">
            <Sparkles className="size-4 text-gold" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ivory">Glow assistant</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-ivory/50">
              Products, delivery, orders
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close assistant"
          className="grid size-8 place-items-center rounded-full border border-ivory/20 text-ivory/70 transition hover:border-ivory/50 hover:text-ivory"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </header>

      <div
        ref={scrollRef}
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto bg-ivory/40 px-4 py-4"
      >
        {messages.map((message, index) => (
          <p
            key={`${message.role}-${index}`}
            className={
              message.role === 'user'
                ? 'ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-forest px-3.5 py-2.5 text-sm leading-relaxed text-ivory'
                : 'max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-forest/10 bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink shadow-sm'
            }
          >
            {message.content}
          </p>
        ))}

        {isSending && (
          <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-bl-sm border border-forest/10 bg-surface px-3.5 py-3 shadow-sm">
            <span className="size-1.5 animate-bounce rounded-full bg-forest/40 [animation-delay:-0.2s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-forest/40 [animation-delay:-0.1s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-forest/40" />
          </div>
        )}

        {error && <p className="text-xs text-rose-600">{error}</p>}

        {messages.length === 1 && !isSending && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendQuestion(suggestion)}
                className="rounded-full border border-forest/15 bg-surface px-3 py-1.5 text-[11px] font-semibold text-forest transition hover:border-forest hover:bg-forest hover:text-ivory"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-forest/10 bg-surface px-3 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={800}
            placeholder="Ask about an oil, delivery or an order"
            aria-label="Your question"
            className="min-w-0 flex-1 rounded-full border border-forest/15 bg-ivory/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-forest focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            aria-label="Send question"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-forest text-ivory transition hover:bg-forest-light disabled:opacity-50"
          >
            <Send className="size-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-ink/40">
          Automated answers • {siteConfig.email}
        </p>
      </form>
    </div>
  );
}
