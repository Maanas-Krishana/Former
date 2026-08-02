"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, ArrowRight, FileText, BarChart2, Copy } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 text-gray-900 dark:text-gray-100 selection:bg-indigo-100 dark:selection:bg-indigo-950 selection:text-indigo-900 dark:selection:text-indigo-200 overflow-x-hidden relative transition-colors duration-200">
      
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-purple-200/20 dark:bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
          <img src="/logo.png" alt="Former Logo" className="w-9 h-9 object-contain rounded-xl shadow-md" />
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">Former</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600 dark:text-gray-300">
          <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
          <a href="#ai-generation" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">AI Engine</a>
          <a href="#analytics" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Analytics</a>
        </nav>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Button variant="ghost" onClick={() => router.push('/login')} className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold">
            Sign In
          </Button>
          <Button onClick={() => router.push('/signup')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-5 shadow-md shadow-indigo-100 dark:shadow-none transition-all hover:translate-y-[-1px]">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-24 text-center relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/80 dark:border-indigo-800/50 rounded-full px-4 py-1.5 mb-8 animate-fade-in shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Form creation, reinvented with AI</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl leading-[1.1] mb-6">
          Build beautiful forms in <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">seconds</span>.
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed mb-10">
          From description to form in one click. Former harnesses AI to build customized, high-converting forms complete with analytics, PWA capabilities, and AI summaries.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full max-w-md">
          <Button onClick={() => router.push('/signup')} className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold py-6 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all hover:translate-y-[-1px] group">
            Start Building Free
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" onClick={() => router.push('/login')} className="w-full sm:w-auto border-gray-300 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 text-base font-semibold py-6 rounded-2xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 px-8">
            Manage Forms
          </Button>
        </div>

        {/* Dashboard Mockup */}
        <div className="w-full max-w-5xl rounded-3xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-2xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-950 aspect-[16/10] relative shadow-inner">
            <div className="absolute top-0 inset-x-0 h-12 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-lg py-1 px-4 text-xs text-gray-400 dark:text-gray-400 font-mono text-center max-w-md mx-auto border dark:border-zinc-700 truncate">
                https://former-six.vercel.app/dashboard
              </div>
            </div>
            
            {/* Visual simulation of dashboard */}
            <div className="pt-16 p-8 text-left space-y-6">
              <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">My Forms</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Manage and view responses for your forms.</p>
                </div>
                <div className="w-32 h-8 bg-indigo-100 dark:bg-indigo-950/60 rounded-lg animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-5 shadow-sm space-y-4">
                  <div className="flex justify-between">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400"><FileText className="w-5 h-5" /></div>
                    <div className="w-16 h-6 bg-gray-100 dark:bg-zinc-800 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-48 h-4 bg-gray-900 dark:bg-zinc-100 rounded" />
                    <div className="w-24 h-3 bg-gray-400 dark:bg-zinc-600 rounded" />
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 p-5 shadow-sm space-y-4">
                  <div className="flex justify-between">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400"><FileText className="w-5 h-5" /></div>
                    <div className="w-16 h-6 bg-gray-100 dark:bg-zinc-800 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-40 h-4 bg-gray-900 dark:bg-zinc-100 rounded" />
                    <div className="w-28 h-3 bg-gray-400 dark:bg-zinc-600 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-gray-100 dark:border-zinc-800/80 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Features built for creators</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Everything you need to gather responses, analyze data, and build seamless client experiences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-8 hover:shadow-lg transition-shadow space-y-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Form Generation</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Describe your objective in plain English and watch Former create the inputs, text areas, ratings, and dropdowns instantly.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-8 hover:shadow-lg transition-shadow space-y-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shadow-sm">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Real-Time Insights</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Monitor conversion rates, views, and raw submission tallies immediately. Export collected feedback to CSV with one click.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-8 hover:shadow-lg transition-shadow space-y-4">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center shadow-sm">
              <Copy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Instant Duplication</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Clone structures, settings, and question layouts in real time from your dashboard to spin up variations in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t dark:border-zinc-800/80 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Former Logo" className="w-6 h-6 object-contain rounded-md" />
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">Former</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">© 2026 Former. Proudly made in India.</p>
        </div>
      </footer>
    </div>
  );
}
