import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Lightbulb, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  Filter,
  Bot
} from 'lucide-react';
import { Flashcard, AZDomain } from '../types';
import { fireCelebrationConfetti } from '../utils/confetti';

interface FlashcardViewProps {
  onAskAI: (prompt: string) => void;
  onUpdateStats?: () => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ onAskAI, onUpdateStats }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [domainFilter, setDomainFilter] = useState<'all' | AZDomain>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_practice' | 'mastered'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [generatingAiCard, setGeneratingAiCard] = useState<boolean>(false);

  useEffect(() => {
    fetchFlashcards();
  }, [domainFilter, statusFilter]);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/flashcards?domain=${domainFilter}&status=${statusFilter}`);
      const data = await res.json();
      if (data.success && data.flashcards) {
        setCards(data.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error('Error fetching flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleConfidence = async (status: 'mastered' | 'needs_practice') => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      const res = await fetch(`/api/flashcards/${currentCard.id}/confidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setCards(prev => prev.map(c => c.id === currentCard.id ? { ...c, status } : c));
        
        if (status === 'mastered') {
          fireCelebrationConfetti();
        }

        if (onUpdateStats) {
          onUpdateStats();
        }

        setTimeout(() => {
          if (currentIndex + 1 < cards.length) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
          } else {
            setIsFlipped(false);
          }
        }, 300);
      }
    } catch (err) {
      console.error('Error updating card confidence:', err);
    }
  };

  const handleGenerateAiFlashcard = async () => {
    setGeneratingAiCard(true);
    try {
      const res = await fetch('/api/ai/generate-flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: domainFilter === 'all' ? 'Availability Zones and SLAs' : domainFilter,
          domain: domainFilter === 'all' ? 'architecture' : domainFilter
        })
      });
      const data = await res.json();
      if (data.success && data.card) {
        setCards(prev => [data.card, ...prev]);
        setCurrentIndex(0);
        setIsFlipped(false);
        fireCelebrationConfetti();
      }
    } catch (err) {
      console.error('Error generating AI flashcard:', err);
    } finally {
      setGeneratingAiCard(false);
    }
  };

  const currentCard = cards[currentIndex];
  const masteredCount = cards.filter(c => c.status === 'mastered').length;
  const needsPracticeCount = cards.filter(c => c.status === 'needs_practice').length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Top Controls and Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-700 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-700" /> Domain:
          </span>
          <button
            onClick={() => setDomainFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              domainFilter === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setDomainFilter('concepts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              domainFilter === 'concepts'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
            }`}
          >
            1. Concepts
          </button>
          <button
            onClick={() => setDomainFilter('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              domainFilter === 'architecture'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
            }`}
          >
            2. Architecture
          </button>
          <button
            onClick={() => setDomainFilter('management')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              domainFilter === 'management'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
            }`}
          >
            3. Governance
          </button>
        </div>

        {/* Stats Pill & AI Flashcard button */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {masteredCount} Mastered
          </span>
          <span className="flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> {needsPracticeCount} Needs Practice
          </span>
          <button
            onClick={handleGenerateAiFlashcard}
            disabled={generatingAiCard}
            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Generate a high-yield flashcard with Groq AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>{generatingAiCard ? 'Generating...' : '+ AI Flashcard'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-md">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-800 font-bold text-sm">Shuffling flashcard deck...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-md">
          <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No flashcards found</h3>
          <p className="text-sm text-slate-600 mt-1">
            Try switching filters to view all domains.
          </p>
          <button
            onClick={() => { setDomainFilter('all'); setStatusFilter('all'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card Deck Progress */}
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>
              Card <strong className="text-slate-900 font-bold text-sm">{currentIndex + 1}</strong> of <strong className="text-slate-900">{cards.length}</strong>
            </span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> Click card to flip
            </span>
          </div>

          {/* 3D Flip Card Container */}
          <div 
            onClick={handleFlip}
            className="w-full min-h-[400px] perspective-1000 cursor-pointer select-none"
          >
            <div className={`relative w-full h-full min-h-[400px] rounded-2xl transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}>
              
              {/* FRONT OF CARD (High contrast, crisp text) */}
              <div className="absolute inset-0 w-full h-full bg-white rounded-2xl p-8 border-2 border-emerald-200 flex flex-col justify-between backface-hidden shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {currentCard?.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold ${
                      currentCard?.status === 'mastered'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : currentCard?.status === 'needs_practice'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {currentCard?.status === 'mastered' ? 'Mastered ✓' : currentCard?.status === 'needs_practice' ? 'Needs Practice ↺' : 'Unreviewed'}
                    </span>
                  </div>

                  <div className="my-10 text-center">
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
                      Official Microsoft Azure Concept
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                      {currentCard?.term}
                    </h2>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-emerald-700 font-bold">
                  <RotateCw className="w-4 h-4 text-emerald-600" />
                  <span>Click anywhere to reveal definition, analogy & exam trap</span>
                </div>
              </div>

              {/* BACK OF CARD (High contrast, clear sections) */}
              <div className="absolute inset-0 w-full h-full bg-white rounded-2xl p-6 sm:p-8 border-2 border-emerald-300 flex flex-col justify-between backface-hidden rotate-y-180 shadow-xl overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-sm font-black text-emerald-900 uppercase tracking-wider">
                      {currentCard?.term}
                    </span>
                    <span className="text-xs font-medium text-slate-500">Click to flip back</span>
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Definition:
                    </h4>
                    <p className="text-sm sm:text-base text-slate-900 font-medium leading-relaxed">
                      {currentCard?.summary}
                    </p>
                  </div>

                  {/* Key Takeaway */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-slate-800">
                    <strong className="text-emerald-950 font-bold block mb-1">Core Exam Takeaway:</strong>
                    {currentCard?.keyTakeaway}
                  </div>

                  {/* Analogy */}
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-950 font-bold block mb-1">Relatable Real-World Analogy:</strong>
                      {currentCard?.analogy}
                    </div>
                  </div>

                  {/* Common Exam Trap */}
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-950 font-bold block mb-1">⚠️ Common Exam Trap:</strong>
                      {currentCard?.commonExamTrap}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskAI(`Explain the Azure term "${currentCard?.term}" with more real-world examples and analogies`);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI Coach for deep-dive</span>
                  </button>
                  <span className="text-slate-500 font-medium">Rate your confidence below</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Confidence Rating Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => handleConfidence('needs_practice')}
              className="py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Needs Practice (Re-queue)</span>
            </button>

            <button
              onClick={() => handleConfidence('mastered')}
              className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Got It! (Mastered +15 XP)</span>
            </button>
          </div>

          {/* Navigation Prev / Next */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex(prev => Math.max(0, prev - 1));
                setIsFlipped(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              disabled={currentIndex >= cards.length - 1}
              onClick={() => {
                setCurrentIndex(prev => Math.min(cards.length - 1, prev + 1));
                setIsFlipped(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
