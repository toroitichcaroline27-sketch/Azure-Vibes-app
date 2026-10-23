import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  Languages,
  Zap,
  HelpCircle
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

type LanguageOption = 'english' | 'sheng' | 'swahili' | 'pidgin' | 'yoruba' | 'zulu' | 'french';

const LANGUAGES: { id: LanguageOption; label: string; flag: string; badge: string }[] = [
  { id: 'english', label: 'English (African Analogies)', flag: '🌍', badge: 'English + Analogies' },
  { id: 'sheng', label: 'Kenyan Sheng (Nairobi)', flag: '🇰🇪', badge: 'Sheng' },
  { id: 'swahili', label: 'Kiswahili', flag: '🇰🇪', badge: 'Kiswahili' },
  { id: 'pidgin', label: 'Nigerian Pidgin', flag: '🇳🇬', badge: 'Pidgin' },
  { id: 'yoruba', label: 'Yorùbá', flag: '🇳🇬', badge: 'Yoruba' },
  { id: 'zulu', label: 'isiZulu', flag: '🇿🇦', badge: 'isiZulu' },
  { id: 'french', label: 'Français', flag: '🇫🇷', badge: 'Français' },
];

const PRESET_PROMPTS_BY_LANG: Record<LanguageOption, string[]> = {
  english: [
    'Explain M-Pesa transaction surges vs Azure Auto-scaling & Elasticity.',
    'Explain CapEx vs OpEx like I am 10 years old with a real-world story.',
    'How do I remember Azure Policy vs RBAC for the AZ-900 exam?',
    'Explain Lagos traffic jams vs Azure Traffic Manager and Load Balancer.',
    'When should a company choose ExpressRoute instead of a VPN Gateway?',
    'Explain Blob Storage Hot, Cool, Cold, and Archive tiers simply.'
  ],
  sheng: [
    'Nielezee CapEx vs OpEx na story ya matatu na boda boda!',
    'Msee, nielezee tofauti ya Azure Policy na RBAC kwa Sheng!',
    'Elasticity vs Scalability inamaanisha nini ukitumia M-Pesa?',
    'Availability Zones ni kama nini Nai wakati KPLC imekata stima?',
    'IaaS vs PaaS vs SaaS kwa lugha ya mtaani'
  ],
  swahili: [
    'Eleza tofauti kati ya CapEx na OpEx kwa mfano wa biashara za kawaida.',
    'Azure Availability Zones ni nini na zinasaidia vipi wakati wa hitilafu ya umeme?',
    'Eleza tofauti ya Azure Policy na Azure RBAC kwa Kiswahili fasaha.',
    'Mfano wa M-Pesa kuelezea Elasticity na Scalability katika Cloud.',
    'Ufafanuzi rahisi wa IaaS, PaaS na SaaS kwa Kiswahili'
  ],
  pidgin: [
    'How far! Explain CapEx vs OpEx with Nigerian business story.',
    'Make you break down Azure Policy vs RBAC for me sharp-sharp.',
    'How Lagos Danfo traffic relate to Azure Traffic Manager & Load Balancer?',
    'Explain Availability Zones like generator backup for shop.',
    'Wetin be the difference between IaaS, PaaS and SaaS?'
  ],
  yoruba: [
    'Ṣe alaye iyatọ laarin CapEx ati OpEx pẹlu apẹẹrẹ ti o rọrun.',
    'Kini iyatọ laarin Azure Policy ati RBAC fun idanwo AZ-900?',
    'Bawo ni a ṣe le loye Availability Zones ninu Azure?'
  ],
  zulu: [
    'Chaza umehluko phakathi kwe-CapEx ne-OpEx usebenzisa izibonelo zangempela.',
    'Kusho ukuthini i-Availability Zones uma kubhekwa i-load shedding?',
    'Ngiyikhumbula kanjani i-Azure Policy ne-RBAC ku-AZ-900?'
  ],
  french: [
    'Expliquez la différence entre CapEx et OpEx avec un exemple concret.',
    'Comment différencier Azure Policy et Azure RBAC pour l\'examen AZ-900 ?',
    'Expliquez les Availability Zones avec l\'analogie d\'un réseau électrique.'
  ]
};

export const AIStudyBuddyView: React.FC<AIStudyBuddyViewProps> = ({
  initialPrompt,
  onClearInitialPrompt
}) => {
  const [language, setLanguage] = useState<LanguageOption>('english');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Hello cloud developer! 👋 I'm **AzureVibe AI Coach** for the **#1MillionDevs Movement**.

I specialize in translating abstract Microsoft Azure architecture into **crystal-clear real-world African analogies** and highlighting sneaky **exam traps** so you pass AZ-900 with flying colors!

Ask me in your preferred language or dialect:
- 🌍 **English** with relatable African infrastructure analogies (M-Pesa, Boda Boda, Lagos traffic)
- 🇰🇪 **Kenyan Sheng** (Nairobi urban street vibe)
- 🇰🇪 **Kiswahili** fasaha
- 🇳🇬 **Nigerian Pidgin** (Make we break am down!)
- 🇳🇬 **Yorùbá** | 🇿🇦 **isiZulu** | 🇫🇷 **Français**

Pick a dialect chip above or ask any AZ-900 question below! 🚀`,
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
          conversationHistory: history,
          language
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
        text: '⚠️ I encountered an issue connecting to the AI Coach. Please verify your Groq API key in .env or try again.',
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

  const currentPresets = PRESET_PROMPTS_BY_LANG[language] || PRESET_PROMPTS_BY_LANG.english;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-210px)] min-h-[580px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-emerald-900 text-white border-b border-emerald-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-emerald-500/30 p-0.5 border border-emerald-400/40 shadow-sm">
            <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-emerald-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">AzureVibe AI Study Buddy</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 fill-emerald-300 text-emerald-300" />
                Groq Fast Inference
              </span>
            </div>
            <p className="text-xs text-emerald-200/80">
              #1MillionDevs · African Analogies & Local Language Explanations
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="text-xs text-emerald-200 hover:text-white flex items-center gap-1 cursor-pointer px-2.5 py-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Language / Dialect Selector Bar */}
      <div className="px-4 py-2.5 bg-emerald-50/80 border-b border-emerald-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 shrink-0 flex items-center gap-1">
          <Languages className="w-3.5 h-3.5 text-emerald-700" /> Language:
        </span>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              language === lang.id
                ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600'
                : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100/70'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.badge}</span>
          </button>
        ))}
      </div>

      {/* Preset Quick Chips Bar */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Quick Prompts:
        </span>
        {currentPresets.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:text-emerald-700 hover:border-emerald-400 whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {isUser ? 'You' : <Bot className="w-4 h-4 text-emerald-700" />}
              </div>

              <div className={`relative max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                isUser
                  ? 'bg-emerald-700 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}>
                {/* Content formatted */}
                <div className="whitespace-pre-wrap font-normal">
                  {msg.text}
                </div>

                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                      title="Copy explanation"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">Copied</span>
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
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce text-emerald-700" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-slate-200 text-xs text-slate-600 flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>AzureVibe AI Coach is formulating a real-world analogy in {LANGUAGES.find(l => l.id === language)?.label}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
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
            placeholder={`Ask in ${LANGUAGES.find(l => l.id === language)?.label} (e.g. 'Explain CapEx vs OpEx' or 'What is an Availability Zone?')...`}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
