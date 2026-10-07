"use client";

import React from "react";
import { Spinner, Skeleton } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

export interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export const FullScreenLoader: React.FC<{ message?: string }> = ({
  message = "Loading HealthBridge Infrastructure...",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md text-white transition-opacity animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center mb-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center animate-pulse shadow-2xl shadow-blue-500/30">
          <svg className="w-10 h-10 text-blue-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm1 14h-2v-3H8v-2h3V7h2v3h3v2h-3v3z" />
          </svg>
        </div>
        <Spinner size="xl" color="primary" className="absolute -inset-2" />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-white mb-2">{message}</h2>
      <p className="text-xs text-slate-400 font-medium">Securing connection to HealthBridge API...</p>

      <div className="mt-8 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse w-3/4" />
      </div>
    </div>
  );
};

export const SectionLoader: React.FC<{ title?: string; height?: string; className?: string }> = ({
  title = "Loading data...",
  height = "h-64",
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6",
        height,
        className
      )}
    >
      <Spinner size="lg" color="primary" />
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide animate-pulse">
        {title}
      </p>
    </div>
  );
};

export const DashboardSkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 p-4 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="h-80 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 p-6 space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoader;
