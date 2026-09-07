/**
 * Phase C — Dynamic Quality Score & Metrics Engine
 * Module: Sudhanshu
 * 
 * Objective:
 * Computes dynamic, non-hardcoded data quality scores from real dataset conditions.
 * Calculates scores across 5 standard industry dimensions:
 * 1. Completeness (% non-missing cells)
 * 2. Uniqueness (% distinct records)
 * 3. Validity (% values conforming to rules and domain ranges)
 * 4. Consistency (% values free of cross-column or category typos)
 * 5. Anomaly Health (% values free of severe statistical outliers)
 * 
 * Compares Original Dataset (Before) vs Final Cleaned Dataset (After)
 */

import { isMissingValue } from '../utils/dataProfiler.js';
import { runDetectionEngine } from '../utils/detectionEngine.js';

/**
 * Calculates a letter grade based on an overall score (0 - 100)
 */
export function getQualityGrade(score) {
  if (score >= 95) return { grade: 'A+', label: 'Pristine Quality', color: '#10b981' };
  if (score >= 90) return { grade: 'A', label: 'High Quality', color: '#34d399' };
  if (score >= 80) return { grade: 'B', label: 'Good Quality', color: '#3b82f6' };
  if (score >= 70) return { grade: 'C', label: 'Acceptable', color: '#f59e0b' };
  if (score >= 60) return { grade: 'D', label: 'Needs Improvement', color: '#f97316' };
  return { grade: 'F', label: 'Poor Quality', color: '#ef4444' };
}

/**
 * Computes individual dimension scores and composite dynamic quality score for a dataset.
 * 
 * @param {Array<Object>} rows - Dataset rows
 * @param {Array<string>} headers - Column headers (excluding __row_id)
 * @param {Object} [detection] - Precomputed detection engine output (optional)
 * @returns {Object} Quality metrics breakdown
 */
export function computeDynamicQualityMetrics(rows = [], headers = [], detection = null) {
  if (!rows || rows.length === 0 || !headers || headers.length === 0) {
    return {
      overallScore: 0,
      grade: getQualityGrade(0),
      dimensions: {
        completeness: 0,
        uniqueness: 0,
        validity: 0,
        consistency: 0,
        anomalyHealth: 0
      },
      counts: {
        totalRows: 0,
        totalColumns: 0,
        totalCells: 0,
        missingCells: 0,
        duplicateRows: 0,
        ruleViolations: 0,
        inconsistencies: 0,
        anomalies: 0
      }
    };
  }

  const cleanHeaders = headers.filter(h => h !== '__row_id');
  const totalRows = rows.length;
  const totalColumns = cleanHeaders.length;
  const totalCells = totalRows * totalColumns;

  // 1. Completeness: Count missing cells
  let missingCells = 0;
  rows.forEach(row => {
    cleanHeaders.forEach(col => {
      if (isMissingValue(row[col])) {
        missingCells++;
      }
    });
  });
  const completeness = totalCells > 0
    ? Math.max(0, Math.min(100, Math.round((1 - (missingCells / totalCells)) * 100)))
    : 100;

  // Run or use detection results for Uniqueness, Validity, Consistency, Anomaly Health
  const detResults = detection || runDetectionEngine(rows, cleanHeaders);
  const {
    duplicate_results = [],
    fuzzy_duplicate_results = [],
    anomaly_results = [],
    rule_violation_results = [],
    inconsistency_results = []
  } = detResults || {};

  // 2. Uniqueness: Penalize duplicate rows
  const exactDups = duplicate_results.length;
  const fuzzyDups = fuzzy_duplicate_results.length;
  const totalDups = exactDups + Math.round(fuzzyDups * 0.5);
  const uniqueness = totalRows > 0
    ? Math.max(0, Math.min(100, Math.round((1 - (totalDups / totalRows)) * 100)))
    : 100;

  // 3. Validity: Penalize rule violations
  const ruleViolations = rule_violation_results.length;
  const validity = totalRows > 0
    ? Math.max(0, Math.min(100, Math.round((1 - (ruleViolations / totalRows)) * 100)))
    : 100;

  // 4. Consistency: Penalize typos, category variants, cross-column mismatches
  const inconsistencies = inconsistency_results.length;
  const consistency = totalRows > 0
    ? Math.max(0, Math.min(100, Math.round((1 - (inconsistencies / totalRows)) * 100)))
    : 100;

  // 5. Anomaly Health: Penalize severe statistical and Isolation Forest outliers
  const anomalies = anomaly_results.length;
  const anomalyHealth = totalRows > 0
    ? Math.max(0, Math.min(100, Math.round((1 - (anomalies / totalRows)) * 100)))
    : 100;

  // Dynamic Weighted Composite Score
  // Weights: Completeness (25%), Validity (25%), Uniqueness (20%), Consistency (15%), Anomaly Health (15%)
  const overallScore = Math.round(
    completeness * 0.25 +
    validity * 0.25 +
    uniqueness * 0.20 +
    consistency * 0.15 +
    anomalyHealth * 0.15
  );

  return {
    overallScore,
    grade: getQualityGrade(overallScore),
    dimensions: {
      completeness,
      uniqueness,
      validity,
      consistency,
      anomalyHealth
    },
    counts: {
      totalRows,
      totalColumns,
      totalCells,
      missingCells,
      duplicateRows: exactDups + fuzzyDups,
      ruleViolations,
      inconsistencies,
      anomalies
    }
  };
}

/**
 * Computes a Before vs After quality comparison between the original dataset and cleaned dataset.
 * 
 * @param {Object} originalDataset - { headers: [], rows: [] }
 * @param {Object} cleanedDataset - { headers: [], rows: [] }
 * @param {Object} [originalDetection] - Pre-computed detection for original dataset
 * @returns {Object} Comprehensive before-vs-after comparison metrics
 */
export function computeBeforeAfterComparison(originalDataset, cleanedDataset, originalDetection = null) {
  if (!originalDataset || !originalDataset.rows) {
    return null;
  }

  const beforeMetrics = computeDynamicQualityMetrics(
    originalDataset.rows,
    originalDataset.headers,
    originalDetection
  );

  const cleanRows = (cleanedDataset && cleanedDataset.rows) ? cleanedDataset.rows : originalDataset.rows;
  const cleanHeaders = (cleanedDataset && cleanedDataset.headers) ? cleanedDataset.headers : originalDataset.headers;

  const afterMetrics = computeDynamicQualityMetrics(cleanRows, cleanHeaders);

  const deltaScore = afterMetrics.overallScore - beforeMetrics.overallScore;
  const relativeImprovement = beforeMetrics.overallScore > 0
    ? Number(((deltaScore / beforeMetrics.overallScore) * 100).toFixed(1))
    : 0;

  return {
    before: beforeMetrics,
    after: afterMetrics,
    delta: {
      overallScore: deltaScore,
      relativeImprovement,
      rowsDiff: afterMetrics.counts.totalRows - beforeMetrics.counts.totalRows,
      missingResolved: beforeMetrics.counts.missingCells - afterMetrics.counts.missingCells,
      duplicatesRemoved: beforeMetrics.counts.duplicateRows - afterMetrics.counts.duplicateRows,
      ruleViolationsFixed: beforeMetrics.counts.ruleViolations - afterMetrics.counts.ruleViolations,
      inconsistenciesCorrected: beforeMetrics.counts.inconsistencies - afterMetrics.counts.inconsistencies,
      anomaliesHandled: beforeMetrics.counts.anomalies - afterMetrics.counts.anomalies,
      dimensionsDelta: {
        completeness: afterMetrics.dimensions.completeness - beforeMetrics.dimensions.completeness,
        uniqueness: afterMetrics.dimensions.uniqueness - beforeMetrics.dimensions.uniqueness,
        validity: afterMetrics.dimensions.validity - beforeMetrics.dimensions.validity,
        consistency: afterMetrics.dimensions.consistency - beforeMetrics.dimensions.consistency,
        anomalyHealth: afterMetrics.dimensions.anomalyHealth - beforeMetrics.dimensions.anomalyHealth
      }
    }
  };
}
