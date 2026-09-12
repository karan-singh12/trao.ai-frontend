'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isNavActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const navLinks = [
    { href: '/dashboard', label: 'My Kits', icon: 'space_dashboard' },
    { href: '/dashboard/create', label: 'Create Kit', icon: 'add_circle' },
    { href: '/dashboard/practice', label: 'Practice Mode', icon: 'style' },
    { href: '/dashboard/schedule', label: 'Schedules', icon: 'calendar_today' },
    { href: '/dashboard/archive', label: 'Question Archive', icon: 'bookmark' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative flex flex-col bg-slate-50/90 dark:bg-zinc-950 font-body-md text-body-md text-on-surface selection:bg-indigo-600 selection:text-white transition-colors">
        {/* Modern Executive Subtle Dot Grid Background */}
        <div
          className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
          aria-hidden="true"
        />

        {/* ========================================================================= */}
        {/* UNIFIED EXECUTIVE TOP NAVIGATION BAR (DESKTOP & TABLET) */}
        {/* ========================================================================= */}
        <header className="sticky top-0 z-30 w-full h-16 glass-header border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between backdrop-blur-xl">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group relative cursor-pointer"
              title="PrepKit.ai · AI Interview Studio"
            >
              {/* World-Class 3D Crystal Neon AI Emblem */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-zinc-950 shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-all duration-300 ring-1 ring-white/10 shrink-0 overflow-hidden">
                <img
                  src="/trao-icon.png"
                  alt="PrepKit AI Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col min-w-0">
                <span className="font-black text-lg tracking-tight text-zinc-950 dark:text-white leading-tight">
                  PrepKit<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">
                  AI Interview Studio
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/70 dark:border-zinc-800/70 shadow-xs">
              {navLinks.map((item) => {
                const active = isNavActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 text-white shadow-sm shadow-indigo-600/25 ring-1 ring-indigo-500/30'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-white/70 dark:hover:bg-zinc-800/70 font-medium'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[17px] ${active ? 'text-white' : ''}`}>
                      {item.icon}
                    </span>
                    <span className={active ? 'text-white' : ''}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Profile Dropdown (Default User) */}
          <div className="flex items-center gap-3">

            {/* User Profile Avatar (AI Generated Default User in Round Button) */}
            <div className="group relative">
              <button
                type="button"
                className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-indigo-600 to-slate-800 shadow-sm hover:ring-2 hover:ring-indigo-500/40 hover:scale-105 transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Default User Profile"
              >
                <img
                  src="/default-avatar.png"
                  alt="Default User Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </button>

              {/* Profile Card Dropdown */}
              <div className="absolute right-0 mt-2 p-4 rounded-2xl bg-zinc-950/95 backdrop-blur-xl text-white text-xs shadow-2xl border border-white/10 pointer-events-none group-hover:pointer-events-auto z-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-3 min-w-[260px]">
                {/* User Header */}
                <div className="flex items-center gap-3 pb-2.5 border-b border-white/10">
                  <img
                    src="/default-avatar.png"
                    alt="Default User Avatar"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white text-sm truncate leading-tight">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate">
                      {user?.email || 'user@example.com'}
                    </span>
                  </div>
                </div>

                {/* Session Status & Role */}
                <div className="flex flex-col gap-1.5 py-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Account Role</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                      {user?.role || 'CANDIDATE PRO'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[11px] text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span>Session valid 3h 42m</span>
                </div>
                </div>

                {/* Logout Action */}
                <button
                  onClick={logout}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs transition-colors border border-rose-500/25 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MOBILE BOTTOM NAVIGATION BAR (md:hidden) */}
        {/* ========================================================================= */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around px-2 shadow-2xl">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            prefetch={true}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isNavActive('/dashboard')
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">space_dashboard</span>
            <span className="text-[10px] tracking-tight">Kits</span>
          </Link>

          {/* Practice Mode */}
          <Link
            href="/dashboard/practice"
            prefetch={true}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isNavActive('/dashboard/practice')
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">style</span>
            <span className="text-[10px] tracking-tight">Practice</span>
          </Link>

          {/* Primary Action: Create Kit Floating Center Button */}
          <Link
            href="/dashboard/create"
            prefetch={true}
            className="flex flex-col items-center justify-center -mt-5 group"
            title="Create New Kit"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[26px]">add</span>
            </div>
            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 uppercase tracking-wider">New</span>
          </Link>

          {/* Schedules */}
          <Link
            href="/dashboard/schedule"
            prefetch={true}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isNavActive('/dashboard/schedule')
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
            <span className="text-[10px] tracking-tight">Schedule</span>
          </Link>

          {/* Builder / Archive */}
          <Link
            href="/dashboard/archive"
            prefetch={true}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isNavActive('/dashboard/archive')
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">bookmark</span>
            <span className="text-[10px] tracking-tight">Archive</span>
          </Link>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 w-full pb-24 md:pb-12">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
