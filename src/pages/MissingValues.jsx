import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Activity, AlertCircle, CheckCircle2, Database, ListTodo,
  Sparkles, TrendingUp, AlertTriangle,
  ArrowRight, Undo2, Check, Sliders, Eye, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDataset } from '../contexts/DatasetContext';
import { isMissingValue } from '../utils/dataProfiler';

export default function MissingValues() {
  const { 
    originalDataset, 
    workingDataset, 
    datasetProfile, 
    columnMetadata, 
    missingRecommendations, 
    imputationResults,
    profilingOptions,
    updateProfilingOptions,
    runImputation, 
    runBatchImputations, 
    resetToOriginal 
  } = useDataset();

  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [customValueInput, setCustomValueInput] = useState('');
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'history' | 'diff'
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  const dataset = workingDataset || originalDataset;

  const showNotification = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Map of original dataset rows keyed by internal stable __row_id (Fix 4: ID-based comparison)
  const originalRowMap = useMemo(() => {
    const map = new Map();
    if (originalDataset && originalDataset.rows) {
      originalDataset.rows.forEach((r, idx) => {
        const id = r.__row_id !== undefined ? r.__row_id : idx + 1;
        map.set(id, r);
      });
    }
    return map;
  }, [originalDataset]);

  if (!dataset || !dataset.rows || dataset.rows.length === 0) {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-500/20">
          <Database className="w-10 h-10 text-blue-500 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">No Dataset Loaded</h2>
        <p className="text-slate-500 dark:text-[#8ba3c9] max-w-md mb-8">
          Please upload a CSV dataset to perform missing-value detection, statistical profiling, and AI imputation.
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

  // Calculate missing stats from current working_dataset respecting profilingOptions
  const totalRows = dataset.rows.length;
  const totalCols = dataset.headers.length;
  const totalCells = totalRows * totalCols;
  
  const missingByCol = dataset.headers.map(h => {
    const missingCount = dataset.rows.filter(r => isMissingValue(r[h], profilingOptions)).length;
    const missingPercent = totalRows > 0 ? Number(((missingCount / totalRows) * 100).toFixed(2)) : 0;
    const meta = columnMetadata.find(c => c.name === h);
    return {
      name: h,
      count: missingCount,
      missing: missingPercent,
      type: meta?.dataType || 'Categorical',
      stats: meta?.stats
    };
  });

  const totalMissingCells = missingByCol.reduce((acc, c) => acc + c.count, 0);
  const overallMissingPercent = totalCells > 0 ? Number(((totalMissingCells / totalCells) * 100).toFixed(2)) : 0;

  const rowsWithMissing = dataset.rows.filter(row =>
    dataset.headers.some(h => isMissingValue(row[h], profilingOptions))
  ).length;

  let qualityGrade = 'A+';
  if (overallMissingPercent > 20) qualityGrade = 'D';
  else if (overallMissingPercent > 10) qualityGrade = 'C';
  else if (overallMissingPercent > 3) qualityGrade = 'B';
  else if (overallMissingPercent > 0) qualityGrade = 'A';

  // Columns that still have missing values
  const pendingColumns = missingByCol.filter(c => c.count > 0);

  // Handle single approval
  const handleApproveRecommendation = (rec) => {
    const result = runImputation(rec.column, rec.recommendedMethod, rec.suggestedValue, rec.reason, rec.confidence);
    if (result && result.success !== false) {
      showNotification(`Successfully applied ${rec.recommendedMethod} imputation to '${rec.column}' (${result.affectedRowCount} cells updated).`, 'success');
    } else if (result && result.error) {
      showNotification(result.error, 'error');
    }
  };

  // Handle custom imputation submit (Fix 5: Type-safe custom imputation)
  const handleApplyCustomImputation = (colName) => {
    if (!selectedMethod) return;
    const meta = columnMetadata.find(c => c.name === colName);
    const result = runImputation(
      colName, 
      selectedMethod, 
      customValueInput, 
      `Manual custom ${selectedMethod} imputation by user.`
    );
    
    if (result && result.success === false) {
      showNotification(result.error || 'Invalid custom value for this column type.', 'error');
      return;
    }

    if (result && result.success !== false) {
      showNotification(`Applied ${selectedMethod} imputation to '${colName}' (${result.affectedRowCount} cells updated).`, 'success');
      setSelectedColumn(null);
      setSelectedMethod('');
      setCustomValueInput('');
    }
  };

  // Handle batch approval
  const handleBatchApprove = () => {
    if (missingRecommendations.length === 0) return;
    runBatchImputations(missingRecommendations);
    showNotification(`Batch applied intelligent imputation to ${missingRecommendations.length} columns.`, 'success');
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto text-slate-800 dark:text-white transition-colors duration-500 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 p-4 text-white text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-3 animate-bounce ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full text-xs font-semibold tracking-wider uppercase">
              Missing Values
            </span>
            <span className="text-xs text-slate-400 dark:text-[#8ba3c9]">Step 4 of 8</span>
          </div>
          <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors">
            Missing-Value Detection &amp; Explainable Imputation
          </h2>
          <p className="text-slate-500 dark:text-[#8ba3c9] mt-2 font-light transition-colors">
            Rule &amp; statistical heuristic recommendations with human-in-the-loop approval. Operates on <code className="text-xs font-mono bg-slate-100 dark:bg-[#0a1f44] px-1 py-0.5 rounded text-blue-600 dark:text-blue-400">working_dataset</code> while preserving <code className="text-xs font-mono bg-slate-100 dark:bg-[#0a1f44] px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">original_dataset</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {imputationResults.length > 0 && (
            <button
              onClick={resetToOriginal}
              className="px-4 py-2 bg-slate-100 dark:bg-[#0a1f44] hover:bg-slate-200 dark:hover:bg-[#112a58] text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-[#1a325a] flex items-center gap-2 transition-all shadow-sm"
            >
              <Undo2 className="w-4 h-4 text-amber-500" />
              Reset to Original Dataset
            </button>
          )}

          {pendingColumns.length > 0 && (
            <button
              onClick={handleBatchApprove}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Approve All Recommendations
            </button>
          )}
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#05142e]/80 p-5 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Missing Values</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {totalMissingCells.toLocaleString()} <span className="text-xs font-normal text-slate-400">({overallMissingPercent}%)</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-[#8ba3c9]">Total empty / null cells</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-500">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#05142e]/80 p-5 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Affected Rows</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {rowsWithMissing.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {totalRows.toLocaleString()}</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-[#8ba3c9]">Rows with &ge;1 missing value</span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-500">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#05142e]/80 p-5 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Quality Grade</p>
            <h3 className={`text-2xl font-bold mt-1 ${qualityGrade === 'A+' || qualityGrade === 'A' ? 'text-emerald-500' : qualityGrade === 'B' ? 'text-blue-500' : 'text-rose-500'}`}>
              Grade {qualityGrade}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-[#8ba3c9]">Completeness index</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#05142e]/80 p-5 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Imputations Done</p>
            <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {imputationResults.length} <span className="text-xs font-normal text-slate-400">actions</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-[#8ba3c9]">Applied to working copy</span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Analysis Chart & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Missing Values Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Missing Values by Column (Detection Distribution)
            </h3>
            <span className="text-xs text-slate-400">Current working copy</span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missingByCol} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  unit="%"
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value, name, item) => [`${value}% (${item.payload.count} cells)`, 'Missing']}
                />
                <Bar dataKey="missing" radius={[6, 6, 0, 0]} maxBarSize={36}>
                  {missingByCol.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.missing > 15 ? '#ef4444' : entry.missing > 0 ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Missing Value Detection Table Summary (Fix 6: Configurable ambiguous markers) */}
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" />
                Detection Breakdown
              </h3>
              
              {/* Optional Configurable Ambiguous Markers Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500 dark:text-[#8ba3c9] hover:text-slate-800 dark:hover:text-white transition-colors" title="Toggle whether '-' and '?' should be treated as missing values">
                <input
                  type="checkbox"
                  checked={Boolean(profilingOptions?.includeAmbiguousMarkers)}
                  onChange={(e) => updateProfilingOptions({ includeAmbiguousMarkers: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Include '-' &amp; '?'</span>
              </label>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {missingByCol.map((col, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-[#0a1f44]">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-white">{col.name}</span>
                    <span className="text-[10px] text-slate-400 block">{col.type}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${col.count > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {col.count} cells
                    </span>
                    <span className="text-[10px] text-slate-400 block">{col.missing}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1a325a] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Common markers:</span>
            <span className="font-mono text-slate-500 dark:text-[#8ba3c9]">NaN, NULL, N/A, &quot;&quot;, None</span>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1a325a] mb-6">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`pb-3 px-6 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'recommendations'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-[#8ba3c9] hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Explainable Recommendations ({pendingColumns.length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-6 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-[#8ba3c9] hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Imputation Audit Trail ({imputationResults.length})
        </button>
        <button
          onClick={() => setActiveTab('diff')}
          className={`pb-3 px-6 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'diff'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-[#8ba3c9] hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          Live Before vs After Comparison
        </button>
      </div>

      {/* TAB 1: Explainable AI Recommendations */}
      {activeTab === 'recommendations' && (
        <div>
          {pendingColumns.length === 0 ? (
            <div className="bg-white dark:bg-[#05142e]/80 p-12 rounded-2xl border border-slate-200 dark:border-[#1a325a] text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Missing Values in Working Dataset</h3>
              <p className="text-xs text-slate-500 dark:text-[#8ba3c9] max-w-md mx-auto mb-6">
                All missing entries have been cleanly imputed or your dataset arrived with 100% completeness.
              </p>
              <div className="flex justify-center gap-4">
                {imputationResults.length > 0 && (
                  <button
                    onClick={resetToOriginal}
                    className="px-6 py-2.5 bg-slate-100 dark:bg-[#0a1f44] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-[#112a58] transition-colors border border-slate-200 dark:border-[#1a325a]"
                  >
                    Reset to Original Dataset
                  </button>
                )}
                <Link
                  to="/duplicates"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-2"
                >
                  Proceed to Duplicate Detection
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {missingRecommendations.map((rec) => {
                const currentMissing = dataset.rows.filter(r => isMissingValue(r[rec.column], profilingOptions)).length;
                if (currentMissing === 0) return null;

                const isCustomOpen = selectedColumn === rec.column;

                return (
                  <div
                    key={rec.column}
                    className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      {/* Top badge line */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-slate-900 dark:text-white">{rec.column}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0a1f44] text-slate-600 dark:text-slate-300 font-mono">
                            {rec.dataType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-rose-500">
                            {currentMissing} missing ({((currentMissing / totalRows) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      {/* Recommendation Box */}
                      <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#081a3d]/80 border border-blue-100 dark:border-blue-500/20 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                            Recommended: {rec.recommendedMethod}
                          </div>
                          <span className="px-2 py-0.5 bg-blue-600 text-white dark:bg-blue-500 text-[10px] font-bold rounded-full shadow-sm">
                            {rec.confidence}% Confidence
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-[#8ba3c9] leading-relaxed mb-3">
                          {rec.reason}
                        </p>

                        {rec.suggestedValue !== null && (
                          <div className="text-xs font-mono text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-[#05142e]/60 px-3 py-1.5 rounded-lg border border-blue-100/50 dark:border-blue-500/10 flex items-center justify-between">
                            <span className="text-slate-400">Calculated Imputation Value:</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-300">{String(rec.suggestedValue)}</span>
                          </div>
                        )}
                      </div>

                      {/* Custom Method Toggle (Human-in-the-loop with Type Safety) */}
                      {isCustomOpen && (
                        <div className="p-4 mb-4 rounded-xl bg-slate-50 dark:bg-[#0a1f44] border border-slate-200 dark:border-[#1a325a] animate-fade-in">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Alternative Imputation Method:</p>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {['Median', 'Mean', 'Mode', 'Custom Value', 'Drop Rows'].map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setSelectedMethod(m)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  selectedMethod === m
                                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                    : 'bg-white dark:bg-[#05142e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1a325a]'
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>

                          {selectedMethod === 'Custom Value' && (
                            <div>
                              <input
                                type="text"
                                placeholder={
                                  rec.dataType === 'Integer' 
                                    ? 'Enter whole integer (e.g. 25)...' 
                                    : rec.dataType === 'Float' 
                                    ? 'Enter decimal number (e.g. 25.5)...'
                                    : rec.dataType === 'Boolean'
                                    ? 'Enter true / false...'
                                    : 'Enter text value...'
                                }
                                value={customValueInput}
                                onChange={(e) => setCustomValueInput(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1a325a] bg-white dark:bg-[#05142e] text-slate-800 dark:text-white mb-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-[10px] text-slate-400 mb-3 block">
                                Type-safe validation: value must conform to <code className="font-mono text-blue-500">{rec.dataType}</code>.
                              </span>
                            </div>
                          )}

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => { setSelectedColumn(null); setSelectedMethod(''); }}
                              className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={!selectedMethod || (selectedMethod === 'Custom Value' && !customValueInput.trim())}
                              onClick={() => handleApplyCustomImputation(rec.column)}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-sm"
                            >
                              Apply Custom Method
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-[#1a325a]">
                      <button
                        onClick={() => handleApproveRecommendation(rec)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve &amp; Apply {rec.recommendedMethod}
                      </button>

                      <button
                        onClick={() => {
                          if (isCustomOpen) {
                            setSelectedColumn(null);
                          } else {
                            setSelectedColumn(rec.column);
                            setSelectedMethod(rec.recommendedMethod);
                          }
                        }}
                        className="px-3 py-2.5 bg-slate-100 dark:bg-[#0a1f44] hover:bg-slate-200 dark:hover:bg-[#112a58] text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg border border-slate-200 dark:border-[#1a325a] transition-colors"
                        title="Customize Cleaning Action"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Imputation Audit Trail (Fix 3: Comprehensive Audit Fields) */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 dark:border-[#1a325a] overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-[#1a325a] flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-blue-500" />
              Imputation Execution Log (Audit Records)
            </h3>
            <span className="text-xs text-slate-400">{imputationResults.length} operations executed</span>
          </div>

          {imputationResults.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No imputations applied yet. Approve recommendations to begin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#0a1f44] border-b border-slate-200 dark:border-[#1a325a] text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Operation ID</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Column</th>
                    <th className="px-3 py-3">Method</th>
                    <th className="px-3 py-3">Decision</th>
                    <th className="px-3 py-3">Confidence</th>
                    <th className="px-4 py-3">Imputed Value</th>
                    <th className="px-4 py-3">Cells Replaced</th>
                    <th className="px-5 py-3">Reason / Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1a325a]">
                  {imputationResults.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#0a2352]/30">
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400 truncate max-w-[100px]">{item.operationId || item.id}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{item.timestamp}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{item.column}</td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded font-semibold text-[10px]">
                          {item.method}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 rounded font-semibold text-[10px]">
                          {item.decision || 'Approved'}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-blue-600 dark:text-blue-400">
                        {item.confidence ? `${item.confidence}%` : '85%'}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {String(item.replacementValue)}
                      </td>
                      <td className="px-4 py-3 text-emerald-500 font-semibold">{item.affectedRowCount} cells</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-[#8ba3c9] max-w-xs truncate" title={item.reason}>
                        {item.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Before vs After Comparison (Fix 4: Stable ID-based matching) */}
      {activeTab === 'diff' && (
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 dark:border-[#1a325a] overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-[#1a325a] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                Original Dataset vs Working Dataset Comparison
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Highlighting cells updated via approved imputation algorithms matched by stable row IDs.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0a1f44] border-b border-slate-200 dark:border-[#1a325a] text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-center w-12 font-mono">Row</th>
                  {dataset.headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1a325a]">
                {workingDataset.rows.slice(0, 15).map((row, rowIdx) => {
                  // Match original row strictly using stable __row_id (Fix 4)
                  const rowId = row.__row_id !== undefined ? row.__row_id : rowIdx + 1;
                  const origRow = originalRowMap.get(rowId) || originalDataset?.rows[rowIdx] || {};

                  return (
                    <tr key={rowId || rowIdx} className="hover:bg-slate-50 dark:hover:bg-[#0a2352]/30">
                      <td className="px-4 py-3 text-slate-400 text-center font-mono bg-slate-50/40 dark:bg-[#0a1f44]/30">
                        {rowIdx + 1}
                      </td>
                      {dataset.headers.map((h, colIdx) => {
                        const origVal = origRow[h];
                        const workVal = row[h];
                        const isOriginallyMissing = isMissingValue(origVal, profilingOptions);
                        const isNowFilled = isOriginallyMissing && !isMissingValue(workVal, profilingOptions);

                        return (
                          <td key={colIdx} className="px-4 py-3">
                            {isNowFilled ? (
                              <div className="flex items-center gap-1.5">
                                <span className="line-through text-rose-400 opacity-60 text-[10px]">NULL</span>
                                <span className="text-slate-400">&rarr;</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded">
                                  {String(workVal)}
                                </span>
                              </div>
                            ) : isOriginallyMissing ? (
                              <span className="text-rose-500 font-semibold text-[10px] bg-rose-50 dark:bg-rose-500/20 px-1.5 py-0.5 rounded">
                                NULL
                              </span>
                            ) : (
                              <span className="text-slate-700 dark:text-slate-300">{String(workVal)}</span>
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
        </div>
      )}
    </div>
  );
}
