import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cloud,
  Flame,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { UserProgress, AZDomain } from '../types';

interface DashboardViewProps {
  progress: UserProgress | null;
  onStartQuiz: (domain: 'all' | AZDomain, filter?: string) => void;
  onOpenFlashcards: () => void;
  onAskAI: (initialPrompt?: string) => void;
  onOpenPlanner: () => void;
}

const domains: {
  id: AZDomain;
  title: string;
  description: string;
  weight: string;
  scoreKey: 'concepts' | 'architecture' | 'management';
  Icon: React.ElementType;
  accent: string;
  iconBg: string;
  bar: string;
  border: string;
}[] = [
  {
    id: 'concepts',
    title: 'Cloud Concepts',
    description: 'Understand cloud computing, its benefits, and service models.',
    weight: '25–30% of exam',
    scoreKey: 'concepts',
    Icon: Cloud,
    accent: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    bar: 'bg-emerald-500',
    border: 'hover:border-emerald-400',
  },
  {
    id: 'architecture',
    title: 'Azure Architecture and Services',
    description: 'Explore Azure infrastructure, compute, networking, and storage.',
    weight: '35–40% of exam',
    scoreKey: 'architecture',
    Icon: Server,
    accent: 'text-green-700',
    iconBg: 'bg-green-100',
    bar: 'bg-green-600',
    border: 'hover:border-green-400',
  },
  {
    id: 'management',
    title: 'Management and Governance',
    description: 'Learn about security, identity, compliance, and cost management.',
    weight: '30–35% of exam',
    scoreKey: 'management',
    Icon: ShieldCheck,
    accent: 'text-lime-800',
    iconBg: 'bg-lime-100',
    bar: 'bg-lime-600',
    border: 'hover:border-lime-400',
  },
];

const clampScore = (value: number) =>
  Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onStartQuiz,
}) => {
  const readiness = clampScore(progress?.overallReadiness ?? 0);
  const streak = progress?.streakDays ?? 0;
  const xp = progress?.xp ?? 0;

  return (
    <main className="min-h-screen bg-[#f6faf6] px-4 py-7 text-[#173b2a] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#164b32] via-[#176640] to-[#27844e] px-6 py-8 shadow-xl shadow-emerald-950/10 sm:px-10 sm:py-10 lg:px-12">
          <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border-[40px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-32 right-32 -z-10 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-semibold text-green-50">
                <Sparkles className="h-4 w-4 text-lime-300" />
                Your AZ-900 learning space
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Build your Azure knowledge.
                <span className="block text-lime-300">One question at a time.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-green-50/85 sm:text-base">
                Practise exam-style questions, strengthen your weak areas, and
                track your progress toward Microsoft Azure Fundamentals.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onStartQuiz('all')}
                  className="group inline-flex items-center gap-2 rounded-xl bg-lime-300 px-5 py-3 font-bold text-green-950 shadow-lg shadow-green-950/10 transition hover:-translate-y-0.5 hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-800"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Start practising
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => onStartQuiz('all', 'mock-exam')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <Target className="h-5 w-5" />
                  Mock exam
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center lg:pr-5">
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-white/10 p-3 ring-1 ring-white/20 sm:h-52 sm:w-52">
                <div
                  className="flex h-full w-full items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#d9f99d ${readiness * 3.6}deg, rgba(255,255,255,0.14) 0deg)`,
                  }}
                >
                  <div className="flex h-[82%] w-[82%] flex-col items-center justify-center rounded-full bg-[#185c3a] text-center">
                    <Trophy className="mb-2 h-6 w-6 text-lime-300" />
                    <span className="text-4xl font-extrabold text-white">
                      {readiness}%
                    </span>
                    <span className="mt-1 text-xs font-semibold text-green-100">
                      Exam readiness
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Study streak</p>
              <p className="mt-0.5 text-2xl font-extrabold text-[#173b2a]">
                {streak} <span className="text-sm font-semibold text-stone-500">days</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-100">
              <Zap className="h-6 w-6 text-lime-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Experience earned</p>
              <p className="mt-0.5 text-2xl font-extrabold text-[#173b2a]">
                {xp} <span className="text-sm font-semibold text-stone-500">XP</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
              <BookOpen className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Study domains</p>
              <p className="mt-0.5 text-2xl font-extrabold text-[#173b2a]">
                3 <span className="text-sm font-semibold text-stone-500">exam areas</span>
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Your learning path
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#173b2a] sm:text-3xl">
                Choose a study domain
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Focus on a topic or practise across the whole exam.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onStartQuiz('all')}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
            >
              All questions <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {domains.map((domain, index) => {
              const score = clampScore(
                progress?.domainScores?.[domain.scoreKey] ?? 0,
              );
              const Icon = domain.Icon;

              return (
                <article
                  key={domain.id}
                  className={`group relative overflow-hidden rounded-2xl border border-green-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${domain.border}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${domain.bar}`}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${domain.iconBg}`}>
                      <Icon className={`h-6 w-6 ${domain.accent}`} />
                    </div>
                    <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600">
                      {domain.weight}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-extrabold leading-snug text-[#173b2a]">
                    {domain.title}
                  </h3>
                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-stone-600">
                    {domain.description}
                  </p>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-stone-600">Your progress</span>
                      <span className={`font-extrabold ${domain.accent}`}>{score}%</span>
                    </div>
                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-stone-100"
                      role="progressbar"
                      aria-label={`${domain.title} progress`}
                      aria-valuenow={score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${domain.bar}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartQuiz(domain.id)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-800 transition hover:border-green-600 hover:bg-green-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Practise this domain
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-r from-white via-green-50 to-lime-50 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white shadow-md shadow-green-900/15">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#173b2a]">
                  Ready to test what you know?
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
                  Take a mixed practice quiz, check your answers, and use the
                  results to decide what to revise next.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartQuiz('all')}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-bold text-white shadow-md shadow-green-900/15 transition hover:-translate-y-0.5 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            >
              Start a quiz <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};
