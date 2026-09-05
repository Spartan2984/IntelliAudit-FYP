import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataset } from '../contexts/DatasetContext';
import { 
  Table, FileText, ArrowRight, AlertCircle, Database, BarChart3, 
  Search, Info, CheckCircle2, ChevronRight, Hash, Calendar, 
  Key, Type, Percent, SlidersHorizontal, Sparkles
} from 'lucide-react';
import { isMissingValue } from '../utils/dataProfiler';

export default function Preview() {
  const { workingDataset, originalDataset, metadata, datasetProfile, columnMetadata } = useDataset();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'table' | 'column-detail'
  const [selectedColumnName, setSelectedColumnName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  // Set default selected column once metadata is ready
  React.useEffect(() => {
    if (columnMetadata && columnMetadata.length > 0 && !selectedColumnName) {
      setSelectedColumnName(columnMetadata[0].name);
    }
  }, [columnMetadata, selectedColumnName]);

  const dataset = workingDataset || originalDataset;

  // Filtered rows for data table
  const filteredRows = useMemo(() => {
    if (!dataset || !dataset.rows) return [];
    if (!searchTerm.trim()) return dataset.rows;
    const term = searchTerm.toLowerCase();
    return dataset.rows.filter(row => 
      dataset.headers.some(h => String(row[h] || '').toLowerCase().includes(term))
    );
  }, [dataset, searchTerm]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;

  if (!dataset || !dataset.rows || dataset.rows.length === 0) {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-[#0a1f44] rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-[#1a325a]">
          <Database className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">No Dataset Preview Available</h2>
        <p className="text-slate-500 dark:text-[#8ba3c9] max-w-md mb-8">
          Please upload a CSV dataset to view structural profiling and statistical distributions.
        </p>
        <Link 
          to="/upload" 
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all"
        >
          Go to Upload
        </Link>
      </div>
    );
  }

  const datasetLevel = datasetProfile?.datasetLevel || {
    totalRows: dataset.rows.length,
    totalColumns: dataset.headers.length,
    totalCells: dataset.rows.length * dataset.headers.length,
    totalMissingCells: 0,
    overallMissingRate: 0,
    numericalColumns: [],
    categoricalColumns: [],
    dateColumns: [],
    idColumns: []
  };

  const selectedColMeta = columnMetadata.find(c => c.name === selectedColumnName) || columnMetadata[0];

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Integer':
      case 'Float':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"><Hash className="w-3 h-3" /> {type}</span>;
      case 'Categorical':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"><Type className="w-3 h-3" /> {type}</span>;
      case 'Date':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"><Calendar className="w-3 h-3" /> {type}</span>;
      case 'ID / Key':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"><Key className="w-3 h-3" /> ID</span>;
      case 'Boolean':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">Boolean</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">{type}</span>;
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto text-slate-800 dark:text-white transition-colors duration-500 pb-16">
      {/* Top Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full text-xs font-semibold tracking-wider uppercase">
              Dataset Profiling
            </span>
            <span className="text-xs text-slate-400 dark:text-[#8ba3c9]">Step 2 of 8</span>
          </div>
          <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors">
            Dataset Profiling &amp; Structure Analysis
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#8ba3c9] bg-slate-100 dark:bg-[#0a1f44] px-3 py-1 rounded-lg border border-slate-200 dark:border-[#1a325a]">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              {metadata?.filename}
            </span>
            <span className="text-xs text-slate-400 dark:text-[#4a6b9c]">
              {dataset.rows.length.toLocaleString()} rows &bull; {dataset.headers.length} columns &bull; {metadata?.fileSize || 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/upload" 
            className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-[#8ba3c9] hover:text-blue-600 dark:hover:text-white transition-colors border border-slate-200 dark:border-[#1a325a] rounded-lg bg-white dark:bg-[#0a1f44]"
          >
            Change File
          </Link>
          <Link 
            to="/missing-values" 
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md hover:from-blue-500 hover:to-indigo-500 flex items-center gap-2 transition-all"
          >
            Missing Values Analysis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Dataset-Level Profiling Summary Cards (A.3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-[#05142e]/80 p-4 rounded-xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Records</p>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">{datasetLevel.totalRows.toLocaleString()}</h4>
          <span className="text-[10px] text-slate-400">Rows in working copy</span>
        </div>

        <div className="bg-white dark:bg-[#05142e]/80 p-4 rounded-xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Columns</p>
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">{datasetLevel.totalColumns}</h4>
          <span className="text-[10px] text-slate-400">Attributes parsed</span>
        </div>

        <div className="bg-white dark:bg-[#05142e]/80 p-4 rounded-xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
          <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1">Numerical</p>
          <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400">{datasetLevel.numericalColumns?.length || 0}</h4>
          <span className="text-[10px] text-slate-400">Int / Float cols</span>
        </div>

        <div className="bg-white dark:bg-[#05142e]/80 p-4 rounded-xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
          <p className="text-[11px] font-bold text-purple-500 uppercase tracking-wider mb-1">Categorical</p>
          <h4 className="text-xl font-bold text-purple-600 dark:text-purple-400">{datasetLevel.categoricalColumns?.length || 0}</h4>
          <span className="text-[10px] text-slate-400">Discrete classes</span>
        </div>

        <div className="bg-white dark:bg-[#05142e]/80 p-4 rounded-xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Dates / IDs</p>
          <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {(datasetLevel.dateColumns?.length || 0) + (datasetLevel.idColumns?.length || 0)}
          </h4>
          <span className="text-[10px] text-slate-400">Keys &amp; timestamps</span>
        </div>

        <div className="bg-white dark:bg-[#05142e]/80 p-4 rounded-xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">Missing Cells</p>
          <h4 className="text-xl font-bold text-amber-500">
            {datasetLevel.totalMissingCells} <span className="text-xs font-normal text-slate-400">({datasetLevel.overallMissingRate}%)</span>
          </h4>
          <span className="text-[10px] text-slate-400">Across all cells</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1a325a] mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-6 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-[#8ba3c9] hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Column Metadata &amp; Statistical Profiling
        </button>
        <button
          onClick={() => setActiveTab('table')}
          className={`pb-3 px-6 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'table'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-[#8ba3c9] hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Data Grid &amp; Missing Inspector
        </button>
        <button
          onClick={() => setActiveTab('column-detail')}
          className={`pb-3 px-6 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'column-detail'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-[#8ba3c9] hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Column Deep Dive
        </button>
      </div>

      {/* TAB 1: Column-Level Information & Numerical Statistics (A.3) */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 dark:border-[#1a325a] overflow-hidden transition-colors duration-500">
          <div className="p-5 border-b border-slate-200 dark:border-[#1a325a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-slate-800 dark:text-white">Column-Level Statistical Metrics</h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-[#8ba3c9]">
              Comprehensive profiling including Mean, Median, Min, Max, StdDev, Q1, Q3, IQR &amp; Mode
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0a1f44] border-b border-slate-200 dark:border-[#1a325a] text-slate-500 dark:text-slate-300 font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Column</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Missing</th>
                  <th className="px-4 py-3.5">Unique</th>
                  <th className="px-3 py-3.5 text-right">Mean</th>
                  <th className="px-3 py-3.5 text-right">Median</th>
                  <th className="px-3 py-3.5 text-right">Min</th>
                  <th className="px-3 py-3.5 text-right">Max</th>
                  <th className="px-3 py-3.5 text-right">Std Dev</th>
                  <th className="px-3 py-3.5 text-right">Q1</th>
                  <th className="px-3 py-3.5 text-right">Q3</th>
                  <th className="px-3 py-3.5 text-right font-bold text-blue-500">IQR</th>
                  <th className="px-4 py-3.5">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1a325a]">
                {columnMetadata.map((col, idx) => {
                  const isNum = col.dataType === 'Integer' || col.dataType === 'Float';
                  const stats = col.stats || {};
                  
                  return (
                    <tr 
                      key={idx} 
                      className="hover:bg-slate-50/80 dark:hover:bg-[#0a2352]/30 transition-colors"
                    >
                      <td className="px-5 py-3 font-semibold text-slate-800 dark:text-white">
                        {col.name}
                      </td>
                      <td className="px-4 py-3">
                        {getTypeBadge(col.dataType)}
                      </td>
                      <td className="px-4 py-3">
                        {col.missingCount > 0 ? (
                          <span className="font-semibold text-rose-500">
                            {col.missingCount} ({col.missingPercentage}%)
                          </span>
                        ) : (
                          <span className="text-emerald-500 font-medium">0 (0%)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-[#8ba3c9]">
                        {col.uniqueCount} ({col.uniquePercentage}%)
                      </td>

                      {/* Numerical Stats */}
                      <td className="px-3 py-3 text-right font-mono text-slate-700 dark:text-slate-200">
                        {isNum ? stats.mean : <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {isNum ? stats.median : <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {isNum ? stats.min : <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {isNum ? stats.max : <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {isNum ? stats.stdDev : <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {isNum ? stats.q1 : <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {isNum ? stats.q3 : <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        {isNum ? stats.iqr : <span className="text-slate-300 dark:text-slate-600">-</span>}
                      </td>
                      
                      {/* Categorical Mode */}
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 truncate max-w-[140px]" title={stats.mode}>
                        {stats.mode !== undefined && stats.mode !== 'N/A' ? (
                          <span className="font-medium">{stats.mode}</span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Data Grid & Missing Inspector */}
      {activeTab === 'table' && (
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 dark:border-[#1a325a] overflow-hidden transition-colors duration-500">
          <div className="p-4 border-b border-slate-200 dark:border-[#1a325a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search values across rows..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1a325a] bg-slate-50 dark:bg-[#0a1f44] text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs text-slate-400 dark:text-[#8ba3c9]">
              Showing {paginatedRows.length} of {filteredRows.length.toLocaleString()} matching rows
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0a1f44] border-b border-slate-200 dark:border-[#1a325a]">
                  <th className="px-4 py-3 text-slate-400 text-center w-12 font-mono">#</th>
                  {dataset.headers.map((header, idx) => (
                    <th 
                      key={idx} 
                      className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap"
                    >
                      <div>{header}</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                        {columnMetadata.find(c => c.name === header)?.dataType}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1a325a]">
                {paginatedRows.map((row, rowIdx) => {
                  const globalIdx = (page - 1) * rowsPerPage + rowIdx + 1;
                  return (
                    <tr 
                      key={rowIdx} 
                      className="hover:bg-slate-50 dark:hover:bg-[#0a2352]/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-400 text-center font-mono bg-slate-50/40 dark:bg-[#0a1f44]/30">
                        {globalIdx}
                      </td>
                      {dataset.headers.map((header, colIdx) => {
                        const cellVal = row[header];
                        const isMissing = isMissingValue(cellVal);

                        return (
                          <td 
                            key={colIdx} 
                            className="px-5 py-3 text-slate-700 dark:text-[#8ba3c9] whitespace-nowrap"
                          >
                            {isMissing ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                                NULL
                              </span>
                            ) : (
                              String(cellVal)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-[#1a325a] flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 rounded bg-slate-100 dark:bg-[#0a1f44] text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded bg-slate-100 dark:bg-[#0a1f44] text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Column Deep Dive */}
      {activeTab === 'column-detail' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column selector list */}
          <div className="bg-white dark:bg-[#05142e]/80 p-4 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Select Column</h4>
            <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
              {columnMetadata.map(col => (
                <button
                  key={col.name}
                  onClick={() => setSelectedColumnName(col.name)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                    selectedColumnName === col.name
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-700 dark:text-[#8ba3c9] hover:bg-slate-100 dark:hover:bg-[#0a1f44]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {col.missingCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${selectedColumnName === col.name ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                        {col.missingCount} missing
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed stats card for selected column */}
          {selectedColMeta && (
            <div className="md:col-span-2 bg-white dark:bg-[#05142e]/80 p-6 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedColMeta.name}
                    {getTypeBadge(selectedColMeta.dataType)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Detailed statistical distribution &amp; cardinality metrics</p>
                </div>
                {selectedColMeta.missingCount > 0 && (
                  <Link
                    to="/missing-values"
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    Clean Missing Values
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-slate-50 dark:bg-[#0a1f44] rounded-xl border border-slate-100 dark:border-[#1a325a]">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Records</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">{selectedColMeta.totalCount}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#0a1f44] rounded-xl border border-slate-100 dark:border-[#1a325a]">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Missing Count</p>
                  <p className={`text-lg font-bold mt-1 ${selectedColMeta.missingCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {selectedColMeta.missingCount} ({selectedColMeta.missingPercentage}%)
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#0a1f44] rounded-xl border border-slate-100 dark:border-[#1a325a]">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Distinct Values</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">
                    {selectedColMeta.uniqueCount} ({selectedColMeta.uniquePercentage}%)
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#0a1f44] rounded-xl border border-slate-100 dark:border-[#1a325a]">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Mode / Top Value</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-1 truncate" title={selectedColMeta.stats?.mode}>
                    {selectedColMeta.stats?.mode || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Numerical Specific Detailed Box */}
              {(selectedColMeta.dataType === 'Integer' || selectedColMeta.dataType === 'Float') && (
                <div className="p-5 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 dark:bg-[#081a3d]/60 rounded-xl border border-blue-100 dark:border-[#1a325a]">
                  <h4 className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 mb-4">Five-Number Summary &amp; Dispersion</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Mean:</span>
                      <span className="font-bold text-sm text-slate-800 dark:text-white">{selectedColMeta.stats?.mean}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Median (Q2):</span>
                      <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{selectedColMeta.stats?.median}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Minimum:</span>
                      <span className="font-bold text-sm text-slate-800 dark:text-white">{selectedColMeta.stats?.min}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Maximum:</span>
                      <span className="font-bold text-sm text-slate-800 dark:text-white">{selectedColMeta.stats?.max}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Standard Dev:</span>
                      <span className="font-bold text-sm text-slate-800 dark:text-white">{selectedColMeta.stats?.stdDev}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Q1 (25th):</span>
                      <span className="font-bold text-sm text-slate-800 dark:text-white">{selectedColMeta.stats?.q1}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Q3 (75th):</span>
                      <span className="font-bold text-sm text-slate-800 dark:text-white">{selectedColMeta.stats?.q3}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">IQR (Q3-Q1):</span>
                      <span className="font-bold text-sm text-blue-600 dark:text-blue-400">{selectedColMeta.stats?.iqr}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Categorical Top Values Table */}
              {selectedColMeta.stats?.topValues && selectedColMeta.stats.topValues.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Top Categories by Frequency</h4>
                  <div className="space-y-1.5">
                    {selectedColMeta.stats.topValues.map((tv, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-[#0a1f44] rounded-lg">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{tv.value || '(Empty)'}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{tv.count} occurrences</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{tv.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
