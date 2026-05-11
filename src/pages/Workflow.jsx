import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, Table2, LayoutDashboard, AlertTriangle, 
  Copy, Wand2, CheckCircle2, FileBox, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Workflow() {
  const { isDark, toggleTheme } = useTheme();

  const workflowSteps = [
    { name: 'Upload Dataset', path: '/upload', icon: UploadCloud, desc: 'Provide your raw data.', color: '#9bc53d' },
    { name: 'Dataset Preview', path: '/preview', icon: Table2, desc: 'Initial look at the raw data structure.', color: '#00a4ef' },
    { name: 'Audit Dashboard', path: '/dashboard', icon: LayoutDashboard, desc: 'High-level metrics and visualizations.', color: '#5bc0be' },
    { name: 'Missing Values', path: '/missing-values', icon: AlertTriangle, desc: 'Detect and resolve empty data points.', color: '#f8c630' },
    { name: 'Duplicates', path: '/duplicates', icon: Copy, desc: 'Identify and remove duplicate rows.', color: '#f25022' },
    { name: 'Cleaning Actions', path: '/cleaning-actions', icon: Wand2, desc: 'Apply ML techniques to cleanse.', color: '#7fba00' },
    { name: 'Cleaned Preview', path: '/cleaned-preview', icon: CheckCircle2, desc: 'Review the final cleaned dataset.', color: '#00a4ef' },
    { name: 'Audit Report', path: '/report', icon: FileBox, desc: 'Generate a comprehensive audit log.', color: '#ffb900' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#030d1f] text-slate-800 dark:text-gray-200 p-8 md:p-12 font-sans relative overflow-hidden transition-colors duration-500">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={(e) => { e.preventDefault(); toggleTheme(); }}
        className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white dark:bg-[#081a3d] border border-slate-200 dark:border-[#1a325a] shadow-md hover:shadow-lg transition-all duration-300 text-slate-600 dark:text-blue-300 hover:scale-110"
        title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-100 dark:bg-[#1a4080] rounded-full blur-[180px] opacity-60 dark:opacity-40 pointer-events-none transition-colors duration-500"></div>

      <div className="relative z-10 w-full max-w-7xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6 opacity-90">
            {/* Shield Logo */}
            <svg className="w-10 h-10 mr-3 filter drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 15L20 25V45C20 65 32 82 50 90C68 82 80 65 80 45V25L50 15Z" fill="#15418f" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
              <rect x="33" y="48" width="6" height="18" rx="1.5" fill="white" />
              <rect x="43" y="42" width="6" height="24" rx="1.5" fill="white" />
              <rect x="53" y="40" width="6" height="26" rx="1.5" fill="white" />
              <rect x="63" y="32" width="6" height="34" rx="1.5" fill="white" />
            </svg>
            <span className="text-slate-800 dark:text-white text-2xl font-medium tracking-wide transition-colors duration-500">IntelliAudit Workflow</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4 transition-colors duration-500">Select an Auditing Stage</h1>
          <p className="text-slate-500 dark:text-[#8ba3c9] text-xl font-light transition-colors duration-500">Navigate through the ML-driven cleansing pipeline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Link 
                key={step.name}
                to={step.path} 
                className="group relative bg-white dark:bg-[#05142e]/80 backdrop-blur-sm border border-slate-200 dark:border-[#1a325a] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl overflow-hidden"
              >
                {/* Left accent bar */}
                <div 
                  className="absolute top-0 left-0 w-1.5 h-full opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: step.color }}
                ></div>
                
                {/* Subtle top glow inside card on hover */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(to right, transparent, ${step.color}, transparent)` }}
                ></div>
                
                <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-[#081a3d] border border-slate-100 dark:border-[#1a325a] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icon 
                    className="w-7 h-7 transition-colors drop-shadow-sm" 
                    style={{ color: step.color }}
                    strokeWidth={1.5} 
                  />
                </div>
                
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2 ml-1 transition-colors duration-500">{index + 1}. {step.name}</h3>
                <p className="text-sm text-slate-500 dark:text-[#8ba3c9] font-light leading-relaxed ml-1 transition-colors duration-500">{step.desc}</p>
                
                {/* Full border highlight on hover */}
                <div 
                   className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                   style={{ boxShadow: `inset 0 0 0 1px ${step.color}` }}
                ></div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
