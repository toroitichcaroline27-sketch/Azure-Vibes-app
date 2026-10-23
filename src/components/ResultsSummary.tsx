
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy } from "lucide-react";

interface ResultsSummaryProps {
  totalQuestions: number;
  correctAnswers: number;
  onRetry: () => void;
  onBackToTopics: () => void;
}

export default function ResultsSummary({
  totalQuestions,
  correctAnswers,
  onRetry,
  onBackToTopics,
}: ResultsSummaryProps) {
  const percentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const message =
    percentage >= 80
      ? "Excellent work! Keep building on your knowledge."
      : percentage >= 60
        ? "Good progress! Review a few areas and try again."
        : "Every attempt is progress. Review the explanations and practise again.";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        <Trophy size={32} />
      </div>

      <p className="mt-5 text-sm font-bold uppercase tracking-widest text-blue-700">
        Quiz completed
      </p>

      <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
        Your results
      </h2>

      <div className="mx-auto my-7 flex h-36 w-36 flex-col items-center justify-center rounded-full border-8 border-blue-100 bg-blue-50">
        <span className="text-4xl font-extrabold text-blue-700">
          {percentage}%
        </span>
        <span className="mt-1 text-xs font-semibold text-slate-500">
          Your score
        </span>
      </div>

      <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-2xl font-extrabold text-slate-900">
            {correctAnswers}
          </p>
          <p className="mt-1 text-sm text-slate-500">Correct</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-2xl font-extrabold text-slate-900">
            {Math.max(0, totalQuestions - correctAnswers)}
          </p>
          <p className="mt-1 text-sm text-slate-500">To review</p>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-md leading-7 text-slate-600">
        {message}
      </p>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <RotateCcw size={18} />
          Try again
        </button>

        <button
          type="button"
          onClick={onBackToTopics}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Back to topics
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <CheckCircle2 size={15} />
        Review explanations to strengthen your understanding.
      </div>
    </section>
  );
}
