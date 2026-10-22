import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { StudyPlan } from '../types';
import { fireCelebrationConfetti } from '../utils/confetti';

interface StudyPlannerViewProps {
  onStartQuiz: (domain: 'all' | any) => void;
  onOpenFlashcards: () => void;
  onAskAI: (prompt: string) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  onStartQuiz,
  onOpenFlashcards,
  onAskAI
}) => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);

  // Form states
  const todayPlusTwoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState<string>(todayPlusTwoWeeks);
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'cram'>('intermediate');

  useEffect(() => {
    fetchStudyPlan();
  }, []);

  const fetchStudyPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/study-plan');
      const data = await res.json();
      if (data.success && data.studyPlan) {
        setStudyPlan(data.studyPlan);
        setTargetDate(data.studyPlan.targetExamDate);
        setDailyHours(data.studyPlan.dailyHours);
      }
    } catch (err) {
      console.error('Error fetching study plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetExamDate: targetDate,
          dailyHours,
          experienceLevel
        })
      });
      const data = await res.json();
      if (data.success && data.studyPlan) {
        setStudyPlan(data.studyPlan);
        fireCelebrationConfetti();
      }
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (dayNumber: number, taskId: string) => {
    if (!studyPlan) return;
    try {
      const res = await fetch('/api/study-plan/toggle-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber, taskId })
      });
      const data = await res.json();
      if (data.success && data.studyPlan) {
        setStudyPlan(data.studyPlan);
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  // Calculate days remaining
  const daysRemaining = studyPlan ? Math.max(0, Math.ceil((new Date(studyPlan.targetExamDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 14;

  const totalTasks = studyPlan ? studyPlan.days.reduce((acc, d) => acc + d.tasks.length, 0) : 0;
  const completedTasks = studyPlan ? studyPlan.days.reduce((acc, d) => acc + d.tasks.filter(t => t.completed).length, 0) : 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header and Countdown Card */}
      <div className="azure-glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Personalized AZ-900 Roadmap
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Targeted Day-by-Day Exam Schedule
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Structured study plan designed for the #1MillionDevs Movement, ensuring complete coverage across Cloud Concepts, Architecture & Services, and Management & Governance before your test.
            </p>
          </div>

          {studyPlan && (
            <div className="azure-glass rounded-2xl p-4 border border-emerald-500/30 text-center min-w-[200px]">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Exam Countdown
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                {daysRemaining} <span className="text-sm font-semibold text-slate-300">Days</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Target: {new Date(studyPlan.targetExamDate).toLocaleDateString()}
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {completedTasks}/{totalTasks} Tasks Done ({progressPercent}%)
              </div>
            </div>
          )}
        </div>

        {/* Plan Configuration Controls */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Exam Date:
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Daily Study Hours: ({dailyHours} hrs/day)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer mt-2"
            />
          </div>

          <div className="flex items-end">
            <button
              disabled={generating}
              onClick={handleGeneratePlan}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{studyPlan ? 'Regenerate Study Plan' : 'Generate Structured Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Days Task Checklist */}
      {studyPlan ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Curriculum Checklist
            </h3>
            <span className="text-xs text-slate-400">
              Each completed task awards +10 XP
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyPlan.days.map((day) => {
              const dayCompletedCount = day.tasks.filter(t => t.completed).length;
              const isDayDone = dayCompletedCount === day.tasks.length;

              return (
                <div
                  key={day.dayNumber}
                  className={`azure-glass-card rounded-2xl p-5 border transition-all ${
                    isDayDone
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        day.domain === 'concepts'
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          : day.domain === 'architecture'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        Day {day.dayNumber} · {day.domain}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">
                        {day.title}
                      </h4>
                    </div>

                    <span className="text-xs font-semibold text-slate-400 shrink-0">
                      {dayCompletedCount}/{day.tasks.length}
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2 mt-3">
                    {day.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(day.dayNumber, task.id)}
                        className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                          task.completed
                            ? 'bg-slate-900/40 border-emerald-500/30 text-slate-400 line-through'
                            : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <span className="flex-1 leading-snug">
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Quick Action footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onStartQuiz(day.domain)}
                      className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Take Day {day.dayNumber} Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onAskAI(`Explain key concepts for: ${day.title}`)}
                      className="text-slate-400 hover:text-cyan-300 cursor-pointer"
                    >
                      AI Summary
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          Click <strong>Generate Structured Plan</strong> above to build your customized day-by-day study roadmap.
        </div>
      )}
    </div>
  );
};
