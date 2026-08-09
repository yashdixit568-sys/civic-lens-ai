'use client';

import React from 'react';
import { UserProfile } from '@/lib/types';
import { Award, Trophy, ShieldCheck, Flame, Star, Zap } from 'lucide-react';

interface LeaderboardViewProps {
  currentUser: UserProfile;
}

export const LEADERBOARD_SEED: UserProfile[] = [
  {
    id: 'u-1',
    name: 'Ananya Deshmukh',
    email: 'ananya@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    role: 'CITIZEN',
    reputationScore: 890,
    tier: 'VERIFIED_REPORTER',
    resolvedCount: 32,
    reportedCount: 38,
  },
  {
    id: 'u-2',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'CITIZEN',
    reputationScore: 480,
    tier: 'GOLD',
    resolvedCount: 14,
    reportedCount: 18,
  },
  {
    id: 'u-3',
    name: 'Kabir Singhania',
    email: 'kabir@example.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    role: 'CITIZEN',
    reputationScore: 390,
    tier: 'GOLD',
    resolvedCount: 11,
    reportedCount: 15,
  },
  {
    id: 'u-4',
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    role: 'CITIZEN',
    reputationScore: 240,
    tier: 'SILVER',
    resolvedCount: 7,
    reportedCount: 9,
  },
  {
    id: 'u-5',
    name: 'Vikram Joshi',
    email: 'vikram@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    role: 'CITIZEN',
    reputationScore: 120,
    tier: 'BRONZE',
    resolvedCount: 3,
    reportedCount: 5,
  },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUser }) => {
  return (
    <div className="w-full space-y-6">
      
      {/* Reputation Score & Tier Banner */}
      <div className="rounded-3xl glass-card border border-brand-500/30 p-6 shadow-2xl relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-16 w-16 rounded-2xl object-cover ring-4 ring-brand-500/40 shadow-xl"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display text-xl font-bold text-white">{currentUser.name}</h2>
                <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{currentUser.tier} CITIZEN</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Verified Ward 8 Citizen Intelligence Contributor</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Reputation Score</span>
              <span className="font-display text-2xl font-black text-brand-300 flex items-center gap-1">
                {currentUser.reputationScore} <Zap className="h-4 w-4 text-brand-400 fill-brand-400 animate-bounce" />
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Resolved Issues</span>
              <span className="font-display text-2xl font-black text-emerald-400">{currentUser.resolvedCount}</span>
            </div>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Next Tier Progress: <strong className="text-amber-400">Verified Reporter Badge</strong></span>
            <span className="text-brand-300 font-mono">480 / 500 PTS (96%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-white/10 p-0.5">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 via-cyan-400 to-amber-400 w-[96%] transition-all duration-500 shadow-md shadow-brand-500/50" />
          </div>
        </div>
      </div>

      {/* Citizen Badges & Achievements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl glass-card border border-amber-500/30 flex items-center space-x-3 bg-amber-500/5">
          <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
            <Star className="h-5 w-5 fill-amber-400" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Gold Citizen</h4>
            <p className="text-[10px] text-slate-400">400+ Reputation Pts</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-slate-400/30 flex items-center space-x-3 bg-slate-500/5">
          <div className="h-9 w-9 rounded-xl bg-slate-500/20 text-slate-300 flex items-center justify-center shrink-0 border border-slate-500/40">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Silver Citizen</h4>
            <p className="text-[10px] text-slate-400">200+ Reputation Pts</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-emerald-500/30 flex items-center space-x-3 bg-emerald-500/5">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Verified Reporter</h4>
            <p className="text-[10px] text-slate-400">10+ AI Verified Reports</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-brand-500/30 flex items-center space-x-3 bg-brand-500/5">
          <div className="h-9 w-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/40">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Ward Champion</h4>
            <p className="text-[10px] text-slate-400">Top 3 in Ward 8</p>
          </div>
        </div>
      </div>

      {/* Community Top Contributors Leaderboard */}
      <div className="rounded-3xl glass-card border border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h3 className="font-display font-bold text-base text-white">Top Citizen Contributors Leaderboard</h3>
          </div>
          <span className="text-xs text-slate-400">Updated Hourly</span>
        </div>

        <div className="mt-4 divide-y divide-white/5">
          {LEADERBOARD_SEED.map((user, idx) => {
            const isSelf = user.name === currentUser.name;
            return (
              <div
                key={user.id}
                className={`py-3.5 px-3 rounded-2xl flex items-center justify-between transition-colors ${
                  isSelf ? 'bg-brand-500/15 border border-brand-500/30' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <span className={`font-display text-sm font-bold w-6 text-center ${
                    idx === 0 ? 'text-amber-400 text-base' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-xl object-cover ring-2 ring-white/10" />
                  <div>
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {user.name} {isSelf && <span className="text-[9px] bg-brand-500/30 text-brand-300 px-1.5 py-0.5 rounded font-bold">(You)</span>}
                    </h4>
                    <p className="text-[10px] text-slate-400">{user.reportedCount} Complaints Submitted • {user.resolvedCount} Resolved</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-sm font-bold text-brand-300">{user.reputationScore} PTS</span>
                  <span className="block text-[10px] text-slate-400 font-medium">{user.tier}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
