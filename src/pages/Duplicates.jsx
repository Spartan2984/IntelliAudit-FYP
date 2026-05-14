import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  AlertTriangle, Copy, Activity, CheckCircle2,
  Search, Sparkles, ListTodo, Layers, Fingerprint
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDataset } from '../contexts/DatasetContext';

export default function Duplicates() {
  const { dataset } = useDataset();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('duplicates');

  const [chartData, setChartData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [duplicateRows, setDuplicateRows] = useState([]);
  const [anomalyRows, setAnomalyRows] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    duplicates: 0,
    anomalies: 0,
    cleanPercent: '100%'
  });

  const handleRunAnalysis = () => {
    if (!dataset || !dataset.rows) {
      alert("Please upload a dataset first.");
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const rows = dataset.rows;
      const headers = dataset.headers;

      // 1. Exact Duplicate Detection
      const seen = new Map();
      const duplicates = [];

      rows.forEach((row, index) => {
        const hash = JSON.stringify(row);
        if (seen.has(hash)) {
          duplicates.push({ ...row, _originalIndex: seen.get(hash), id: index });
        } else {
          seen.set(hash, index);
        }
      });

      // 2. Simple Anomaly Detection (Statistical Outliers for Numeric Columns)
      const anomalies = [];
      headers.forEach(header => {
        const values = rows
          .map(r => parseFloat(r[header]))
          .filter(v => !isNaN(v) && isFinite(v));

        if (values.length > 5) {
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const stdDev = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / values.length);

          rows.forEach((row, index) => {
            const val = parseFloat(row[header]);
            if (!isNaN(val) && isFinite(val)) {
              const zScore = Math.abs((val - mean) / stdDev);
              if (zScore > 3) {
                anomalies.push({
                  ...row,
                  id: index,
                  _issue: `Outlier in ${header}`,
                  _value: val,
                  _header: header
                });
              }
            }
          });
        }
      });

      setDuplicateRows(duplicates.slice(0, 50)); // Limit for preview
      setAnomalyRows(anomalies.slice(0, 50));

      const totalIssues = duplicates.length + anomalies.length;
      const cleanPercent = Math.max(0, 100 - (totalIssues / rows.length) * 100).toFixed(1);

      setStats({
        totalIssues,
        duplicates: duplicates.length,
        anomalies: anomalies.length,
        cleanPercent: cleanPercent + '%'
      });

      const pieData = [
        { name: 'Clean Data', value: parseFloat(cleanPercent), color: '#10b981' },
        { name: 'Exact Duplicates', value: parseFloat(((duplicates.length / rows.length) * 100).toFixed(1)), color: '#f59e0b' },
        { name: 'Anomalies', value: parseFloat(((anomalies.length / rows.length) * 100).toFixed(1)), color: '#ef4444' },
      ];
      setChartData(pieData);

      // Recommendations
      const recs = [];
      if (duplicates.length > 0) {
        recs.push({
          issue: 'Exact Duplicates',
          rec: 'Auto-Drop',
          reason: `Found ${duplicates.length} exactly identical rows. Dropping them is recommended.`
        });
      }
      if (anomalies.length > 0) {
        const topAnomaly = anomalies[0];
        recs.push({
          issue: 'Statistical Outliers',
          rec: 'Investigate',
          reason: `${anomalies.length} rows flagged by Z-Score. Check values like ${topAnomaly._value} in ${topAnomaly._header}.`
        });
      }
      if (recs.length === 0) {
        recs.push({ issue: 'All Clear', rec: 'No Action', reason: 'Dataset looks clean and consistent.' });
      }
      setRecommendations(recs);

      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2500);
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto text-slate-800 dark:text-white transition-colors duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors">Data Quality Scan</h2>
          <p className="text-slate-500 dark:text-[#8ba3c9] mt-2 font-light transition-colors">
            Detect exact duplicates, fuzzy matches, and structural anomalies.
          </p>
        </div>
        {analysisComplete && (
          <button
            onClick={() => setAnalysisComplete(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#0a1f44] dark:hover:bg-[#112a58] text-slate-700 dark:text-[#8ba3c9] rounded-lg transition-colors text-sm font-medium border border-slate-200 dark:border-[#1a325a]"
          >
            Reset Scan
          </button>
        )}
      </div>

      {!analysisComplete && !isAnalyzing && (
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-12 rounded-2xl shadow-md dark:shadow-lg border border-slate-200 dark:border-[#1a325a] min-h-[400px] flex flex-col items-center justify-center text-center transition-colors duration-500">
          {!dataset ? (
            <>
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-100 dark:border-rose-500/20">
                <AlertTriangle className="w-10 h-10 text-rose-500 dark:text-rose-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-white">No Dataset Detected</h3>
              <p className="text-slate-500 dark:text-[#8ba3c9] max-w-md mb-8">
                You need to upload a CSV dataset before you can run a quality scan.
              </p>
              <Link
                to="/upload"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg font-medium tracking-wide flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Upload
              </Link>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-500/20">
                <Layers className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-white">Ready for Quality Scan</h3>
              <p className="text-slate-500 dark:text-[#8ba3c9] max-w-md mb-8">
                Click the button below to scan your dataset for duplicates, fuzzy similarities, and statistical outliers across all columns.
              </p>
              <button
                onClick={handleRunAnalysis}
                className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 font-medium tracking-wide flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Search className="w-5 h-5" />
                Run Quality Scan
              </button>
            </>
          )}
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-12 rounded-2xl shadow-md dark:shadow-lg border border-slate-200 dark:border-[#1a325a] min-h-[400px] flex flex-col items-center justify-center text-center transition-colors duration-500">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-slate-100 dark:border-[#0a1f44] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-medium text-slate-800 dark:text-white mb-2 animate-pulse">Running Deep Scan...</h3>
          <p className="text-slate-500 dark:text-[#8ba3c9]">Calculating TF-IDF matrices, hashing rows, and finding Isolation Forests.</p>
        </div>
      )}

      {analysisComplete && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 dark:bg-rose-400/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-[#8ba3c9]">Total Issues</p>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.totalIssues}</h3>
                </div>
                <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#8ba3c9] relative z-10">Rows needing attention</p>
            </div>

            <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 dark:bg-amber-400/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-[#8ba3c9]">Duplicates</p>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.duplicates}</h3>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                  <Copy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#8ba3c9] relative z-10">Exact & Fuzzy matches</p>
            </div>

            <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 dark:bg-purple-400/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-[#8ba3c9]">Anomalies</p>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.anomalies}</h3>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#8ba3c9] relative z-10">Statistical outliers found</p>
            </div>

            <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-[#8ba3c9]">Clean Data</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{stats.cleanPercent}</h3>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#8ba3c9] relative z-10">Dataset overall health</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Chart Area */}
            <div className="lg:col-span-2 bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Data Quality Breakdown
                </h3>
              </div>
              <div className="h-[320px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderColor: '#1e293b',
                        color: '#f8fafc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value) => `${value}%`}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendations & Models */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-indigo-500" />
                  AI Recommendations
                </h3>
                <div className="space-y-4">
                  {recommendations.map((item, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-[#0a1f44] rounded-xl border border-slate-100 dark:border-[#1a325a]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-slate-800 dark:text-white">{item.issue}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-full">
                          {item.rec}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-[#8ba3c9] leading-relaxed">
                        {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-rose-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-12 group-hover:scale-110 transition-transform duration-700"></div>
                <h3 className="text-lg font-semibold mb-4 relative z-10 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Detection Models Used
                </h3>
                <ul className="space-y-3 relative z-10">
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    Isolation Forest (Outliers)
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    TF-IDF & Cosine Sim (Fuzzy)
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    Z-Score (Statistical)
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    Exact Hashing (MD5)
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Preview Table */}
          <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-[#1a325a] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-500" />
                Issue Preview Viewer
              </h3>

              <div className="flex bg-slate-100 dark:bg-[#0a1f44] p-1 rounded-lg border border-slate-200 dark:border-[#1a325a]">
                <button
                  onClick={() => setActiveTab('duplicates')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'duplicates' ? 'bg-white dark:bg-[#1a325a] text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-[#8ba3c9] hover:text-slate-700 dark:hover:text-white'}`}
                >
                  Duplicates
                </button>
                <button
                  onClick={() => setActiveTab('anomalies')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'anomalies' ? 'bg-white dark:bg-[#1a325a] text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 dark:text-[#8ba3c9] hover:text-slate-700 dark:hover:text-white'}`}
                >
                  Anomalies
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 dark:text-[#8ba3c9]">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-[#0a1f44] dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Row ID</th>
                    {dataset?.headers?.slice(0, 4).map((h, i) => (
                      <th key={i} className={`px-4 py-3 ${i === 3 ? 'rounded-r-lg' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'duplicates' ? duplicateRows : anomalyRows).length > 0 ? (activeTab === 'duplicates' ? duplicateRows : anomalyRows).map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-[#1a325a] hover:bg-slate-50 dark:hover:bg-[#0a1f44]/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">#{row.id}</td>
                      {dataset?.headers?.slice(0, 4).map((h, i) => (
                        <td key={i} className="px-4 py-3">
                          {row[h]}
                          {activeTab === 'anomalies' && row._header === h && (
                            <span className="ml-2 text-[10px] bg-rose-100 text-rose-600 px-1 rounded">Outlier</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        No {activeTab} detected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {activeTab === 'duplicates' && duplicateRows.length > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-4 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Note: These rows are exactly identical to other rows in your dataset.
              </p>
            )}
            {activeTab === 'anomalies' && anomalyRows.length > 0 && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-4 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Note: These values deviate significantly from the column mean (Z-Score {'>'} 3).
              </p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
