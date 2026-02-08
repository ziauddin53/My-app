
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizModalProps {
  onClose: () => void;
  onComplete: (points: number) => void;
}

// Static fallback questions for user quiz
const DEFAULT_QUESTIONS: QuizQuestion[] = [
  { question: "বাংলাদেশের জাতীয় ফলের নাম কি?", options: ["আম", "কাঁঠাল", "লিচু", "কলা"], correctAnswer: 1 },
  { question: "৫ + ৫ × ২ = কত?", options: ["২০", "১৫", "১০", "২৫"], correctAnswer: 1 },
  { question: "বিশ্বের বৃহত্তম ম্যানগ্রোভ বন কোনটি?", options: ["সুন্দরবন", "আমাজন", "আফ্রিকান জঙ্গল", "ভাওয়াল বন"], correctAnswer: 0 }
];

const QuizModal: React.FC<QuizModalProps> = ({ onClose, onComplete }) => {
  const [questions] = useState<QuizQuestion[]>(DEFAULT_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (idx: number) => {
    if (idx === questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
    }
    
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
    }
  };

  const progress = (currentIdx / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white animate-in zoom-in duration-300">
        {!finished ? (
          <div className="flex flex-col h-full">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-black text-slate-800">ম্যাথ ও নলেজ চ্যালেঞ্জ</h3>
              <button onClick={onClose} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="h-1.5 w-full bg-indigo-50">
               <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="p-8">
              <p className="text-2xl font-bold text-slate-800 mb-8">{questions[currentIdx]?.question}</p>
              <div className="grid gap-3">
                {questions[currentIdx]?.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="w-full text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 font-bold transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-xl shadow-indigo-200">🎉</div>
            <h2 className="text-4xl font-black text-slate-800">চমৎকার!</h2>
            <p className="text-slate-400 font-medium mt-2 mb-8">আপনি {questions.length}টির মধ্যে {score}টি সঠিক উত্তর দিয়েছেন।</p>
            <button
              onClick={() => onComplete(score * 50)}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all"
            >
              পুরস্কার নিন ({score * 50} pts)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
