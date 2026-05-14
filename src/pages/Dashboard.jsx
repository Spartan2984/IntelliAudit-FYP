import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataset } from '../contexts/DatasetContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const { dataset, metadata } = useDataset();

  const stats = useMemo(() => {
    if (!dataset || !dataset.rows || dataset.rows.length === 0) return null;

    let totalMissing = 0;
    const missingColCounts = {};
    dataset.headers.forEach(h => missingColCounts[h] = 0);

    const rowHashes = new Set();
    let totalDuplicates = 0;

    dataset.rows.forEach(row => {
      // Calculate missing
      dataset.headers.forEach(h => {
        const val = row[h];
        if (val === null || val === undefined || String(val).trim() === '') {
          totalMissing++;
          missingColCounts[h]++;
        }
      });

      // Calculate duplicates (simple JSON stringify approach)
      const hash = JSON.stringify(row);
      if (rowHashes.has(hash)) {
        totalDuplicates++;
      } else {
        rowHashes.add(hash);
      }
    });

    // Prepare chart data
    let missingChartData = dataset.headers.map(h => ({
      name: h,
      missing: missingColCounts[h]
    }));
    
    // Sort so highest missing are first
    missingChartData.sort((a, b) => b.missing - a.missing);
    // Take top 10 if there are many columns to avoid overcrowding
    missingChartData = missingChartData.slice(0, 10);

    const duplicateChartData = [
      { name: 'Unique', value: dataset.rows.length - totalDuplicates },
      { name: 'Duplicate', value: totalDuplicates }
    ];

    return {
      totalRows: dataset.rows.length,
      totalMissing,
      totalDuplicates,
      missingChartData,
      duplicateChartData
    };
  }, [dataset]);

  const COLORS = ['#5bc0be', '#f8c630', '#f25022', '#5491f5', '#7fba00'];

  if (!dataset || !dataset.rows) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-slate-800 dark:text-white transition-colors duration-500">
        <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white mb-4">Audit Dashboard</h2>
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-12 rounded-2xl shadow-md border border-slate-200 dark:border-[#1a325a] flex flex-col items-center text-slate-400 dark:text-[#4a6b9c]">
          <p className="mb-6 text-lg">No dataset loaded. Please upload a dataset first to view statistics.</p>
          <Link to="/upload" className="px-8 py-3 bg-blue-600 dark:bg-[#113677] text-white font-medium rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-[#1a4080] transition-colors">
            Go to Upload
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in text-slate-800 dark:text-white transition-colors duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors">Audit Dashboard</h2>
          <p className="text-slate-500 dark:text-[#8ba3c9] mt-2 font-light transition-colors">
            Analysis for <span className="font-medium">{metadata?.filename}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl shadow-md dark:shadow-sm border border-slate-200 dark:border-[#1a325a] flex flex-col relative overflow-hidden group transition-colors duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#5bc0be]"></div>
          <h3 className="text-slate-500 dark:text-[#8ba3c9] text-sm font-semibold uppercase tracking-wider pl-2 transition-colors">Total Rows</h3>
          <p className="text-4xl font-bold mt-3 pl-2 group-hover:scale-105 transition-transform origin-left text-slate-900 dark:text-white">
            {stats.totalRows.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl shadow-md dark:shadow-sm border border-slate-200 dark:border-[#1a325a] flex flex-col relative overflow-hidden group transition-colors duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#f8c630]"></div>
          <h3 className="text-slate-500 dark:text-[#8ba3c9] text-sm font-semibold uppercase tracking-wider pl-2 transition-colors">Missing Values</h3>
          <p className="text-4xl font-bold mt-3 pl-2 text-amber-500 dark:text-[#f8c630] group-hover:scale-105 transition-transform origin-left">
            {stats.totalMissing.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl shadow-md dark:shadow-sm border border-slate-200 dark:border-[#1a325a] flex flex-col relative overflow-hidden group transition-colors duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#5491f5]"></div>
          <h3 className="text-slate-500 dark:text-[#8ba3c9] text-sm font-semibold uppercase tracking-wider pl-2 transition-colors">Duplicate Rows</h3>
          <p className="text-4xl font-bold mt-3 pl-2 text-blue-500 dark:text-[#5491f5] group-hover:scale-105 transition-transform origin-left">
            {stats.totalDuplicates.toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Values Chart */}
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-slate-200 dark:border-[#1a325a] transition-colors duration-500">
          <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white">Missing Values by Column (Top 10)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.missingChartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  angle={-45} 
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  cursor={{ fill: '#334155', opacity: 0.1 }}
                />
                <Bar dataKey="missing" fill="#f8c630" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Duplicates Chart */}
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-slate-200 dark:border-[#1a325a] transition-colors duration-500">
          <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white">Row Duplication Overview</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.duplicateChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.duplicateChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#5bc0be' : '#f25022'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
