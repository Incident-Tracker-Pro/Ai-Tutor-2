import React, { useState } from 'react';
import { BookOpen, Brain, Target, ChevronRight, CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { StudySession, StudyQuestion } from '../types';

interface StudyModeProps {
  conversationId: string;
  conversationTitle: string;
  onClose: () => void;
  onGenerateStudySession: (conversationId: string, type: 'quiz' | 'flashcards' | 'practice') => Promise<StudySession>;
}

export function StudyMode({ conversationId, conversationTitle, onClose, onGenerateStudySession }: StudyModeProps) {
  const [selectedType, setSelectedType] = useState<'quiz' | 'flashcards' | 'practice' | null>(null);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [flippedCards, setFlippedCards] = useState<{[key: string]: boolean}>({});

  const studyTypes = [
    {
      id: 'quiz' as const,
      title: 'Quiz Mode',
      description: 'Test your knowledge with multiple choice questions',
      icon: Target,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'flashcards' as const,
      title: 'Flashcards',
      description: 'Review key concepts with interactive flashcards',
      icon: BookOpen,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'practice' as const,
      title: 'Practice Problems',
      description: 'Solve practice problems and get detailed explanations',
      icon: Brain,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const handleGenerateSession = async (type: 'quiz' | 'flashcards' | 'practice') => {
    setIsGenerating(true);
    try {
      const session = await onGenerateStudySession(conversationId, type);
      setStudySession(session);
      setSelectedType(type);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowResults(false);
      setFlippedCards({});
    } catch (error) {
      console.error('Error generating study session:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    if (!studySession) return;
    
    // Calculate scores and mark answers
    const updatedQuestions = studySession.questions.map(q => ({
      ...q,
      userAnswer: userAnswers[q.id],
      isCorrect: userAnswers[q.id] === q.answer
    }));
    
    const correctAnswers = updatedQuestions.filter(q => q.isCorrect).length;
    const score = Math.round((correctAnswers / updatedQuestions.length) * 100);
    
    setStudySession(prev => prev ? {
      ...prev,
      questions: updatedQuestions,
      score,
      completedAt: new Date()
    } : null);
    
    setShowResults(true);
  };

  const handleFlipCard = (questionId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setFlippedCards({});
  };

  if (!studySession) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Study Mode</h2>
              <p className="text-sm text-gray-600 mt-1">Generate study materials from: {conversationTitle}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {studyTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleGenerateSession(type.id)}
                  disabled={isGenerating}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${type.color}`}>
                    <type.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{type.title}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
            
            {isGenerating && (
              <div className="text-center mt-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 mt-2">Generating study materials...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz Mode Rendering
  if (selectedType === 'quiz') {
    const currentQuestion = studySession.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / studySession.questions.length) * 100;

    if (showResults) {
      const correctCount = studySession.questions.filter(q => q.isCorrect).length;
      const totalCount = studySession.questions.length;
      
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{studySession.score}%</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Quiz Complete!</h2>
                <p className="text-gray-600">{correctCount} out of {totalCount} correct</p>
              </div>
              <div className="space-y-4 mb-6">
                {studySession.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-2">
                      {question.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{question.question}</p>
                        <p className="text-sm text-green-600 mt-1">Correct: {question.answer}</p>
                        {question.userAnswer !== question.answer && (
                          <p className="text-sm text-red-600">Your answer: {question.userAnswer}</p>
                        )}
                        {question.explanation && (
                          <p className="text-sm text-gray-600 mt-2">{question.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleRestart} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Quiz Mode</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestionIndex + 1} of {studySession.questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{currentQuestion.question}</h3>
              <div className="space-y-2">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      userAnswers[currentQuestion.id] === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentQuestionIndex === studySession.questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length !== studySession.questions.length}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  disabled={!userAnswers[currentQuestion.id]}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Flashcards Mode Rendering
  if (selectedType === 'flashcards') {
    const currentQuestion = studySession.questions[currentQuestionIndex];
    const isFlipped = flippedCards[currentQuestion.id] || false;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Flashcards</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Card {currentQuestionIndex + 1} of {studySession.questions.length}</span>
              </div>
            </div>
            <div
              onClick={() => handleFlipCard(currentQuestion.id)}
              className="min-h-[200px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all mb-6 flex items-center justify-center text-center"
            >
              <div>
                {!isFlipped ? (
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">{currentQuestion.question}</p>
                    <p className="text-sm text-gray-600">Click to reveal answer</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-blue-700 mb-2">{currentQuestion.answer}</p>
                    {currentQuestion.explanation && (
                      <p className="text-sm text-gray-600 mt-4">{currentQuestion.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(studySession.questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === studySession.questions.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Practice Problems Mode (similar structure to quiz but with open-ended questions)
  return null;
}
