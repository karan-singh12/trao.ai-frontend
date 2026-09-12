'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  // The dashboard provides its own executive top header
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left Side: Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight group relative cursor-pointer"
            title="PrepKit.ai"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-zinc-950 shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-all duration-300 ring-1 ring-white/10 shrink-0 overflow-hidden">
              <img
                src="/trao-icon.png"
                alt="PrepKit AI Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent font-black tracking-tight text-xl">
              PrepKit<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
            </span>

            {/* Floating Hover Badge on Logo */}
            <div className="absolute top-full mt-2 left-0 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-white/10 pointer-events-none z-50 transition-all opacity-0 scale-95 origin-top group-hover:opacity-100 group-hover:scale-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>PrepKit.ai · The AI Interview Prep Kit</span>
            </div>
          </Link>

          {/* Landing Page Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <a
              href="#features"
              className="px-3 py-1.5 rounded-xl hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              Features
            </a>
            <a
              href="#playground"
              className="px-3 py-1.5 rounded-xl hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              Interactive Playground
            </a>
          </nav>
        </div>

        {/* Right Side: Auth / Profile Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                prefetch={true}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">space_dashboard</span>
                <span>Go to Dashboard</span>
              </Link>

              {/* User Profile Avatar with Dropdown & Logout (Matching Dashboard layout) */}
              <div className="group relative">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-indigo-600 to-slate-800 shadow-sm hover:ring-2 hover:ring-indigo-500/40 hover:scale-105 transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="Profile & Settings"
                >
                  <img
                    src="/default-avatar.png"
                    alt="User Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </button>

                {/* Profile Card Dropdown */}
                <div className="absolute right-0 mt-2 p-4 rounded-2xl bg-zinc-950/95 backdrop-blur-xl text-white text-xs shadow-2xl border border-white/10 pointer-events-none group-hover:pointer-events-auto z-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-3 min-w-[260px]">
                  {/* User Header */}
                  <div className="flex items-center gap-3 pb-2.5 border-b border-white/10">
                    <img
                      src="/default-avatar.png"
                      alt="User Avatar"
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
                      <span>Active Session</span>
                    </div>
                  </div>

                  {/* Quick Dashboard Links */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/10">
                    <Link
                      href="/dashboard"
                      prefetch={true}
                      className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px] text-indigo-400">space_dashboard</span>
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/practice"
                      prefetch={true}
                      className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px] text-violet-400">style</span>
                      <span>Practice</span>
                    </Link>
                  </div>

                  {/* Logout Action */}
                  <button
                    onClick={logout}
                    type="button"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs transition-colors border border-rose-500/25 cursor-pointer mt-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                prefetch={true}
                className="px-4 py-2 text-xs font-bold rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                prefetch={true}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 text-white shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
