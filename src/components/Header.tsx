import React from 'react';
import {
  Cloud,
  Flame,
  Zap,
  Compass,
  CheckCircle2,
  BookOpen,
  Layers,
  Bot,
  Mic,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { UserProgress } from '../types';

export type HeaderTab =
  | 'dashboard'
  | 'topics'
  | 'quiz'
  | 'flashcards'
  | 'ai-coach'
  | 'transcripts'
  | 'planner';

interface HeaderProps {
  activeTab: HeaderTab;
  setActiveTab: (tab: HeaderTab) => void;
  progress: UserProgress | null;
  onQuickQuiz: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  progress,
  onQuickQuiz,
}) => {
  const readiness = progress?.overallReadiness ?? 65;
  const streak = progress?.streakDays ?? 1;
  const xp = progress?.xp ?? 0;

  const navButtonClass = (tab: HeaderTab) =>
    `flex items-center gap-2 whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
      activeTab === tab
        ? 'border-emerald-600 bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600'
        : 'border-transparent text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-950'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-100 bg-white/95 backdrop-blur-xl shadow-sm">
      {/* Top Movement Banner */}
      <div className="border-b border-emerald-100 bg-emerald-50/80 px-4 py-1.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs font-semibold text-emerald-950">
            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
            <span>#1MillionDevs · Microsoft Azure Fundamentals (AZ-900) Exam Accelerator</span>
          </span>
          <span className="text-[11px] font-medium text-emerald-800 sm:text-xs">
            Unofficial Community Prep Platform
          </span>
        </div>
      </div>

      {/* Main Brand Row */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="group flex items-center gap-3 text-left cursor-pointer"
          aria-label="Go to dashboard"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-600/20 transition-transform group-hover:scale-105">
            <Cloud className="h-6 w-6 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-emerald-950">
                AzureVibe
              </span>
              <span className="rounded-md border border-emerald-300 bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-900">
                AZ-900
              </span>
            </div>
            <p className="text-xs font-medium text-slate-600">
              Practise. Learn. Ace the Exam.
            </p>
          </div>
        </button>

        {/* Stats Pill Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Readiness Score */}
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-1.5 shadow-xs">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600 leading-none">Readiness</p>
              <p className="text-sm font-extrabold text-emerald-900 leading-tight">
                {readiness}%
              </p>
            </div>
          </div>

          {/* Daily Streak */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-xs">
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600 leading-none">Streak</p>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                {streak} {streak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          {/* XP */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-xs">
            <Zap className="h-4 w-4 text-emerald-600 fill-emerald-600" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-600 leading-none">XP Earned</p>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                {xp} XP
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onQuickQuiz}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Start Practice</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar with ALL Challenge Features */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <nav
          aria-label="Main navigation"
          className="flex gap-1.5 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none"
        >
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={navButtonClass('dashboard')}
          >
            <Compass className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={navButtonClass('topics')}
          >
            <BookOpen className="h-4 w-4" />
            <span>Topics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={navButtonClass('quiz')}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Smart Quiz</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flashcards')}
            className={navButtonClass('flashcards')}
          >
            <Layers className="h-4 w-4" />
            <span>Flashcard Coach</span>
            {progress?.flashcards?.needsPractice ? (
              <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-extrabold text-white">
                {progress.flashcards.needsPractice}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai-coach')}
            className={navButtonClass('ai-coach')}
          >
            <Bot className="h-4 w-4 text-emerald-600 group-hover:text-white" />
            <span>AI Study Buddy</span>
            <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-900 border border-emerald-300">
              Groq AI
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transcripts')}
            className={navButtonClass('transcripts')}
          >
            <Mic className="h-4 w-4" />
            <span>Audio & Word Export</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('planner')}
            className={navButtonClass('planner')}
          >
            <Calendar className="h-4 w-4" />
            <span>Study Planner</span>
          </button>
        </nav>
      </div>
    </header>
  );
};