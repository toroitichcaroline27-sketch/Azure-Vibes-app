
import { CheckCircle2, XCircle } from "lucide-react";
import type { Question } from "../types";

interface AnswerFeedbackProps {
  question: Question;
  selectedOptionId: string;
}

export default function AnswerFeedback({
  question,
  selectedOptionId,
}: AnswerFeedbackProps) {
  const selected = question.options.find(
    (option) => option.id === selectedOptionId,
  );

  if (!selected) return null;

  return (
    <section
      role="status"
      className={`rounded-xl border p-4 ${
        selected.isCorrect
          ? "border-emerald-200 bg-emerald-50"
          : "border-rose-200 bg-rose-50"
      }`}
    >
      <div className="flex items-start gap-3">
        {selected.isCorrect ? (
          <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={22} />
        ) : (
          <XCircle className="mt-0.5 shrink-0 text-rose-700" size={22} />
        )}

        <div>
          <h3
            className={`font-bold ${
              selected.isCorrect ? "text-emerald-900" : "text-rose-900"
            }`}
          >
            {selected.isCorrect ? "Correct answer!" : "Not quite"}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-700">
            {selected.explanation ||
              (selected.isCorrect
                ? question.whyRight
                : "Review the explanation below to understand the correct answer.")}
          </p>

          {!selected.isCorrect && (
            <p className="mt-2 text-sm font-semibold text-slate-800">
              Correct answer:{" "}
              {question.options.find((option) => option.isCorrect)?.text}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
