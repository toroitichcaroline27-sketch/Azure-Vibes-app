
import { ArrowLeft } from "lucide-react";
import type { Question } from "../types";
import ResultsSummary from "../components/ResultsSummary";

interface ResultsPageProps {
  questions: Question[];
  answers: Record<number, string>;
  correctAnswers: number;
  onRetry: () => void;
  onBackToTopics: () => void;
}

export default function ResultsPage({
  questions,
  answers,
  correctAnswers,
  onRetry,
  onBackToTopics,
}: ResultsPageProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <ResultsSummary
        totalQuestions={questions.length}
        correctAnswers={correctAnswers}
        onRetry={onRetry}
        onBackToTopics={onBackToTopics}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="text-xl font-bold text-slate-900">
          Review your answers
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Revisit each question and identify the concepts you should study again.
        </p>

        <div className="mt-5 space-y-4">
          {questions.map((question, index) => {
            const chosenId = answers[index];
            const chosen = question.options.find(
              (option) => option.id === chosenId,
            );
            const correct = question.options.find(
              (option) => option.isCorrect,
            );

            return (
              <article
                key={`${index}-${question.question}`}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Question {index + 1}
                </p>

                <h3 className="mt-2 font-semibold leading-6 text-slate-900">
                  {question.question}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Your answer: {chosen?.text ?? "Not answered"}
                </p>

                {chosen?.id !== correct?.id && (
                  <p className="mt-2 text-sm font-semibold text-emerald-700">
                    Correct answer: {correct?.text}
                  </p>
                )}

                {correct?.explanation && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {correct.explanation}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <button
        type="button"
        onClick={onBackToTopics}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
      >
        <ArrowLeft size={17} />
        Return to topics
      </button>
    </main>
  );
}
