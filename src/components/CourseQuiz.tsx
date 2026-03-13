'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, ArrowRight, Lock } from 'lucide-react';

interface Question {
  id: number;
  question_number: number;
  question: string;
  image_path: string;
  options: string[];
}

interface QuizResult {
  question_number: number;
  correct: boolean;
  correct_option: number;
  user_answer: number;
}

interface CourseQuizProps {
  chapterSlug: string;
  chapterTitle: string;
  chapterNumber: number;
  onQuizPassed: () => void;
  isLoggedIn: boolean;
}

export default function CourseQuiz({ chapterSlug, chapterTitle, chapterNumber, onQuizPassed, isLoggedIn }: CourseQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/course/quiz/${chapterSlug}`)
      .then(r => r.json())
      .then(data => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [chapterSlug]);

  const handleSelectOption = (optionIndex: number) => {
    if (submitted) return;
    setSelectedOption(optionIndex);
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].question_number]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(answers[questions[currentQuestion + 1]?.question_number] ?? null);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedOption(answers[questions[currentQuestion - 1]?.question_number] ?? null);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/course/quiz/${chapterSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      setResults(data.results || []);
      setScore(data.score);
      setTotal(data.total);
      setPassed(data.passed);
      setSubmitted(true);

      if (data.passed) {
        onQuizPassed();
      }
    } catch (err) {
      console.error('Quiz submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setSelectedOption(null);
    setSubmitted(false);
    setResults([]);
    setScore(0);
    setPassed(false);
  };

  if (loading) {
    return (
      <div className="mt-12 p-8 bg-gray-50 rounded-2xl text-center">
        <div className="loading-spinner mx-auto"></div>
        <p className="text-gray-500 mt-4">Laster quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) return null;

  // Results view
  if (submitted) {
    return (
      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`p-6 text-center ${passed ? 'bg-gradient-to-r from-[#8DC99C] to-[#5a9a6a]' : 'bg-gradient-to-r from-red-400 to-red-500'}`}>
          <h3 className="text-2xl font-bold text-white mb-1">
            {passed ? '🎉 Gratulerer!' : '😅 Prøv igjen!'}
          </h3>
          <p className="text-white/90">
            Du fikk {score} av {total} riktig
            {passed ? ' — du kan gå videre!' : ' — du trenger 100% for å fortsette.'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {results.map((result, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${result.correct ? 'bg-green-50' : 'bg-red-50'}`}>
              {result.correct ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-gray-900 text-sm">{questions[i]?.question}</p>
                {!result.correct && (
                  <p className="text-xs text-red-600 mt-1">
                    Riktig svar: {questions[i]?.options[result.correct_option]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-100 text-center">
          {passed ? (
            <p className="text-[#5a9a6a] font-semibold flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Kapittel fullført! Du kan nå gå videre.
            </p>
          ) : (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Ta quizen på nytt
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz question view
  const q = questions[currentQuestion];
  const allAnswered = Object.keys(answers).length === questions.length;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Quiz header */}
      <div className="bg-gradient-to-r from-[#8DC99C]/10 to-[#5a9a6a]/10 p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">
            📝 Quiz — Kapittel {chapterNumber}
          </h3>
          <span className="text-sm text-gray-500">
            Spørsmål {currentQuestion + 1} av {questions.length}
          </span>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5 mt-3">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i === currentQuestion
                  ? 'bg-[#5a9a6a]'
                  : answers[questions[i]?.question_number] !== undefined
                    ? 'bg-[#8DC99C]'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question image */}
      {q.image_path && (
        <div className="w-full h-48 sm:h-56 relative overflow-hidden bg-gray-100">
          <img
            src={q.image_path}
            alt={`Quiz spørsmål ${q.question_number}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Question */}
      <div className="p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-6">{q.question}</h4>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelectOption(i)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedOption === i
                  ? 'border-[#5a9a6a] bg-[#8DC99C]/10 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  selectedOption === i
                    ? 'bg-[#5a9a6a] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className={`font-medium ${selectedOption === i ? 'text-[#5a9a6a]' : 'text-gray-700'}`}>
                  {option}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className="px-4 py-2 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          ← Forrige
        </button>

        {isLastQuestion && allAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || !isLoggedIn}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5a9a6a] hover:bg-[#4a8a5a] text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? 'Sjekker...' : 'Lever quiz'}
            {!isLoggedIn && <Lock className="w-4 h-4" />}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="inline-flex items-center gap-2 px-4 py-2 text-[#5a9a6a] hover:bg-[#8DC99C]/10 rounded-lg font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          >
            Neste <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
