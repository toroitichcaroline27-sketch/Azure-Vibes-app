
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import type { Question } from "../types";

interface QuestionCardProps {
  question: Question;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export default function QuestionCard({
  question,
  selectedOptionId,
  onSelect,
  disabled = false,
}: QuestionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      {question.scenario && (
        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
          {question.scenario}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
          {question.domainTitle}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
          {question.difficulty}
        </span>
      </div>

      <h2 className="text-xl font-bold leading-relaxed text-slate-900 sm:text-2xl">
        {question.question}
      </h2>

      <p className="mt-3 text-sm text-slate-500">
        Choose the best answer.
      </p>

      <div className="mt-6 space-y-3">
        {question.options.map((option, index) => {
          const selected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(option.id)}
              aria-pressed={selected}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
              } ${disabled ? "cursor-not-allowed opacity-80" : ""}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                {String.fromCharCode(65 + index)}
              </span>

              <span className="flex-1 pt-1 text-sm font-medium leading-6 text-slate-800">
                {option.text}
              </span>

              {selected ? (
                <CheckCircle2 size={20} className="mt-1 shrink-0 text-blue-600" />
              ) : (
                <Circle size={20} className="mt-1 shrink-0 text-slate-300" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
