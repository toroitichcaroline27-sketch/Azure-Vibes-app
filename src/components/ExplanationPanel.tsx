
import { BookOpen, Lightbulb, ExternalLink } from "lucide-react";
import type { Question } from "../types";

interface ExplanationPanelProps {
  question: Question;
}

export default function ExplanationPanel({
  question,
}: ExplanationPanelProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <BookOpen size={21} className="text-blue-600" />
        <h3 className="text-lg font-bold text-slate-900">
          Understand the answer
        </h3>
      </div>

      <p className="text-sm leading-7 text-slate-700">
        {question.whyRight ||
          question.options.find((option) => option.isCorrect)?.explanation ||
          "Review the correct answer and the relevant study material."}
      </p>

      {question.analogy && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 flex items-center gap-2 font-bold text-amber-900">
            <Lightbulb size={19} />
            Real-world analogy
          </div>
          <p className="text-sm leading-6 text-slate-700">
            {question.analogy}
          </p>
        </div>
      )}

      {question.officialLearnRef &&
        /^https?:\/\//i.test(question.officialLearnRef) && (
          <a
            href={question.officialLearnRef}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            Read Microsoft Learn
            <ExternalLink size={16} />
          </a>
        )}
    </section>
  );
}
