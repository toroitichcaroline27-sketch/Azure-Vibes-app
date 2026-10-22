export type AZDomain = 'concepts' | 'architecture' | 'management';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuestionDistractorExplanation {
  optionId: string;
  optionText: string;
  reason: string;
}

export interface Question {
  id: string;
  domain: AZDomain;
  domainTitle: string;
  topic: string;
  subtopic: string;
  difficulty: 'beginner' | 'intermediate' | 'exam-ready';
  question: string;
  scenario?: string;
  options: QuestionOption[];
  whyRight: string;
  whyWrong: QuestionDistractorExplanation[];
  analogy: string;
  officialLearnRef: string;
}

export interface Flashcard {
  id: string;
  domain: AZDomain;
  term: string;
  category: string;
  summary: string;
  keyTakeaway: string;
  analogy: string;
  commonExamTrap: string;
  status: 'unseen' | 'needs_practice' | 'mastered';
  lastReviewed: number | null;
}

export interface QuizAttemptAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  timestamp: number;
  domainFilter: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  answers: QuizAttemptAnswer[];
}

export interface WeakArea {
  topic: string;
  domain: AZDomain;
  missCount: number;
  totalCount: number;
  accuracy: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
}

export interface UserProgress {
  overallReadiness: number;
  domainScores: {
    concepts: number;
    architecture: number;
    management: number;
  };
  domainTotals: {
    concepts: number;
    architecture: number;
    management: number;
  };
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  streakDays: number;
  xp: number;
  unlockedBadges: Badge[];
  weakAreas: WeakArea[];
  flashcards: {
    total: number;
    mastered: number;
    needsPractice: number;
    unseen: number;
  };
}

export interface StudyPlanTask {
  id: string;
  text: string;
  completed: boolean;
  type: 'read' | 'quiz' | 'flashcard' | 'lab';
}

export interface StudyPlanDay {
  dayNumber: number;
  title: string;
  domain: AZDomain;
  estimatedHours: number;
  tasks: StudyPlanTask[];
}

export interface StudyPlan {
  targetExamDate: string;
  dailyHours: number;
  experienceLevel: 'beginner' | 'intermediate' | 'cram';
  planGeneratedAt: number;
  days: StudyPlanDay[];
}

export interface StudyNote {
  id: string;
  title: string;
  category: string;
  timestamp: number;
  audioFileName?: string;
  durationSeconds?: number;
  transcript: string;
  summary: string;
  keyTerms: string[];
  examTips: string[];
  isStarred: boolean;
}
