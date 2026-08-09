'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ComplaintItem } from '@/lib/types';
import { PLAIN_CATEGORY_LABELS, PLAIN_STATUS_CONFIG, SupportedLanguage, UI_COPY } from '@/lib/copy-helpers';
import { BackButton } from '@/components/layout/BackButton';
import {
  MapPin,
  Eye,
  Search,
  Navigation,
  ThumbsUp,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const CivicMapInner = dynamic(() => import('./CivicMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center space-y-2 text-slate-500">
      <MapPin className="h-8 w-8 text-blue-600 animate-bounce" />
      <span className="text-xs font-semibold text-slate-700">Loading Map...</span>
    </div>
  ),
});

interface CivicMapProps {
  complaints: ComplaintItem[];
  onSelectComplaint?: (complaint: ComplaintItem) => void;
  onSupportComplaint?: (complaint: ComplaintItem) => void;
  onOpenReportFlow?: (initialLocation?: string) => void;
  lang?: SupportedLanguage;
  onBack?: () => void;
}

type CategoryFilter = 'ALL' | 'ROAD_DAMAGE' | 'GARBAGE_ACCUMULATION' | 'WATER_LEAKAGE' | 'STREET_LIGHT' | 'ELECTRIC_POLE_DAMAGE' | 'OTHER_CIVIC_ISSUE';

// Predefined landmark coordinates for quick search panning
const LANDMARK_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  'civil lines': { lat: 28.6139, lng: 77.2090, name: 'Civil Lines Gate 2' },
  'connaught place': { lat: 28.6315, lng: 77.2167, name: 'Connaught Place Outer Circle' },
  'railway station': { lat: 28.6430, lng: 77.2194, name: 'New Delhi Railway Station' },
  'rohini': { lat: 28.7041, lng: 77.1025, name: 'Rohini Sector 7' },
  'saket': { lat: 28.5244, lng: 77.2188, name: 'Saket District Centre' },
  'karol bagh': { lat: 28.6514, lng: 77.1907, name: 'Karol Bagh Market' },
};

export const CivicMap: React.FC<CivicMapProps> = ({
  complaints,
  onSelectComplaint,
  onSupportComplaint,
  onOpenReportFlow,
  lang = 'en',
  onBack,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [hasMapError, setHasMapError] = useState(false);

  // Map viewport states
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // User current location GPS state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);

  // Mobile Bottom Sheet Collapsible state
  const [isNearbySheetOpen, setIsNearbySheetOpen] = useState(true);

  const copy = UI_COPY[lang] || UI_COPY.en;

  // Auto-detect GPS location on mount
  useEffect(() => {
    setIsClient(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setMapCenter([loc.lat, loc.lng]);
        },
        () => {
          // GPS fallback to default city center
        }
      );
    }
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const term = searchQuery.toLowerCase().trim();
    const matchedKey = Object.keys(LANDMARK_COORDINATES).find((k) => term.includes(k) || k.includes(term));

    if (matchedKey) {
      const coord = LANDMARK_COORDINATES[matchedKey];
      setMapCenter([coord.lat, coord.lng]);
      setMapZoom(15);
    } else {
      // Default fallback pan slightly
      setMapCenter([28.6250, 77.2150]);
      setMapZoom(14);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (selectedCategory === 'ALL') return true;
    return c.category === selectedCategory;
  });

  return (
    <div className="w-full space-y-4">
      
      {/* Top Map Title & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          {onBack && <BackButton label={copy.backToHome} onClick={onBack} />}
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>{copy.cityProblemMap}</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">{copy.viewReportedCivicIssues}</p>
          </div>
        </div>

        {/* Location Search Bar (Item 11) */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 sm:w-72">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search area (e.g. Civil Lines)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 civic-input text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Horizontal Category Filter Chips (Item 6) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: lang === 'hi' ? 'सभी' : lang === 'hinglish' ? 'All' : 'All' },
          { id: 'ROAD_DAMAGE', label: lang === 'hi' ? '🛣️ सड़कें' : '🛣️ Roads' },
          { id: 'GARBAGE_ACCUMULATION', label: lang === 'hi' ? '🗑️ कचरा' : '🗑️ Garbage' },
          { id: 'WATER_LEAKAGE', label: lang === 'hi' ? '💧 पानी' : '💧 Water' },
          { id: 'STREET_LIGHT', label: lang === 'hi' ? '💡 बिजली' : '💡 Street Lights' },
          { id: 'ELECTRIC_POLE_DAMAGE', label: lang === 'hi' ? '⚡ खंभा/तार' : '⚡ Pole/Wire' },
          { id: 'OTHER_CIVIC_ISSUE', label: lang === 'hi' ? '⚠️ अन्य' : '⚠️ Other' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ERROR STATE SCREEN (Item 20) */}
      {hasMapError ? (
        <div className="civic-card p-12 text-center space-y-4 max-w-lg mx-auto">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">We couldn't load the map</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">You can still report a problem directly to municipal teams.</p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setHasMapError(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
            >
              Retry Map
            </button>
            {onOpenReportFlow && (
              <button
                onClick={() => onOpenReportFlow()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm"
              >
                {copy.reportProblem}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* MAIN MAP + SIDE PANEL CONTAINER (Item 17 Desktop Layout) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* MAP CANVAS CONTAINER (Occupies 2 cols on desktop, full width on mobile) */}
          <div className="md:col-span-2 relative h-[520px] rounded-2xl civic-card overflow-hidden shadow-sm flex flex-col">
            
            {/* Map Surface */}
            <div className="relative flex-1 bg-slate-100 w-full overflow-hidden">
              {isClient ? (
                <CivicMapInner
                  complaints={filteredComplaints}
                  center={mapCenter}
                  zoom={mapZoom}
                  userLocation={userLocation}
                  lang={lang}
                  onSelectComplaint={(cmp) => setSelectedComplaint(cmp)}
                  onSupportComplaint={(cmp) => onSupportComplaint && onSupportComplaint(cmp)}
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <MapPin className="h-8 w-8 text-blue-600 animate-bounce" />
                  <span className="text-xs font-semibold text-slate-700">Loading Map...</span>
                </div>
              )}

              {/* Floating Action Button: Report From Map (Item 13) */}
              {onOpenReportFlow && (
                <button
                  onClick={() => onOpenReportFlow('Civil Lines Gate 2')}
                  className="absolute top-4 right-4 z-20 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 border border-white/20"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{copy.reportProblem}</span>
                </button>
              )}

              {/* Compact Floating Legend Badge (Item 15) */}
              <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-[11px] font-semibold text-slate-700 flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600 inline-block" /> Reported</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> In progress</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-600 inline-block" /> Resolved</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-600 inline-block" /> Urgent</span>
              </div>

              {/* SELECTED ISSUE FLOATING BOTTOM CARD (Item 8) */}
              {selectedComplaint && (
                <div className="absolute bottom-14 left-4 right-4 sm:left-auto sm:right-4 sm:w-88 civic-card p-4 shadow-2xl z-30 animate-in slide-in-from-bottom duration-150 bg-white border border-slate-200">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-[10px] font-mono text-blue-600 font-bold">{selectedComplaint.ticketId}</span>
                      <h4 className="font-display text-sm font-bold text-slate-900 leading-snug flex items-center gap-1.5 mt-0.5">
                        <span>{PLAIN_CATEGORY_LABELS[selectedComplaint.category]?.icon || '⚠️'}</span>
                        <span>{PLAIN_CATEGORY_LABELS[selectedComplaint.category]?.[lang] || selectedComplaint.title}</span>
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedComplaint(null)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded-lg bg-slate-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="mt-3 space-y-2.5 text-xs">
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">"{selectedComplaint.description}"</p>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" /> {selectedComplaint.location.ward}
                      </span>
                      <span className="font-bold text-blue-700">{selectedComplaint.reportCount} citizens reported</span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Status:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${PLAIN_STATUS_CONFIG[selectedComplaint.status]?.badgeClass}`}>
                        {PLAIN_STATUS_CONFIG[selectedComplaint.status]?.[lang] || PLAIN_STATUS_CONFIG[selectedComplaint.status]?.label}
                      </span>
                    </div>

                    {/* Action Buttons: Support & View Report */}
                    <div className="flex items-center gap-2 pt-1">
                      {onSupportComplaint && selectedComplaint.status !== 'RESOLVED' && (
                        <button
                          onClick={() => onSupportComplaint(selectedComplaint)}
                          className="flex-1 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 hover:bg-blue-100 flex items-center justify-center gap-1.5"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Support</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (onSelectComplaint) onSelectComplaint(selectedComplaint);
                          else if (typeof window !== 'undefined') window.location.href = `/complaints/${selectedComplaint.id}`;
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{copy.viewMyReport}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* NEARBY ISSUES PANEL (Item 10 Collapsible / Item 17 Desktop Side Panel) */}
          <div className="civic-card p-4 space-y-3 flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-600" /> Near you
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">{filteredComplaints.length} issues in your area</p>
              </div>
              <button
                onClick={() => setIsNearbySheetOpen(!isNearbySheetOpen)}
                className="md:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                {isNearbySheetOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </button>
            </div>

            {/* EMPTY STATE SCREEN (Item 19) */}
            {filteredComplaints.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl">
                  🎉
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900">Your area looks good!</h4>
                  <p className="text-xs text-slate-500 mt-0.5">No reported civic problems nearby.</p>
                </div>
                {onOpenReportFlow && (
                  <button
                    onClick={() => onOpenReportFlow()}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm"
                  >
                    {copy.reportProblem}
                  </button>
                )}
              </div>
            ) : (
              <div className={`flex-1 overflow-y-auto space-y-2.5 ${isNearbySheetOpen ? 'block' : 'hidden md:block'}`}>
                {filteredComplaints.map((c) => {
                  const catObj = PLAIN_CATEGORY_LABELS[c.category];
                  const categoryName = catObj ? catObj[lang] : c.categoryLabel;
                  const icon = catObj ? catObj.icon : '⚠️';
                  const statusConf = PLAIN_STATUS_CONFIG[c.status] || PLAIN_STATUS_CONFIG.PENDING;

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedComplaint(c);
                        setMapCenter([c.location.latitude, c.location.longitude]);
                        setMapZoom(15);
                      }}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all cursor-pointer ${
                        selectedComplaint?.id === c.id
                          ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 truncate">
                          <span>{icon}</span> {categoryName}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${statusConf.badgeClass}`}>
                          {statusConf[lang] || statusConf.label}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-1 font-medium">{c.title}</p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>📍 400m away</span>
                        <span className="text-blue-600 font-bold">{c.reportCount} reports</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
