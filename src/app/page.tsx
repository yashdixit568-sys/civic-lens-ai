'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Sparkles,
  Camera,
  Mic,
  MapPin,
  Flame,
  Award,
  Building2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  BotMessageSquare,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* Background Soft Gradients */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
            Civic Lens <span className="text-teal-700 text-xs font-semibold px-2 py-0.5 rounded border border-teal-200 bg-teal-50 ml-1">AI Enterprise</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-700/20 hover:bg-teal-800 active:scale-95 transition-all"
          >
            <span>Launch Live App</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 rounded-full bg-teal-50 border border-teal-200 px-4 py-1.5 text-xs font-semibold text-teal-800 shadow-sm mb-8">
          <Sparkles className="h-4 w-4 text-teal-600" />
          <span>Smart City Civic Intelligence & Infrastructure Platform</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Report City Issues in <span className="inline-block bg-gradient-to-r from-teal-700 to-sky-700 bg-clip-text text-transparent pb-1">Under 30 Seconds</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          AI-powered municipal complaint dispatch, spatial duplicate merging, severity priority scoring, and automated field resolution tracking.
        </p>

        {/* Quick Role Entry Portals */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 rounded-2xl bg-white border border-slate-200 p-4 text-left shadow-sm hover:border-teal-500 hover:shadow-md transition-all group w-64"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:scale-105 transition-transform">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Citizen Portal</h4>
              <p className="text-[11px] text-slate-500">Report issues, earn points & badges</p>
            </div>
          </Link>

          <Link
            href="/authority"
            className="flex items-center space-x-3 rounded-2xl bg-white border border-slate-200 p-4 text-left shadow-sm hover:border-sky-500 hover:shadow-md transition-all group w-64"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Authority Console</h4>
              <p className="text-[11px] text-slate-500">Priority dispatch & proof-of-work</p>
            </div>
          </Link>

          <Link
            href="/analytics"
            className="flex items-center space-x-3 rounded-2xl bg-white border border-slate-200 p-4 text-left shadow-sm hover:border-purple-500 hover:shadow-md transition-all group w-64"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Predictive AI Insights</h4>
              <p className="text-[11px] text-slate-500">Ward flood risk & degradation</p>
            </div>
          </Link>
        </div>

        {/* Live System Metric Counters */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
            <span className="font-display text-3xl font-extrabold text-teal-700">187+</span>
            <span className="block text-xs text-slate-500 mt-1">Spatial Duplicates Merged</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
            <span className="font-display text-3xl font-extrabold text-sky-700">96/100</span>
            <span className="block text-xs text-slate-500 mt-1">Peak Priority Score</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
            <span className="font-display text-3xl font-extrabold text-emerald-700">1.2 Days</span>
            <span className="block text-xs text-slate-500 mt-1">Avg SLA Resolution</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
            <span className="font-display text-3xl font-extrabold text-amber-700">98.4%</span>
            <span className="block text-xs text-slate-500 mt-1">AI Classification Score</span>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16 border-t border-slate-200 bg-white">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Enterprise Operations & AI Features</h2>
          <p className="text-sm text-slate-500 mt-2">Designed for municipal scale, public safety, and smart city infrastructure management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">AI Vision Diagnostics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects road potholes, garbage overflow, water leaks, streetlight failures, and animal hazards with risk level & confidence rating.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-800">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">Multilingual Speech & Audio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Processes raw voice input ("Bhai sadak pe bada gaddha hai hospital ke pass") and converts it into structured municipal complaints.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-800">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">Spatial Duplicate Merging</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Geospatial Haversine calculation merges reports within 150m radius, escalating urgency ("Reported by 187 citizens").
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 bg-slate-50">
        Civic Lens AI — Enterprise Civic Infrastructure & Smart Governance System
      </footer>

    </div>
  );
}
