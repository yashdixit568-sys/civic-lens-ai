'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserRole, ComplaintItem, NotificationItem } from '@/lib/types';
import { INITIAL_COMPLAINTS, INITIAL_NOTIFICATIONS, DEMO_USERS } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav, CitizenTab } from '@/components/layout/BottomNav';
import { CivicMap } from '@/components/map/CivicMap';
import { ReportFlowSection } from '@/components/citizen/ReportFlowSection';
import { SubmitComplaintModal } from '@/components/citizen/SubmitComplaintModal';
import { CivicChatbotDrawer } from '@/components/chatbot/CivicChatbotDrawer';
import { SupportedLanguage, UI_COPY, PLAIN_CATEGORY_LABELS, PLAIN_STATUS_CONFIG, getCitizenPlainReason } from '@/lib/copy-helpers';
import { mergeDuplicateIntoMaster } from '@/lib/ai/duplicate-detector';
import { BackButton } from '@/components/layout/BackButton';
import {
  Camera,
  Mic,
  FileText,
  MapPin,
  ThumbsUp,
  ChevronRight,
  BotMessageSquare,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function CitizenDashboard() {
  const [currentRole, setCurrentRole] = useState<UserRole>('CITIZEN');
  const [activeTab, setActiveTab] = useState<CitizenTab>('HOME');
  const [lang, setLang] = useState<SupportedLanguage>('en');

  const [complaints, setComplaints] = useState<ComplaintItem[]>(INITIAL_COMPLAINTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [reportInputMode, setReportInputMode] = useState<'PHOTO' | 'VOICE' | 'TEXT'>('PHOTO');

  // Fetch persisted complaints and notifications from PostgreSQL API
  React.useEffect(() => {
    async function loadData() {
      try {
        const [cmpRes, notifRes] = await Promise.all([
          fetch('/api/complaints'),
          fetch('/api/notifications?userId=usr-citizen-01'),
        ]);
        const cmpData = await cmpRes.json();
        const notifData = await notifRes.json();
        if (cmpData.success && cmpData.data && cmpData.data.length > 0) {
          setComplaints(cmpData.data);
        }
        if (notifData.success && notifData.data && notifData.data.length > 0) {
          setNotifications(notifData.data);
        }
      } catch (err) {
        // Fallback to initial mock if offline
      }
    }
    loadData();
  }, []);

  const currentUser = DEMO_USERS[currentRole];
  const copy = UI_COPY[lang] || UI_COPY.en;

  const handleNewSubmitSuccess = (newComplaint: ComplaintItem, supportedMasterTicketId?: string) => {
    if (supportedMasterTicketId) {
      setComplaints((prev) =>
        prev.map((c) => {
          if (c.ticketId === supportedMasterTicketId || c.id === supportedMasterTicketId) {
            return {
              ...c,
              reportCount: c.reportCount + 1,
              upvotes: c.upvotes + 2,
            };
          }
          return c;
        })
      );
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: 'Report Supported',
          message: `You supported ticket ${supportedMasterTicketId}. Community count increased!`,
          ticketId: supportedMasterTicketId,
          type: 'DUPLICATE_MERGE',
          read: false,
          createdAt: 'Just now',
        },
        ...prev,
      ]);
    } else {
      const dupIndex = complaints.findIndex(
        (c) => c.category === newComplaint.category && c.status !== 'RESOLVED'
      );

      if (dupIndex !== -1) {
        const updatedMaster = mergeDuplicateIntoMaster(complaints[dupIndex], newComplaint.citizenName);
        const updatedList = [...complaints];
        updatedList[dupIndex] = updatedMaster;
        setComplaints(updatedList);

        setNotifications((prev) => [
          {
            id: `n-${Date.now()}`,
            title: 'Report Added to Nearby Issue',
            message: `Your report was added to nearby ticket ${updatedMaster.ticketId}.`,
            ticketId: updatedMaster.ticketId,
            type: 'DUPLICATE_MERGE',
            read: false,
            createdAt: 'Just now',
          },
          ...prev,
        ]);
      } else {
        setComplaints((prev) => [newComplaint, ...prev]);
        setNotifications((prev) => [
          {
            id: `n-${Date.now()}`,
            title: 'Report Received',
            message: `Report ${newComplaint.ticketId} received and sent to local team.`,
            ticketId: newComplaint.ticketId,
            type: 'STATUS_CHANGE',
            read: false,
            createdAt: 'Just now',
          },
          ...prev,
        ]);
      }
    }

    setActiveTab('REPORTS');
  };

  const handleUpvote = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/complaints/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr-citizen-01' }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...data.data, hasUpvoted: true } : c))
        );
        return;
      }
    } catch (err) {}

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const hasUpvoted = !c.hasUpvoted;
          return {
            ...c,
            hasUpvoted,
            upvotes: hasUpvoted ? c.upvotes + 1 : c.upvotes - 1,
          };
        }
        return c;
      })
    );
  };

  const handleCitizenVerifyResolution = (id: string, isFixed: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: isFixed ? 'RESOLVED' : 'IN_PROGRESS',
            history: [
              ...c.history,
              {
                id: `h-${Date.now()}`,
                status: isFixed ? 'RESOLVED' : 'IN_PROGRESS',
                actorName: currentUser.name,
                note: isFixed ? 'Citizen confirmed problem is fixed.' : 'Citizen reported problem is still present.',
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return c;
      })
    );
  };

  const nearbyComplaints = complaints.slice(0, 3);
  const myComplaints = complaints;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-24 md:pb-8 selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
        lang={lang}
        onLangChange={setLang}
        onOpenReportFlow={() => setActiveTab('REPORT')}
      />

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* ==================== SCREEN 1: HOME ==================== */}
        {activeTab === 'HOME' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Primary Action Card: What needs fixing? -> Report a Problem */}
            <div className="civic-card p-6 sm:p-8 space-y-6 bg-white border border-slate-200 shadow-sm text-center">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">What needs fixing?</span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {copy.reportProblem}
                </h1>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-medium mt-1">
                  Report potholes, garbage, water leaks & broken lights in under 30 seconds.
                </p>
              </div>

              {/* 3 Entry Buttons (Photo as Primary Action) */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <button
                  onClick={() => { setReportInputMode('PHOTO'); setActiveTab('REPORT'); }}
                  className="p-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md flex flex-col items-center justify-center space-y-2 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold">{copy.photoMode}</span>
                </button>

                <button
                  onClick={() => { setReportInputMode('VOICE'); setActiveTab('REPORT'); }}
                  className="p-4 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all flex flex-col items-center justify-center space-y-2 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mic className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold">{copy.voiceMode}</span>
                </button>

                <button
                  onClick={() => { setReportInputMode('TEXT'); setActiveTab('REPORT'); }}
                  className="p-4 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all flex flex-col items-center justify-center space-y-2 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold">{copy.textMode}</span>
                </button>
              </div>
            </div>

            {/* Simple Nearby Issues Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>{copy.nearbyIssues}</span>
                </h2>
                <button onClick={() => setActiveTab('MAP')} className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                  <span>View Map</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {nearbyComplaints.map((c) => {
                  const catObj = PLAIN_CATEGORY_LABELS[c.category];
                  const categoryName = catObj ? catObj[lang] : c.categoryLabel;
                  const icon = catObj ? catObj.icon : '⚠️';
                  const statusConf = PLAIN_STATUS_CONFIG[c.status] || PLAIN_STATUS_CONFIG.PENDING;

                  return (
                    <Link
                      key={c.id}
                      href={`/complaints/${c.id}`}
                      className="block p-4 civic-card space-y-2 hover:border-blue-300 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                          <span>{icon}</span> {categoryName}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-500 font-medium">400m away</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusConf.badgeClass}`}>
                            {statusConf[lang] || statusConf.label}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1 font-medium">{c.title}</p>

                      <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-100">
                        <span>Reported by {c.reportCount} citizens</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleUpvote(c.id, e)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                              c.hasUpvoted ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" /> {c.upvotes}
                          </button>
                          <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                            Details →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

        {/* ==================== SCREEN 2: REPORT FLOW ==================== */}
        {activeTab === 'REPORT' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <BackButton label="Back to Home" onClick={() => setActiveTab('HOME')} />
              <span className="text-xs font-semibold text-slate-500">Report Flow</span>
            </div>

            <ReportFlowSection
              onSuccess={handleNewSubmitSuccess}
              existingComplaints={complaints}
              lang={lang}
              initialInputMode={reportInputMode}
              onCancel={() => setActiveTab('HOME')}
              onViewMyReport={() => setActiveTab('REPORTS')}
            />
          </motion.div>
        )}

        {/* ==================== SCREEN 3: MAP VIEW ==================== */}
        {activeTab === 'MAP' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <CivicMap
              complaints={complaints}
              lang={lang}
              onBack={() => setActiveTab('HOME')}
              onSupportComplaint={(c) => handleNewSubmitSuccess(c, c.ticketId)}
              onOpenReportFlow={() => setActiveTab('REPORT')}
              onSelectComplaint={(c) => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/complaints/${c.id}`;
                }
              }}
            />
          </motion.div>
        )}

        {/* ==================== SCREEN 4: MY REPORTS ==================== */}
        {activeTab === 'REPORTS' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <BackButton label="Back to Home" onClick={() => setActiveTab('HOME')} />
              <span className="text-xs text-slate-500 font-semibold">{myComplaints.length} active reports</span>
            </div>

            <h1 className="font-display text-xl font-bold text-slate-900">{copy.myReports}</h1>

            <div className="space-y-3">
              {myComplaints.map((c) => {
                const catObj = PLAIN_CATEGORY_LABELS[c.category];
                const categoryName = catObj ? catObj[lang] : c.categoryLabel;
                const icon = catObj ? catObj.icon : '⚠️';
                const statusConf = PLAIN_STATUS_CONFIG[c.status] || PLAIN_STATUS_CONFIG.PENDING;
                const plainReason = getCitizenPlainReason(c, lang);

                return (
                  <Link
                    key={c.id}
                    href={`/complaints/${c.id}`}
                    className="block p-4 civic-card space-y-3 hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-blue-600">{c.ticketId}</span>
                        <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5 group-hover:text-blue-600 transition-colors">
                          <span>{icon}</span> {categoryName}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConf.badgeClass}`}>
                        {statusConf[lang] || statusConf.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-800 font-medium">
                      {plainReason}
                    </div>

                    {/* Progress Stepper */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>Status Progress</span>
                        <span>{statusConf.label}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${(statusConf.stepIndex / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Verification Card if Ready */}
                    {c.status === 'CITIZEN_VERIFICATION' && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                        <span className="font-bold text-amber-800 block">Is the problem fixed?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleCitizenVerifyResolution(c.id, true, e)}
                            className="flex-1 py-1.5 rounded-lg bg-green-600 text-white font-bold text-xs"
                          >
                            ✓ Yes, Fixed
                          </button>
                          <button
                            onClick={(e) => handleCitizenVerifyResolution(c.id, false, e)}
                            className="flex-1 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs"
                          >
                            ✕ Still Broken
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">📍 {c.location.ward}</span>
                      <span className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                        <span>View Details</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ==================== SCREEN 5: PROFILE ==================== */}
        {activeTab === 'PROFILE' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            <div className="flex items-center justify-between">
              <BackButton label="Back to Home" onClick={() => setActiveTab('HOME')} />
              <span className="text-xs font-semibold text-slate-500">Citizen Profile</span>
            </div>

            {/* User Profile Card */}
            <div className="civic-card p-6 flex items-center space-x-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-16 w-16 rounded-full object-cover ring-4 ring-blue-100"
              />
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-slate-900">{currentUser.name}</h2>
                <p className="text-xs text-slate-500 font-medium">Citizen Reporter • Civil Lines Ward</p>
                <div className="flex items-center space-x-2 pt-1 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    280 Community Points
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200">
                    🏅 Level 3 Neighborhood Guardian
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="civic-card divide-y divide-slate-100 text-xs font-semibold">
              <div className="p-4 flex items-center justify-between">
                <span className="text-slate-700">Notifications & Alerts</span>
                <span className="text-slate-400">Enabled</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-slate-700">Preferred Language</span>
                <span className="text-blue-600 uppercase font-bold">{lang}</span>
              </div>
            </div>

            {/* Authority Console Switcher Link (For Demo / Role Testing) */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-2">
              <span className="text-xs text-slate-500 font-medium block">Role Switcher (Demo Mode)</span>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentRole('CITIZEN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${currentRole === 'CITIZEN' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
                >
                  Citizen
                </button>
                <Link
                  href="/authority"
                  className="px-3 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-50"
                >
                  Authority Console →
                </Link>
                <Link
                  href="/analytics"
                  className="px-3 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-50"
                >
                  Analytics →
                </Link>
              </div>
            </div>

          </motion.div>
        )}

      </div>

      {/* Floating AI Chatbot Button */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all md:bottom-6"
        aria-label="Civic Assistant"
      >
        <BotMessageSquare className="h-6 w-6" />
      </button>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} lang={lang} />

      {/* Submit Modal & Chatbot Drawer */}
      <SubmitComplaintModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitSuccess={handleNewSubmitSuccess}
        existingComplaints={complaints}
        lang={lang}
      />

      <CivicChatbotDrawer
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        userComplaints={complaints}
      />

    </div>
  );
}
