/**
 * Missing Value Processing and Recommendation Engine
 * Handles explainable AI-driven recommendations, confidence scoring, and imputation algorithms.
 */

import { isMissingValue, computeNumericStats, computeCategoricalStats } from './dataProfiler.js';

/**
 * Generates explainable recommendations for all columns with missing values
 * @param {Array<Object>} columnsMetadata 
 * @returns {Array<Object>}
 */
export function generateMissingRecommendations(columnsMetadata) {
  if (!columnsMetadata || columnsMetadata.length === 0) return [];

  const recommendations = [];

  columnsMetadata.forEach(col => {
    if (col.missingCount === 0) return;

    let rec = {
      column: col.name,
      dataType: col.dataType,
      missingCount: col.missingCount,
      missingPercentage: col.missingPercentage,
      recommendedMethod: 'Median',
      confidence: 85,
      reason: '',
      alternativeMethods: [],
      suggestedValue: null
    };

    if (col.dataType === 'Integer' || col.dataType === 'Float') {
      const stats = col.stats || {};
      const isSkewed = stats.isSkewed || Math.abs(stats.skewness || 0) > 0.8;
      const calculatedMedian = stats.median !== undefined ? stats.median : 0;
      const calculatedMean = stats.mean !== undefined ? stats.mean : 0;

      if (col.missingPercentage > 50) {
        rec.recommendedMethod = 'Median';
        rec.confidence = 78;
        rec.suggestedValue = calculatedMedian;
        rec.reason = `Severe missingness (${col.missingPercentage}% missing). Median imputation (${calculatedMedian}) is recommended as a neutral fallback, but consider dropping this column if non-critical.`;
        rec.alternativeMethods = ['Mean', 'Custom Value', 'Drop Rows'];
      } else if (isSkewed) {
        const confScore = Math.min(96, Math.max(82, 85 + Math.round(Math.abs(stats.skewness || 1) * 3)));
        rec.recommendedMethod = 'Median';
        rec.confidence = confScore;
        rec.suggestedValue = calculatedMedian;
        rec.reason = `The column is skewed (skewness: ${stats.skewness}) and contains extreme variance (IQR: ${stats.iqr}). The median (${calculatedMedian}) is robust against outlier distortion and preserves realistic distributions.`;
        rec.alternativeMethods = ['Mean', 'Custom Value', 'Drop Rows'];
      } else {
        const confScore = Math.min(94, Math.max(85, 90 - Math.round(Math.abs(stats.skewness || 0) * 5)));
        rec.recommendedMethod = 'Mean';
        rec.confidence = confScore;
        rec.suggestedValue = calculatedMean;
        rec.reason = `The column exhibits a symmetric distribution (skewness: ${stats.skewness}). Mean imputation (${calculatedMean}) preserves the dataset's central tendency and arithmetic expectation.`;
        rec.alternativeMethods = ['Median', 'Custom Value', 'Drop Rows'];
      }
    } else if (col.dataType === 'Boolean') {
      const stats = col.stats || {};
      rec.recommendedMethod = 'Mode';
      rec.confidence = 92;
      rec.suggestedValue = stats.mode || 'false';
      rec.reason = `Binary categorical attribute. Mode imputation ('${stats.mode}') matches the majority class (${stats.modePercentage}% of known records).`;
      rec.alternativeMethods = ['Custom Value', 'Drop Rows'];
    } else if (col.dataType === 'Date') {
      const stats = col.stats || {};
      rec.recommendedMethod = 'Mode';
      rec.confidence = 80;
      rec.suggestedValue = stats.mode || 'N/A';
      rec.reason = `Temporal column. Imputing with the most common date entry ('${stats.mode}') or using a dedicated sentinel date is advised.`;
      rec.alternativeMethods = ['Custom Value', 'Drop Rows'];
    } else if (col.dataType === 'ID / Key') {
      rec.recommendedMethod = 'Drop Rows';
      rec.confidence = 94;
      rec.suggestedValue = null;
      rec.reason = `Unique identifier feature. Imputing synthetic IDs can cause false primary key collisions; deleting affected rows or manually assigning unique IDs is necessary.`;
      rec.alternativeMethods = ['Custom Value'];
    } else {
      // General Categorical
      const stats = col.stats || {};
      const modeVal = stats.mode || 'Unknown';
      const modePct = stats.modePercentage || 0;

      if (stats.uniqueCount > 50 && col.missingPercentage > 20) {
        rec.recommendedMethod = 'Custom Value';
        rec.confidence = 84;
        rec.suggestedValue = 'Unknown';
        rec.reason = `High-cardinality categorical column (${stats.uniqueCount} distinct values). Assigning a constant placeholder ('Unknown') prevents artificially inflating category frequencies.`;
        rec.alternativeMethods = ['Mode', 'Drop Rows'];
      } else {
        rec.recommendedMethod = 'Mode';
        rec.confidence = modePct > 50 ? 92 : 86;
        rec.suggestedValue = modeVal;
        rec.reason = `Categorical attribute with dominant class '${modeVal}' (${modePct}% of observed data). Mode imputation replaces missing entries with the most representative category.`;
        rec.alternativeMethods = ['Custom Value', 'Drop Rows'];
      }
    }

    recommendations.push(rec);
  });

  return recommendations;
}

/**
 * Executes imputation on a dataset for a specific column and method
 * @param {Array<Object>} rows 
 * @param {string} column 
 * @param {string} method ('Mean' | 'Median' | 'Mode' | 'Custom Value' | 'Drop Rows')
 * @param {any} customValue 
 * @returns {Object} { updatedRows, replacementValue, affectedRowCount, affectedIndices, auditEntry }
 */
export function executeImputation(rows, column, method, customValue = '') {
  if (!rows || rows.length === 0 || !column) {
    throw new Error('Invalid parameters for imputation');
  }

  const updatedRows = rows.map(r => ({ ...r }));
  const affectedIndices = [];

  // Find all rows where column is missing
  updatedRows.forEach((row, idx) => {
    if (isMissingValue(row[column])) {
      affectedIndices.push(idx);
    }
  });

  if (affectedIndices.length === 0) {
    return {
      updatedRows,
      replacementValue: null,
      affectedRowCount: 0,
      affectedIndices: [],
      column,
      method,
      timestamp: new Date().toISOString()
    };
  }

  let replacementValue = null;

  if (method === 'Drop Rows') {
    const filteredRows = updatedRows.filter(r => !isMissingValue(r[column]));
    return {
      updatedRows: filteredRows,
      replacementValue: '[REMOVED]',
      affectedRowCount: affectedIndices.length,
      affectedIndices,
      column,
      method: 'Drop Rows',
      timestamp: new Date().toISOString()
    };
  }

  const nonMissingValues = updatedRows
    .filter(r => !isMissingValue(r[column]))
    .map(r => r[column]);

  if (method === 'Mean') {
    const stats = computeNumericStats(nonMissingValues);
    replacementValue = stats.mean;
  } else if (method === 'Median') {
    const stats = computeNumericStats(nonMissingValues);
    replacementValue = stats.median;
  } else if (method === 'Mode') {
    const stats = computeCategoricalStats(nonMissingValues);
    replacementValue = stats.mode;
  } else if (method === 'Custom Value') {
    replacementValue = customValue;
  } else {
    // Default fallback to median if numeric, else mode
    const stats = computeNumericStats(nonMissingValues);
    replacementValue = stats.count > 0 ? stats.median : 'Unknown';
  }

  // Apply replacement
  affectedIndices.forEach(idx => {
    updatedRows[idx][column] = replacementValue;
  });

  return {
    updatedRows,
    replacementValue,
    affectedRowCount: affectedIndices.length,
    affectedIndices,
    column,
    method,
    timestamp: new Date().toISOString()
  };
}
