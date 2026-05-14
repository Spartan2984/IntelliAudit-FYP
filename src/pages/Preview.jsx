import React from 'react';
import { Link } from 'react-router-dom';
import { useDataset } from '../contexts/DatasetContext';

export default function Preview() {
  const { dataset, metadata } = useDataset();

  // Determine how many rows to show (max 50 for efficiency)
  const maxRowsPreview = 50;
  const rowsToShow = dataset?.rows ? dataset.rows.slice(0, maxRowsPreview) : [];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto text-slate-800 dark:text-white transition-colors duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors">Dataset Preview</h2>
          <p className="text-slate-500 dark:text-[#8ba3c9] mt-2 font-light transition-colors">
            {metadata ? `Showing first ${rowsToShow.length} of ${metadata.totalRows} rows from ${metadata.filename}` : 'Initial dataset preview table'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm rounded-2xl shadow-md dark:shadow-lg border border-slate-200 dark:border-[#1a325a] min-h-[300px] flex flex-col text-slate-800 dark:text-gray-200 transition-colors duration-500 overflow-hidden">
        {!dataset || !dataset.headers || dataset.headers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 dark:text-[#4a6b9c]">
            <p className="mb-4">No dataset loaded. Please upload a dataset first.</p>
            <Link to="/upload" className="px-6 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors">
              Go to Upload
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto w-full max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-[#0a1f44] sticky top-0 z-10 shadow-sm">
                <tr>
                  {dataset.headers.map((header, i) => (
                    <th key={i} className="px-4 py-3 font-medium text-sm text-slate-600 dark:text-gray-300 border-b border-slate-200 dark:border-[#1a325a] whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#10244a]">
                {rowsToShow.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-[#081a3d] transition-colors">
                    {dataset.headers.map((header, colIndex) => (
                      <td key={colIndex} className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                        {row[header] !== null && row[header] !== undefined ? String(row[header]) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Link to="/dashboard" className="px-8 py-3 bg-blue-600 dark:bg-[#113677] text-white font-medium rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-[#1a4080] hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(84,145,245,0.4)] transition-all duration-300 transform hover:-translate-y-1">
          Proceed to Audit Dashboard
        </Link>
      </div>
    </div>
  );
}
