import React from 'react';

export default function Upload() {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto text-slate-800 dark:text-white transition-colors duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors">Upload Dataset</h2>
        <p className="text-slate-500 dark:text-[#8ba3c9] mt-2 font-light transition-colors">Provide the raw CSV or Excel dataset to begin the auditing process.</p>
      </div>

      <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-12 rounded-2xl shadow-md dark:shadow-lg border-2 border-dashed border-blue-300 dark:border-[#1a325a] flex flex-col items-center justify-center min-h-[350px] hover:border-blue-500 dark:hover:border-[#5491f5] hover:bg-slate-50 dark:hover:bg-[#081a3d] transition-all duration-300 cursor-pointer group">
        
        <div className="w-24 h-24 bg-blue-50 dark:bg-[#0a2352] border border-blue-100 dark:border-[#1a325a] rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-[#113677] transition-all duration-500 shadow-sm dark:shadow-[0_0_30px_rgba(84,145,245,0.1)]">
          <svg className="w-10 h-10 text-blue-500 dark:text-[#5491f5] group-hover:text-blue-700 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
        </div>
        
        <h3 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-white transition-colors">Drag and drop your file here</h3>
        <p className="text-slate-500 dark:text-[#8ba3c9] font-light mb-8 transition-colors">or click to browse your computer</p>
        
        <button className="px-10 py-4 bg-blue-600 dark:bg-[#113677] text-white font-medium rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-[#1a4080] hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(84,145,245,0.4)] transition-all duration-300 transform hover:-translate-y-1">
          Select File
        </button>
      </div>
      
      <div className="mt-8 text-center text-sm text-slate-400 dark:text-[#4a6b9c] font-light tracking-wide transition-colors">
        Supported formats: .csv, .xlsx, .json (Max size: 50MB)
      </div>
    </div>
  );
}
