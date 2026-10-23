import React from 'react';
import {
  Cloud,
  Flame,
  Zap,
  Compass,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { UserProgress } from '../types';

type HeaderTab =
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
  const readiness = progress?.overallReadiness ?? 0;
  const streak = progress?.streakDays ?? 0;
  const xp = progress?.xp ?? 0;

  const navButtonClass = (tab: HeaderTab) =>
    `flex items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors ${
      activeTab === tab
        ? 'border-green-200 bg-green-50 text-green-800'
        : 'border-transparent text-stone-600 hover:bg-green-50 hover:text-green-800'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-green-100 bg-white/95 backdrop-blur-xl">
      <div className="border-b border-green-100 bg-green-50/70 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs font-medium text-stone-600">
            <Sparkles className="h-3.5 w-3.5 text-green-700" />
            AZ-900 Microsoft Azure Fundamentals
          </span>
          <span className="text-[10px] text-stone-500 sm:text-xs">
            Unofficial study tool
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="group flex items-center gap-3 text-left"
          aria-label="Go to dashboard"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 ring-1 ring-green-200">
            <Cloud className="h-6 w-6 text-green-800 transition-transform group-hover:scale-110" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-green-950">
                AzureVibe
              </span>
              <span className="rounded-md border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-800">
                AZ-900
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Practise. Learn. Get exam-ready.
            </p>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50/70 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-green-600" />
            <div>
              <p className="text-[10px] text-stone-500">Readiness</p>
              <p className="text-sm font-bold text-green-800">
                {readiness}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-white px-3 py-2">
            <Flame className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-[10px] text-stone-500">Streak</p>
              <p className="text-sm font-bold text-green-950">
                {streak} days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-white px-3 py-2">
            <Zap className="h-4 w-4 text-lime-700" />
            <div>
              <p className="text-[10px] text-stone-500">Experience</p>
              <p className="text-sm font-bold text-green-950">
                {xp} XP
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onQuickQuiz}
            className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Start Quiz
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Main navigation"
          className="flex gap-2 overflow-x-auto pb-3"
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
            <span>Study Topics</span>
          </button>

          <button
            type="button"
            onClick={onQuickQuiz}
            className={navButtonClass('quiz')}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Practise Quiz</span>
          </button>
        </nav>
      </div>
    </header>
  );
};