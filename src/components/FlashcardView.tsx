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
        // Update local card status
        setCards(prev => prev.map(c => c.id === currentCard.id ? { ...c, status } : c));
        
        if (status === 'mastered') {
          fireCelebrationConfetti();
        }

        if (onUpdateStats) {
          onUpdateStats();
        }

        // Advance to next card smoothly
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

  const currentCard = cards[currentIndex];
  const masteredCount = cards.filter(c => c.status === 'mastered').length;
  const needsPracticeCount = cards.filter(c => c.status === 'needs_practice').length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      {/* Top Controls and Filter Bar */}
      <div className="azure-glass rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Domain:
          </span>
          <button
            onClick={() => setDomainFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              domainFilter === 'all'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setDomainFilter('concepts')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              domainFilter === 'concepts'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Concepts
          </button>
          <button
            onClick={() => setDomainFilter('architecture')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              domainFilter === 'architecture'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Architecture
          </button>
          <button
            onClick={() => setDomainFilter('management')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              domainFilter === 'management'
                ? 'bg-indigo-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Governance
          </button>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {masteredCount} Mastered
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" /> {needsPracticeCount} Needs Practice
          </span>
        </div>
      </div>

      {loading ? (
        <div className="azure-glass-card rounded-2xl p-12 text-center border border-slate-800">
          <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-300 text-sm">Shuffling flashcard deck...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="azure-glass-card rounded-2xl p-10 text-center border border-slate-800">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No flashcards found</h3>
          <p className="text-sm text-slate-400 mt-1">
            Try switching filters to view all domains.
          </p>
          <button
            onClick={() => { setDomainFilter('all'); setStatusFilter('all'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card Deck Progress */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Card <strong>{currentIndex + 1}</strong> of <strong>{cards.length}</strong>
            </span>
            <span className="text-sky-400 font-medium">Click card or space to flip</span>
          </div>

          {/* 3D Flip Card Container */}
          <div 
            onClick={handleFlip}
            className="w-full min-h-[380px] perspective-1000 cursor-pointer select-none"
          >
            <div className={`relative w-full h-full min-h-[380px] rounded-2xl transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}>
              
              {/* FRONT OF CARD */}
              <div className="absolute inset-0 w-full h-full azure-glass-card rounded-2xl p-8 border border-sky-500/25 flex flex-col justify-between backface-hidden shadow-2xl">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      {currentCard?.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      currentCard?.status === 'mastered'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : currentCard?.status === 'needs_practice'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {currentCard?.status === 'mastered' ? 'Mastered' : currentCard?.status === 'needs_practice' ? 'Needs Practice' : 'Unreviewed'}
                    </span>
                  </div>

                  <div className="my-8 text-center">
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                      Official Azure Concept
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {currentCard?.term}
                    </h2>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-sky-400 font-semibold">
                  <RotateCw className="w-4 h-4" />
                  <span>Click anywhere to reveal definition & analogy</span>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div className="absolute inset-0 w-full h-full azure-glass-card rounded-2xl p-6 sm:p-8 border border-emerald-500/30 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl bg-slate-950/95 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      {currentCard?.term}
                    </span>
                    <span className="text-[11px] text-slate-400">Click to flip back</span>
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Definition:
                    </h4>
                    <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                      {currentCard?.summary}
                    </p>
                  </div>

                  {/* Key Takeaway */}
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
                    <strong className="text-emerald-300 block mb-0.5">Core Key Takeaway:</strong>
                    {currentCard?.keyTakeaway}
                  </div>

                  {/* Analogy */}
                  <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 text-xs text-sky-200 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sky-300 block mb-0.5">Relatable Analogy:</strong>
                      {currentCard?.analogy}
                    </div>
                  </div>

                  {/* Common Exam Trap */}
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 block mb-0.5">⚠️ Common Exam Trap:</strong>
                      {currentCard?.commonExamTrap}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskAI(`Explain the Azure term "${currentCard?.term}" with more real-world examples and analogies`);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI Coach</span>
                  </button>
                  <span className="text-slate-500">Rate confidence below</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Confidence Rating Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => handleConfidence('needs_practice')}
              className="py-3 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Needs Practice (Re-queue)</span>
            </button>

            <button
              onClick={() => handleConfidence('mastered')}
              className="py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Got It! (Mark Mastered +15 XP)</span>
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
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
