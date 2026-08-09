'use client';

import React, { useState } from 'react';
import { ComplaintItem, Status } from '@/lib/types';
import { WARD_LIST } from '@/lib/ai/predictive-analytics';
import {
  ListTodo,
  Clock,
  UserPlus,
  CheckCircle2,
  AlertOctagon,
  Search,
  Filter,
  Eye,
  Building2,
  Flame,
  MapPin,
} from 'lucide-react';

interface PriorityQueueProps {
  complaints: ComplaintItem[];
  onAssignEngineer: (ticketId: string, engineerName: string) => void;
  onOpenProofModal: (complaint: ComplaintItem) => void;
  onSelectComplaint: (complaint: ComplaintItem) => void;
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({
  complaints,
  onAssignEngineer,
  onOpenProofModal,
  onSelectComplaint,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = complaints
    .filter((c) => {
      const matchesSearch =
        c.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === 'ALL' || c.departmentCode === deptFilter;
      const matchesWard = wardFilter === 'ALL' || c.location.ward.includes(wardFilter);
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesSearch && matchesDept && matchesWard && matchesStatus;
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const calculateSLABadge = (createdIso: string, status: Status) => {
    if (status === 'RESOLVED') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">🟢 Resolved</span>;
    }
    const createdTime = new Date(createdIso).getTime();
    const nowTime = new Date().getTime();
    const hoursElapsed = Math.floor((nowTime - createdTime) / (1000 * 60 * 60));
    const hoursRemaining = 24 - hoursElapsed;

    if (hoursRemaining <= 0) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">🔴 {Math.abs(hoursRemaining)}h Overdue</span>;
    } else if (hoursRemaining <= 4) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">🟡 {hoursRemaining}h remaining</span>;
    } else {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">🟢 {hoursRemaining}h remaining</span>;
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-teal-600" /> Municipal AI Priority Dispatch Queue
          </h3>
          <p className="text-xs text-slate-500">Dynamically sorted by multi-factor AI priority engine (0-100 score)</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticket, title, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs w-44 focus:w-56 focus:border-teal-600 focus:outline-none transition-all text-slate-900 bg-white"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
          >
            <option value="ALL">All Departments</option>
            <option value="PWD">PWD Road</option>
            <option value="MUNICIPAL_CORP">Sanitation</option>
            <option value="WATER">Water Dept</option>
            <option value="ELECTRICITY">Electricity</option>
            <option value="DRAINAGE">Drainage</option>
          </select>

          {/* Ward Filter */}
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white max-w-[150px]"
          >
            <option value="ALL">All Wards</option>
            {WARD_LIST.map((w) => (
              <option key={w} value={w.split(' ')[1]}>
                {w}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Reported</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">Work Started</option>
            <option value="CITIZEN_VERIFICATION">Verification</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* EMPTY STATE SCREEN */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <h4 className="font-display font-bold text-base text-slate-900">No urgent issues matching filters</h4>
          <p className="text-xs text-slate-500">Everything is currently under control in selected department/ward.</p>
        </div>
      ) : (
        /* Priority Queue Table (Desktop) / Cards (Mobile) */
        <>
          {/* Mobile/Tablet Card View */}
          <div className="md:hidden space-y-3">
            {filtered.map((cmp) => {
              let scoreColor = 'text-amber-800 bg-amber-50 border-amber-200';
              let badgeText = 'MEDIUM';
              if (cmp.priorityScore >= 85) {
                scoreColor = 'text-rose-800 bg-rose-50 border-rose-200 font-bold';
                badgeText = 'CRITICAL';
              } else if (cmp.priorityScore <= 60) {
                scoreColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
                badgeText = 'LOW';
              }

              return (
                <div
                  key={cmp.id}
                  onClick={() => onSelectComplaint(cmp)}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-teal-500 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-teal-700 font-bold">{cmp.ticketId}</span>
                    <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${scoreColor}`}>
                      {badgeText} {cmp.priorityScore}/100
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{cmp.title}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>{cmp.departmentCode} • {cmp.location.ward}</span>
                    {calculateSLABadge(cmp.createdAt, cmp.status)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Operations Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 uppercase font-semibold text-[10px] text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Priority & Rank</th>
                  <th className="py-3 px-4">Ticket & Title</th>
                  <th className="py-3 px-4">Dept & Ward</th>
                  <th className="py-3 px-4">Signals</th>
                  <th className="py-3 px-4">Target SLA</th>
                  <th className="py-3 px-4">Status & Assigned</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((cmp) => {
                  let scoreColor = 'text-amber-800 bg-amber-50 border-amber-200';
                  let priorityLabel = 'MEDIUM';
                  if (cmp.priorityScore >= 85) {
                    scoreColor = 'text-rose-800 bg-rose-50 border-rose-200 font-bold';
                    priorityLabel = 'CRITICAL';
                  } else if (cmp.priorityScore <= 60) {
                    scoreColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
                    priorityLabel = 'LOW';
                  }

                  return (
                    <tr key={cmp.id} className="hover:bg-slate-50 transition-colors group">
                      
                      {/* Priority Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border ${scoreColor}`}>
                          <Flame className="h-3.5 w-3.5 shrink-0" />
                          <span className="font-display text-xs font-bold">{priorityLabel} {cmp.priorityScore}/100</span>
                        </div>
                      </td>

                      {/* Ticket & Title */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-xs">
                          <span className="text-[10px] font-mono text-teal-700 font-bold block">{cmp.ticketId}</span>
                          <p className="font-semibold text-slate-900 truncate group-hover:text-teal-700 transition-colors">{cmp.title}</p>
                        </div>
                      </td>

                      {/* Dept & Ward */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div>
                          <span className="text-slate-900 block font-semibold">{cmp.departmentCode}</span>
                          <span className="text-[10px] text-slate-500">{cmp.location.ward}</span>
                        </div>
                      </td>

                      {/* Signals */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 text-[10px]">
                          <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 w-fit">
                            {cmp.reportCount} Citizens
                          </span>
                          {cmp.location.nearSchool && (
                            <span className="text-amber-800 font-semibold">🏫 Near School</span>
                          )}
                        </div>
                      </td>

                      {/* Target SLA */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {calculateSLABadge(cmp.createdAt, cmp.status)}
                      </td>

                      {/* Status & Assigned */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            cmp.status === 'IN_PROGRESS'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : cmp.status === 'CITIZEN_VERIFICATION'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : cmp.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {cmp.status}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]">
                            {cmp.assignedEngineerName || 'Unassigned'}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                        {!cmp.assignedEngineerName && (
                          <button
                            onClick={() => onAssignEngineer(cmp.ticketId, 'Senior Inspector Er. Ramesh Kumar')}
                            className="px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 text-[11px] font-semibold"
                          >
                            Assign Engineer
                          </button>
                        )}

                        {cmp.status !== 'RESOLVED' && (
                          <button
                            onClick={() => onOpenProofModal(cmp)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-semibold"
                          >
                            Upload Resolution
                          </button>
                        )}

                        <button
                          onClick={() => onSelectComplaint(cmp)}
                          className="px-2.5 py-1 rounded-xl bg-teal-700 text-white font-bold text-[11px] hover:bg-teal-800 shadow-xs inline-flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Open</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
};
