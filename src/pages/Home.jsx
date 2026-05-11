import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <Link to="/workflow" className="block min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#030d1f] font-sans cursor-pointer group transition-colors duration-500">
      
      {/* Background radial glow matching the first image */}
      <div className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-100 dark:bg-[#1a4080] rounded-full blur-[180px] opacity-60 dark:opacity-50 pointer-events-none transition-colors duration-500"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 min-h-screen flex flex-col md:flex-row items-center justify-between">
        
        {/* Left Side: Text */}
        <div className="flex-1 text-left mt-20 md:mt-0">
          
          {/* Top small logo line */}
          <div className="flex items-center mb-8 opacity-90">
            {/* Small Shield Logo */}
            <svg className="w-8 h-8 mr-3 filter drop-shadow-md transition-colors duration-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 15L20 25V45C20 65 32 82 50 90C68 82 80 65 80 45V25L50 15Z" fill="#3b82f6" className="dark:fill-[#15418f]" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
              <rect x="33" y="48" width="6" height="18" rx="1.5" fill="white" />
              <rect x="43" y="42" width="6" height="24" rx="1.5" fill="white" />
              <rect x="53" y="40" width="6" height="26" rx="1.5" fill="white" />
              <rect x="63" y="32" width="6" height="34" rx="1.5" fill="white" />
            </svg>
            <span className="text-slate-800 dark:text-white text-xl font-medium tracking-wide transition-colors duration-500">IntelliAudit</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-7xl md:text-[5.5rem] text-slate-900 dark:text-white mb-6 tracking-tight leading-tight transition-colors duration-500">
             <span className="font-normal">Intelli</span><span className="font-bold">Audit</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-slate-600 dark:text-[#8ba3c9] text-2xl md:text-[1.75rem] font-light max-w-xl leading-snug transition-colors duration-500">
            ML-Driven Data Cleansing &amp; Intelligent Auditing System
          </p>

          {/* Click to enter hint */}
           <div className="mt-20 text-blue-600 dark:text-[#4a6b9c] flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <span className="text-sm uppercase tracking-widest font-semibold mr-3">Click anywhere to launch workspace</span>
              <svg className="w-5 h-5 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
           </div>
        </div>

        {/* Right Side: Shield Icon from Image 2 */}
        <div className="flex-1 flex justify-center md:justify-end perspective-1000 mt-16 md:mt-0">
           {/* Container with hover 3D effect */}
           <div className="relative w-80 h-80 md:w-[480px] md:h-[480px] transform transition-transform duration-700 group-hover:scale-[1.03]">
              
              {/* Drop shadow underneath the icon for the 3D effect */}
              <div className="absolute inset-16 bg-black/10 dark:bg-black/60 blur-[60px] rounded-full translate-y-16 translate-x-8 mix-blend-multiply transition-colors duration-500"></div>
              
              <svg className="w-full h-full relative z-10 filter drop-shadow-2xl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Dark blue background with subtle 3D lighting */}
                <rect width="100" height="100" rx="18" fill="url(#shield-bg-grad)"/>
                <rect width="100" height="100" rx="18" fill="url(#shield-highlight)" opacity="0.4"/>
                
                {/* Shield Base */}
                <path d="M50 15L20 25V45C20 65 32 82 50 90C68 82 80 65 80 45V25L50 15Z" fill="url(#shield-inner-grad)" stroke="url(#stroke-grad)" strokeWidth="3" strokeLinejoin="round"/>
                
                {/* 4 Ascending Bars */}
                <rect x="33" y="48" width="6" height="18" rx="1.5" fill="white" className="drop-shadow-lg"/>
                <rect x="43" y="42" width="6" height="24" rx="1.5" fill="white" className="drop-shadow-lg"/>
                <rect x="53" y="40" width="6" height="26" rx="1.5" fill="white" className="drop-shadow-lg"/>
                <rect x="63" y="32" width="6" height="34" rx="1.5" fill="white" className="drop-shadow-lg"/>

                <defs>
                   <linearGradient id="shield-bg-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1e40af" />
                      <stop offset="1" stopColor="#1e3a8a" />
                   </linearGradient>
                   <linearGradient id="shield-highlight" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white" stopOpacity="0.3"/>
                      <stop offset="0.3" stopColor="transparent" stopOpacity="0"/>
                   </linearGradient>
                   <linearGradient id="shield-inner-grad" x1="50" y1="15" x2="50" y2="90" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3b82f6" />
                      <stop offset="1" stopColor="#1d4ed8" />
                   </linearGradient>
                   <linearGradient id="stroke-grad" x1="50" y1="15" x2="50" y2="90" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="1" stopColor="#bfdbfe" />
                   </linearGradient>
                </defs>
              </svg>
           </div>
        </div>

      </div>
      
      {/* Add custom animation in style block */}
      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(30%); }
        }
        .animate-bounce-x {
          animation: bounce-x 1.5s infinite;
        }
        
        .dark #shield-bg-grad stop:nth-child(1) { stop-color: #08204d; }
        .dark #shield-bg-grad stop:nth-child(2) { stop-color: #020814; }
        .dark #shield-inner-grad stop:nth-child(1) { stop-color: #15418f; }
        .dark #shield-inner-grad stop:nth-child(2) { stop-color: #0d295c; }
        .dark #stroke-grad stop:nth-child(2) { stop-color: #9cbbeb; }
      `}</style>
    </Link>
  );
}
