import React from 'react';
import { 
  Cloud, 
  Flame, 
  Zap, 
  Compass, 
  CheckCircle2, 
  Layers, 
  Bot, 
  Mic, 
  Calendar, 
  Sparkles,
  Award
} from 'lucide-react';
import { UserProgress } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'quiz' | 'flashcards' | 'ai-coach' | 'transcripts' | 'planner';
  setActiveTab: (tab: 'dashboard' | 'quiz' | 'flashcards' | 'ai-coach' | 'transcripts' | 'planner') => void;
  progress: UserProgress | null;
  onQuickQuiz: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  progress,
  onQuickQuiz
}) => {
  const readiness = progress?.overallReadiness ?? 65;
  const streak = progress?.streakDays ?? 1;
  const xp = progress?.xp ?? 250;

  const getReadinessColor = (val: number) => {
    if (val >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 60) return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  const getReadinessLabel = (val: number) => {
    if (val >= 85) return 'Exam Ready 🚀';
    if (val >= 70) return 'Strong Pace ⚡';
    if (val >= 50) return 'Building Base 📈';
    return 'Groundwork 🌱';
  };

  return (
    <header className="sticky top-0 z-40 w-full azure-glass border-b border-slate-800/80">
      {/* Top Movement & Disclaimer Ribbon */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900/90 to-indigo-950/80 border-b border-sky-900/30 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              #1MillionDevs Movement
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-300 font-medium">
              AZ-900 Microsoft Azure Fundamentals Accelerator
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400">
              Official MS Learn Syllabus: <strong>Cloud Concepts</strong>, <strong>Architecture</strong> & <strong>Governance</strong>
            </span>
            <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
              Unofficial Study Tool
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cloud className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-200 to-cyan-400 bg-clip-text text-transparent">
                AzureVibe
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
                AZ-900
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Gamified Cloud Cert Prep & AI Coach
            </p>
          </div>
        </div>

        {/* Gamified Live Stats (Readiness, Streak, XP) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Readiness Score Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${getReadinessColor(readiness)}`}>
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-8 h-8 -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  className="opacity-20"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={81.68}
                  strokeDashoffset={81.68 - (81.68 * readiness) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute text-[11px] font-bold">{readiness}%</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 leading-none">
                Readiness
              </div>
              <div className="text-xs font-bold leading-tight">
                {getReadinessLabel(readiness)}
              </div>
            </div>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-amber-400 text-xs font-bold shadow-inner">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streak}d</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline uppercase">Streak</span>
          </div>

          {/* XP Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-cyan-300 text-xs font-bold">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>{xp}</span>
            <span className="text-[10px] text-slate-500 hidden sm:inline uppercase">XP</span>
          </div>

          {/* Fast Quiz CTA Button */}
          <button
            onClick={onQuickQuiz}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 hover:shadow-sky-500/40 active:scale-95 transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Quick Practice</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Dashboard & Readiness</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Smart Quiz & Deep Why</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Flashcard Coach</span>
            {progress?.flashcards?.needsPractice ? (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                {progress.flashcards.needsPractice}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('ai-coach')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ai-coach'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>AI Study Buddy</span>
            <span className="px-1 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-bold">
              Gemini
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transcripts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'transcripts'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Mic className="w-4 h-4 text-rose-400" />
            <span>Audio Transcripts & Word Export</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Study Planner</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
