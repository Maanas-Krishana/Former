"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, ArrowRight, FileText, BarChart2, Copy } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 text-gray-900 dark:text-gray-100 selection:bg-indigo-100 dark:selection:bg-indigo-950 selection:text-indigo-900 dark:selection:text-indigo-200 overflow-x-hidden relative transition-colors duration-200 bg-dotted-grid pb-20">
      
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl shadow-sm hover-neo-lift" onClick={() => router.push('/')}>
            <img src="/logo.png" alt="Former Logo" className="w-8 h-8 object-contain rounded-lg" />
            <span className="text-xl font-bold text-indigo-650 dark:text-indigo-400 tracking-tight">Former</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-600 dark:text-gray-400">
            <a href="#features" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">Features</a>
            <a href="#ai-generation" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">AI Engine</a>
            <a href="#analytics" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">Analytics</a>
          </nav>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => router.push('/login')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-650 dark:hover:text-indigo-400 font-bold">
              Sign In
            </Button>
            <Button onClick={() => router.push('/signup')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 border border-transparent shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] transition-all">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-16 text-center relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-full px-4 py-1.5 mb-8 shadow-sm hover-neo-lift cursor-pointer">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Form creation, reinvented with AI</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-gray-900 dark:text-white max-w-4xl leading-[1.1] mb-6">
          Build beautiful forms in <span className="bg-gradient-to-r from-indigo-650 to-purple-650 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">seconds</span>.
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed mb-10 font-semibold">
          From description to form in one click. Former harnesses AI to build customized, high-converting forms complete with analytics, PWA capabilities, and AI summaries.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full max-w-md">
          <Button onClick={() => router.push('/signup')} className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold py-6 rounded-2xl shadow-md hover:translate-y-[-1px] active:translate-y-[0px] transition-all group">
            Start Building Free
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" onClick={() => router.push('/login')} className="w-full sm:w-auto border border-gray-250 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-base font-bold py-6 rounded-2xl bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 px-8 shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] transition-all">
            Manage Forms
          </Button>
        </div>

        {/* Dashboard Bento Mockup */}
        <div className="w-full max-w-5xl rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-md relative group overflow-hidden text-left">
          <div className="border border-gray-200 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-950 rounded-2xl relative shadow-inner">
            <div className="h-12 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
              <div className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-lg py-1 px-4 text-xs text-gray-500 dark:text-gray-400 font-mono text-center max-w-md mx-auto border border-gray-200 dark:border-zinc-700 truncate">
                https://former.dev/dashboard
              </div>
            </div>
            
            {/* Visual simulation of dashboard - Bento Grid Layout */}
            <div className="p-6 space-y-6">
              {/* Gretting row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 dark:border-zinc-850 pb-4 gap-4">
                <div>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white">Workspace Analytics</h4>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Telemetry details for active campaigns.</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-300 font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900">
                  LIVE RESPONSE CAPTURE
                </div>
              </div>

              {/* Bento Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Panel 1: Stats Monospace */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-150 dark:border-zinc-850 p-5 shadow-sm hover-neo-lift space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black tracking-wider uppercase text-gray-400 dark:text-gray-500">TOTAL SUBMISSIONS</span>
                    <FileText className="w-4 h-4 text-indigo-650 dark:text-indigo-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black font-mono text-gray-900 dark:text-white">1,284</div>
                    <div className="text-[10px] text-green-600 font-bold">+12% vs last week</div>
                  </div>
                </div>

                {/* Panel 2: Completion Monospace */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-150 dark:border-zinc-850 p-5 shadow-sm hover-neo-lift space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black tracking-wider uppercase text-gray-400 dark:text-gray-500">COMPLETION RATE</span>
                    <BarChart2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black font-mono text-gray-900 dark:text-white">92.4%</div>
                    {/* Linear bar meter */}
                    <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full border border-gray-150 dark:border-zinc-700 overflow-hidden">
                      <div className="bg-purple-650 h-full w-[92.4%] rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Panel 3: Quick Action */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-150 dark:border-zinc-850 p-5 shadow-sm hover-neo-lift space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black tracking-wider uppercase text-gray-400 dark:text-gray-500">AI TEMPLATE STATUS</span>
                    <Sparkles className="w-4 h-4 text-teal-650 dark:text-teal-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">Coffee Shop Survey</div>
                    <div className="text-xs font-mono text-gray-500 dark:text-gray-400">Created 2m ago via Prompt</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-gray-200 dark:border-zinc-800/80 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4">Features built for creators</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">Everything you need to gather responses, analyze data, and build seamless client experiences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 hover-neo-lift shadow-sm space-y-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-650 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Form Generation</h3>
            <p className="text-gray-655 dark:text-gray-400 text-sm leading-relaxed font-semibold">
              Describe your objective in plain English and watch Former create the inputs, text areas, ratings, and dropdowns instantly.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 hover-neo-lift shadow-sm space-y-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/60 text-purple-650 dark:text-purple-400 rounded-xl flex items-center justify-center border border-purple-100 dark:border-purple-900">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Real-Time Insights</h3>
            <p className="text-gray-655 dark:text-gray-400 text-sm leading-relaxed font-semibold">
              Monitor conversion rates, views, and raw submission tallies immediately. Export collected feedback to CSV with one click.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 hover-neo-lift shadow-sm space-y-4">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/60 text-teal-650 dark:text-teal-400 rounded-xl flex items-center justify-center border border-teal-100 dark:border-teal-900">
              <Copy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Instant Duplication</h3>
            <p className="text-gray-655 dark:text-gray-400 text-sm leading-relaxed font-semibold">
              Clone structures, settings, and question layouts in real time from your dashboard to spin up variations in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-850 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg shadow-sm">
            <img src="/logo.png" alt="Former Logo" className="w-6 h-6 object-contain rounded-md" />
            <span className="font-bold text-indigo-650 dark:text-indigo-400 text-lg">Former</span>
          </div>
          <p className="text-xs text-gray-450 dark:text-gray-500 font-mono">© 2026 Former. Proudly made in India.</p>
        </div>
      </footer>
    </div>
  );
}
