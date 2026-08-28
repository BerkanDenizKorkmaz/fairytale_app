// frontend/src/pages/ReadingScreen.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function ReadingScreen() {
  const { childId, bookId } = useParams();
  const navigate = useNavigate();
  
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isListening, setIsListening] = useState(false);
  
  const [wordStatuses, setWordStatuses] = useState([]);
  
  // NEW: State for the "Stuck" Pop-up
  const [showStuckPopup, setShowStuckPopup] = useState(false);
  
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    const fetchBookContent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/profiles/${childId}/books`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const targetRecord = response.data.find(item => item.book_id === parseInt(bookId));
        if (targetRecord) {
          setBookData(targetRecord.book);
          
          const wordsArray = targetRecord.book.content.split(/\s+/);
          setWords(wordsArray);
          
          let startIndex = 0;
          if (targetRecord.progress > 0) {
            startIndex = Math.round((targetRecord.progress / 100) * wordsArray.length);
            if (startIndex >= wordsArray.length) startIndex = wordsArray.length - 1;
            setCurrentWordIndex(startIndex);
            setProgressPercentage(targetRecord.progress);
          }

          const initialStatuses = wordsArray.map((_, index) => 
            index < startIndex ? 'correct' : 'pending'
          );
          setWordStatuses(initialStatuses);
        }
      } catch (error) {
        console.error("Failed to load book:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookContent();
  }, [childId, bookId]);

  useEffect(() => {
    if (words.length > 0) {
      const currentPercent = Math.round((currentWordIndex / words.length) * 100);
      setProgressPercentage(currentPercent);
    }
  }, [currentWordIndex, words.length]);

  // NEW: The Stuck Timer Logic
  useEffect(() => {
    setShowStuckPopup(false); // Reset popup when word changes

    if (!isListening || currentWordIndex >= words.length) return;

    // If they sit on the same word for 4 seconds, show the popup
    const timer = setTimeout(() => {
      setShowStuckPopup(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentWordIndex, isListening, words.length]);

  const handleSkipWord = () => {
    setWordStatuses(prev => {
      const next = [...prev];
      next[currentWordIndex] = 'missed';
      return next;
    });
    setCurrentWordIndex(prev => prev + 1);
    setShowStuckPopup(false);
  };

  const handleSaveAndExit = async () => {
    shouldListenRef.current = false;
    if (recognitionRef.current) recognitionRef.current.stop();

    try {
      const token = localStorage.getItem('token');
      await api.patch(`/profiles/${childId}/books/${bookId}`, 
        { progress: progressPercentage }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to save progress", error);
    }
    
    navigate(`/library/${childId}`);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript.toLowerCase() + ' ';
        }

        setCurrentWordIndex((prevIndex) => {
          if (prevIndex >= words.length) return prevIndex;

          const targetWord = words[prevIndex].toLowerCase().replace(/[^a-z0-9]/g, '');
          
          if (currentTranscript.includes(targetWord) && targetWord !== '') {
            setWordStatuses(prevStatuses => {
              const newStatuses = [...prevStatuses];
              if (newStatuses[prevIndex] !== 'missed') {
                newStatuses[prevIndex] = 'correct';
              }
              return newStatuses;
            });
            return prevIndex + 1;
          }
          return prevIndex;
        });
      };

      recognitionRef.current.onend = () => {
        if (shouldListenRef.current) {
          try { recognitionRef.current.start(); } catch (e) { console.error("Auto-restart failed", e); }
        } else {
          setIsListening(false);
        }
      };
    }

    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [words]);

  const toggleListening = () => {
    if (isListening) {
      shouldListenRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        shouldListenRef.current = true;
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error("Microphone failed to start:", error);
      }
    }
  };

const speakWord = (word, index) => {
    const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanWord);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

const handleFinishBook = async () => {
    // 1. Gather all missed/skipped words
    const missedWordsList = words.filter((_, index) => wordStatuses[index] === 'missed');
    const totalWordsCount = words.length;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 2. Save the completed session stats to the database
      await api.post(`/profiles/${childId}/books/${bookId}/sessions`, {
        missed_words: missedWordsList.join(','),
        total_words: totalWordsCount
      }, { headers });

      // 3. Reset the book progress back to 0% for the next read
      await api.patch(`/profiles/${childId}/books/${bookId}`, 
        { progress: 0 }, 
        { headers }
      );
      
    } catch (error) {
      console.error("Failed to record session or reset progress:", error);
    }

    // 4. Navigate to the summary screen with the session statistics
    navigate(`/summary/${childId}/${bookId}`, { 
      state: { 
        missedWords: missedWordsList,
        totalWords: totalWordsCount,
        bookTitle: bookData.title,
        bookEmoji: bookData.emoji
      } 
    });
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400 text-2xl animate-pulse">Opening book...</div>;
  if (!bookData) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-2xl">Book not found.</div>;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-6 relative">
      
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <button 
          onClick={handleSaveAndExit}
          className="text-slate-400 hover:text-white font-medium transition-colors flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700"
        >
          ← Save & Exit
        </button>
        
        <button 
          onClick={toggleListening}
          className={`font-bold px-6 py-3 rounded-xl border flex items-center gap-2 transition-all shadow-lg transform hover:-translate-y-1 ${
            isListening 
              ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30' 
              : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
          }`}
        >
          {isListening ? '🛑 Stop Reading' : '🎤 Start Reading'}
        </button>
      </div>

      <div className="w-full max-w-4xl mb-8 flex items-center gap-4">
        <div className="w-full bg-slate-800 rounded-full h-4 border border-slate-700 overflow-hidden shadow-inner">
          <div 
            className="bg-indigo-500 h-4 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <span className="text-indigo-400 font-bold min-w-[3rem] text-right">{progressPercentage}%</span>
      </div>

      <div className="w-full max-w-4xl bg-slate-50 rounded-[3rem] p-12 md:p-20 shadow-2xl min-h-[60vh] relative border-8 border-slate-800">
        
        {/* NEW: Stuck Popup */}
        {showStuckPopup && (
          <div className="absolute top-4 right-8 bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border-2 border-indigo-400 flex items-center gap-4 animate-bounce z-10">
            <span className="font-medium">Stuck on a word?</span>
            <button 
              onClick={handleSkipWord}
              className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-xl font-bold transition-colors"
            >
              Skip it ➔
            </button>
          </div>
        )}

        <div className="text-center mb-12">
          <div className="text-8xl mb-6">{bookData.emoji}</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800">{bookData.title}</h1>
        </div>
        
        <div className="text-2xl md:text-3xl leading-relaxed font-medium flex flex-wrap gap-x-3 gap-y-4 cursor-pointer">
          {words.map((word, index) => {
            let wordStyle = "transition-all duration-300 rounded-lg px-1 ";
            
            if (index === currentWordIndex) {
              // Now BLUE for the current word
              wordStyle += "text-blue-900 bg-blue-200 transform scale-110 shadow-sm border border-blue-300";
            } else if (wordStatuses[index] === 'correct') {
              wordStyle += "text-emerald-600 font-bold";
            } else if (wordStatuses[index] === 'missed') {
              // Now YELLOW for missed words
              wordStyle += "text-yellow-500 font-bold underline decoration-yellow-300 decoration-4";
            } else {
              wordStyle += "text-slate-400 hover:bg-indigo-100 hover:text-indigo-600";
            }

            return (
              <span 
                key={index} 
                className={wordStyle}
                onClick={() => speakWord(word, index)}
                title="Click to hear pronunciation"
              >
                {word}
              </span>
            );
          })}
        </div>
        
        {currentWordIndex >= words.length && words.length > 0 && (
          <div className="mt-12 text-center">
             <button 
                onClick={handleFinishBook}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-1 animate-bounce"
             >
                🎉 I Finished the Book! 🎉
             </button>
          </div>
        )}
      </div>
      
    </div>
  );
}