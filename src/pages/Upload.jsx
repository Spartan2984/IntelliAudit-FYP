import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { useDataset } from '../contexts/DatasetContext';
import { CheckCircle2, FileText, UploadCloud, RefreshCcw, ArrowRight } from 'lucide-react';

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { dataset, setDataset, metadata, setMetadata, setLoading } = useDataset();

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
    setDataset(null);
    setMetadata(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (file) => {
    setLoading(true);
    
    // Parse CSV using PapaParse
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, meta } = results;
        
        setDataset({
          headers: meta.fields || [],
          rows: data
        });
        
        setMetadata({
          filename: file.name,
          totalRows: data.length,
          totalColumns: meta.fields ? meta.fields.length : 0,
          fileSize: (file.size / 1024).toFixed(2) + ' KB'
        });
        
        setLoading(false);
        // We stay on the page now to show the success state
      },
      error: (error) => {
        console.error("Error parsing file:", error);
        setLoading(false);
        alert("Failed to parse file. Ensure it's a valid CSV.");
      }
    });
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto text-slate-800 dark:text-white transition-colors duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-wide text-slate-900 dark:text-white transition-colors">Upload Dataset</h2>
        <p className="text-slate-500 dark:text-[#8ba3c9] mt-2 font-light transition-colors">Provide the raw CSV dataset to begin the auditing process.</p>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        className="hidden" 
      />

      {metadata ? (
        <div className="bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-12 rounded-2xl shadow-md dark:shadow-lg border border-slate-200 dark:border-[#1a325a] flex flex-col items-center justify-center min-h-[350px] transition-all duration-500">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-100 dark:border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="text-2xl font-semibold text-slate-800 dark:text-white">{metadata.filename}</h3>
          </div>
          <p className="text-slate-500 dark:text-[#8ba3c9] mb-8 font-light">
            {metadata.totalRows.toLocaleString()} rows and {metadata.totalColumns} columns detected.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleReset}
              className="px-8 py-3 bg-slate-100 dark:bg-[#0a1f44] text-slate-700 dark:text-white font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-[#112a58] transition-all flex items-center gap-2 border border-slate-200 dark:border-[#1a325a]"
            >
              <RefreshCcw className="w-4 h-4" />
              Reset & Upload New
            </button>
            <button 
              onClick={() => navigate('/preview')}
              className="px-8 py-3 bg-blue-600 dark:bg-[#113677] text-white font-medium rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-[#1a4080] transition-all flex items-center gap-2"
            >
              Continue to Preview
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`bg-white dark:bg-[#05142e]/80 backdrop-blur-sm p-12 rounded-2xl shadow-md dark:shadow-lg border-2 border-dashed flex flex-col items-center justify-center min-h-[350px] transition-all duration-300 cursor-pointer group ${isDragging ? 'border-blue-500 dark:border-[#5491f5] bg-blue-50 dark:bg-[#0a2352]' : 'border-blue-300 dark:border-[#1a325a] hover:border-blue-500 dark:hover:border-[#5491f5] hover:bg-slate-50 dark:hover:bg-[#081a3d]'}`}
        >
          <div className="w-24 h-24 bg-blue-50 dark:bg-[#0a2352] border border-blue-100 dark:border-[#1a325a] rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-[#113677] transition-all duration-500 shadow-sm dark:shadow-[0_0_30px_rgba(84,145,245,0.1)]">
            <UploadCloud className="w-10 h-10 text-blue-500 dark:text-[#5491f5] group-hover:text-blue-700 dark:group-hover:text-white transition-colors" />
          </div>
          
          <h3 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-white transition-colors">Drag and drop your file here</h3>
          <p className="text-slate-500 dark:text-[#8ba3c9] font-light mb-8 transition-colors">or click to browse your computer</p>
          
          <button 
            onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
            className="px-10 py-4 bg-blue-600 dark:bg-[#113677] text-white font-medium rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-[#1a4080] hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(84,145,245,0.4)] transition-all duration-300 transform hover:-translate-y-1"
          >
            Select File
          </button>
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-slate-400 dark:text-[#4a6b9c] font-light tracking-wide transition-colors">
        Supported formats: .csv (Max size: 50MB)
      </div>
    </div>
  );
}
