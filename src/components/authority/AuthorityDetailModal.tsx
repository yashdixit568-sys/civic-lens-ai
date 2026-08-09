'use client';

import React, { useState } from 'react';
import { ComplaintItem, Status } from '@/lib/types';
import { getCitizenPlainReason } from '@/lib/copy-helpers';
import {
  Building2,
  ShieldAlert,
  Flame,
  Clock,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  MessageSquare,
  MapPin,
  Sparkles,
  Layers,
  FileText,
  UserCheck,
  Send,
  History,
  X,
  ThumbsUp,
  RotateCcw,
} from 'lucide-react';

interface AuthorityDetailModalProps {
  complaint: ComplaintItem | null;
  onClose: () => void;
  onAssignEngineer: (ticketId: string, engineerName: string) => void;
  onUpdateStatus: (ticketId: string, status: Status, note?: string) => void;
  onMarkUrgent: (ticketId: string) => void;
  onAddInternalNote: (ticketId: string, note: string) => void;
  onOpenProofModal: (complaint: ComplaintItem) => void;
  onReopenComplaint: (ticketId: string, reason: string) => void;
}

const DEMO_ENGINEERS = [
  { name: 'Er. Ramesh Kumar', dept: 'PWD', workload: 2, distance: '1.2 km away' },
  { name: 'Er. Sunita Verma', dept: 'MUNICIPAL_CORP', workload: 1, distance: '0.8 km away' },
  { name: 'Er. Amit Sharma', dept: 'WATER', workload: 3, distance: '2.5 km away' },
  { name: 'Er. Priya Patel', dept: 'ELECTRICITY', workload: 0, distance: '0.4 km away' },
];

export const AuthorityDetailModal: React.FC<AuthorityDetailModalProps> = ({
  complaint,
  onClose,
  onAssignEngineer,
  onUpdateStatus,
  onMarkUrgent,
  onAddInternalNote,
  onOpenProofModal,
  onReopenComplaint,
}) => {
  const [selectedEngineer, setSelectedEngineer] = useState(DEMO_ENGINEERS[0].name);
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [reopenReasonInput, setReopenReasonInput] = useState('');
  const [showReopenInput, setShowReopenInput] = useState(false);

  if (!complaint) return null;

  // SLA Calculation helper
  const calculateSLABadge = (createdIso: string, status: Status) => {
    if (status === 'RESOLVED') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30">🟢 SLA Resolved</span>;
    }
    const createdTime = new Date(createdIso).getTime();
    const nowTime = new Date().getTime();
    const hoursElapsed = Math.floor((nowTime - createdTime) / (1000 * 60 * 60));
    const hoursRemaining = 24 - hoursElapsed;

    if (hoursRemaining <= 0) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 🔴 {Math.abs(hoursRemaining)}h Overdue</span>;
    } else if (hoursRemaining <= 4) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 🟡 {hoursRemaining}h remaining</span>;
    } else {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 🟢 {hoursRemaining}h remaining</span>;
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteInput.trim()) return;
    onAddInternalNote(complaint.ticketId, internalNoteInput);
    setInternalNoteInput('');
  };

  const handleTriggerReopen = () => {
    if (!reopenReasonInput.trim()) return;
    onReopenComplaint(complaint.ticketId, reopenReasonInput);
    setShowReopenInput(false);
    setReopenReasonInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-slate-200 p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900">
        
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                {complaint.ticketId}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {complaint.departmentName || complaint.departmentCode} • {complaint.location.ward}
              </span>
            </div>
            <h2 className="font-display text-xl font-extrabold text-slate-900 mt-1">
              {complaint.title}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {calculateSLABadge(complaint.createdAt, complaint.status)}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Columns: Issue Details & AI Analysis */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI PRIORITY EXPLANATION CARD */}
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2.5 shadow-xs">
              <h3 className="font-display text-sm font-bold text-sky-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-700" />
                Why is this urgent?
              </h3>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Marked urgent because:
              </p>
              <ul className="text-xs text-slate-700 space-y-1.5 font-medium pl-2">
                {complaint.location.nearSchool && (
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-700 shrink-0" />
                    <span>It is near a school zone</span>
                  </li>
                )}
                {complaint.location.nearHospital && (
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-700 shrink-0" />
                    <span>It is near a hospital corridor</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-700 shrink-0" />
                  <span>{complaint.reportCount} citizens reported this issue</span>
                </li>
                {complaint.upvotes > 5 && (
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-700 shrink-0" />
                    <span>High community engagement ({complaint.upvotes} upvotes)</span>
                  </li>
                )}
                {complaint.severity === 'CRITICAL' && (
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0" />
                    <span className="text-rose-700 font-bold">Safety hazard detected by AI vision models</span>
                  </li>
                )}
              </ul>
            </div>

            {/* AI TECHNICAL BREAKDOWN GRID */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-teal-600" />
                AI Technical Analysis Metrics
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Priority Score</span>
                  <span className="font-display text-base font-extrabold text-amber-700 flex items-center gap-1">
                    <Flame className="h-4 w-4 text-amber-600" /> {complaint.priorityScore}/100
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Severity Level</span>
                  <span className="font-display text-base font-extrabold text-rose-700">
                    {complaint.severity}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Vision Confidence</span>
                  <span className="font-display text-base font-extrabold text-emerald-700">
                    {Math.round((complaint.confidenceScore || 0.94) * 100)}%
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Duplicate Signal</span>
                  <span className="font-display text-base font-extrabold text-sky-700">
                    {complaint.isDuplicate ? '92% Match' : 'Unique Signal'}
                  </span>
                </div>
              </div>
            </div>

            {/* CITIZEN EVIDENCE & REPORTED PHOTO */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-sky-700" />
                Citizen Evidence & Location
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {complaint.imageUrl && (
                  <div className="h-44 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
                    <img src={complaint.imageUrl} alt="Reported defect" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-bold text-white">
                      Reported Defect Photo
                    </span>
                  </div>
                )}

                <div className="space-y-2 font-medium">
                  <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    "{complaint.description}"
                  </p>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 block">Location Address</span>
                    <span className="text-slate-900 font-semibold flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-teal-600" /> {complaint.location.address}
                    </span>
                    <span className="text-[10px] text-slate-500 block pt-1">
                      Reported by {complaint.reportCount} citizens • {complaint.upvotes} community upvotes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RESOLUTION PROOF OF WORK */}
            {(complaint.status === 'RESOLVED' || complaint.status === 'CITIZEN_VERIFICATION' || complaint.afterImageUrl) && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    Proof-of-Work Resolution Record
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Status: {complaint.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {complaint.afterImageUrl && (
                    <div className="h-36 rounded-xl overflow-hidden border border-emerald-300 relative bg-emerald-100">
                      <img src={complaint.afterImageUrl} alt="After repair" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-800 text-[10px] font-bold text-white">
                        AFTER: REPAIRED
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {complaint.proofOfWork && (
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-slate-800 space-y-1">
                        <span className="text-[10px] text-emerald-700 font-bold block">Official Repair Notes</span>
                        <p>{complaint.proofOfWork.officialNotes}</p>
                        <span className="text-[10px] text-slate-500 block pt-1">
                          Resolved by: {complaint.proofOfWork.resolvedByEngineer}
                        </span>
                      </div>
                    )}

                    {/* Citizen Verification Status */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Citizen Feedback:</span>
                      <span className="font-bold text-amber-800">Awaiting Citizen Verification</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIT LOG TRAIL HISTORY */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="h-4 w-4 text-teal-600" />
                Audit Trail Log History
              </h3>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {complaint.history.map((h) => (
                  <div key={h.id} className="p-2 rounded-xl bg-white border border-slate-200 text-xs flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{h.actorName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          {h.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{h.note}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Dispatch Actions & Internal Notes */}
          <div className="space-y-6">
            
            {/* ENGINEER DISPATCH CARD */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-teal-600" />
                Engineer Workload Dispatch
              </h3>

              {complaint.assignedEngineerName ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Assigned Engineer</span>
                  <span className="font-bold text-slate-900 text-sm block">{complaint.assignedEngineerName}</span>
                  <span className="text-[10px] text-slate-500 block">Dispatched with 24h SLA target</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Available Field Engineer</label>
                    <select
                      value={selectedEngineer}
                      onChange={(e) => setSelectedEngineer(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                    >
                      {DEMO_ENGINEERS.map((eng) => (
                        <option key={eng.name} value={eng.name}>
                          {eng.name} ({eng.workload} active • {eng.distance})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => onAssignEngineer(complaint.ticketId, selectedEngineer)}
                    className="w-full py-2 px-3 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Dispatch Engineer</span>
                  </button>
                </div>
              )}
            </div>

            {/* LIFECYCLE STATUS ACTIONS */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-600" />
                Lifecycle Status Control
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onUpdateStatus(complaint.ticketId, 'ASSIGNED', 'Acknowledged by municipal control room.')}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                    complaint.status === 'ASSIGNED' ? 'bg-sky-100 border-sky-300 text-sky-900' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Acknowledged
                </button>

                <button
                  onClick={() => onUpdateStatus(complaint.ticketId, 'IN_PROGRESS', 'Field repair team dispatched on-site.')}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                    complaint.status === 'IN_PROGRESS' ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Work Started
                </button>
              </div>

              {/* Upload Proof of Work Trigger */}
              {complaint.status !== 'RESOLVED' && (
                <button
                  onClick={() => onOpenProofModal(complaint)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-xs flex items-center justify-center gap-1.5 mt-2"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>Upload Proof & Resolve</span>
                </button>
              )}

              {/* Urgent Toggle Button */}
              <button
                onClick={() => onMarkUrgent(complaint.ticketId)}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Flame className="h-4 w-4 text-rose-600" />
                <span>Mark High Priority Urgent</span>
              </button>

              {/* Re-open Issue Option */}
              {complaint.status === 'RESOLVED' && (
                <div className="pt-2">
                  {!showReopenInput ? (
                    <button
                      onClick={() => setShowReopenInput(true)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Re-open Issue (Citizen Unresolved)</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={reopenReasonInput}
                        onChange={(e) => setReopenReasonInput(e.target.value)}
                        placeholder="Reason citizen states issue is still broken..."
                        className="w-full h-16 p-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowReopenInput(false)}
                          className="flex-1 py-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleTriggerReopen}
                          className="flex-1 py-1 bg-rose-700 text-white font-bold text-xs rounded-lg hover:bg-rose-800"
                        >
                          Confirm Reopen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* INTERNAL NOTES FORM */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-teal-600" />
                Add Internal Authority Note
              </h3>

              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  placeholder="Private internal notes for officers & engineers..."
                  className="w-full h-20 p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                />
                <button
                  type="submit"
                  disabled={!internalNoteInput.trim()}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Post Internal Note</span>
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
