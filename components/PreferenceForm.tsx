
import React from 'react';
import { UserPreferences, Vibe, Budget } from '../types';
import { MapPin, Calendar, Wallet, Compass, Plane } from 'lucide-react';

interface PreferenceFormProps {
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
  onSubmit: () => void;
  loading: boolean;
}

const PreferenceForm: React.FC<PreferenceFormProps> = ({ preferences, onUpdate, onSubmit, loading }) => {
  const handleChange = (field: keyof UserPreferences, value: any) => {
    onUpdate({ ...preferences, [field]: value });
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 ring-1 ring-slate-200/50">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-950 uppercase tracking-tight">
        <Compass className="w-7 h-7 text-emerald-600" /> Start Your Quest
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" /> Starting Location
          </label>
          <input
            type="text"
            className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-0 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50"
            placeholder="Mumbai, Pune, Nagpur..."
            value={preferences.startingCity}
            onChange={(e) => handleChange('startingCity', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-500" /> Duration
            </label>
            <select
              className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-emerald-500 focus:ring-0 outline-none font-bold text-slate-900 appearance-none cursor-pointer"
              value={preferences.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 7].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Day' : 'Days'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-500" /> Month
            </label>
            <select
              className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-emerald-500 focus:ring-0 outline-none font-bold text-slate-900 appearance-none cursor-pointer"
              value={preferences.month}
              onChange={(e) => handleChange('month', e.target.value)}
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-500" /> Travel Vibe
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(Vibe).map((v) => (
              <button
                key={v}
                onClick={() => handleChange('vibe', v)}
                className={`p-3 text-[10px] font-black uppercase tracking-wider rounded-xl border-2 transition-all ${
                  preferences.vibe === v 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-500" /> Budget
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(Budget).map((b) => (
              <button
                key={b}
                onClick={() => handleChange('budget', b)}
                className={`p-3 text-[10px] font-black uppercase tracking-wider rounded-xl border-2 transition-all ${
                  preferences.budget === b 
                    ? 'bg-slate-950 border-slate-950 text-white shadow-lg shadow-slate-200' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading || !preferences.startingCity}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest py-5 px-6 rounded-2xl transition-all shadow-xl hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-3"
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              Planning...
            </span>
          ) : (
            <>
              <Plane className="w-5 h-5 -rotate-12" />
              Build Itinerary
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PreferenceForm;
