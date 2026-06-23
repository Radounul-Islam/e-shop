import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import useUiStore from '../store/uiStore';
import { ShieldCheck, Loader2 } from 'lucide-react';

const UserProfessionModal = () => {
  const { user, login } = useAuth();
  const { addToast } = useUiStore();
  const [professions, setProfessions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Only fetch professions if user needs setup
    if (user && user.role === 'USER' && !user.hasCompletedProfessionSetup) {
      const fetchProfessions = async () => {
        try {
          const res = await api.get('/professions');
          setProfessions(res.data);
        } catch (err) {
          console.error('Failed to load professions', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProfessions();
    }
  }, [user]);

  // Modal is only active for standard USERs who haven't completed setup
  if (!user || user.role !== 'USER' || user.hasCompletedProfessionSetup) {
    return null;
  }

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/professions/setup', { professionIds: selectedIds });
      
      // Update local storage and context auth user state
      const updatedUser = {
        ...user,
        hasCompletedProfessionSetup: true,
        professions: res.data.user.professions,
      };
      login(updatedUser);
      addToast('Profile personalization setup complete!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save profession selections.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in-fast">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-scale-in">
        {/* Header Banner */}
        <div className="blue-gradient p-6 text-center relative">
          <div className="mx-auto bg-white/20 text-white rounded-full w-14 h-14 flex items-center justify-center mb-3">
            <ShieldCheck size={30} />
          </div>
          <h2 className="text-2xl font-black">Personalize Your Shop</h2>
          <p className="text-primary-100 text-xs font-semibold mt-1 uppercase tracking-wider">
            Select your profession(s) to view tailored products
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="text-slate-600 text-sm font-semibold leading-relaxed">
            Welcome to E-Shop! Please select your profession(s) from the options below. We will use this to prioritize products matching your interest in our trending, latest, and catalog grids.
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="animate-spin text-primary-600 w-8 h-8" />
              <span className="text-sm font-semibold text-slate-400">Loading checklist options...</span>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-2xl p-4 bg-slate-50/50 pr-2 space-y-2.5">
              {professions.length === 0 ? (
                <div className="text-center text-slate-400 font-semibold py-8 text-sm">
                  No predefined profession options found. You can proceed without selecting, or add them as admin.
                </div>
              ) : (
                professions.map((prof) => {
                  const isChecked = selectedIds.includes(prof.id);
                  return (
                    <label
                      key={prof.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-300 select-none ${
                        isChecked
                          ? 'border-primary-500 bg-primary-50/60'
                          : 'border-slate-100 hover:border-primary-200 bg-white hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(prof.id)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-5 h-5 cursor-pointer"
                      />
                      <span className={`text-sm font-bold transition-colors ${isChecked ? 'text-primary-700' : 'text-slate-700'}`}>
                        {prof.name}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-3.5 text-base font-bold shadow-xl flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Saving Preferences...</span>
                </>
              ) : (
                <span>Save and Continue</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfessionModal;
