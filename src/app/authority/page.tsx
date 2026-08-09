'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserRole, ComplaintItem, NotificationItem, Status } from '@/lib/types';
import { INITIAL_COMPLAINTS, INITIAL_NOTIFICATIONS, DEMO_USERS } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { PriorityQueue } from '@/components/authority/PriorityQueue';
import { ProofOfWorkModal } from '@/components/authority/ProofOfWorkModal';
import { AuthorityDetailModal } from '@/components/authority/AuthorityDetailModal';
import { CivicMap } from '@/components/map/CivicMap';
import { WARD_LIST, getPredictiveWardRiskReports, getExecutiveAIInsightsSummary } from '@/lib/ai/predictive-analytics';
import {
  Building2,
  ListTodo,
  FileCheck2,
  MapPin,
  CheckCircle2,
  Flame,
  Clock,
  ShieldAlert,
  Search,
  Bell,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export default function AuthorityDashboard() {
  const [currentRole, setCurrentRole] = useState<UserRole>('AUTHORITY');
  const [complaints, setComplaints] = useState<ComplaintItem[]>(INITIAL_COMPLAINTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Fetch persisted priority queue from PostgreSQL API
  React.useEffect(() => {
    async function loadAuthorityData() {
      try {
        const [cmpRes, notifRes] = await Promise.all([
          fetch('/api/authority'),
          fetch('/api/notifications?userId=usr-auth-01'),
        ]);
        const cmpData = await cmpRes.json();
        const notifData = await notifRes.json();
        if (cmpData.success && cmpData.data && cmpData.data.length > 0) {
          setComplaints(cmpData.data);
        }
        if (notifData.success && notifData.data && notifData.data.length > 0) {
          setNotifications(notifData.data);
        }
      } catch (err) {}
    }
    loadAuthorityData();
  }, []);

  // Selected ward filter state for header
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Modals & Drawers state
  const [selectedForProofModal, setSelectedForProofModal] = useState<ComplaintItem | null>(null);
  const [selectedForDetailModal, setSelectedForDetailModal] = useState<ComplaintItem | null>(null);

  const currentUser = DEMO_USERS[currentRole];
  const predictiveReports = getPredictiveWardRiskReports();
  const executiveInsights = getExecutiveAIInsightsSummary();

  // Metrics calculation
  const criticalCount = complaints.filter((c) => c.severity === 'CRITICAL' || c.priorityScore >= 85).length;
  const newCount = complaints.filter((c) => c.status === 'PENDING').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CITIZEN_VERIFICATION').length;

  // Overdue calculation (>24h since creation and not resolved)
  const overdueCount = complaints.filter((c) => {
    if (c.status === 'RESOLVED') return false;
    const hours = (new Date().getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
    return hours >= 24;
  }).length;

  // Filter complaints by header global search and ward selector
  const filteredComplaints = complaints.filter((c) => {
    const matchesWard = selectedWard === 'ALL' || c.location.ward.includes(selectedWard);
    const matchesSearch =
      !globalSearch.trim() ||
      c.ticketId.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.departmentCode.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.location.address.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesWard && matchesSearch;
  });

  const handleMarkUrgent = (ticketId: string) => {
    handleUpdateStatus(ticketId, 'IN_PROGRESS', 'Authority Override: Marked Urgent');
  };

  const handleAddInternalNote = (ticketId: string, noteText: string) => {
    handleUpdateStatus(ticketId, 'IN_PROGRESS', `Internal Note: ${noteText}`);
  };

  // Action handlers connected to /api/authority
  const handleAssignEngineer = async (ticketId: string, engineerName: string) => {
    const target = complaints.find((c) => c.ticketId === ticketId || c.id === ticketId);
    if (!target) return;

    try {
      const res = await fetch('/api/authority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_ENGINEER',
          complaintId: target.id,
          engineerName,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setComplaints((prev) => prev.map((c) => (c.id === target.id ? data.data : c)));
        if (selectedForDetailModal?.id === target.id) setSelectedForDetailModal(data.data);
        return;
      }
    } catch (e) {}

    // Fallback UI update
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.ticketId === ticketId || c.id === ticketId) {
          const updated = {
            ...c,
            status: 'ASSIGNED' as Status,
            assignedEngineerName: engineerName,
            updatedAt: new Date().toISOString(),
          };
          if (selectedForDetailModal?.id === c.id) setSelectedForDetailModal(updated);
          return updated;
        }
        return c;
      })
    );
  };

  const handleUpdateStatus = async (ticketId: string, status: Status, note?: string) => {
    const target = complaints.find((c) => c.ticketId === ticketId || c.id === ticketId);
    if (!target) return;

    try {
      const res = await fetch('/api/authority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          complaintId: target.id,
          status,
          note,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setComplaints((prev) => prev.map((c) => (c.id === target.id ? data.data : c)));
        if (selectedForDetailModal?.id === target.id) setSelectedForDetailModal(data.data);
        return;
      }
    } catch (e) {}
  };

  const handleConfirmResolution = async (ticketId: string, afterImgUrl: string, notes: string) => {
    const target = complaints.find((c) => c.ticketId === ticketId || c.id === ticketId);
    if (!target) return;

    try {
      const res = await fetch('/api/authority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUBMIT_PROOF',
          complaintId: target.id,
          afterImageUrl: afterImgUrl,
          officialNotes: notes,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setComplaints((prev) => prev.map((c) => (c.id === target.id ? data.data : c)));
        if (selectedForDetailModal?.id === target.id) setSelectedForDetailModal(data.data);
        return;
      }
    } catch (e) {}
  };

  const handleReopenComplaint = async (ticketId: string, reason: string) => {
    const target = complaints.find((c) => c.ticketId === ticketId || c.id === ticketId);
    if (!target) return;

    try {
      const res = await fetch('/api/authority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REOPEN_COMPLAINT',
          complaintId: target.id,
          reason,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setComplaints((prev) => prev.map((c) => (c.id === target.id ? data.data : c)));
        if (selectedForDetailModal?.id === target.id) setSelectedForDetailModal(data.data);
        return;
      }
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
      />

      <div className="flex-1 flex mx-auto max-w-7xl w-full">
        
        {/* Persistent Sidebar */}
        <Sidebar
          currentRole={currentRole}
          pendingCount={newCount}
          criticalCount={criticalCount}
        />

        {/* Main Command Workspace */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* HEADER COMMAND CENTER BAR */}
          <div className="rounded-2xl border border-slate-200 p-5 shadow-sm bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  Municipal Operations Command Center
                </span>
                <span className="text-[10px] text-slate-500">• Civil Lines Zone</span>
              </div>
              <h1 className="font-display text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-teal-600" />
                {currentUser.departmentName || 'Public Works Department'}
              </h1>
            </div>

            {/* Global Search & Ward Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Global search (Ticket, Ward, Dept)..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs w-52 sm:w-64 focus:w-72 focus:border-teal-600 focus:outline-none transition-all text-slate-900 bg-white"
                />
              </div>

              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
              >
                <option value="ALL">All Wards (City-Wide)</option>
                {WARD_LIST.map((w) => (
                  <option key={w} value={w.split(' ')[1]}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* OVERVIEW EXECUTIVE KPI CARDS */}
          <div id="overview" className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Critical Urgent</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-display text-2xl font-extrabold text-rose-700">{criticalCount}</span>
                <Flame className="h-5 w-5 text-rose-600" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-sm">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">New Reported</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-display text-2xl font-extrabold text-sky-700">{newCount}</span>
                <ShieldAlert className="h-5 w-5 text-sky-600" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Work Started</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-display text-2xl font-extrabold text-amber-700">{inProgressCount}</span>
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-red-200 shadow-sm">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">SLA Overdue</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-display text-2xl font-extrabold text-red-700">{overdueCount}</span>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Resolved Today</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-display text-2xl font-extrabold text-emerald-700">{resolvedCount}</span>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* PRIORITY QUEUE SECTION */}
          <div id="queue" className="space-y-2">
            <PriorityQueue
              complaints={filteredComplaints}
              onAssignEngineer={handleAssignEngineer}
              onOpenProofModal={(c) => setSelectedForProofModal(c)}
              onSelectComplaint={(c) => setSelectedForDetailModal(c)}
            />
          </div>

          {/* ANALYTICS SUMMARY & PREDICTIVE RISKS */}
          <div id="predictive" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* Analytics Summary Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" /> What changed this week?
                </h3>
                <ul className="text-xs text-slate-700 space-y-2 font-medium">
                  <li className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>Road damage reports increased <strong>34%</strong> in transit corridors.</span>
                  </li>
                  <li className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <span className="text-sky-600 font-bold">•</span>
                    <span>Drainage issues increased <strong>3.8x</strong> after rainfall in Ward 8.</span>
                  </li>
                  <li className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Ward 8 has the highest unresolved complaint density.</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/analytics"
                className="w-full py-2 px-3 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200 hover:bg-teal-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Analytics Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Upcoming Predictive Risks Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 md:col-span-2">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-600" /> Upcoming AI Predictive Risks & Preventative Actions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {predictiveReports.slice(0, 2).map((report) => (
                  <div key={report.ward} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="font-bold text-slate-900 text-xs">{report.ward}</span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {report.floodRiskPercent}% Flood Risk
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      "{report.recommendedAction}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>Road Damage Prob: <strong>{report.roadDamageProbabilityPercent}%</strong></span>
                      <span className="text-amber-700 font-bold">Trend: {report.riskTrend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ADVANCED AUTHORITY INCIDENT MAP */}
          <div id="map" className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-600" /> Municipal Operations Live Incident Map
              </h2>
              <span className="text-xs text-slate-500 font-medium">Ward-Level Filter Active</span>
            </div>

            <CivicMap
              complaints={filteredComplaints}
              onSelectComplaint={(c) => setSelectedForDetailModal(c)}
              onSupportComplaint={(c) => handleConfirmResolution(c.ticketId, c.imageUrl || '', 'Supported by authority')}
            />
          </div>

        </main>
      </div>

      {/* AUTHORITY COMPLAINT DETAIL MODAL / DRAWER */}
      <AuthorityDetailModal
        complaint={selectedForDetailModal}
        onClose={() => setSelectedForDetailModal(null)}
        onAssignEngineer={handleAssignEngineer}
        onUpdateStatus={handleUpdateStatus}
        onMarkUrgent={handleMarkUrgent}
        onAddInternalNote={handleAddInternalNote}
        onOpenProofModal={(c) => {
          setSelectedForDetailModal(null);
          setSelectedForProofModal(c);
        }}
        onReopenComplaint={handleReopenComplaint}
      />

      {/* PROOF OF WORK RESOLUTION MODAL */}
      <ProofOfWorkModal
        complaint={selectedForProofModal}
        onClose={() => setSelectedForProofModal(null)}
        onConfirmResolution={handleConfirmResolution}
      />

    </div>
  );
}
