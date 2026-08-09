'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserRole, ComplaintItem, NotificationItem } from '@/lib/types';
import { INITIAL_COMPLAINTS, INITIAL_NOTIFICATIONS, DEMO_USERS } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProofOfWorkModal } from '@/components/authority/ProofOfWorkModal';
import { PLAIN_STATUS_CONFIG, getCitizenPlainReason, PLAIN_CATEGORY_LABELS, SupportedLanguage, UI_COPY } from '@/lib/copy-helpers';
import { BackButton } from '@/components/layout/BackButton';
import {
  ShieldAlert,
  Clock,
  MapPin,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  Send,
} from 'lucide-react';

export default function DetailedComplaintPage() {
  const params = useParams();
  const router = useRouter();
  
  const [currentRole, setCurrentRole] = useState<UserRole>('CITIZEN');
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [notifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [complaints, setComplaints] = useState<ComplaintItem[]>(INITIAL_COMPLAINTS);
  
  const [commentText, setCommentText] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);

  const complaintId = params?.id as string;

  // Fetch complaint from PostgreSQL API
  React.useEffect(() => {
    async function loadComplaintDetail() {
      if (!complaintId) return;
      try {
        const res = await fetch(`/api/complaints/${complaintId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setComplaints((prev) => {
            const idx = prev.findIndex((c) => c.id === data.data.id || c.ticketId === data.data.ticketId);
            if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = data.data;
              return copy;
            }
            return [data.data, ...prev];
          });
        }
      } catch (e) {}
    }
    loadComplaintDetail();
  }, [complaintId]);

  const complaint = complaints.find((c) => c.id === complaintId || c.ticketId === complaintId) || complaints[0];

  const currentUser = DEMO_USERS[currentRole];
  const isCitizen = currentRole === 'CITIZEN';
  const copy = UI_COPY[lang] || UI_COPY.en;
  
  const statusConf = PLAIN_STATUS_CONFIG[complaint.status] || PLAIN_STATUS_CONFIG.PENDING;
  const statusLabel = statusConf[lang] || statusConf.label;
  const plainReason = getCitizenPlainReason(complaint, lang);
  const catObj = PLAIN_CATEGORY_LABELS[complaint.category];
  const categoryName = catObj ? catObj[lang] : complaint.categoryLabel;

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText, userId: currentUser.id }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setComplaints((prev) => prev.map((c) => (c.id === complaint.id ? data.data : c)));
        setCommentText('');
        return;
      }
    } catch (e) {}

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaint.id) {
          return {
            ...c,
            history: [
              ...c.history,
              {
                id: `h-${Date.now()}`,
                status: c.status,
                actorName: `${currentUser.name} (${currentRole})`,
                note: `Comment: "${commentText}"`,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return c;
      })
    );
    setCommentText('');
  };

  const handleConfirmResolution = (ticketId: string, afterImgUrl: string, notes: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.ticketId === ticketId) {
          return {
            ...c,
            status: 'CITIZEN_VERIFICATION',
            afterImageUrl: afterImgUrl,
            proofOfWork: {
              beforeImageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7',
              afterImageUrl: afterImgUrl,
              officialNotes: notes,
              aiVerificationScore: 0.96,
              resolvedByEngineer: c.assignedEngineerName || currentUser.name,
              timestamp: new Date().toISOString(),
            },
            history: [
              ...c.history,
              {
                id: `h-${Date.now()}`,
                status: 'CITIZEN_VERIFICATION',
                actorName: currentUser.name,
                note: `Resolution proof uploaded. AI similarity verification score: 96%. Awaiting citizen final confirmation.`,
                timestamp: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${isCitizen ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
        lang={lang}
        onLangChange={setLang}
      />

      <div className="flex-1 flex mx-auto max-w-5xl w-full">
        
        {/* Sidebar (if authority) */}
        {!isCitizen && <Sidebar currentRole={currentRole} />}

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto pb-24">
          
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <BackButton href={isCitizen ? '/dashboard' : '/authority'} label={isCitizen ? copy.backToMyReports : 'Back to Priority Queue'} />

            {/* TWO-TIER METRICS HEADER */}
            <div className="flex items-center space-x-2">
              <span className={`font-mono text-xs font-bold ${isCitizen ? 'text-blue-600' : 'text-teal-400'}`}>
                {complaint.ticketId}
              </span>
              
              {isCitizen ? (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConf.badgeClass}`}>
                  {statusLabel}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI Priority Score: {complaint.priorityScore}/100
                </span>
              )}
            </div>
          </div>

          {/* Main Title & Overview Header */}
          <div className={`p-6 shadow-sm space-y-3 ${isCitizen ? 'civic-card' : 'rounded-3xl glass-card border border-white/10'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
                <span>{catObj?.icon || '⚠️'}</span>
                <span>{categoryName}</span>
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConf.badgeClass}`}>
                {statusLabel}
              </span>
            </div>

            <p className={`text-xs leading-relaxed ${isCitizen ? 'text-slate-600' : 'text-slate-300'}`}>
              {complaint.description}
            </p>

            {/* Two-Tier Plain Language Overview */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl text-xs ${isCitizen ? 'bg-slate-50 border border-slate-200' : 'bg-slate-900/60 border border-white/5'}`}>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">
                  {isCitizen ? copy.whosHandling : "Assigned Dept"}
                </span>
                <span className={`font-semibold ${isCitizen ? 'text-blue-700' : 'text-teal-300'}`}>
                  {complaint.departmentName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">{copy.locationAndWard}</span>
                <span className="font-semibold">{complaint.location.ward}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">
                  {isCitizen ? copy.communityReports : "Spatial Merged Count"}
                </span>
                <span className={`font-bold ${isCitizen ? 'text-blue-600' : 'text-cyan-300'}`}>
                  {complaint.reportCount} Citizens
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">
                  {isCitizen ? copy.assignedWorker : "Assigned Inspector"}
                </span>
                <span className="font-semibold text-green-600">{complaint.assignedEngineerName || 'Team Dispatch Pending'}</span>
              </div>
            </div>

            {/* Citizen Plain Language Reason Banner */}
            {isCitizen && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium">
                {plainReason}
              </div>
            )}
          </div>

          {/* Photos Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div className={`p-4 space-y-2 ${isCitizen ? 'civic-card' : 'rounded-3xl glass-card border border-white/10'}`}>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isCitizen ? 'text-slate-700' : 'text-slate-300'}`}>
                <ShieldAlert className="h-4 w-4 text-amber-500" /> {copy.reportedDefectPhoto}
              </span>
              {complaint.imageUrl && (
                <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-200">
                  <img src={complaint.imageUrl} alt="Before defect" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* After Photo or Resolution Action */}
            <div className={`p-4 space-y-2 flex flex-col justify-between ${isCitizen ? 'civic-card' : 'rounded-3xl glass-card border border-white/10'}`}>
              <div>
                <span className={`text-xs font-bold flex items-center gap-1.5 ${isCitizen ? 'text-slate-700' : 'text-slate-300'}`}>
                  <CheckCircle2 className="h-4 w-4 text-green-600" /> {copy.resolutionProofPhoto}
                </span>

                {complaint.afterImageUrl ? (
                  <div className="h-56 w-full rounded-xl overflow-hidden border border-green-300 mt-2">
                    <img src={complaint.afterImageUrl} alt="After repair" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`h-56 w-full rounded-xl border border-dashed flex flex-col items-center justify-center p-4 text-center mt-2 space-y-2 ${isCitizen ? 'border-slate-300 bg-slate-50' : 'border-white/20'}`}>
                    <FileCheck2 className="h-8 w-8 text-slate-400" />
                    <p className="text-xs text-slate-500">
                      {isCitizen ? copy.workInProgress : 'Resolution proof not yet uploaded by inspector.'}
                    </p>
                    {!isCitizen && (
                      <button
                        onClick={() => setShowProofModal(true)}
                        className="px-4 py-2 rounded-xl bg-green-600 text-xs font-bold text-white shadow hover:bg-green-700"
                      >
                        Upload Resolution Photo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TWO-TIER: AI Diagnostic Section (Only for Authority) */}
          {!isCitizen && (
            <div className="rounded-3xl glass-card border border-teal-500/30 p-6 shadow-2xl space-y-3">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
                <Sparkles className="h-5 w-5 text-teal-400" />
                <h3 className="font-display font-bold text-base text-white">AI Vision & Technical Diagnostic Report (Authority View)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Impact Assessment</span>
                  <p className="text-slate-200">{complaint.aiAnalysis.impactAssessment}</p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Suggested Action & Protocol</span>
                  <p className="text-cyan-300 font-semibold">{complaint.aiAnalysis.suggestedAction}</p>
                </div>
              </div>
            </div>
          )}

          {/* TWO-TIER: Timeline vs Stepper */}
          <div className={`p-6 shadow-sm space-y-4 ${isCitizen ? 'civic-card' : 'rounded-3xl glass-card border border-white/10'}`}>
            <h3 className="font-display font-bold text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>{isCitizen ? copy.statusProgress : 'Complaint Lifecycle Audit Timeline'}</span>
            </h3>

            {isCitizen ? (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between gap-1">
                  {['Reported', 'Received', 'Assigned', 'Work Started', 'Resolved'].map((stepName, idx) => {
                    const isDone = idx + 1 <= statusConf.stepIndex;
                    return (
                      <div key={stepName} className="flex-1 text-center">
                        <div className={`h-2 rounded-full mb-2 ${isDone ? 'bg-blue-600' : 'bg-slate-200'}`} />
                        <span className={`text-[11px] font-semibold block truncate ${isDone ? 'text-blue-700' : 'text-slate-400'}`}>
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10 pl-6">
                {complaint.history.map((h) => (
                  <div key={h.id} className="relative space-y-0.5">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-teal-400 ring-4 ring-slate-900" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{h.actorName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-300">{h.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Community Discussion Notes */}
          <div className={`p-6 shadow-sm space-y-4 ${isCitizen ? 'civic-card' : 'rounded-3xl glass-card border border-white/10'}`}>
            <h3 className="font-display font-bold text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" /> {copy.communityNotes} ({complaint.commentsCount})
            </h3>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={copy.addNoteOrComment}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className={`flex-1 p-2.5 rounded-xl text-xs ${isCitizen ? 'civic-input' : 'glass-input'}`}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

        </main>
      </div>

      {/* Proof of Work Modal */}
      <ProofOfWorkModal
        complaint={showProofModal ? complaint : null}
        onClose={() => setShowProofModal(false)}
        onConfirmResolution={handleConfirmResolution}
      />

    </div>
  );
}
