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

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quiz' | 'flashcards' | 'ai-coach' | 'transcripts' | 'planner'>('dashboard');
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // Cross-component handoff states
  const [quizDomain, setQuizDomain] = useState<'all' | AZDomain>('all');
  const [quizFilter, setQuizFilter] = useState<string>('all');
  const [aiPrompt, setAiPrompt] = useState<string>('');

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

  const handleStartQuiz = (domain: 'all' | AZDomain = 'all', filter: string = 'all') => {
    setQuizDomain(domain);
    setQuizFilter(filter);
    setActiveTab('quiz');
  };

  const handleAskAI = (prompt?: string) => {
    if (prompt) setAiPrompt(prompt);
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
    <div className="min-h-screen flex flex-col bg-[#070d18] text-slate-100 selection:bg-sky-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        progress={progress}
        onQuickQuiz={() => handleStartQuiz('all')}
      />

      {/* Main Content Area */}
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

        {activeTab === 'quiz' && (
          <QuizView
            initialDomain={quizDomain}
            initialFilter={quizFilter}
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

      {/* Footer with Unofficial Disclaimer */}
      <Footer />
    </div>
  );
}
