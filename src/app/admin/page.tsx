'use client';

import React, { useState } from 'react';
import { UserRole, NotificationItem } from '@/lib/types';
import { INITIAL_NOTIFICATIONS, DEMO_USERS } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { DepartmentManager } from '@/components/admin/DepartmentManager';
import { ShieldCheck, Users, Ban, Lock, SlidersHorizontal, FileText } from 'lucide-react';

export default function AdminPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [notifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const currentUser = DEMO_USERS[currentRole];

  return (
    <div className="min-h-screen bg-civic-dark text-white flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
      />

      <div className="flex-1 flex mx-auto max-w-7xl w-full">
        
        {/* Sidebar */}
        <Sidebar currentRole={currentRole} />

        {/* Main Admin Console */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* Header Banner */}
          <div className="rounded-3xl glass-card border border-emerald-500/30 p-6 shadow-2xl relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  Master System Admin Panel
                </span>
                <h1 className="font-display text-2xl font-extrabold text-white mt-1">
                  Civic Lens AI Control Center
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Active Admin: {currentUser.name} • RBAC Enforcement Active • System Security Status: Operational
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> System Guard Active
                </span>
              </div>
            </div>
          </div>

          {/* Department & AI SLA Configuration */}
          <div id="departments" className="space-y-2">
            <DepartmentManager />
          </div>

        </main>
      </div>

    </div>
  );
}
