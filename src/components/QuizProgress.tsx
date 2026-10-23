
interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  correctAnswers: number;
}

export default function QuizProgress({
  currentQuestion,
  totalQuestions,
  correctAnswers,
}: QuizProgressProps) {
  const progress =
    totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <section
      aria-label="Quiz progress"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-800">
          Question {currentQuestion} of {totalQuestions}
        </span>

        <span className="text-sm font-semibold text-emerald-700">
          {correctAnswers} correct so far
        </span>
      </div>

      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Quiz completion"
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}
