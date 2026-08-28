// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Dashboard({ token, onLogout }) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildEmoji, setNewChildEmoji] = useState('🦸‍♂️');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await api.get('/profiles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfiles(response.data);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [token]);

  // Function to save the new child to the database
  const handleAddProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/profiles', {
        name: newChildName,
        avatar_url: newChildEmoji
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Instantly add the new profile to the screen
      setProfiles([...profiles, response.data]);
      
      // Close and reset the modal
      setIsModalOpen(false);
      setNewChildName('');
      setNewChildEmoji('🦸‍♂️');
    } catch (error) {
      console.error("Failed to create profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const emojiOptions = ['🦸‍♂️', '🧚‍♀️', '🐉', '🧙‍♂️', '🧜‍♀️', '🚀', '🦖', '🦄'];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative">
      
      <div className="w-full max-w-4xl flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-white">Who is reading today?</h1>
        <button 
          onClick={onLogout}
          className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-8 max-w-4xl">
        {loading ? (
          <div className="text-indigo-400 animate-pulse">Loading profiles...</div>
        ) : (
          <>
            {profiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => navigate(`/library/${profile.id}`)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-32 h-32 rounded-3xl bg-indigo-500 flex items-center justify-center text-5xl shadow-lg transform transition-all duration-300 group-hover:scale-105 border-4 border-slate-800 group-hover:border-indigo-400">
                  {profile.avatar_url}
                </div>
                <span className="mt-4 text-slate-300 font-medium text-lg group-hover:text-white transition-colors">
                  {profile.name}
                </span>
              </div>
            ))}

            {/* Clicking this opens the modal */}
            <div 
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-32 h-32 rounded-3xl bg-slate-800 flex items-center justify-center text-5xl shadow-lg transform transition-all duration-300 group-hover:scale-105 border-4 border-slate-700 group-hover:border-emerald-500 text-slate-500 group-hover:text-emerald-400">
                +
              </div>
              <span className="mt-4 text-slate-400 font-medium text-lg group-hover:text-emerald-400 transition-colors">
                Add Child
              </span>
            </div>
          </>
        )}
      </div>

      {/* Pop-up Modal Overlay */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Create Profile</h2>
            
            <form onSubmit={handleAddProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Child's name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Choose an Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewChildEmoji(emoji)}
                      className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                        newChildEmoji === emoji 
                          ? 'bg-slate-700 border-emerald-500 scale-110' 
                          : 'border-transparent hover:bg-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-slate-400 bg-slate-900 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}