import React from 'react';
import { Link } from 'react-router-dom';
import { useDataset } from '../contexts/DatasetContext';
import { Table, FileText, ArrowRight, AlertCircle, Database } from 'lucide-react';

export default function Preview() {
  const { dataset, metadata } = useDataset();

  if (!dataset || !dataset.rows || dataset.rows.length === 0) {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-[#0a1f44] rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-[#1a325a]">
          <Database className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">No Dataset Preview Available</h2>
        <p className="text-slate-500 dark:text-[#8ba3c9] max-w-md mb-8">
          Please upload a CSV file to view the raw data structure.
        </p>
        <Link 
          to="/upload" 
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          Go to Upload
        </Link>
      </div>
    );
  }

  // Preview only the first 15 rows for performance
  const previewRows = dataset.rows.slice(0, 15);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto text-slate-800 dark:text-white transition-colors duration-500 pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors">Dataset Preview</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-[#8ba3c9] bg-slate-100 dark:bg-[#0a1f44] px-3 py-1 rounded-full border border-slate-200 dark:border-[#1a325a]">
              <FileText className="w-3.5 h-3.5" />
              {metadata?.filename}
            </span>
            <span className="text-sm text-slate-400 dark:text-[#4a6b9c]">
              Showing first {previewRows.length} of {dataset.rows.length.toLocaleString()} rows
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/upload" 
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-[#8ba3c9] hover:text-blue-600 dark:hover:text-white transition-colors"
          >
            Change File
          </Link>
          <Link 
            to="/dashboard" 
            className="px-6 py-2.5 bg-blue-600 dark:bg-[#113677] text-white font-medium rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-[#1a4080] flex items-center gap-2 transition-all"
          >
            Analyze Data
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-[#1a325a] overflow-hidden transition-colors duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0a1f44] border-b border-slate-200 dark:border-[#1a325a]">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-16">#</th>
                {dataset.headers.map((header, idx) => (
                  <th 
                    key={idx} 
                    className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider min-w-[150px]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1a325a]">
              {previewRows.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className="hover:bg-slate-50 dark:hover:bg-[#0a2352]/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-400 dark:text-[#4a6b9c] text-center bg-slate-50/50 dark:bg-[#0a1f44]/30 font-mono">
                    {rowIdx + 1}
                  </td>
                  {dataset.headers.map((header, colIdx) => (
                    <td 
                      key={colIdx} 
                      className="px-6 py-4 text-sm text-slate-600 dark:text-[#8ba3c9]"
                    >
                      {row[header] === null || row[header] === undefined || String(row[header]).trim() === '' ? (
                        <span className="text-rose-400 italic text-xs font-light opacity-60">NULL</span>
                      ) : (
                        String(row[header])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-[#0a1f44]/50 border-t border-slate-200 dark:border-[#1a325a] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-[#4a6b9c]">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Previewing a subset of data for performance. Full dataset will be analyzed in the next steps.</span>
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-[#8ba3c9]">
            Total Cells: {(dataset.rows.length * dataset.headers.length).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#05142e]/80 p-6 rounded-xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
          <p className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase mb-1">Rows</p>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{dataset.rows.length.toLocaleString()}</h4>
        </div>
        <div className="bg-white dark:bg-[#05142e]/80 p-6 rounded-xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
          <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase mb-1">Columns</p>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{dataset.headers.length}</h4>
        </div>
        <div className="bg-white dark:bg-[#05142e]/80 p-6 rounded-xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
          <p className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase mb-1">Estimated Size</p>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{metadata?.fileSize || 'N/A'}</h4>
        </div>
      </div>
    </div>
  );
}
