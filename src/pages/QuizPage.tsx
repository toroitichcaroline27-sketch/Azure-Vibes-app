
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Question } from "../types";
import AnswerFeedback from "../components/AnswerFeedback";
import ExplanationPanel from "../components/ExplanationPanel";
import QuestionCard from "../components/QuestionCard";
import QuizProgress from "../components/QuizProgress";
import useQuiz from "../hooks/useQuiz";

interface QuizPageProps {
  questions: Question[];
  onBack: () => void;
  onFinish: (result: {
    questions: Question[];
    answers: Record<number, string>;
    correctAnswers: number;
  }) => void;
}

export default function QuizPage({
  questions,
  onBack,
  onFinish,
}: QuizPageProps) {
  const quiz = useQuiz(questions);
  const question = quiz.currentQuestion;

  if (questions.length === 0 || !question) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          No questions available
        </h1>
        <p className="mt-3 text-slate-600">
          Try another topic or return to topic selection.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Back to topics
        </button>
      </main>
    );
  }

  const isLastQuestion = quiz.currentIndex === questions.length - 1;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-blue-700"
      >
        <ArrowLeft size={17} />
        Exit quiz
      </button>

      <QuizProgress
        currentQuestion={quiz.currentIndex + 1}
        totalQuestions={questions.length}
        correctAnswers={quiz.correctAnswers}
      />

      <QuestionCard
        question={question}
        selectedOptionId={quiz.selectedOptionId}
        onSelect={quiz.selectAnswer}
        disabled={quiz.isChecked}
      />

      {quiz.isChecked && quiz.selectedOptionId && (
        <>
          <AnswerFeedback
            question={question}
            selectedOptionId={quiz.selectedOptionId}
          />
          <ExplanationPanel question={question} />
        </>
      )}

      <div className="flex justify-end">
        {!quiz.isChecked ? (
          <button
            type="button"
            disabled={!quiz.selectedOptionId}
            onClick={quiz.checkAnswer}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={18} />
            Check answer
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (isLastQuestion) {
                onFinish({
                  questions,
                  answers: quiz.answers,
                  correctAnswers: quiz.correctAnswers,
                });
              } else {
                quiz.nextQuestion();
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {isLastQuestion ? "View results" : "Next question"}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </main>
  );
}
