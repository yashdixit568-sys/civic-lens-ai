'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '@/lib/types';
import {
  LayoutDashboard,
  Map,
  BarChart3,
  SlidersHorizontal,
  Award,
  Building2,
  ListTodo,
  FileCheck2,
  Shield,
  FileText,
  Menu,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  pendingCount?: number;
  criticalCount?: number;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  pendingCount = 4,
  criticalCount = 2,
}) => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const citizenNav: NavItem[] = [
    { label: 'Citizen Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Live GIS Map', href: '/dashboard#map', icon: Map },
    { label: 'Reputation & Leaderboard', href: '/dashboard#leaderboard', icon: Award },
    { label: 'Public Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const authorityNav: NavItem[] = [
    { label: 'Overview', href: '/authority#overview', icon: LayoutDashboard },
    { label: 'Priority Queue', href: '/authority#queue', icon: ListTodo, badge: criticalCount > 0 ? `${criticalCount} Critical` : undefined },
    { label: 'Map', href: '/authority#map', icon: Map },
    { label: 'Complaints', href: '/authority#complaints', icon: FileText },
    { label: 'Departments', href: '/authority#departments', icon: Building2 },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Predictive Risks', href: '/authority#predictive', icon: Shield },
    { label: 'Reports', href: '/authority#reports', icon: FileCheck2 },
    { label: 'Settings', href: '/authority#settings', icon: SlidersHorizontal },
  ];

  const adminNav: NavItem[] = [
    { label: 'System Admin Panel', href: '/admin', icon: Shield },
    { label: 'Department Configuration', href: '/admin#departments', icon: Building2 },
    { label: 'AI Priority & SLA Tuning', href: '/admin#ai-config', icon: SlidersHorizontal },
    { label: 'Audit Trail Logs', href: '/admin#audit', icon: FileText },
    { label: 'City Analytics Overview', href: '/analytics', icon: BarChart3 },
  ];

  let activeNav = citizenNav;
  if (currentRole === 'AUTHORITY') activeNav = authorityNav;
  if (currentRole === 'ADMIN') activeNav = adminNav;

  const renderNavContent = (isMobile: boolean = false) => (
    <div className="space-y-6">
      
      {/* Active Portal Indicator */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 shadow-sm relative overflow-hidden">
        <p className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-teal-600" /> Active Portal
        </p>
        <h3 className="font-display font-bold text-sm text-slate-900 flex items-center justify-between mt-0.5">
          <span>{currentRole} Console</span>
          <span className="h-2 w-2 rounded-full bg-teal-600 shadow-[0_0_8px_rgba(13,148,136,0.6)] animate-pulse" />
        </h3>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {activeNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href.includes('#') && pathname === item.href.split('#')[0]);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => isMobile && setIsMobileOpen(false)}
              className="block group"
            >
              <div
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="shrink-0">
                    <Icon className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-teal-600'
                    }`} />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick System Telemetry Footer */}
      <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-500 space-y-1.5 font-medium">
        <div className="flex justify-between items-center">
          <span>AI Vision Core:</span>
          <span className="text-teal-700 font-mono font-bold flex items-center gap-1">
            <Zap className="h-3 w-3 text-teal-600 fill-teal-600" /> v4.8 Active
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Spatial Merging:</span>
          <span className="text-sky-700 font-mono font-bold">150m Radius</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Municipal SLA:</span>
          <span className="text-slate-700 font-mono font-bold">99.98% On-Time</span>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Drawer Floating Toggle Button */}
      <div className="lg:hidden fixed bottom-5 left-5 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-700 border border-slate-200 shadow-lg hover:scale-105 active:scale-95 transition-all"
          aria-label="Toggle Mobile Navigation Menu"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Slide-out Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] h-full bg-white border-r border-slate-200 p-5 shadow-2xl overflow-y-auto z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <span className="font-display text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-teal-600" /> Civic Lens AI Menu
                </span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 border border-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {renderNavContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:block bg-white border-r border-slate-200 p-4 min-h-[calc(100vh-3.5rem)]">
        {renderNavContent(false)}
      </aside>
    </>
  );
};
