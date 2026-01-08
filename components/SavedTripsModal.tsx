
import React from 'react';
import { X, Calendar, MapPin, ChevronRight, Trash2, Bookmark } from 'lucide-react';
import { TripItinerary } from '../types';

interface SavedTripsModalProps {
  trips: TripItinerary[];
  onClose: () => void;
  onSelect: (trip: TripItinerary) => void;
  onDelete: (id: string) => void;
}

const SavedTripsModal: React.FC<SavedTripsModalProps> = ({ trips, onClose, onSelect, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b flex justify-between items-center bg-slate-950 text-white">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-emerald-400" /> My Adventures
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto bg-slate-50 flex-1">
          {trips.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900">No trips saved yet</h3>
              <p className="text-slate-500 mt-2 font-medium">Your planned quests in Maharashtra will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div 
                  key={trip.id} 
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 group hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer relative"
                >
                  <div className="flex justify-between items-start" onClick={() => onSelect(trip)}>
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-slate-950 group-hover:text-emerald-600 transition-colors">
                        {trip.trip_title}
                      </h4>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(trip.createdAt || 0).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <MapPin className="w-3.5 h-3.5" /> {trip.itinerary.length} Destinations
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(trip.id!); }}
                    className="absolute bottom-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedTripsModal;
