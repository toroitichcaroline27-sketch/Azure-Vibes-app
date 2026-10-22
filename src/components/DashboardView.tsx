import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Zap, 
  ShieldCheck, 
  Server, 
  Database,
  BarChart3,
  Bot,
  Timer
} from 'lucide-react';
import { UserProgress, AZDomain } from '../types';

interface DashboardViewProps {
  progress: UserProgress | null;
  onStartQuiz: (domain: 'all' | AZDomain, filter?: string) => void;
  onOpenFlashcards: () => void;
  onAskAI: (initialPrompt?: string) => void;
  onOpenPlanner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onStartQuiz,
  onOpenFlashcards,
  onAskAI,
  onOpenPlanner
}) => {
  const readiness = progress?.overallReadiness ?? 65;
  const domainScores = progress?.domainScores ?? { concepts: 65, architecture: 60, management: 55 };
  const weakAreas = progress?.weakAreas ?? [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-800/40 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-40 -mb-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              #1MillionDevs Movement · AZ-900 Certification Accelerator
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Master the Microsoft Azure Fundamentals Exam
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Target passing score is <span className="text-emerald-400 font-bold">700 / 1000</span>. AzureVibe transforms abstract cloud architectures into memorable real-world mental models with deep explanations for every option.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onStartQuiz('all')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Start Smart Practice Quiz</span>
              </button>

              <button
                onClick={() => onStartQuiz('all', 'mock-exam')}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Timer className="w-4 h-4 text-amber-400" />
                <span>45-Min Mock Exam (Timed)</span>
              </button>

              <button
                onClick={onOpenFlashcards}
                className="px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/60 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Flashcard Coach</span>
              </button>
            </div>
          </div>

          {/* Large Readiness Score Gauge */}
          <div className="azure-glass-card rounded-2xl p-5 border border-sky-500/20 flex flex-col items-center justify-center min-w-[240px] text-center">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Exam Readiness Score
            </div>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-32 h-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="#1e293b"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke={readiness >= 80 ? '#10b981' : readiness >= 60 ? '#0284c7' : '#f59e0b'}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={326.7}
                  strokeDashoffset={326.7 - (326.7 * readiness) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white">{readiness}%</span>
                <span className="text-[10px] text-slate-400 font-medium">EST. SCORE</span>
              </div>
            </div>

            <div className="mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                readiness >= 80 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : readiness >= 60 
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {readiness >= 80 ? 'Exam Ready (700+ Projected)' : readiness >= 60 ? 'On Track to Pass' : 'Review Fundamentals'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Based on quiz accuracy, domain coverage & flashcards
            </div>
          </div>
        </div>
      </div>

      {/* 3 Official AZ-900 Domain Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              Official AZ-900 Domain Breakdown
            </h2>
            <p className="text-xs text-slate-400">
              Evaluated against Microsoft's official exam weightings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Domain 1: Cloud Concepts */}
          <div className="azure-glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-sky-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Database className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  25–30% Weight
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  1. Cloud Concepts
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  CapEx vs OpEx, IaaS / PaaS / SaaS, shared responsibility model, high availability, elasticity.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Domain Mastery</span>
                  <span className="font-bold text-sky-400">{domainScores.concepts}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-700"
                    style={{ width: `${domainScores.concepts}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => onStartQuiz('concepts')}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 group cursor-pointer"
              >
                <span>Practice Domain 1</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onAskAI('Explain Cloud Concepts CapEx vs OpEx and Shared Responsibility Model with simple analogies')}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                title="Ask AI Coach"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Tutor</span>
              </button>
            </div>
          </div>

          {/* Domain 2: Azure Architecture & Services */}
          <div className="azure-glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Server className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  35–40% Weight
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  2. Azure Architecture & Services
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Regions, Availability Zones, VMs, Containers, VNets, Blob Storage tiers, ExpressRoute vs VPN.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Domain Mastery</span>
                  <span className="font-bold text-emerald-400">{domainScores.architecture}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                    style={{ width: `${domainScores.architecture}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => onStartQuiz('architecture')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group cursor-pointer"
              >
                <span>Practice Domain 2</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onAskAI('Explain Azure Availability Zones, Region Pairs, and Blob Storage Tiers with simple analogies')}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                title="Ask AI Coach"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Tutor</span>
              </button>
            </div>
          </div>

          {/* Domain 3: Azure Management & Governance */}
          <div className="azure-glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  30–35% Weight
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  3. Management & Governance
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Cost Management, TCO vs Pricing Calculator, Azure Policy, RBAC, Defender for Cloud, Service Health.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Domain Mastery</span>
                  <span className="font-bold text-indigo-400">{domainScores.management}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-700"
                    style={{ width: `${domainScores.management}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => onStartQuiz('management')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group cursor-pointer"
              >
                <span>Practice Domain 3</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onAskAI('Explain Azure Policy vs RBAC and Resource Locks with a relatable real-world story')}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                title="Ask AI Coach"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Tutor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weak-Area Identification & Spaced Revision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Areas Card */}
        <div className="azure-glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Identified Weak Areas
                </h3>
                <p className="text-xs text-slate-400">
                  Targeted review to prevent common exam pitfalls
                </p>
              </div>
            </div>
            <button
              onClick={() => onStartQuiz('all', 'weak-areas')}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              Drill All Weak Topics
            </button>
          </div>

          <div className="space-y-3">
            {weakAreas.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/90 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">
                      {item.topic}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                      {item.domain}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Accuracy: <strong className={item.accuracy < 60 ? 'text-rose-400' : 'text-amber-400'}>{item.accuracy}%</strong></span>
                    {item.totalCount > 0 ? (
                      <span>({item.missCount} missed out of {item.totalCount})</span>
                    ) : (
                      <span className="text-slate-500">Curriculum High-Yield Pitfall</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAskAI(`Explain ${item.topic} for the AZ-900 exam with a memorable analogy and why students get it wrong`)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium cursor-pointer"
                    title="Explain with AI"
                  >
                    <Bot className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onStartQuiz(item.domain)}
                    className="p-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-medium cursor-pointer"
                    title="Quiz Topic"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gamification, Badges & Milestone Progress */}
        <div className="azure-glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Study Momentum & Badges
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your #1MillionDevs certification journey stats
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenPlanner}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
              >
                View Study Plan →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-xs text-slate-400 font-medium">Daily Streak</div>
                <div className="text-xl font-bold text-amber-400 mt-1 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  <span>{progress?.streakDays ?? 1} Days</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-xs text-slate-400 font-medium">Total XP</div>
                <div className="text-xl font-bold text-cyan-400 mt-1 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span>{progress?.xp ?? 250}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                <div className="text-xs text-slate-400 font-medium">Flashcards</div>
                <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{progress?.flashcards?.mastered ?? 0}/{progress?.flashcards?.total ?? 10}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Unlocked Achievements
              </div>
              <div className="flex flex-wrap gap-2">
                {(progress?.unlockedBadges || []).map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200"
                    title={b.description}
                  >
                    <span>{b.icon}</span>
                    <span className="font-semibold">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Next Goal: <strong>Mnemonic Master (Master 5 flashcards)</strong></span>
            <span className="text-emerald-400 font-semibold">+50 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
