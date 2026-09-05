import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { useDataset } from '../contexts/DatasetContext';
import { 
  CheckCircle2, FileText, UploadCloud, RefreshCcw, ArrowRight, 
  AlertTriangle, Database, Sparkles, Layers, ShieldCheck 
} from 'lucide-react';

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { originalDataset, workingDataset, metadata, loadDataset, clearDataset, loading, setLoading } = useDataset();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    clearDataset();
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (file) => {
    setErrorMessage(null);

    // Validation: File format
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setErrorMessage('Invalid file format. Please upload a standard .CSV file.');
      return;
    }

    // Validation: File size (e.g. 50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 50MB limit. Please upload a smaller CSV dataset.');
      return;
    }

    // Validation: Empty file
    if (file.size === 0) {
      setErrorMessage('The selected file is empty (0 bytes).');
      return;
    }

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => {
        const { data, meta, errors } = results;

        if (errors && errors.length > 0 && data.length === 0) {
          setLoading(false);
          setErrorMessage(`Failed to parse CSV: ${errors[0].message}`);
          return;
        }

        const fields = (meta.fields ? meta.fields.filter(f => f && f.trim() !== '') : []).filter(f => f !== '__row_id');

        if (!fields || fields.length === 0) {
          setLoading(false);
          setErrorMessage('CSV file must have a header row with valid column names.');
          return;
        }

        if (!data || data.length === 0) {
          setLoading(false);
          setErrorMessage('The CSV file does not contain any data rows.');
          return;
        }

        const fileMeta = {
          filename: file.name,
          totalRows: data.length,
          totalColumns: fields.length,
          fileSize: file.size < 1024 * 1024 
            ? (file.size / 1024).toFixed(2) + ' KB'
            : (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          uploadedAt: new Date().toLocaleTimeString()
        };

        // Populate both original_dataset and working_dataset in context
        loadDataset(fields, data, fileMeta);
        setLoading(false);
      },
      error: (error) => {
        setLoading(false);
        setErrorMessage(`Error reading file: ${error.message}`);
      }
    });
  };

  // Sample data loader for quick demonstration
  const handleLoadSampleData = () => {
    const sampleCSV = `name,age,email,city,salary
John Doe,25,john@example.com,New York,50000
Jane Smith,30,jane@example.com,London,60000
John Doe,25,john@example.com,New York,50000
Bob Brown,,bob@example.com,Paris,
Alice Green,22,,Berlin,70000
Charlie Black,35,charlie@example.com,,
Jane Smith,30,jane@example.com,London,60000
Eve White,28,eve@example.com,San Francisco,1500000
Frank Blue,40,frank@example.com,Chicago,-5000
Grace Lee,29,grace@example.com,Tokyo,85000
David Miller,,david@example.com,Sydney,92000
Sarah Connor,33,sarah@example.com,Los Angeles,110000`;

    setLoading(true);
    Papa.parse(sampleCSV, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, meta } = results;
        loadDataset(meta.fields, data, {
          filename: 'customer_benchmark_sample.csv',
          totalRows: data.length,
          totalColumns: meta.fields.length,
          fileSize: '1.24 KB',
          uploadedAt: new Date().toLocaleTimeString()
        });
        setLoading(false);
      }
    });
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto text-slate-800 dark:text-white transition-colors duration-500 pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full text-xs font-semibold tracking-wider uppercase">
            Data Ingestion
          </span>
          <span className="text-xs text-slate-400 dark:text-[#8ba3c9]">Step 1 of 8</span>
        </div>
        <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors">
          Dataset Upload & Ingestion
        </h2>
        <p className="text-slate-500 dark:text-[#8ba3c9] mt-2 font-light transition-colors">
          Upload a raw CSV dataset. The system preserves an immutable <code className="text-xs bg-slate-100 dark:bg-[#0a1f44] px-1.5 py-0.5 rounded font-mono text-blue-600 dark:text-blue-400">original_dataset</code> and generates an active <code className="text-xs bg-slate-100 dark:bg-[#0a1f44] px-1.5 py-0.5 rounded font-mono text-indigo-600 dark:text-indigo-400">working_dataset</code> for intelligent auditing.
        </p>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv,text/csv,application/vnd.ms-excel" 
        className="hidden" 
      />

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-700 dark:text-rose-300 animate-fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1 text-sm font-medium">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Success State Card */}
      {metadata && originalDataset ? (
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-md dark:shadow-lg border border-slate-200 dark:border-[#1a325a] flex flex-col items-center justify-center transition-all duration-500">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-100 dark:border-emerald-500/20 animate-scale-up">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{metadata.filename}</h3>
          </div>
          
          {/* Upload Status Box */}
          <div className="my-6 w-full max-w-lg bg-slate-50 dark:bg-[#0a1f44]/80 p-5 rounded-xl border border-slate-200 dark:border-[#1a325a]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Rows</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{metadata.totalRows.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Columns</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{metadata.totalColumns}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">File Size</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{metadata.fileSize}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Upload Status</p>
                <p className="text-sm font-bold text-emerald-500 mt-2 flex items-center justify-center gap-1">
                  <span>✓</span> Successful
                </p>
              </div>
            </div>
          </div>

          {/* Dataset Copies Architecture Indicator */}
          <div className="w-full max-w-lg mb-8 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-[#08204d]/40 border border-blue-200 dark:border-blue-500/20 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div>
                <span className="font-semibold text-blue-800 dark:text-blue-300">original_dataset:</span>
                <span className="text-slate-500 dark:text-[#8ba3c9] block">Preserved &amp; Locked</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-[#132247]/40 border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <div>
                <span className="font-semibold text-indigo-800 dark:text-indigo-300">working_dataset:</span>
                <span className="text-slate-500 dark:text-[#8ba3c9] block">Ready for Profiling</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-slate-100 dark:bg-[#0a1f44] text-slate-700 dark:text-white font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-[#112a58] transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-[#1a325a]"
            >
              <RefreshCcw className="w-4 h-4" />
              Reset &amp; Upload New
            </button>
            <button 
              onClick={() => navigate('/preview')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Continue to Profiling
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Area */
        <div className="space-y-6">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-12 rounded-2xl shadow-md dark:shadow-lg border-2 border-dashed flex flex-col items-center justify-center min-h-[350px] transition-all duration-300 cursor-pointer group ${
              isDragging 
                ? 'border-blue-500 dark:border-[#5491f5] bg-blue-50 dark:bg-[#0a2352]' 
                : 'border-blue-300 dark:border-[#1a325a] hover:border-blue-500 dark:hover:border-[#5491f5] hover:bg-slate-50 dark:hover:bg-[#081a3d]'
            }`}
          >
            <div className="w-24 h-24 bg-blue-50 dark:bg-[#0a2352] border border-blue-100 dark:border-[#1a325a] rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-[#113677] transition-all duration-500 shadow-sm dark:shadow-[0_0_30px_rgba(84,145,245,0.1)]">
              <UploadCloud className="w-10 h-10 text-blue-500 dark:text-[#5491f5] group-hover:text-blue-700 dark:group-hover:text-white transition-colors" />
            </div>
            
            <h3 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-white transition-colors">
              Drag and drop your raw CSV dataset here
            </h3>
            <p className="text-slate-500 dark:text-[#8ba3c9] font-light mb-8 transition-colors text-center max-w-md">
              Supports standard comma-delimited files (.csv). Automatic delimiter detection, data type inference, and validation.
            </p>
            
            <button 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Select CSV File
            </button>
          </div>

          {/* Quick Benchmark Sample Loader */}
          <div className="bg-slate-50 dark:bg-[#05142e]/50 p-5 rounded-xl border border-slate-200 dark:border-[#1a325a] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Need a test dataset?</h4>
                <p className="text-xs text-slate-500 dark:text-[#8ba3c9]">Load our pre-packaged benchmark dataset with realistic missing values, outliers, and duplicates.</p>
              </div>
            </div>
            <button
              onClick={handleLoadSampleData}
              disabled={loading}
              className="px-4 py-2 bg-white dark:bg-[#0a1f44] hover:bg-slate-100 dark:hover:bg-[#112a58] text-blue-600 dark:text-blue-300 text-xs font-semibold rounded-lg border border-blue-200 dark:border-[#1a325a] transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Benchmark Sample CSV
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center text-xs text-slate-400 dark:text-[#4a6b9c] font-light tracking-wide transition-colors">
        Supported formats: .csv (Max size: 50MB) &bull; Preserves raw original dataset &bull; Client-side security
      </div>
    </div>
  );
}
