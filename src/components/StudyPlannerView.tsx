import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  BookOpen, 
  Layers, 
  ArrowRight,
  Flame,
  Award,
  AlertCircle
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
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              Personalized AZ-900 Roadmap · Weak-Area Prioritized
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Targeted Day-by-Day Exam Schedule
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Structured study plan designed for the #1MillionDevs Movement. Prioritizes your diagnostic weak areas first, ensuring 100% curriculum confidence before test day.
            </p>
          </div>

          {studyPlan && (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-center min-w-[210px] shadow-xs">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Exam Countdown
              </div>
              <div className="text-3xl font-black text-emerald-800 mt-1">
                {daysRemaining} <span className="text-sm font-bold text-slate-600">Days</span>
              </div>
              <div className="text-xs text-slate-600 mt-1 font-medium">
                Target: {new Date(studyPlan.targetExamDate).toLocaleDateString()}
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 mt-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-xs text-slate-700 font-bold mt-1.5">
                {completedTasks}/{totalTasks} Tasks Done ({progressPercent}%)
              </div>
            </div>
          )}
        </div>

        {/* Plan Configuration Controls */}
        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Exam Date:
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Daily Study Hours: ({dailyHours} hrs/day)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer mt-2"
            />
          </div>

          <div className="flex items-end">
            <button
              disabled={generating}
              onClick={handleGeneratePlan}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{studyPlan ? 'Regenerate Study Plan' : 'Generate Structured Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Days Task Checklist */}
      {studyPlan ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              Curriculum Checklist
            </h3>
            <span className="text-xs text-slate-600 font-bold">
              Each completed task awards +10 XP
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyPlan.days.map((day) => {
              const dayCompletedCount = day.tasks.filter(t => t.completed).length;
              const isDayDone = dayCompletedCount === day.tasks.length;
              const isPriorityWeakArea = day.title.includes('Priority Weak Area');

              return (
                <div
                  key={day.dayNumber}
                  className={`rounded-2xl p-5 border transition-all shadow-xs ${
                    isDayDone
                      ? 'border-emerald-300 bg-emerald-50/60'
                      : isPriorityWeakArea
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        isPriorityWeakArea
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        Day {day.dayNumber} · {day.domain}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1.5 leading-snug">
                        {day.title}
                      </h4>
                    </div>

                    <span className="text-xs font-bold text-slate-600 shrink-0">
                      {dayCompletedCount}/{day.tasks.length}
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2 mt-3">
                    {day.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(day.dayNumber, task.id)}
                        className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-start gap-2.5 cursor-pointer transition-colors ${
                          task.completed
                            ? 'bg-emerald-50/80 border-emerald-200 text-slate-500 line-through'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/30'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <span className="flex-1 leading-snug">
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Quick Action footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <button
                      onClick={() => onStartQuiz(day.domain)}
                      className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Take Day {day.dayNumber} Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onAskAI(`Explain key concepts for: ${day.title}`)}
                      className="text-slate-600 hover:text-emerald-800 cursor-pointer"
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
        <div className="text-center py-12 text-slate-600 font-medium">
          Click <strong>Generate Structured Plan</strong> above to build your customized day-by-day study roadmap.
        </div>
      )}
    </div>
  );
};
