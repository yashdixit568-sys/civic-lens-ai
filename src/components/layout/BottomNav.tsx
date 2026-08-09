'use client';

import React from 'react';
import { Home, PlusCircle, Map, FileText, User } from 'lucide-react';
import { SupportedLanguage, UI_COPY } from '@/lib/copy-helpers';

export type CitizenTab = 'HOME' | 'REPORT' | 'MAP' | 'REPORTS' | 'PROFILE';

interface BottomNavProps {
  activeTab: CitizenTab;
  onSelectTab: (tab: CitizenTab) => void;
  lang?: SupportedLanguage;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab, lang = 'en' }) => {
  const copy = UI_COPY[lang] || UI_COPY.en;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-1.5 shadow-lg md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* Home Tab */}
        <button
          onClick={() => onSelectTab('HOME')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'HOME' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Home className={`h-5 w-5 ${activeTab === 'HOME' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">{copy.home}</span>
        </button>

        {/* Map Tab */}
        <button
          onClick={() => onSelectTab('MAP')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'MAP' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Map className={`h-5 w-5 ${activeTab === 'MAP' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">{copy.map}</span>
        </button>

        {/* Report Tab (Prominent Middle CTA) */}
        <button
          onClick={() => onSelectTab('REPORT')}
          className="flex flex-col items-center justify-center flex-1 -mt-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md border-2 border-white active:scale-95 transition-transform hover:bg-blue-700">
            <PlusCircle className="h-6 w-6 stroke-[2.5px]" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-blue-700">{copy.reportProblem}</span>
        </button>

        {/* My Reports Tab */}
        <button
          onClick={() => onSelectTab('REPORTS')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'REPORTS' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <FileText className={`h-5 w-5 ${activeTab === 'REPORTS' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">{copy.myReports}</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onSelectTab('PROFILE')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'PROFILE' ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <User className={`h-5 w-5 ${activeTab === 'PROFILE' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">{copy.profile}</span>
        </button>

      </div>
    </div>
  );
};
