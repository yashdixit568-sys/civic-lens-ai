'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserRole, UserProfile, NotificationItem } from '@/lib/types';
import { DEMO_USERS } from '@/lib/store';
import { SupportedLanguage } from '@/lib/copy-helpers';
import {
  ShieldAlert,
  Bell,
  Sparkles,
  Globe,
  ChevronDown,
  CheckCircle2,
  User,
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  notifications: NotificationItem[];
  lang?: SupportedLanguage;
  onLangChange?: (lang: SupportedLanguage) => void;
  onOpenReportFlow?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  notifications,
  lang = 'en',
  onLangChange = () => {},
  onOpenReportFlow,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const currentUser: UserProfile = DEMO_USERS[currentRole];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
              Civic Lens
            </span>
          </Link>
        </div>

        {/* Minimal Actions: Language, Notifications, Profile */}
        <div className="flex items-center space-x-2">
          
          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center space-x-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              <span className="uppercase text-[11px]">{lang}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white p-1.5 shadow-lg border border-slate-200 z-50 animate-in fade-in duration-100">
                <button
                  onClick={() => { onLangChange('en'); setShowLangDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between font-medium ${lang === 'en' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>English</span>
                  {lang === 'en' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => { onLangChange('hi'); setShowLangDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between font-medium ${lang === 'hi' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>हिंदी</span>
                  {lang === 'hi' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => { onLangChange('hinglish'); setShowLangDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between font-medium ${lang === 'hinglish' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>Hinglish</span>
                  {lang === 'hinglish' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Icon */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-4 shadow-xl border border-slate-200 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Notifications
                  </h4>
                  <span className="text-[10px] text-slate-500">{notifications.length} alerts</span>
                </div>
                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2.5 rounded-xl border text-xs transition-colors ${
                        notif.read ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-blue-50/50 border-blue-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-slate-900">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{notif.createdAt}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Icon */}
          <div className="flex items-center space-x-1 pl-1">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-7 w-7 rounded-full object-cover ring-2 ring-slate-200"
            />
          </div>

        </div>
      </div>
    </header>
  );
};
