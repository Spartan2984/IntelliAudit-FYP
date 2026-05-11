import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Eye, 
  AlertTriangle, 
  Copy, 
  Wand2, 
  CheckCircle, 
  FileText,
  Home,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardLayout() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  
  // Exact workflow ordered array with shortened names for top nav
  const navItems = [
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'Preview', path: '/preview', icon: Eye },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Missing', path: '/missing-values', icon: AlertTriangle },
    { name: 'Duplicates', path: '/duplicates', icon: Copy },
    { name: 'Cleanse', path: '/cleaning-actions', icon: Wand2 },
    { name: 'Final', path: '/cleaned-preview', icon: CheckCircle },
    { name: 'Report', path: '/report', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#030d1f] text-slate-800 dark:text-gray-200 transition-colors duration-500">
      
      {/* Top Navbar */}
      <header className="bg-white/90 dark:bg-[#05142e]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1a325a] shadow-sm dark:shadow-xl z-20 relative px-4 md:px-8 py-3 transition-colors duration-500">
        <div className="flex items-center justify-between w-full">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center text-xl font-bold text-slate-800 dark:text-white hover:text-blue-500 dark:hover:text-[#5491f5] transition-colors tracking-wide mr-6">
            {/* Small Shield Logo */}
            <svg className="w-8 h-8 mr-3 rounded filter drop-shadow-md transition-colors duration-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 15L20 25V45C20 65 32 82 50 90C68 82 80 65 80 45V25L50 15Z" fill={isDark ? "#15418f" : "#3b82f6"} stroke="white" strokeWidth="4" strokeLinejoin="round"/>
              <rect x="33" y="48" width="6" height="18" rx="1.5" fill="white" />
              <rect x="43" y="42" width="6" height="24" rx="1.5" fill="white" />
              <rect x="53" y="40" width="6" height="26" rx="1.5" fill="white" />
              <rect x="63" y="32" width="6" height="34" rx="1.5" fill="white" />
            </svg>
            Intelli<span className="font-light">Audit</span>
          </Link>

          {/* Horizontal Workflow Navigation (Pipeline) */}
          <nav className="hidden xl:flex flex-1 items-center justify-center overflow-x-auto px-4">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <React.Fragment key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      isActive 
                        ? 'bg-blue-600 dark:bg-[#113677] text-white shadow-md dark:shadow-[0_0_15px_rgba(84,145,245,0.2)] border border-blue-500 dark:border-[#5491f5]' 
                        : 'text-slate-500 dark:text-[#8ba3c9] hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0a1e45] border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                  {/* Separator Chevron */}
                  {index < navItems.length - 1 && (
                    <svg className="w-4 h-4 text-slate-300 dark:text-[#1a325a] mx-1.5 flex-shrink-0 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center ml-auto space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-[#0a1e45] border border-slate-200 dark:border-[#1a325a] text-slate-500 dark:text-[#8ba3c9] hover:text-blue-600 dark:hover:text-white transition-all shadow-sm"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Back Home Button */}
            <Link 
              to="/workflow" 
              className="flex items-center px-4 py-2 bg-slate-100 dark:bg-[#0a1e45] border border-slate-200 dark:border-[#1a325a] text-slate-600 dark:text-[#8ba3c9] rounded-lg hover:bg-blue-600 dark:hover:bg-[#113677] hover:text-white hover:border-blue-500 dark:hover:border-[#5491f5] transition-all shadow-sm group"
            >
              <Home className="w-4 h-4 mr-2 text-blue-500 dark:text-[#5491f5] group-hover:text-white transition-colors" />
              <span className="font-medium">Back Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto relative">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 dark:bg-[#1a4080] rounded-full blur-[200px] opacity-60 dark:opacity-20 pointer-events-none transition-colors duration-500"></div>

        <main className="relative p-8 z-10 min-h-full">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
