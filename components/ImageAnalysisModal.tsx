
import React, { useState } from 'react';
import { analyzePlaceImage } from '../geminiService';
import { ImageAnalysis } from '../types';
import { Camera, X, Loader2, Sparkles, MapPin, Search } from 'lucide-react';

interface ImageAnalysisModalProps {
  onClose: () => void;
}

const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageAnalysis | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const base64 = preview.split(',')[1];
      const analysis = await analyzePlaceImage(base64);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/10">
        <div className="p-6 border-b flex justify-between items-center bg-slate-950 text-white">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
            <Search className="w-6 h-6 text-emerald-400" /> Visual Scout AI
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          {!result ? (
            <div className="flex flex-col items-center gap-8">
              <p className="text-slate-500 text-center font-medium">
                Upload a landmark or scenery photo. Gemini will scout for identical or similar hidden treasures across Maharashtra.
              </p>
              
              <div className="w-full">
                <label className="relative group cursor-pointer flex flex-col items-center justify-center border-4 border-dashed border-slate-100 hover:border-emerald-500 rounded-3xl bg-slate-50 h-72 transition-all overflow-hidden shadow-inner">
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-300 group-hover:text-emerald-500 transition-colors">
                      <Camera className="w-16 h-16" />
                      <span className="font-black uppercase tracking-widest text-xs">Drop image here or click</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <button
                disabled={!file || loading}
                onClick={handleAnalyze}
                className="w-full bg-slate-950 text-white font-black uppercase tracking-widest py-5 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-400" /> : <Sparkles className="w-6 h-6 text-emerald-400" />}
                {loading ? 'Consulting Gemini...' : 'Analyze Scene'}
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-2/5 shrink-0 rounded-2xl overflow-hidden shadow-lg border-4 border-slate-50">
                   <img src={preview!} className="w-full h-48 object-cover" alt="Scanned" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Analysis</h3>
                  <p className="text-2xl font-black text-slate-950 leading-tight">{result.location_guess}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{result.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" /> Recommended in Maharashtra
                </h3>
                <div className="grid gap-3">
                  {result.similar_places_in_mh.map((place, idx) => (
                    <div key={idx} className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex items-center gap-4 group hover:bg-emerald-100 transition-colors">
                      <div className="bg-emerald-600 text-white font-black rounded-xl w-8 h-8 flex items-center justify-center text-xs shrink-0 shadow-md group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <p className="text-emerald-950 font-black uppercase tracking-wide text-sm">{place}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setResult(null)}
                className="w-full py-4 text-slate-500 font-black uppercase tracking-widest text-xs border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Scout Another Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysisModal;
