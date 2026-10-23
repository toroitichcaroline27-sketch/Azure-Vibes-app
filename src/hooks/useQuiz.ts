
import { useMemo, useState } from "react";
import type { Question } from "../types";

export default function useQuiz(questions: Question[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isChecked, setIsChecked] = useState(false);

  const currentQuestion = questions[currentIndex] ?? null;

  const score = useMemo(
    () => correctAnswers,
    [correctAnswers],
  );

  function selectAnswer(optionId: string) {
    if (isChecked) return;
    setSelectedOptionId(optionId);
  }

  function checkAnswer() {
    if (!currentQuestion || !selectedOptionId || isChecked) return;

    const selected = currentQuestion.options.find(
      (option) => option.id === selectedOptionId,
    );

    setAnswers((previous) => ({
      ...previous,
      [currentIndex]: selectedOptionId,
    }));

    if (selected?.isCorrect) {
      setCorrectAnswers((previous) => previous + 1);
    }

    setIsChecked(true);
  }

  function nextQuestion() {
    if (!isChecked) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((previous) => previous + 1);
      setSelectedOptionId(null);
      setIsChecked(false);
    }
  }

  function resetQuiz() {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setAnswers({});
    setCorrectAnswers(0);
    setIsChecked(false);
  }

  return {
    currentIndex,
    currentQuestion,
    selectedOptionId,
    answers,
    correctAnswers: score,
    isChecked,
    isComplete: questions.length > 0 && isChecked &&
      currentIndex === questions.length - 1,
    selectAnswer,
    checkAnswer,
    nextQuestion,
    resetQuiz,
  };
}
