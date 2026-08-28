// frontend/src/pages/Library.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Library({ onLogout }) {
  const { childId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('downloaded');
  
  const [catalogueBooks, setCatalogueBooks] = useState([]);
  const [downloadedBooks, setDownloadedBooks] = useState([]);
  const [sessions, setSessions] = useState([]); // NEW: State for past sessions
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch ALL data: Catalogue, Downloaded Books, AND Session History
        const [catalogueRes, downloadedRes, sessionsRes] = await Promise.all([
          api.get('/books', { headers }),
          api.get(`/profiles/${childId}/books`, { headers }),
          api.get(`/profiles/${childId}/sessions`, { headers }) // Fetch history
        ]);
        
        setCatalogueBooks(catalogueRes.data);
        setDownloadedBooks(downloadedRes.data);
        setSessions(sessionsRes.data);
      } catch (error) {
        console.error("Failed to fetch library data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLibraryData();
  }, [childId]);

  const handleDownload = async (bookId) => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/profiles/${childId}/books/${bookId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDownloadedBooks([...downloadedBooks, response.data]);
      setActiveTab('downloaded');
    } catch (error) {
      console.error("Failed to download book:", error);
    } finally {
      setIsDownloading(false);
    }
  };

const viewSessionSummary = (session) => {
    // Avoid creating [""] when session.missed_words is empty
    const missedArray = session.missed_words && session.missed_words.trim().length > 0 
      ? session.missed_words.split(',').filter(Boolean) 
      : [];

    navigate(`/summary/${childId}/${session.book_id}`, { 
      state: { 
        missedWords: missedArray,
        totalWords: session.total_words || 0,
        bookTitle: session.book?.title || "Book",
        bookEmoji: session.book?.emoji || "📖"
      } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-6 relative">
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <button onClick={() => navigate('/')} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-2">
          ← Back to Profiles
        </button>
        <button onClick={onLogout} className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors">
          Sign Out
        </button>
      </div>

      <div className="w-full max-w-5xl bg-slate-800 rounded-3xl p-8 border border-slate-700 min-h-[60vh] shadow-xl">
        <div className="flex justify-between items-end border-b border-slate-700 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Library</h1>
          </div>
          
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
            <button 
              onClick={() => setActiveTab('downloaded')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'downloaded' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Ready to Read
            </button>
            <button 
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'search' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Book Catalogue
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Reading History
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-indigo-400 animate-pulse">Loading library...</div>
        ) : (
          <>
            {activeTab === 'downloaded' && (
              <div className="flex flex-wrap gap-6">
                {downloadedBooks.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => navigate(`/read/${childId}/${item.book.id}`)} 
                    className="bg-slate-700 p-6 rounded-2xl border border-slate-600 w-48 flex flex-col items-center hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{item.book.emoji}</div>
                    <h3 className="text-white font-medium text-center mb-2">{item.book.title}</h3>
                    
                    {/* Progress Bar Container */}
                    <div className="w-full bg-slate-900 rounded-full h-2.5 mt-auto">
                      <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                    </div>
                    {/* Percentage label restored */}
                    <span className="text-xs text-slate-400 mt-2">{item.progress}% Complete</span>
                  </div>
                ))}
                {downloadedBooks.length === 0 && <p className="text-slate-500 w-full text-center py-10">No books downloaded yet.</p>}
              </div>
            )}

            {activeTab === 'search' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogueBooks.map(book => {
                  const isDownloaded = downloadedBooks.some(item => item.book_id === book.id);
                  return (
                    <div key={book.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl bg-slate-800 p-3 rounded-lg">{book.emoji}</div>
                        <h3 className="text-white font-medium">{book.title}</h3>
                      </div>
                      <button 
                        onClick={() => handleDownload(book.id)}
                        disabled={isDownloaded || isDownloading}
                        className={`text-xs font-bold uppercase px-4 py-2 rounded-lg border ${isDownloaded ? 'text-slate-500 bg-slate-800 border-slate-700 cursor-not-allowed' : 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 border-emerald-400/30'}`}
                      >
                        {isDownloaded ? 'Downloaded' : 'Download'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* NEW: Reading History Tab */}
            {activeTab === 'history' && (
              <div className="flex flex-col gap-4">
                {sessions.length > 0 ? sessions.map(session => (
                  <div key={session.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center justify-between hover:border-amber-500/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl bg-slate-800 p-3 rounded-lg">{session.book.emoji}</div>
                      <div>
                        <h3 className="text-white font-medium">{session.book.title}</h3>
                        <p className="text-xs text-slate-400">Session ID: {session.id} • Total Words: {session.total_words}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => viewSessionSummary(session)}
                      className="text-sm font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-4 py-2 rounded-lg border border-amber-400/30 transition-colors"
                    >
                      View Summary
                    </button>
                  </div>
                )) : (
                  <p className="text-slate-500 w-full text-center py-10">No reading sessions completed yet.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}