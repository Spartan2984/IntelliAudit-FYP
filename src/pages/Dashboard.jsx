import React from 'react';

export default function Dashboard() {
  return (
    <div className="animate-fade-in text-slate-800 dark:text-white transition-colors duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors">Audit Dashboard</h2>
          <p className="text-slate-500 dark:text-[#8ba3c9] mt-2 font-light transition-colors">High-level statistics and data quality metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl shadow-md dark:shadow-sm border border-slate-200 dark:border-[#1a325a] flex flex-col relative overflow-hidden group transition-colors duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#5bc0be]"></div>
          <h3 className="text-slate-500 dark:text-[#8ba3c9] text-sm font-semibold uppercase tracking-wider pl-2 transition-colors">Total Rows</h3>
          <p className="text-4xl font-bold mt-3 pl-2 group-hover:scale-105 transition-transform origin-left text-slate-900 dark:text-white">--</p>
        </div>
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl shadow-md dark:shadow-sm border border-slate-200 dark:border-[#1a325a] flex flex-col relative overflow-hidden group transition-colors duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#f8c630]"></div>
          <h3 className="text-slate-500 dark:text-[#8ba3c9] text-sm font-semibold uppercase tracking-wider pl-2 transition-colors">Missing Values</h3>
          <p className="text-4xl font-bold mt-3 pl-2 text-amber-500 dark:text-[#f8c630] group-hover:scale-105 transition-transform origin-left">--</p>
        </div>
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl shadow-md dark:shadow-sm border border-slate-200 dark:border-[#1a325a] flex flex-col relative overflow-hidden group transition-colors duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#5491f5]"></div>
          <h3 className="text-slate-500 dark:text-[#8ba3c9] text-sm font-semibold uppercase tracking-wider pl-2 transition-colors">Duplicate Rows</h3>
          <p className="text-4xl font-bold mt-3 pl-2 text-blue-500 dark:text-[#5491f5] group-hover:scale-105 transition-transform origin-left">--</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-slate-200 dark:border-[#1a325a] min-h-[400px] flex flex-col items-center justify-center text-slate-400 dark:text-[#4a6b9c] transition-colors duration-500">
        <svg className="w-16 h-16 mb-6 text-slate-300 dark:text-[#1a325a] transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-xl font-light">Charts and Visualizations will go here</p>
      </div>
    </div>
  );
}
