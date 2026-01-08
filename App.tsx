
import React, { useState, useEffect } from 'react';
import { UserPreferences, Vibe, Budget, TripItinerary, User, ItineraryDay } from './types';
import { 
  generateTripItinerary, 
  askComplexQuestion, 
  getQuickFact, 
  generateMaharashtraImage, 
} from './geminiService';
import { authService } from './authService';
import Header from './components/Header';
import PreferenceForm from './components/PreferenceForm';
import MapView from './components/MapView';
import ImageAnalysisModal from './components/ImageAnalysisModal';
import AuthModal from './components/AuthModal';
import SavedTripsModal from './components/SavedTripsModal';
import { 
  Utensils, Cloud, Star, Camera, Compass, 
  Save, Check, Clock, Navigation, BrainCircuit, ImageIcon, 
  Send, Loader2, Wand2, ChevronRight, Map as MapIcon,
  ExternalLink, Sparkles
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    vibe: Vibe.History,
    budget: Budget.Mid,
    duration: 3,
    startingCity: '',
    month: 'October',
  });
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [previewDay, setPreviewDay] = useState<ItineraryDay | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // AI Feature State
  const [thoughtQuery, setThoughtQuery] = useState('');
  const [thoughtResponse, setThoughtResponse] = useState('');
  const [thinking, setThinking] = useState(false);
  const [quickFact, setQuickFact] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [genImgUrl, setGenImgUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Listen for real Firebase auth changes
    const unsubscribe = authService.onAuthChange((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (u: User) => {
    setUser(u);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setIsSaved(false);
    try {
      const data = await generateTripItinerary(preferences);
      setItinerary(data);
      // Low-latency Fact (Flash Lite)
      const fact = await getQuickFact(preferences.startingCity || "Maharashtra");
      setQuickFact(fact);
    } catch (err) {
      console.error(err);
      alert("Search grounding failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleThinkingAssist = async () => {
    if (!thoughtQuery) return;
    setThinking(true);
    setThoughtResponse('');
    try {
      const resp = await askComplexQuestion(thoughtQuery);
      setThoughtResponse(resp);
    } catch (err) {
      setThoughtResponse("The historical archives are temporarily unavailable.");
    } finally {
      setThinking(false);
    }
  };

  const handleGenerateAIImage = async () => {
    if (!imagePrompt) return;

    // MANDATORY API key selection check for gemini-3-pro-image-preview
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setGenerating(true);
    setGenImgUrl(null);
    try {
      const url = await generateMaharashtraImage(imagePrompt, imageSize);
      setGenImgUrl(url);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
      alert("Image generation failed. Ensure your API key is correctly configured.");
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 w-full h-full fixed inset-0">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Initializing Secure Auth...</p>
      </div>
    );
  }

  // ENFORCE AUTH FIRST FLOW
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative w-full">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-white space-y-8">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-600 p-4 rounded-3xl shadow-2xl shadow-emerald-900/40">
                <MapIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter">Explore<span className="text-emerald-500">MH</span></h1>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight">
              Unlock the <span className="text-emerald-400 italic">Heritage</span> of Maharashtra.
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Step into the world's most intelligent travel recommender. From the heights of Sahyadri to the Konkan coast, your next adventure starts after a quick sign-in.
            </p>
            <div className="flex items-center gap-4 py-6 border-y border-slate-800">
               <div className="flex -space-x-3">
                 {[...Array(4)].map((_, i) => (
                   <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+100}`} className="w-12 h-12 rounded-full border-4 border-slate-950 bg-slate-800" alt="User" />
                 ))}
               </div>
               <p className="text-sm font-bold text-slate-300">Join 10k+ local explorers</p>
            </div>
          </div>
          
          <div className="bg-white rounded-[3rem] p-2 shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700">
            <AuthModal onClose={() => {}} onSuccess={handleAuthSuccess} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafc] w-full">
      <Header 
        user={user} 
        onLoginClick={() => {}} 
        onLogout={async () => { await authService.logout(); setUser(null); }}
        onOpenSaved={() => setShowSavedModal(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <PreferenceForm
              preferences={preferences}
              onUpdate={setPreferences}
              onSubmit={handleGenerate}
              loading={loading}
            />

            {quickFact && (
              <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100 flex items-start gap-4 animate-in slide-in-from-left duration-500">
                <div className="bg-sky-600 p-2 rounded-xl text-white shadow-lg">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1">Fast Insider Tip</h4>
                  <p className="text-slate-900 text-sm font-bold leading-relaxed">{quickFact}</p>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 space-y-4">
              <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                <BrainCircuit className="w-6 h-6 text-emerald-600" /> Deep Scholar
              </h3>
              <p className="text-xs text-slate-500 font-medium">Ask complex historical or geographical questions for a reasoned response (Thinking Mode).</p>
              <div className="relative">
                <textarea
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 outline-none font-bold text-sm h-24 transition-all"
                  placeholder="Explain the strategic importance of Raigad Fort..."
                  value={thoughtQuery}
                  onChange={(e) => setThoughtQuery(e.target.value)}
                />
                <button 
                  onClick={handleThinkingAssist}
                  disabled={thinking || !thoughtQuery}
                  className="absolute bottom-3 right-3 bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-90"
                >
                  {thinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              {thoughtResponse && (
                <div className="p-4 bg-emerald-50 rounded-2xl text-xs font-medium text-slate-700 leading-relaxed max-h-48 overflow-y-auto border border-emerald-100 animate-in fade-in duration-300">
                  {thoughtResponse}
                </div>
              )}
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl shadow-2xl text-white space-y-4 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 opacity-5">
                  <Wand2 className="w-40 h-40" />
               </div>
               <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight relative z-10">
                <ImageIcon className="w-6 h-6 text-rose-400" /> AI Postcard
               </h3>
               <div className="space-y-3 relative z-10">
                 <input 
                   type="text"
                   className="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-sm font-bold placeholder:text-white/30 focus:bg-white/20 outline-none transition-all"
                   placeholder="A misty morning at Mahabaleshwar..."
                   value={imagePrompt}
                   onChange={(e) => setImagePrompt(e.target.value)}
                 />
                 <div className="flex gap-2">
                   {(['1K', '2K', '4K'] as const).map(size => (
                     <button
                       key={size}
                       onClick={() => setImageSize(size)}
                       className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all border ${
                         imageSize === size ? 'bg-white text-slate-950 border-white shadow-lg' : 'bg-transparent border-white/20 hover:bg-white/5'
                       }`}
                     >
                       {size}
                     </button>
                   ))}
                 </div>
                 <button 
                   onClick={handleGenerateAIImage}
                   disabled={generating || !imagePrompt}
                   className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                 >
                   {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                   Generate
                 </button>
                 <p className="text-[9px] text-white/40 mt-1 italic">
                   Paid API key required for Nano Banana Pro. 
                   <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1">Billing Info</a>
                 </p>
               </div>
               {genImgUrl && (
                 <div className="mt-4 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 animate-in zoom-in duration-500">
                    <img src={genImgUrl} alt="Generated" className="w-full aspect-video object-cover" />
                 </div>
               )}
            </div>
            
            <button 
              onClick={() => setShowImageModal(true)}
              className="w-full bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black uppercase tracking-tight">Visual Scout</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Identify destinations from photos</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-all" />
            </button>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {!itinerary && !loading && (
              <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-slate-200">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                   <Navigation className="w-12 h-12 text-emerald-600 rotate-45" />
                </div>
                <h3 className="text-4xl font-black text-slate-950 mb-4 tracking-tighter uppercase">Ready for Maharashtra?</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-lg font-medium">
                  Select your preferences to generate a search-grounded travel plan powered by Gemini 3.
                </p>
              </div>
            )}

            {loading && (
              <div className="space-y-8">
                <div className="h-[550px] bg-slate-200 rounded-[3rem] animate-pulse"></div>
                <div className="space-y-4">
                  <div className="h-12 bg-slate-200 rounded-2xl w-1/2 animate-pulse"></div>
                  <div className="h-40 bg-slate-200 rounded-2xl w-full animate-pulse"></div>
                </div>
              </div>
            )}

            {itinerary && !loading && (
              <div className="space-y-10 animate-in fade-in duration-700">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                      <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">
                        {itinerary.trip_title}
                      </h1>
                      <div className="flex flex-wrap gap-3 mt-4">
                        <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                          <Navigation className="w-4 h-4" /> {itinerary.total_estimated_cost}
                        </span>
                        <span className="bg-sky-50 text-sky-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-sky-100 flex items-center gap-2">
                          <Cloud className="w-4 h-4" /> {itinerary.weather_forecast}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const updated = authService.saveTrip(itinerary);
                        if (updated) { setUser(updated); setIsSaved(true); }
                      }}
                      disabled={isSaved}
                      className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${
                        isSaved ? 'bg-slate-100 text-emerald-600' : 'bg-slate-950 text-white hover:bg-emerald-600'
                      }`}
                    >
                      {isSaved ? <Check className="w-4 h-4 inline mr-2" /> : <Save className="w-4 h-4 inline mr-2" />}
                      {isSaved ? 'Saved' : 'Save Plan'}
                    </button>
                  </div>

                  <MapView days={itinerary.itinerary} />
                </div>

                <div className="space-y-8">
                   <h2 className="text-2xl font-black uppercase tracking-tighter px-4 flex items-center gap-3">
                      <div className="w-2 h-8 bg-emerald-600 rounded-full"></div>
                      Daily Expedition
                   </h2>
                   
                   {itinerary.itinerary.map((day) => (
                     <div key={day.day} className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-12 -mt-12 group-hover:bg-emerald-50 transition-colors"></div>
                        <div className="flex flex-col lg:flex-row gap-8">
                           <div className="lg:w-20 shrink-0">
                              <div className="bg-slate-950 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg">
                                 <span className="text-[10px] uppercase opacity-40">Day</span>
                                 <span className="text-2xl">{day.day}</span>
                              </div>
                           </div>
                           <div className="flex-1 space-y-6">
                              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <div className="flex gap-0.5">
                                          {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(day.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                          ))}
                                       </div>
                                       <span className="text-xs font-black text-slate-400">({day.review_count})</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-950">{day.location}</h3>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 flex items-center gap-2">
                                       <Clock className="w-3 h-3" /> {day.opening_hours}
                                    </p>
                                 </div>
                                 <button onClick={() => setPreviewDay(day)} className="bg-slate-50 hover:bg-slate-100 text-slate-600 p-3 rounded-xl transition-all border border-slate-200">
                                    <Camera className="w-5 h-5" />
                                 </button>
                              </div>

                              <div className="grid md:grid-cols-2 gap-8">
                                 <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</h4>
                                    <ul className="space-y-2">
                                       {day.activities.map((act, i) => (
                                         <li key={i} className="text-slate-700 text-sm leading-relaxed flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white transition-all">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                            {act}
                                         </li>
                                       ))}
                                    </ul>
                                 </div>
                                 <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Must-Try Food</h4>
                                    <div className="flex flex-wrap gap-2">
                                       {day.food_recommendations.map((food, i) => (
                                         <span key={i} className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide border border-orange-100">
                                            {food}
                                         </span>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                {itinerary.grounding_sources && itinerary.grounding_sources.length > 0 && (
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" /> Validated Search References
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {itinerary.grounding_sources.map((chunk, idx) => {
                        if (chunk.web) {
                          return (
                            <a 
                              key={idx}
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-black uppercase bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-4 py-2 rounded-xl border border-slate-100 transition-all flex items-center gap-2 group"
                            >
                              <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                              {chunk.web.title || 'Source'}
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-slate-950 p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                      <Compass className="w-48 h-48" />
                   </div>
                   <h3 className="text-2xl font-black mb-10 flex items-center gap-3 relative z-10">
                      <Sparkles className="w-7 h-7 text-emerald-400" /> Professional Travel Tips
                   </h3>
                   <div className="grid md:grid-cols-2 gap-6 relative z-10">
                      {itinerary.travel_tips.map((tip, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl text-sm border border-white/10 leading-relaxed font-medium">
                           {tip}
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {previewDay && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[70] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-12 text-center space-y-8">
               <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                  <Camera className="w-10 h-10 text-emerald-600" />
               </div>
               <div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">{previewDay.location}</h2>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed italic">"{previewDay.image_description}"</p>
               </div>
               <div className="flex flex-col gap-3">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${previewDay.coordinates.lat},${previewDay.coordinates.lng}`}
                    target="_blank"
                    className="bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
                  >
                    <ExternalLink className="w-5 h-5" /> Launch Navigation
                  </a>
                  <button onClick={() => setPreviewDay(null)} className="py-4 text-slate-400 font-black uppercase tracking-widest text-xs">Dismiss</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {showImageModal && <ImageAnalysisModal onClose={() => setShowImageModal(false)} />}
      {showSavedModal && user && (
        <SavedTripsModal 
          trips={user.savedTrips} 
          onClose={() => setShowSavedModal(false)} 
          onSelect={(trip) => { setItinerary(trip); setShowSavedModal(false); setIsSaved(true); }}
          onDelete={(id) => { const updated = authService.deleteTrip(id); if (updated) setUser(updated); }}
        />
      )}
    </div>
  );
};

export default App;
