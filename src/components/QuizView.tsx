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
      <div className="bg-white rounded-2xl p-12 text-center border border-emerald-100 shadow-md max-w-2xl mx-auto my-8">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-900 font-bold text-base">Loading official AZ-900 practice questions...</p>
        <p className="text-slate-500 text-xs mt-1">Sourced from Microsoft Learn objectives</p>
      </div>
    );
  }

  // Quiz Finished View
  if (quizFinished && quizResultSummary) {
    const attempt = quizResultSummary.attempt;
    const isPassing = attempt.scorePercentage >= 70; // 700 / 1000

    return (
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-emerald-200 max-w-3xl mx-auto text-center shadow-xl animate-fadeIn">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-100 border border-emerald-300 mb-4 shadow-sm">
          {isPassing ? (
            <Trophy className="w-10 h-10 text-emerald-700 animate-bounce" />
          ) : (
            <RotateCcw className="w-10 h-10 text-emerald-700" />
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          {isPassing ? 'Congratulations! Passing Score Achieved 🎉' : 'Great Effort! Practice Solidifies Knowledge 📈'}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-lg mx-auto">
          {isPassing
            ? `You scored ${attempt.scorePercentage}% which clears the AZ-900 official 700/1000 passing threshold!`
            : `You scored ${attempt.scorePercentage}%. Review the "Why It's Wrong" breakdowns below to master tricky distractors.`}
        </p>

        {/* Score & XP Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Final Score</div>
            <div className={`text-2xl font-black mt-1 ${isPassing ? 'text-emerald-700' : 'text-amber-600'}`}>
              {attempt.scorePercentage}%
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{attempt.correctCount} / {attempt.totalQuestions} Correct</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">XP Earned</div>
            <div className="text-2xl font-black text-emerald-700 mt-1 flex items-center justify-center gap-1">
              <Zap className="w-5 h-5 fill-emerald-600 text-emerald-600" />
              <span>+{quizResultSummary.earnedXp}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Speed & Accuracy Bonus</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Status</div>
            <div className={`text-base font-black mt-2 ${isPassing ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isPassing ? 'PASSED 🚀' : 'NEEDS DRILL 📈'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">70% (700/1000) Target</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-600 font-bold uppercase tracking-wider">Time Taken</div>
            <div className="text-xl font-black text-slate-900 mt-1.5">
              {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Total duration</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={() => {
              setQuizFinished(false);
              fetchQuestions();
            }}
            className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Another Round</span>
          </button>

          <button
            onClick={() => {
              setSelectedDomain('all');
              setActiveFilter('weak-areas');
            }}
            className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border-2 border-slate-300 transition-all flex items-center gap-2 cursor-pointer"
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Drill Missed Concepts</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Question View
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Filter & Domain Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Domain selection chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-slate-700 font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-700" /> Domain:
          </span>
          <button
            onClick={() => { setSelectedDomain('all'); setSelectedTopic(null); setActiveFilter('all'); setIsMockExam(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              selectedDomain === 'all' && activeFilter !== 'weak-areas' && !isMockExam && !selectedTopic
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
            }`}
          >
            All Domains
          </button>
          <button
            onClick={() => { setSelectedDomain('concepts'); setSelectedTopic(null); setActiveFilter('all'); setIsMockExam(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              selectedDomain === 'concepts'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
            }`}
          >
            1. Cloud Concepts
          </button>
          <button
            onClick={() => { setSelectedDomain('architecture'); setSelectedTopic(null); setActiveFilter('all'); setIsMockExam(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              selectedDomain === 'architecture'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
            }`}
          >
            2. Architecture
          </button>
          <button
            onClick={() => { setSelectedDomain('management'); setSelectedTopic(null); setActiveFilter('all'); setIsMockExam(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              selectedDomain === 'management'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
            }`}
          >
            3. Governance
          </button>
        </div>

        {/* Right side: Mock Exam Timer or Progress */}
        <div className="flex items-center gap-3">
          {isMockExam ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold font-mono shadow-xs">
              <Timer className="w-4 h-4 text-amber-600 animate-spin-slow" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Question <span className="text-emerald-800 font-extrabold text-sm">{currentIndex + 1}</span> of <span className="text-slate-600">{questions.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / Math.max(1, questions.length)) * 100}%` }}
        />
      </div>

      {currentQ && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md relative">
          {/* Question Metadata Tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                {currentQ.domainTitle}
              </span>
              <span className="text-xs text-slate-600 font-bold">
                · {currentQ.topic}
              </span>
            </div>

            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
              Difficulty: {currentQ.difficulty}
            </span>
          </div>

          {/* Scenario Context if present */}
          {currentQ.scenario && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-800 text-xs sm:text-sm leading-relaxed border-l-4 border-l-emerald-600 shadow-xs">
              <strong className="text-emerald-950 font-bold block mb-1 uppercase tracking-wide text-xs">
                Business Scenario:
              </strong>
              {currentQ.scenario}
            </div>
          )}

          {/* Question Statement (High Contrast Black on White) */}
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug mb-6">
            {currentQ.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((opt, optionIndex) => {
              const isSelected = selectedOptionId === opt.id;
              const hasAnswered = selectedOptionId !== null;
              const isCorrectOpt = opt.isCorrect;

              let optionStyle = 'bg-white border-2 border-slate-200 text-slate-900 hover:border-emerald-600 hover:bg-emerald-50/40 shadow-xs';
              let badgeStyle = 'bg-slate-100 text-slate-700 border border-slate-300 font-bold';

              if (hasAnswered) {
                if (isCorrectOpt) {
                  // Correct option: vibrant green
                  optionStyle = 'bg-emerald-50 border-2 border-emerald-600 text-emerald-950 shadow-md ring-1 ring-emerald-500';
                  badgeStyle = 'bg-emerald-600 text-white font-extrabold border-emerald-700';
                } else if (isSelected && !isCorrectOpt) {
                  // User chose this and it was wrong: vibrant red
                  optionStyle = 'bg-rose-50 border-2 border-rose-500 text-rose-950 shadow-md ring-1 ring-rose-400';
                  badgeStyle = 'bg-rose-600 text-white font-extrabold border-rose-700';
                } else {
                  // Unselected wrong options
                  optionStyle = 'bg-slate-50 border border-slate-200 text-slate-500 opacity-60';
                  badgeStyle = 'bg-slate-100 text-slate-400 border-slate-200';
                }
              }

              return (
                <button
                  key={opt.id}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${optionStyle}`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5 ${badgeStyle}`}>
                    {hasAnswered && isCorrectOpt ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : hasAnswered && isSelected && !isCorrectOpt ? (
                      <XCircle className="w-5 h-5 text-white" />
                    ) : (
                      (['A', 'B', 'C', 'D'][optionIndex] ?? String(optionIndex + 1))
                    )}
                  </span>
                  <div className="flex-1 text-sm sm:text-base font-semibold leading-snug pt-0.5">
                    {opt.text}
                  </div>
                </button>
              );
            })}
          </div>

          {/* IMMEDIATE FEEDBACK & WHY IT'S RIGHT / WHY IT'S WRONG EXPLANATIONS */}
          {showExplanation && (
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-5 animate-fadeIn">
              {/* Correctness Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                selectedOptionId && currentQ.options.find(o => o.id === selectedOptionId)?.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-center gap-2.5">
                  {selectedOptionId && currentQ.options.find(o => o.id === selectedOptionId)?.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                  )}
                  <span className="font-extrabold text-sm sm:text-base">
                    {selectedOptionId && currentQ.options.find(o => o.id === selectedOptionId)?.isCorrect
                      ? 'Spot On! That is the correct Microsoft architectural choice.'
                      : 'Incorrect. Let\'s learn why the distractors are wrong.'}
                  </span>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-xs">
                  {selectedOptionId && currentQ.options.find(o => o.id === selectedOptionId)?.isCorrect ? '+25 XP' : '+5 XP for Learning'}
                </span>
              </div>

              {/* WHY IT'S RIGHT */}
              <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Why the correct option is right:
                </div>
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
                  {currentQ.whyRight}
                </p>
              </div>

              {/* WHY EACH INCORRECT OPTION IS WRONG (Distractor Breakdown) */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs uppercase tracking-wider">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Why each distractor is wrong:
                </div>
                <div className="space-y-2.5">
                  {currentQ.whyWrong.map((distractor, idx) => (
                    <div key={idx} className="text-xs sm:text-sm text-slate-700 p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                      <strong className="text-rose-800 font-bold block mb-1">
                        {distractor.optionText}:
                      </strong>
                      <span className="text-slate-600 leading-relaxed">{distractor.reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RELATABLE REAL-WORLD ANALOGY */}
              {currentQ.analogy && (
                <div className="p-4 sm:p-5 rounded-xl bg-amber-50/90 border border-amber-200 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    Relatable Real-World Analogy:
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
                    {currentQ.analogy}
                  </p>
                </div>
              )}

              {/* Microsoft Learn Reference */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-2">
                <div className="flex items-center gap-1.5 font-medium text-slate-600">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{currentQ.officialLearnRef}</span>
                </div>

                <button
                  onClick={() => onAskAI(`Deep dive: Why is "${currentQ.question}" answered this way? Give me another analogy.`)}
                  className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI Coach for more examples</span>
                </button>
              </div>

              {/* Next Question / Finish Button */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  disabled={generatingAiQuestion}
                  onClick={() => handleGenerateAiQuestion(currentQ.topic, currentQ.domain)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Generate another authentic question on this exact topic"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{generatingAiQuestion ? 'Generating Drill...' : 'AI Practice Drill on this Topic'}</span>
                </button>

                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Quiz'}</span>
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
