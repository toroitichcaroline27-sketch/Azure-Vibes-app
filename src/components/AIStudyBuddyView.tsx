import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Lightbulb, 
  RotateCcw, 
  Copy, 
  Check, 
  HelpCircle,
  Cloud,
  Compass
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface AIStudyBuddyViewProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

const PRESET_PROMPTS = [
  'What is the difference between a Fault Domain and an Update Domain?',
  'Explain CapEx vs OpEx like I am 10 years old with a real-world story.',
  'How do I remember Azure Policy vs RBAC for the AZ-900 exam?',
  'Give me an M-Pesa or ride-hailing analogy for Azure Elasticity vs Scalability.',
  'When should a company choose ExpressRoute instead of a VPN Gateway?',
  'Explain Blob Storage Hot, Cool, Cold, and Archive tiers simply.'
];

export const AIStudyBuddyView: React.FC<AIStudyBuddyViewProps> = ({
  initialPrompt,
  onClearInitialPrompt
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Hello cloud developer! 👋 I'm **AzureVibe AI Coach** for the **#1MillionDevs Movement**.

I specialize in translating abstract Microsoft Azure architecture into **crystal-clear real-world analogies** and highlighting the sneaky **exam traps** so you pass AZ-900 with confidence.

Ask me anything about:
- **Cloud Concepts:** CapEx vs OpEx, Shared Responsibility, High Availability
- **Architecture & Services:** Availability Zones, VMs, Containers, Storage Tiers, VNets
- **Governance & Management:** Azure Policy vs RBAC, Defender, TCO vs Pricing Calculator

Or pick one of the quick prompts below to get started! 🚀`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          conversationHistory: history
        })
      });

      const data = await res.json();
      if (data.success && data.answer) {
        const modelMsg: Message = {
          id: 'model-' + Date.now(),
          role: 'model',
          text: data.answer,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, modelMsg]);
      } else {
        throw new Error(data.error || 'Failed to get answer');
      }
    } catch (err: any) {
      console.error('Error asking AI Coach:', err);
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        role: 'model',
        text: '⚠️ I encountered an error connecting to the AI Coach. Please try again or check your query.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-210px)] min-h-[550px] flex flex-col azure-glass rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-fadeIn">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">AzureVibe AI Study Buddy</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Powered by Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Plain-English analogies & exam trap alerts for AZ-900
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Preset Quick Chips Bar */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Prompts:
        </span>
        {PRESET_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-800 text-cyan-400 border border-slate-700'
              }`}>
                {isUser ? 'You' : <Bot className="w-4 h-4" />}
              </div>

              <div className={`relative max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                isUser
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'azure-glass-card border border-slate-800/90 text-slate-200 rounded-tl-none shadow-md'
              }`}>
                {/* Content formatted */}
                <div className="whitespace-pre-wrap font-normal">
                  {msg.text}
                </div>

                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      title="Copy explanation"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="azure-glass-card rounded-2xl rounded-tl-none p-4 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>AzureVibe AI Coach is crafting a beginner-friendly analogy...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (e.g. 'Explain Azure Virtual Desktop vs VM' or 'Give an analogy for PaaS')..."
            className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
