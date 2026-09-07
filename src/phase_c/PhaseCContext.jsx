/**
 * Phase C Context & State Provider
 * Module: Sudhanshu
 * 
 * Objective:
 * Central reactive store managing explainable recommendations, user approval decisions,
 * cleaning engine execution, dynamic quality scoring, and audit reports.
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useDataset } from '../contexts/DatasetContext';
import { generateExplainableRecommendations } from './recommendationEngine.js';
import { executeApprovedCleaning } from './cleaningEngine.js';
import { computeBeforeAfterComparison } from './qualityMetrics.js';
import { 
  buildAuditReportData, 
  downloadCleanedCSV, 
  downloadAuditReportJSON, 
  downloadAuditReportMarkdown 
} from './auditReportGenerator.js';
import { runDetectionEngine } from '../utils/detectionEngine.js';

const PhaseCContext = createContext(null);

export function usePhaseC() {
  const context = useContext(PhaseCContext);
  if (!context) {
    throw new Error('usePhaseC must be used within a PhaseCProvider');
  }
  return context;
}

export function PhaseCProvider({ children }) {
  const {
    originalDataset,
    columnMetadata,
    missingRecommendations,
    detectionResults,
    setDetectionResults,
    metadata,
    auditLog,
    profilingOptions
  } = useDataset();

  // User decisions map keyed by recommendation ID: { status, userCustomValue, suggestedAction }
  const [userDecisions, setUserDecisions] = useState({});
  const [hasExecutedCleaning, setHasExecutedCleaning] = useState(false);
  const [cleanedDatasetState, setCleanedDatasetState] = useState(null);
  const [cleaningSummaryState, setCleaningSummaryState] = useState(null);
  const [appliedOpsState, setAppliedOpsState] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterConfidence, setFilterConfidence] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-run detection engine if not already run for uploaded dataset
  useEffect(() => {
    if (originalDataset && originalDataset.rows && originalDataset.rows.length > 0) {
      const summary = detectionResults?.detection_summary;
      if (!summary && originalDataset.headers) {
        const cleanHeaders = originalDataset.headers.filter(h => h !== '__row_id');
        const autoDet = runDetectionEngine(originalDataset.rows, cleanHeaders);
        if (typeof setDetectionResults === 'function') {
          setDetectionResults(autoDet);
        }
      }
    }
  }, [originalDataset, detectionResults, setDetectionResults]);

  // Generate base recommendations dynamically
  const baseRecommendations = useMemo(() => {
    if (!originalDataset || !originalDataset.rows || originalDataset.rows.length === 0) {
      return [];
    }
    return generateExplainableRecommendations({
      rows: originalDataset.rows,
      headers: originalDataset.headers || [],
      columnMetadata: columnMetadata || [],
      missingRecommendations: missingRecommendations || [],
      detectionResults: detectionResults || {}
    });
  }, [originalDataset, columnMetadata, missingRecommendations, detectionResults]);

  // Combine base recommendations with live user decisions
  const recommendations = useMemo(() => {
    return baseRecommendations.map(rec => {
      const override = userDecisions[rec.id];
      if (override) {
        return {
          ...rec,
          ...override
        };
      }
      return rec;
    });
  }, [baseRecommendations, userDecisions]);

  // Derived approved recommendations
  const approvedRecommendations = useMemo(() => {
    return recommendations.filter(r => r.status === 'approved' || r.status === 'edited');
  }, [recommendations]);

  // User Approval Action: Approve
  const approveRecommendation = useCallback((recId) => {
    setUserDecisions(prev => ({
      ...prev,
      [recId]: { ...(prev[recId] || {}), status: 'approved' }
    }));
  }, []);

  // User Approval Action: Reject
  const rejectRecommendation = useCallback((recId) => {
    setUserDecisions(prev => ({
      ...prev,
      [recId]: { ...(prev[recId] || {}), status: 'rejected' }
    }));
  }, []);

  // User Approval Action: Ignore
  const ignoreRecommendation = useCallback((recId) => {
    setUserDecisions(prev => ({
      ...prev,
      [recId]: { ...(prev[recId] || {}), status: 'ignored' }
    }));
  }, []);

  // User Approval Action: Edit Value
  const editRecommendation = useCallback((recId, customValue, customAction = null) => {
    setUserDecisions(prev => ({
      ...prev,
      [recId]: {
        ...(prev[recId] || {}),
        status: 'edited',
        userCustomValue: customValue,
        ...(customAction ? { suggestedAction: customAction } : {})
      }
    }));
  }, []);

  // Bulk Approval: Approve All High Confidence (>= 90%)
  const approveAllHighConfidence = useCallback(() => {
    setUserDecisions(prev => {
      const updated = { ...prev };
      baseRecommendations.forEach(r => {
        const currentStatus = (prev[r.id]?.status) || r.status;
        if (r.confidenceLevel === 'High' && currentStatus === 'pending') {
          updated[r.id] = { ...(updated[r.id] || {}), status: 'approved' };
        }
      });
      return updated;
    });
  }, [baseRecommendations]);

  // Bulk Approval: Approve All Pending
  const approveAll = useCallback(() => {
    setUserDecisions(prev => {
      const updated = { ...prev };
      baseRecommendations.forEach(r => {
        updated[r.id] = { ...(updated[r.id] || {}), status: 'approved' };
      });
      return updated;
    });
  }, [baseRecommendations]);

  // Bulk Rejection: Reject All Pending
  const rejectAll = useCallback(() => {
    setUserDecisions(prev => {
      const updated = { ...prev };
      baseRecommendations.forEach(r => {
        updated[r.id] = { ...(updated[r.id] || {}), status: 'rejected' };
      });
      return updated;
    });
  }, [baseRecommendations]);

  // Reset Approvals to Pending
  const resetApprovals = useCallback(() => {
    setUserDecisions({});
    setHasExecutedCleaning(false);
    setCleanedDatasetState(null);
  }, []);

  // Execute Cleaning Engine on Approved Recommendations
  const executeCleaning = useCallback(() => {
    if (!originalDataset || !originalDataset.rows) return null;

    const result = executeApprovedCleaning({
      rows: originalDataset.rows,
      headers: originalDataset.headers,
      approvedRecommendations,
      columnMetadata: columnMetadata || [],
      profilingOptions: profilingOptions || {}
    });

    const finalCleaned = {
      headers: [...originalDataset.headers],
      rows: result.cleanedRows
    };

    setCleanedDatasetState(finalCleaned);
    setCleaningSummaryState(result.summary);
    setAppliedOpsState(result.appliedOperations);
    setHasExecutedCleaning(true);

    return result;
  }, [originalDataset, approvedRecommendations, columnMetadata, profilingOptions]);

  // Cleaned dataset (defaults to execution result, or auto-evaluates approved ops)
  const finalCleanedDataset = useMemo(() => {
    if (cleanedDatasetState) return cleanedDatasetState;
    if (!originalDataset || !originalDataset.rows) return null;

    if (approvedRecommendations.length > 0) {
      const result = executeApprovedCleaning({
        rows: originalDataset.rows,
        headers: originalDataset.headers,
        approvedRecommendations,
        columnMetadata: columnMetadata || [],
        profilingOptions: profilingOptions || {}
      });
      return {
        headers: [...originalDataset.headers],
        rows: result.cleanedRows
      };
    }

    return originalDataset;
  }, [cleanedDatasetState, originalDataset, approvedRecommendations, columnMetadata, profilingOptions]);

  // Compute Before vs After Quality Comparison
  const qualityComparison = useMemo(() => {
    if (!originalDataset || !originalDataset.rows) return null;
    return computeBeforeAfterComparison(originalDataset, finalCleanedDataset, detectionResults);
  }, [originalDataset, finalCleanedDataset, detectionResults]);

  // Build Audit Report Data Structure
  const auditReportData = useMemo(() => {
    return buildAuditReportData({
      filename: metadata?.filename || 'dataset.csv',
      originalDataset,
      cleanedDataset: finalCleanedDataset,
      recommendations,
      appliedOperations: appliedOpsState.length > 0 ? appliedOpsState : approvedRecommendations,
      auditLog: auditLog || [],
      qualityComparison,
      cleaningSummary: cleaningSummaryState || {
        duplicatesRemoved: qualityComparison?.delta?.duplicatesRemoved || 0,
        anomaliesHandled: qualityComparison?.delta?.anomaliesHandled || 0,
        typosCorrected: qualityComparison?.delta?.inconsistenciesCorrected || 0,
        ruleViolationsFixed: qualityComparison?.delta?.ruleViolationsFixed || 0,
        missingValuesImputed: qualityComparison?.delta?.missingResolved || 0
      }
    });
  }, [metadata, originalDataset, finalCleanedDataset, recommendations, appliedOpsState, approvedRecommendations, auditLog, qualityComparison, cleaningSummaryState]);

  // Export handlers
  const handleDownloadCSV = useCallback(() => {
    downloadCleanedCSV(finalCleanedDataset, metadata?.filename || 'dataset.csv');
  }, [finalCleanedDataset, metadata]);

  const handleDownloadReportJSON = useCallback(() => {
    downloadAuditReportJSON(auditReportData, metadata?.filename || 'dataset.csv');
  }, [auditReportData, metadata]);

  const handleDownloadReportMD = useCallback(() => {
    downloadAuditReportMarkdown(auditReportData, metadata?.filename || 'dataset.csv');
  }, [auditReportData, metadata]);

  const value = {
    // Recommendations (C.1, C.2, C.3)
    recommendations,
    approvedRecommendations,
    hasExecutedCleaning,
    filterCategory,
    setFilterCategory,
    filterConfidence,
    setFilterConfidence,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,

    // User Approval Controls (C.4)
    approveRecommendation,
    rejectRecommendation,
    ignoreRecommendation,
    editRecommendation,
    approveAllHighConfidence,
    approveAll,
    rejectAll,
    resetApprovals,

    // Cleaning Engine (C.5)
    executeCleaning,
    finalCleanedDataset,
    final_cleaned_dataset: finalCleanedDataset,
    appliedOperations: appliedOpsState,
    cleaningSummary: cleaningSummaryState,

    // Dynamic Quality Metrics & Before/After (C.6, C.7)
    qualityComparison,
    quality_metrics: qualityComparison?.after || null,
    before_after_metrics: qualityComparison || null,

    // Audit Report & Downloads (C.8, C.10, C.11)
    auditReportData,
    handleDownloadCSV,
    handleDownloadReportJSON,
    handleDownloadReportMD
  };

  return (
    <PhaseCContext.Provider value={value}>
      {children}
    </PhaseCContext.Provider>
  );
}
