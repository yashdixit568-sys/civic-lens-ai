'use client';

import React, { useState } from 'react';
import { UserRole, NotificationItem } from '@/lib/types';
import { INITIAL_NOTIFICATIONS } from '@/lib/store';
import { getPredictiveWardRiskReports, getExecutiveAIInsightsSummary } from '@/lib/ai/predictive-analytics';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Download,
  Building2,
  ShieldCheck,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AnalyticsDashboard() {
  const [currentRole, setCurrentRole] = useState<UserRole>('AUTHORITY');
  const [notifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isExporting, setIsExporting] = useState(false);

  const predictiveReports = getPredictiveWardRiskReports();
  const executiveInsights = getExecutiveAIInsightsSummary();

  const monthlyTrendData = [
    { month: 'Jan', reported: 120, resolved: 110 },
    { month: 'Feb', reported: 145, resolved: 135 },
    { month: 'Mar', reported: 180, resolved: 170 },
    { month: 'Apr', reported: 210, resolved: 195 },
    { month: 'May', reported: 260, resolved: 240 },
    { month: 'Jun', reported: 340, resolved: 310 },
    { month: 'Jul', reported: 490, resolved: 440 },
  ];

  const deptShareData = [
    { name: 'PWD Road', value: 38, color: '#3B82F6' },
    { name: 'Sanitation', value: 28, color: '#10B981' },
    { name: 'Drainage', value: 18, color: '#8B5CF6' },
    { name: 'Electricity', value: 10, color: '#F59E0B' },
    { name: 'Water', value: 6, color: '#06B6D4' },
  ];

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Official Executive Analytics Report (CSV & PDF) exported successfully!');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
      />

      <div className="flex-1 flex mx-auto max-w-7xl w-full">
        
        {/* Sidebar */}
        <Sidebar currentRole={currentRole} />

        {/* Main Analytics Content */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* Header & Export Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-teal-600" /> City Civic Intelligence & Predictive Analytics
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Real-time KPI metrics, ward performance & seasonal machine learning forecasts</p>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center space-x-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-800 active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting Report...' : 'Export Municipal PDF/CSV Report'}</span>
            </button>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl glass-card border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Complaints YTD</span>
              <span className="font-display text-2xl font-black text-white block">1,745</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="h-3 w-3" /> +18.4% vs last month
              </span>
            </div>

            <div className="p-4 rounded-3xl glass-card border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Resolution Rate</span>
              <span className="font-display text-2xl font-black text-emerald-400 block">91.8%</span>
              <span className="text-[10px] text-slate-400">1,602 Total Resolved</span>
            </div>

            <div className="p-4 rounded-3xl glass-card border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Avg Resolution Time</span>
              <span className="font-display text-2xl font-black text-brand-300 block">1.2 Days</span>
              <span className="text-[10px] text-brand-400 font-semibold">Within 24h SLA target</span>
            </div>

            <div className="p-4 rounded-3xl glass-card border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">High Risk Wards</span>
              <span className="font-display text-2xl font-black text-rose-400 block">3 Wards</span>
              <span className="text-[10px] text-rose-300 font-semibold">Ward 8, Ward 5, Ward 10</span>
            </div>
          </div>

          {/* LLM Generated Executive Insights Banner */}
          <div className="rounded-3xl glass-card border border-brand-500/40 p-6 shadow-2xl bg-gradient-to-r from-brand-950/60 via-slate-900 to-slate-900 space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-brand-400 animate-pulse" />
              <h3 className="font-display font-bold text-base text-white">LLM Executive Intelligence Summary</h3>
            </div>
            
            <h4 className="text-sm font-bold text-brand-300">{executiveInsights.highlightHeadline}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{executiveInsights.keyObservation}</p>

            <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-xs text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span><strong>Recommended Action:</strong> {executiveInsights.recommendedIntervention}</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-brand-500 text-white shrink-0">
                {executiveInsights.wardImpactStat}
              </span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Monthly Trend Line Chart */}
            <div className="lg:col-span-2 p-5 rounded-3xl glass-card border border-white/10 space-y-4">
              <h3 className="font-display font-bold text-sm text-white">Monthly Complaint Volume & Resolution SLA Velocity</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="reported" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} name="Reported Complaints" />
                    <Line type="monotone" dataKey="resolved" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} name="Resolved Tickets" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Distribution Pie */}
            <div className="p-5 rounded-3xl glass-card border border-white/10 space-y-4">
              <h3 className="font-display font-bold text-sm text-white">Department Issue Share</h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptShareData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fontSize: 10 }}>
                      {deptShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Predictive Risk Forecast Table */}
          <div className="rounded-3xl glass-card border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h3 className="font-display font-bold text-base text-white">Predictive AI Ward Seasonal Risk Assessment</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 uppercase font-semibold text-[10px] text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Municipal Ward</th>
                    <th className="py-3 px-4">Monsoon Flood Risk</th>
                    <th className="py-3 px-4">Garbage Overflow Risk</th>
                    <th className="py-3 px-4">Road Damage Prob</th>
                    <th className="py-3 px-4">Recommended Preventive Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {predictiveReports.map((report) => (
                    <tr key={report.ward} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">{report.ward}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${report.floodRiskPercent >= 80 ? 'text-rose-400 bg-rose-500/15' : 'text-amber-300 bg-amber-500/10'}`}>
                          {report.floodRiskPercent}% Risk
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-cyan-300 font-bold">{report.garbageOverflowRiskPercent}% Risk</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-brand-300 font-bold">{report.roadDamageProbabilityPercent}% Prob</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-[11px] max-w-md">{report.recommendedAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
