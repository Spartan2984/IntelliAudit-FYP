import React from 'react';
import { Link } from 'react-router-dom';

export default function CleaningActions() {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto text-slate-800 dark:text-white transition-colors duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors">Data Cleaning Actions</h2>
        <p className="text-slate-500 dark:text-[#8ba3c9] mt-2 font-light transition-colors">Apply various cleaning algorithms (imputation, removal) to the dataset here.</p>
      </div>
      
      <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl shadow-md dark:shadow-lg border border-slate-200 dark:border-[#1a325a] min-h-[300px] flex items-center justify-center text-slate-400 dark:text-[#4a6b9c] transition-colors duration-500">
        Cleaning Action Controls Placeholder
      </div>

      <div className="mt-8 flex justify-end">
        <Link to="/cleaned-preview" className="px-8 py-3 bg-blue-600 dark:bg-[#113677] text-white font-medium rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-[#1a4080] hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(84,145,245,0.4)] transition-all duration-300 transform hover:-translate-y-1">
          View Cleaned Dataset
        </Link>
      </div>
    </div>
  );
}
