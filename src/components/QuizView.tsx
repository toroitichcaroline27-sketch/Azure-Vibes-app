import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Lightbulb, 
  Sparkles, 
  BookOpen, 
  Timer, 
  Filter, 
  Bot, 
  Zap, 
  Trophy,
  Compass,
  AlertCircle
} from 'lucide-react';
import { Question, AZDomain, UserProgress } from '../types';
import type { AZTopic } from '../data/topics';
import { fireCelebrationConfetti, fireMegaConfetti } from '../utils/confetti';

interface QuizViewProps {
  initialDomain?: 'all' | AZDomain;
  initialTopic?: AZTopic | null;
  initialFilter?: string;
  onQuizComplete: (attempt: any) => void;
  onAskAI: (prompt: string) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  initialDomain = 'all',
  initialTopic = null,
  initialFilter = 'all',
  onQuizComplete,
  onAskAI
}) => {
  const [selectedDomain, setSelectedDomain] = useState<'all' | AZDomain>(initialDomain);
  const [selectedTopic, setSelectedTopic] = useState<AZTopic | null>(initialTopic);
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Current question user response state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; selectedOptionId: string; isCorrect: boolean }[]>([]);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Mock Exam Timer
  const [isMockExam, setIsMockExam] = useState<boolean>(initialFilter === 'mock-exam');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);

  // Completed State
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizResultSummary, setQuizResultSummary] = useState<any | null>(null);

  // AI Question Generation state
  const [generatingAiQuestion, setGeneratingAiQuestion] = useState<boolean>(false);

  // Load questions when filter or domain changes
  useEffect(() => {
    fetchQuestions();
  }, [selectedDomain, activeFilter, selectedTopic]);

  // Timer countdown
  useEffect(() => {
    if (!isMockExam || quizFinished) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isMockExam, quizFinished, userAnswers]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ domain: selectedDomain });
      if (selectedTopic?.questionTopics.length) {
        params.set("topics", selectedTopic.questionTopics.join(","));
      }
      if (activeFilter === 'weak-areas') {
        params.set('filter', 'weak-areas');
      }
      if (isMockExam) {
        params.set('limit', '20');
      }
      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.questions) {
        // Shuffle each question's complete option objects once when loaded.
        const shuffledQuestions: Question[] = data.questions.map((question: Question) => {
          const options = [...question.options];

          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }

          return { ...question, options };
        });

        setQuestions(shuffledQuestions);
        setCurrentIndex(0);
        setSelectedOptionId(null);
        setShowExplanation(false);
        setUserAnswers([]);
        setQuizFinished(false);
        setQuizResultSummary(null);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId !== null) return; // prevent changing after choice

    const currentQ = questions[currentIndex];
    const correctOpt = currentQ.options.find(o => o.isCorrect);
    const isCorrect = correctOpt ? correctOpt.id === optionId : false;

    setSelectedOptionId(optionId);
    setShowExplanation(true);

    const updatedAnswers = [
      ...userAnswers,
      {
        questionId: currentQ.id,
        selectedOptionId: optionId,
        isCorrect
      }
    ];
    setUserAnswers(updatedAnswers);

    if (isCorrect) {
      fireCelebrationConfetti();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setShowExplanation(false);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    if (isSubmitting || quizFinished) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domainFilter: selectedDomain,
          answers: userAnswers,
          timeSpentSeconds: isMockExam ? (45 * 60 - secondsRemaining) : (userAnswers.length * 45)
        })
      });

      const data = await res.json();
      if (data.success) {
        setQuizResultSummary(data);
        setQuizFinished(true);
        onQuizComplete(data);

        if (data.attempt.scorePercentage >= 70) {
          fireMegaConfetti();
        }
      }
    } catch (err) {
      console.error('Error submitting quiz attempt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAiQuestion = async (topic: string, domain: AZDomain) => {
    setGeneratingAiQuestion(true);
    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, domain })
      });
      const data = await res.json();
      if (data.success && data.question) {
        // insert into current quiz set right next!
        setQuestions(prev => [
          ...prev.slice(0, currentIndex + 1),
          data.question,
          ...prev.slice(currentIndex + 1)
        ]);
        handleNextQuestion();
      }
    } catch (err) {
      console.error('Error generating AI question:', err);
    } finally {
      setGeneratingAiQuestion(false);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  // If loading
  if (loading) {
    return (
      <div className="azure-glass-card rounded-2xl p-12 text-center border border-slate-800">
        <div className="animate-spin w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-300 font-semibold">Loading official AZ-900 practice questions...</p>
        <p className="text-slate-500 text-xs mt-1">Sourced from Microsoft Learn objectives</p>
      </div>
    );
  }

  // Quiz Finished View
  if (quizFinished && quizResultSummary) {
    const attempt = quizResultSummary.attempt;
    const isPassing = attempt.scorePercentage >= 70; // 700 / 1000

    return (
      <div className="azure-glass-card rounded-2xl p-6 sm:p-10 border border-slate-800 max-w-3xl mx-auto text-center animate-fadeIn">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 border border-sky-400/30 mb-4 shadow-xl">
          {isPassing ? (
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          ) : (
            <RotateCcw className="w-10 h-10 text-sky-400" />
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {isPassing ? 'Congratulations! Passing Score Achieved' : 'Great Effort! Practice Solidifies Knowledge'}
        </h2>
        <p className="text-slate-300 text-sm mt-2 max-w-lg mx-auto">
          {isPassing
            ? `You scored ${attempt.scorePercentage}% which clears the AZ-900 official 700/1000 passing threshold!`
            : `You scored ${attempt.scorePercentage}%. Review the "Why It's Wrong" breakdowns below to master tricky distractors.`}
        </p>

        {/* Score & XP Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Final Score</div>
            <div className={`text-2xl font-black mt-1 ${isPassing ? 'text-emerald-400' : 'text-amber-400'}`}>
              {attempt.scorePercentage}%
            </div>
            <div className="text-[10px] text-slate-500">{attempt.correctCount} / {attempt.totalQuestions} Correct</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">XP Earned</div>
            <div className="text-2xl font-black text-cyan-400 mt-1 flex items-center justify-center gap-1">
              <Zap className="w-5 h-5 fill-cyan-400" />
              <span>+{quizResultSummary.earnedXp}</span>
            </div>
            <div className="text-[10px] text-slate-500">Speed & Accuracy Bonus</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Status</div>
            <div className="text-base font-bold text-white mt-2">
              {isPassing ? 'PASSED 🚀' : 'NEEDS DRILL 📈'}
            </div>
            <div className="text-[10px] text-slate-500">70% Required</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Time Taken</div>
            <div className="text-xl font-bold text-slate-200 mt-1.5">
              {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
            </div>
            <div className="text-[10px] text-slate-500">Total duration</div>
          </div>
        </div>

        {/* New Badges if any */}
        {quizResultSummary.newBadges && quizResultSummary.newBadges.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              New Achievement Unlocked!
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {quizResultSummary.newBadges.map((b: any) => (
                <div key={b.id} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 font-bold text-sm">
                  <span>{b.icon}</span>
                  <span>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              setQuizFinished(false);
              fetchQuestions();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Another Round</span>
          </button>

          <button
            onClick={() => {
              setSelectedDomain('all');
              setActiveFilter('weak-areas');
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Drill Missed Concepts</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Question View
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Filter & Domain Header */}
      <div className="azure-glass rounded-xl p-3.5 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Domain selection chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Domain:
          </span>
          <button
            onClick={() => { setSelectedDomain('all'); setActiveFilter('all'); setIsMockExam(false); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              selectedDomain === 'all' && activeFilter !== 'weak-areas' && !isMockExam
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Domains
          </button>
          <button
            onClick={() => { setSelectedDomain('concepts'); setActiveFilter('all'); setIsMockExam(false); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              selectedDomain === 'concepts'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Cloud Concepts
          </button>
          <button
            onClick={() => { setSelectedDomain('architecture'); setActiveFilter('all'); setIsMockExam(false); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              selectedDomain === 'architecture'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Architecture
          </button>
          <button
            onClick={() => { setSelectedDomain('management'); setActiveFilter('all'); setIsMockExam(false); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              selectedDomain === 'management'
                ? 'bg-indigo-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Governance
          </button>
        </div>

        {/* Right side: Mock Exam Timer or Progress */}
        <div className="flex items-center gap-3">
          {isMockExam ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
              <Timer className="w-4 h-4 animate-spin-slow" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-400">
              Question <span className="text-white font-extrabold">{currentIndex + 1}</span> of <span className="text-slate-500">{questions.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / Math.max(1, questions.length)) * 100}%` }}
        />
      </div>

      {currentQ && (
        <div className="azure-glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative">
          {/* Question Metadata Tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                currentQ.domain === 'concepts'
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                  : currentQ.domain === 'architecture'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
              }`}>
                {currentQ.domainTitle}
              </span>
              <span className="text-xs text-slate-400">
                · {currentQ.topic}
              </span>
            </div>

            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              Difficulty: {currentQ.difficulty}
            </span>
          </div>

          {/* Scenario Context if present */}
          {currentQ.scenario && (
            <div className="mb-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed italic border-l-4 border-l-sky-500">
              <strong className="text-sky-300 not-italic block mb-0.5">Business Scenario:</strong>
              {currentQ.scenario}
            </div>
          )}

          {/* Question Statement */}
          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed mb-6">
            {currentQ.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((opt, optionIndex) => {
              const isSelected = selectedOptionId === opt.id;
              const hasAnswered = selectedOptionId !== null;
              const isCorrectOpt = opt.isCorrect;

              let optionStyle = 'bg-slate-900/70 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/60';
              let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';

              if (hasAnswered) {
                if (isCorrectOpt) {
                  // Always show the correct option highlighted in emerald/green
                  optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-200 shadow-sm shadow-emerald-500/20';
                  badgeStyle = 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold';
                } else if (isSelected && !isCorrectOpt) {
                  // User chose this and it was wrong: highlight red
                  optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-200 shadow-sm shadow-rose-500/20';
                  badgeStyle = 'bg-rose-500 text-white border-rose-400 font-bold';
                } else {
                  // Unselected wrong options
                  optionStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60';
                  badgeStyle = 'bg-slate-900 text-slate-600 border-slate-800';
                }
              }

              return (
                <button
                  key={opt.id}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer ${optionStyle}`}
                >
                  <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${badgeStyle}`}>
                    {hasAnswered && isCorrectOpt ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                    ) : hasAnswered && isSelected && !isCorrectOpt ? (
                      <XCircle className="w-4 h-4 text-white" />
                    ) : (
                      (['A', 'B', 'C', 'D'][optionIndex] ?? String(optionIndex + 1))
                    )}
                  </span>
                  <div className="flex-1 text-sm sm:text-base leading-snug">
                    {opt.text}
                  </div>
                </button>
              );
            })}
          </div>

          {/* IMMEDIATE FEEDBACK & WHY IT'S RIGHT / WHY IT'S WRONG EXPLANATIONS */}
          {showExplanation && (
            <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-5 animate-fadeIn">
              {/* Correctness Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                selectedOptionId && currentQ.options.find(o => o.id === selectedOptionId)?.isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  {selectedOptionId && currentQ.options.find(o => o.id === selectedOptionId)?.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span className="font-bold text-sm">
                    {selectedOptionId && currentQ.options.find(o => o.id === selectedOptionId)?.isCorrect
                      ? 'Spot On! That is the correct Microsoft architectural choice.'
                      : 'Incorrect. Let\'s learn why the distractors are wrong.'}
                  </span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700 text-slate-300">
                  {selectedOptionId && currentQ.options.find(o => o.id === selectedOptionId)?.isCorrect ? '+25 XP' : '+5 XP for Learning'}
                </span>
              </div>

              {/* WHY IT'S RIGHT */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  Why the correct option is right:
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {currentQ.whyRight}
                </p>
              </div>

              {/* WHY EACH INCORRECT OPTION IS WRONG (Distractor Breakdown) */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <XCircle className="w-4 h-4" />
                  Why each distractor is wrong:
                </div>
                <div className="space-y-2.5">
                  {currentQ.whyWrong.map((distractor, idx) => (
                    <div key={idx} className="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <strong className="text-rose-300 block mb-0.5">
                        {distractor.optionText}:
                      </strong>
                      <span className="text-slate-400">{distractor.reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RELATABLE REAL-WORLD ANALOGY */}
              {currentQ.analogy && (
                <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Relatable Real-World Analogy:
                  </div>
                  <p className="text-sm text-sky-100 leading-relaxed font-medium">
                    {currentQ.analogy}
                  </p>
                </div>
              )}

              {/* Microsoft Learn Reference */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>{currentQ.officialLearnRef}</span>
                </div>

                <button
                  onClick={() => onAskAI(`Deep dive: Why is "${currentQ.question}" answered this way? Give me another analogy.`)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI Coach for more examples</span>
                </button>
              </div>

              {/* Next Question / Finish Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  disabled={generatingAiQuestion}
                  onClick={() => handleGenerateAiQuestion(currentQ.topic, currentQ.domain)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Generate another authentic question on this exact topic"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>{generatingAiQuestion ? 'Generating...' : 'AI Practice Drill on this Topic'}</span>
                </button>

                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Finish & View Score'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
