'use client';

import React, { useState } from 'react';
import { DepartmentInfo, SystemAuditLog } from '@/lib/types';
import { INITIAL_DEPARTMENTS, INITIAL_AUDIT_LOGS } from '@/lib/store';
import { Building2, SlidersHorizontal, ShieldAlert, CheckCircle2, Save, FileText } from 'lucide-react';

export const DepartmentManager: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentInfo[]>(INITIAL_DEPARTMENTS);
  const [auditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);
  
  // AI Config Tuning Weights
  const [severityWeight, setSeverityWeight] = useState(45);
  const [hospitalProximityWeight, setHospitalProximityWeight] = useState(15);
  const [duplicationMultiplier, setDuplicationMultiplier] = useState(3);
  const [isSaved, setIsSaved] = useState(false);

  const handleSlaChange = (id: string, newSla: number) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, slaHours: newSla } : d))
    );
  };

  const handleSaveConfig = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Department Routing Matrix */}
      <div className="rounded-3xl glass-card border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-brand-400" />
            <h3 className="font-display font-bold text-base text-white">Municipal Department SLA & Routing Controls</h3>
          </div>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            6 Active Departments
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="p-4 rounded-2xl glass-card border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-300">{dept.code}</span>
                <span className="text-[10px] text-slate-400">Avg SLA: {dept.slaHours}h</span>
              </div>
              <h4 className="font-semibold text-xs text-white leading-snug">{dept.name}</h4>
              <p className="text-[11px] text-slate-400">Head: {dept.headOfficer}</p>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Target SLA (Hours):</span>
                <input
                  type="number"
                  value={dept.slaHours}
                  onChange={(e) => handleSlaChange(dept.id, parseInt(e.target.value) || 24)}
                  className="w-16 p-1 rounded-lg glass-input text-center text-xs font-bold text-brand-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Priority Engine Weight Tuning */}
      <div className="rounded-3xl glass-card border border-white/10 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-5 w-5 text-amber-400" />
            <h3 className="font-display font-bold text-base text-white">AI Multi-Factor Priority Weight Calibration</h3>
          </div>
          <button
            onClick={handleSaveConfig}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-brand-500 text-xs font-bold text-white shadow hover:bg-brand-400 transition-colors"
          >
            {isSaved ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <Save className="h-3.5 w-3.5" />}
            <span>{isSaved ? 'Weights Saved!' : 'Apply Model Weights'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl glass-card border border-white/5 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Base Severity Weight</span>
              <span className="text-brand-300">{severityWeight}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              value={severityWeight}
              onChange={(e) => setSeverityWeight(parseInt(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <div className="p-4 rounded-2xl glass-card border border-white/5 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Hospital Proximity Weight</span>
              <span className="text-amber-300">+{hospitalProximityWeight} PTS</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              value={hospitalProximityWeight}
              onChange={(e) => setHospitalProximityWeight(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div className="p-4 rounded-2xl glass-card border border-white/5 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Duplication Multiplier</span>
              <span className="text-cyan-300">{duplicationMultiplier}x / report</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={duplicationMultiplier}
              onChange={(e) => setDuplicationMultiplier(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="rounded-3xl glass-card border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
          <FileText className="h-5 w-5 text-cyan-400" />
          <h3 className="font-display font-bold text-base text-white">System Security Audit Logs</h3>
        </div>

        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-brand-300 text-[10px] block">{log.timestamp}</span>
                <span className="font-semibold text-white">{log.action}: </span>
                <span className="text-slate-300">{log.details}</span>
              </div>
              <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-black/40 font-mono">{log.actor}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
