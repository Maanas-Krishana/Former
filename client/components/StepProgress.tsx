"use client";

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepInfo {
  id: string;
  title: string;
}

interface StepProgressProps {
  steps: StepInfo[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'vertical' | 'horizontal';
  themeColor?: string;
}

export function StepProgress({
  steps,
  currentStep,
  onStepClick,
  orientation = 'vertical',
  themeColor = 'indigo'
}: StepProgressProps) {
  if (!steps || steps.length <= 1) return null;

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    indigo: { bg: 'bg-indigo-600', border: 'border-indigo-600', text: 'text-indigo-600 dark:text-indigo-400' },
    teal: { bg: 'bg-teal-600', border: 'border-teal-600', text: 'text-teal-600 dark:text-teal-400' },
    rose: { bg: 'bg-rose-600', border: 'border-rose-600', text: 'text-rose-600 dark:text-rose-400' },
    amber: { bg: 'bg-amber-600', border: 'border-amber-600', text: 'text-amber-600 dark:text-amber-400' },
    emerald: { bg: 'bg-emerald-600', border: 'border-emerald-600', text: 'text-emerald-600 dark:text-emerald-400' },
    blue: { bg: 'bg-blue-600', border: 'border-blue-600', text: 'text-blue-600 dark:text-blue-400' },
    violet: { bg: 'bg-violet-600', border: 'border-violet-600', text: 'text-violet-600 dark:text-violet-400' },
    slate: { bg: 'bg-slate-600', border: 'border-slate-600', text: 'text-slate-600 dark:text-slate-400' }
  };

  const activeTheme = colorClasses[themeColor] || colorClasses.indigo;

  if (orientation === 'horizontal') {
    return (
      <div className="w-full py-4 mb-6">
        <div className="flex items-center justify-between relative max-w-xl mx-auto px-4">
          {/* Connector line */}
          <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-[2px] bg-gray-200 dark:bg-zinc-800 -z-0" />
          <div 
            className={cn("absolute top-1/2 left-8 -translate-y-1/2 h-[2px] transition-all duration-300 -z-0", activeTheme.bg)}
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <div 
                key={step.id} 
                className="flex flex-col items-center relative z-10 cursor-pointer group"
                onClick={() => onStepClick && onStepClick(idx)}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-200 border-2",
                  isCompleted ? `${activeTheme.bg} ${activeTheme.border} text-white` :
                  isActive ? `bg-white dark:bg-zinc-900 ${activeTheme.border} ${activeTheme.text} ring-4 ring-indigo-100 dark:ring-indigo-950/60` :
                  "bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-400"
                )}>
                  {isCompleted ? <Check className="w-4 h-4 text-white" /> : idx + 1}
                </div>
                <span className={cn(
                  "mt-2 text-xs font-medium max-w-[90px] text-center truncate transition-colors",
                  isActive ? activeTheme.text :
                  isCompleted ? "text-gray-800 dark:text-gray-200 font-semibold" :
                  "text-gray-400 dark:text-gray-500"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical layout (Matching reference image side timeline)
  return (
    <div className="flex flex-col space-y-6">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;

        return (
          <div 
            key={step.id} 
            className="flex items-start space-x-3.5 group cursor-pointer"
            onClick={() => onStepClick && onStepClick(idx)}
          >
            <div className="relative flex flex-col items-center">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-200 border-2 flex-shrink-0",
                isCompleted ? `${activeTheme.bg} ${activeTheme.border} text-white` :
                isActive ? `bg-white dark:bg-zinc-900 ${activeTheme.border} ${activeTheme.text} ring-4 ring-indigo-50 dark:ring-indigo-950/50` :
                "bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-400"
              )}>
                {isCompleted ? <Check className="w-3.5 h-3.5 text-white" /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  "w-[2px] h-8 mt-1 transition-colors",
                  isCompleted ? activeTheme.bg : "bg-gray-200 dark:bg-zinc-800"
                )} />
              )}
            </div>
            <div className="pt-0.5">
              <p className={cn(
                "text-sm font-medium transition-colors leading-tight",
                isActive ? `${activeTheme.text} font-bold` :
                isCompleted ? "text-gray-800 dark:text-gray-200 font-semibold" :
                "text-gray-400 dark:text-gray-500"
              )}>
                {step.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
