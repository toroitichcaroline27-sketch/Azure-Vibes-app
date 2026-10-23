
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { QuizView } from './components/QuizView';
import { FlashcardView } from './components/FlashcardView';
import { AIStudyBuddyView } from './components/AIStudyBuddyView';
import { AudioTranscriberView } from './components/AudioTranscriberView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { Footer } from './components/Footer';
import { UserProgress, AZDomain } from './types';
import TopicSelectionPage from './pages/TopicSelectionPage';
import type { AZTopic } from './data/topics';

type AppTab =
  | 'dashboard'
  | 'topics'
  | 'quiz'
  | 'flashcards'
  | 'ai-coach'
  | 'transcripts'
  | 'planner';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // Cross-component handoff states
  const [quizDomain, setQuizDomain] = useState<'all' | AZDomain>('all');
  const [quizFilter, setQuizFilter] = useState<string>('all');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [quizTopic, setQuizTopic] = useState<AZTopic | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress');
      const data = await res.json();

      if (data.success && data.progress) {
        setProgress(data.progress);
      }
    } catch (err) {
      console.error('Error fetching user progress:', err);
    }
  };

  // Start a regular quiz from the dashboard or another feature.
  const handleStartQuiz = (
    domain: 'all' | AZDomain = 'all',
    filter: string = 'all'
  ) => {
    setQuizTopic(null);
    setQuizDomain(domain);
    setQuizFilter(filter);
    setActiveTab('quiz');
  };

  // Start a quiz for the topic selected on the topic-selection page.
  const handleSelectTopic = (topic: AZTopic) => {
    setQuizTopic(topic);
    setQuizDomain(topic.domain);
    setQuizFilter('all');
    setActiveTab('quiz');
  };

  const handleAskAI = (prompt?: string) => {
    if (prompt) {
      setAiPrompt(prompt);
    }

    setActiveTab('ai-coach');
  };

  const handleQuizComplete = (attemptData: any) => {
    if (attemptData.progress) {
      setProgress(attemptData.progress);
    } else {
      fetchProgress();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7faf7] text-[#173b2a] selection:bg-green-200 selection:text-green-950">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        progress={progress}
        onQuickQuiz={() => handleStartQuiz('all')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            progress={progress}
            onStartQuiz={handleStartQuiz}
            onOpenFlashcards={() => setActiveTab('flashcards')}
            onAskAI={handleAskAI}
            onOpenPlanner={() => setActiveTab('planner')}
          />
        )}

        {activeTab === 'topics' && (
          <TopicSelectionPage
            onSelectTopic={handleSelectTopic}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            initialDomain={quizDomain}
            initialFilter={quizFilter}
            initialTopic={quizTopic}
            onQuizComplete={handleQuizComplete}
            onAskAI={handleAskAI}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardView
            onAskAI={handleAskAI}
            onUpdateStats={fetchProgress}
          />
        )}

        {activeTab === 'ai-coach' && (
          <AIStudyBuddyView
            initialPrompt={aiPrompt}
            onClearInitialPrompt={() => setAiPrompt('')}
          />
        )}

        {activeTab === 'transcripts' && (
          <AudioTranscriberView />
        )}

        {activeTab === 'planner' && (
          <StudyPlannerView
            onStartQuiz={handleStartQuiz}
            onOpenFlashcards={() => setActiveTab('flashcards')}
            onAskAI={handleAskAI}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
