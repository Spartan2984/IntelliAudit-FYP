import React, { createContext, useState, useContext, useCallback } from 'react';
import { computeDatasetProfile } from '../utils/dataProfiler.js';
import { generateMissingRecommendations, executeImputation } from '../utils/missingHandler.js';

const DatasetContext = createContext();

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}

export function DatasetProvider({ children }) {
  // Original Dataset: Immutable master copy
  const [originalDataset, setOriginalDataset] = useState(null); // { headers: [], rows: [] }
  
  // Working Dataset: Active copy on which operations are applied
  const [workingDataset, setWorkingDataset] = useState(null); // { headers: [], rows: [] }

  // Metadata & Profile
  const [metadata, setMetadata] = useState(null);
  const [datasetProfile, setDatasetProfile] = useState(null);
  const [columnMetadata, setColumnMetadata] = useState([]);
  
  // Missing Value Analysis & Recommendations
  const [missingRecommendations, setMissingRecommendations] = useState([]);
  const [imputationResults, setImputationResults] = useState([]);
  
  // Audit Trail
  const [auditLog, setAuditLog] = useState([]);
  
  // Loading & UI state
  const [loading, setLoading] = useState(false);

  /**
   * Initializes and profiles the uploaded dataset
   */
  const loadDataset = useCallback((headers, rows, fileMeta) => {
    // Deep clone rows to ensure original is strictly immutable
    const rawOriginalRows = rows.map(r => ({ ...r }));
    const rawWorkingRows = rows.map(r => ({ ...r }));

    const orig = { headers: [...headers], rows: rawOriginalRows };
    const work = { headers: [...headers], rows: rawWorkingRows };

    setOriginalDataset(orig);
    setWorkingDataset(work);

    const profile = computeDatasetProfile(headers, rawWorkingRows, fileMeta);
    setDatasetProfile(profile);

    if (profile && profile.columns) {
      setColumnMetadata(profile.columns);
      const recs = generateMissingRecommendations(profile.columns);
      setMissingRecommendations(recs);
    } else {
      setColumnMetadata([]);
      setMissingRecommendations([]);
    }

    setMetadata({
      filename: fileMeta.filename || 'dataset.csv',
      totalRows: rows.length,
      totalColumns: headers.length,
      fileSize: fileMeta.fileSize || 'N/A',
      uploadedAt: new Date().toLocaleTimeString(),
      status: 'Ready'
    });

    setImputationResults([]);
    setAuditLog([
      {
        id: 'log-0',
        timestamp: new Date().toLocaleTimeString(),
        action: 'Dataset Upload',
        category: 'Ingestion',
        details: `Loaded ${rows.length.toLocaleString()} rows and ${headers.length} columns from ${fileMeta.filename || 'CSV'}. Original copy preserved.`,
        status: 'Success'
      }
    ]);
  }, []);

  /**
   * Applies an approved imputation on working_dataset
   */
  const runImputation = useCallback((column, method, customValue = '', reason = '') => {
    if (!workingDataset || !workingDataset.rows) return null;

    const result = executeImputation(workingDataset.rows, column, method, customValue);
    
    // Create new working dataset
    const newWorking = {
      headers: [...workingDataset.headers],
      rows: result.updatedRows
    };
    setWorkingDataset(newWorking);

    // Recompute profile for updated working dataset
    const updatedProfile = computeDatasetProfile(newWorking.headers, newWorking.rows, metadata || {});
    setDatasetProfile(updatedProfile);

    if (updatedProfile && updatedProfile.columns) {
      setColumnMetadata(updatedProfile.columns);
      const updatedRecs = generateMissingRecommendations(updatedProfile.columns);
      setMissingRecommendations(updatedRecs);
    }

    // Add to imputation results
    const impRecord = {
      id: `imp-${Date.now()}`,
      column,
      method,
      replacementValue: result.replacementValue,
      affectedRowCount: result.affectedRowCount,
      timestamp: new Date().toLocaleTimeString(),
      reason: reason || `Applied ${method} imputation.`
    };
    setImputationResults(prev => [...prev, impRecord]);

    // Add to audit log
    const auditRecord = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action: `Missing Value Imputation (${method})`,
      category: 'Cleaning',
      details: `Replaced ${result.affectedRowCount} missing cells in column '${column}' with value '${result.replacementValue}'.`,
      status: 'Approved & Applied'
    };
    setAuditLog(prev => [...prev, auditRecord]);

    return impRecord;
  }, [workingDataset, metadata]);

  /**
   * Batch applies all approved recommendations
   */
  const runBatchImputations = useCallback((recsToApply) => {
    if (!workingDataset || !workingDataset.rows || !recsToApply || recsToApply.length === 0) return;

    let currentRows = workingDataset.rows.map(r => ({ ...r }));
    const appliedRecords = [];
    const newLogs = [];

    recsToApply.forEach(rec => {
      const res = executeImputation(currentRows, rec.column, rec.recommendedMethod, rec.suggestedValue);
      currentRows = res.updatedRows;

      appliedRecords.push({
        id: `imp-${Date.now()}-${rec.column}`,
        column: rec.column,
        method: rec.recommendedMethod,
        replacementValue: res.replacementValue,
        affectedRowCount: res.affectedRowCount,
        timestamp: new Date().toLocaleTimeString(),
        reason: rec.reason
      });

      newLogs.push({
        id: `log-${Date.now()}-${rec.column}`,
        timestamp: new Date().toLocaleTimeString(),
        action: `Batch Imputation (${rec.recommendedMethod})`,
        category: 'Cleaning',
        details: `Replaced ${res.affectedRowCount} missing cells in '${rec.column}' with '${res.replacementValue}'.`,
        status: 'Approved & Applied'
      });
    });

    const newWorking = {
      headers: [...workingDataset.headers],
      rows: currentRows
    };
    setWorkingDataset(newWorking);

    const updatedProfile = computeDatasetProfile(newWorking.headers, newWorking.rows, metadata || {});
    setDatasetProfile(updatedProfile);

    if (updatedProfile && updatedProfile.columns) {
      setColumnMetadata(updatedProfile.columns);
      const updatedRecs = generateMissingRecommendations(updatedProfile.columns);
      setMissingRecommendations(updatedRecs);
    }

    setImputationResults(prev => [...prev, ...appliedRecords]);
    setAuditLog(prev => [...prev, ...newLogs]);
  }, [workingDataset, metadata]);

  /**
   * Reverts working dataset back to original dataset
   */
  const resetToOriginal = useCallback(() => {
    if (!originalDataset) return;
    const restoredRows = originalDataset.rows.map(r => ({ ...r }));
    const restoredDataset = { headers: [...originalDataset.headers], rows: restoredRows };
    
    setWorkingDataset(restoredDataset);

    const restoredProfile = computeDatasetProfile(restoredDataset.headers, restoredDataset.rows, metadata || {});
    setDatasetProfile(restoredProfile);

    if (restoredProfile && restoredProfile.columns) {
      setColumnMetadata(restoredProfile.columns);
      const restoredRecs = generateMissingRecommendations(restoredProfile.columns);
      setMissingRecommendations(restoredRecs);
    }

    setImputationResults([]);
    setAuditLog(prev => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action: 'Reset to Original',
        category: 'Rollback',
        details: 'Reverted working dataset back to original uncleaned state.',
        status: 'Restored'
      }
    ]);
  }, [originalDataset, metadata]);

  const clearDataset = useCallback(() => {
    setOriginalDataset(null);
    setWorkingDataset(null);
    setMetadata(null);
    setDatasetProfile(null);
    setColumnMetadata([]);
    setMissingRecommendations([]);
    setImputationResults([]);
    setAuditLog([]);
  }, []);

  // Backward compatibility alias: `dataset` refers to `workingDataset`
  const dataset = workingDataset;
  const setDataset = (data) => {
    if (data && data.headers && data.rows) {
      loadDataset(data.headers, data.rows, metadata || {});
    }
  };

  const value = {
    // Datasets (Both camelCase and snake_case Phase A outputs)
    originalDataset,
    workingDataset,
    original_dataset: originalDataset,
    working_dataset: workingDataset,
    dataset, // alias for workingDataset
    setDataset,
    
    // Metadata & Profiles
    metadata,
    setMetadata,
    datasetProfile,
    dataset_profile: datasetProfile,
    columnMetadata,
    column_metadata: columnMetadata,
    
    // Missing & Imputation
    missingRecommendations,
    missing_value_report: missingRecommendations,
    imputationResults,
    imputation_results: imputationResults,
    
    // Audit Trail
    auditLog,
    audit_log: auditLog,
    
    // State & Handlers
    loading,
    setLoading,
    loadDataset,
    runImputation,
    runBatchImputations,
    resetToOriginal,
    clearDataset
  };

  return (
    <DatasetContext.Provider value={value}>
      {children}
    </DatasetContext.Provider>
  );
}
