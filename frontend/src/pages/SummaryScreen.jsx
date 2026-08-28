// frontend/src/pages/SummaryScreen.jsx
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function SummaryScreen() {
  const { childId, bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Grab session data safely
  const { missedWords = [], totalWords = 0, bookTitle = "Book", bookEmoji = "📖" } = location.state || {};

  // 1. Clean the array but KEEP duplicates for precise mathematical calculation
  const allMissedWords = Array.isArray(missedWords) 
    ? missedWords.filter(w => typeof w === 'string' && w.trim().length > 0) 
    : [];

  // 2. Precise Accuracy Calculation
  // Total words minus the exact number of times a word was skipped/missed
  const correctWordsCount = totalWords - allMissedWords.length;
  
  let accuracy = 0;
  if (totalWords > 0) {
    accuracy = Math.round((correctWordsCount / totalWords) * 100);
    // Strict bounds to prevent impossible numbers from state/network anomalies
    if (accuracy < 0) accuracy = 0;
    if (accuracy > 100) accuracy = 100;
  }

  // 3. Deduplicate ONLY for the UI, so the child doesn't see "the" listed 5 times
  const uniqueMissedWords = [...new Set(allMissedWords)];

  // Determine Badge based on exact accuracy
  let badge = { emoji: "🥉", label: "Bronze Reader", color: "bg-amber-700/20 text-amber-500 border-amber-700/50" };
  if (accuracy >= 90) {
    badge = { emoji: "🥇", label: "Gold Reader", color: "bg-yellow-400/20 text-yellow-400 border-yellow-400/50" };
  } else if (accuracy >= 75) {
    badge = { emoji: "🥈", label: "Silver Reader", color: "bg-slate-300/20 text-slate-300 border-slate-300/50" };
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-2xl bg-slate-800 rounded-[2rem] p-10 shadow-2xl border border-slate-700 text-center relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/20 to-transparent"></div>
        
        <div className="text-6xl mb-4 relative z-10">{bookEmoji}</div>
        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">You finished {bookTitle}!</h1>
        <p className="text-slate-400 mb-10 relative z-10">Here is how you did today.</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700">
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Accuracy</div>
            <div className="text-5xl font-extrabold text-emerald-400">{accuracy}%</div>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-center">
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Reward Earned</div>
            <div className={`px-4 py-2 rounded-xl border-2 font-bold flex items-center gap-2 ${badge.color}`}>
              <span className="text-2xl">{badge.emoji}</span> {badge.label}
            </div>
          </div>
        </div>

        {/* Tricky Words Review - Uses the Unique list! */}
        {uniqueMissedWords.length > 0 && (
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 mb-10">
            <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center justify-center gap-2">
              <span>🎯</span> Words to Practice
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {uniqueMissedWords.map((word, i) => (
                <span key={i} className="bg-slate-800 text-yellow-400 px-4 py-2 rounded-lg font-medium border border-yellow-500/30">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 w-full">
          <button 
            onClick={() => navigate(`/library/${childId}`)}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Back to Library
          </button>
          <button 
            onClick={() => navigate(`/read/${childId}/${bookId}`)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
          >
            Read Again
          </button>
        </div>

      </div>
    </div>
  );
}