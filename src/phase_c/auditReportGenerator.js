/**
 * Phase C — Audit Report & Dataset Export Generator
 * Module: Sudhanshu
 * 
 * Objective:
 * Generates audit-ready compliance reports and exportable artifacts:
 * 1. Downloadable Cleaned CSV (customer_data_cleaned.csv)
 * 2. Full Audit Log & Summary Report (JSON & Markdown)
 * 3. Handoff Data Structure (final_cleaned_dataset, quality_metrics, etc.)
 */

import Papa from 'papaparse';

/**
 * Builds the complete structured audit report data object.
 * 
 * @param {Object} params
 * @returns {Object} Phase C Final Output Package
 */
export function buildAuditReportData({
  filename = 'dataset.csv',
  originalDataset = null,
  cleanedDataset = null,
  recommendations = [],
  appliedOperations = [],
  auditLog = [],
  qualityComparison = null,
  cleaningSummary = {}
}) {
  const timestamp = new Date().toISOString();
  const formattedDate = new Date().toLocaleString();

  const reportId = `AUDIT-${Date.now().toString(36).toUpperCase()}`;

  return {
    report_metadata: {
      report_id: reportId,
      system_name: 'IntelliAudit — Explainable Data Quality & Cleaning System',
      generated_at: timestamp,
      formatted_date: formattedDate,
      source_file: filename,
      auditor: 'IntelliAudit Autonomous AI Engine (Phase C)',
      status: 'Verified & Certified'
    },
    dataset_overview: {
      original_rows: originalDataset?.rows?.length || 0,
      cleaned_rows: cleanedDataset?.rows?.length || 0,
      columns_count: cleanedDataset?.headers?.filter(h => h !== '__row_id').length || 0,
      headers: cleanedDataset?.headers?.filter(h => h !== '__row_id') || []
    },
    quality_metrics: {
      before_score: qualityComparison?.before?.overallScore ?? 0,
      after_score: qualityComparison?.after?.overallScore ?? 0,
      grade_before: qualityComparison?.before?.grade?.grade || 'N/A',
      grade_after: qualityComparison?.after?.grade?.grade || 'N/A',
      improvement_percentage: qualityComparison?.delta?.relativeImprovement ?? 0,
      dimensions_before: qualityComparison?.before?.dimensions || {},
      dimensions_after: qualityComparison?.after?.dimensions || {}
    },
    cleaning_summary: {
      total_recommendations: recommendations.length,
      approved_operations_count: appliedOperations.length,
      duplicates_removed: cleaningSummary.duplicatesRemoved || 0,
      anomalies_handled: cleaningSummary.anomaliesHandled || 0,
      typos_corrected: cleaningSummary.typosCorrected || 0,
      rule_violations_fixed: cleaningSummary.ruleViolationsFixed || 0,
      missing_values_imputed: cleaningSummary.missingValuesImputed || 0
    },
    approved_operations: appliedOperations,
    audit_trail: auditLog,
    recommendations_log: recommendations
  };
}

/**
 * Generates and downloads a clean CSV file without internal __row_id metadata.
 * 
 * @param {Object} cleanedDataset - { headers: [], rows: [] }
 * @param {string} originalFilename - e.g. "customer_data.csv"
 */
export function downloadCleanedCSV(cleanedDataset, originalFilename = 'dataset.csv') {
  if (!cleanedDataset || !cleanedDataset.rows || cleanedDataset.rows.length === 0) {
    alert('No cleaned dataset available for download.');
    return;
  }

  // Filter out internal __row_id
  const exportHeaders = cleanedDataset.headers.filter(h => h !== '__row_id');

  const cleanRows = cleanedDataset.rows.map(row => {
    const cleanRow = {};
    exportHeaders.forEach(header => {
      cleanRow[header] = row[header] !== undefined && row[header] !== null ? row[header] : '';
    });
    return cleanRow;
  });

  const csvContent = Papa.unparse({
    fields: exportHeaders,
    data: cleanRows
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  // Format clean filename e.g. customer_data_cleaned.csv
  const baseName = originalFilename.replace(/\.[^/.]+$/, '');
  link.setAttribute('href', url);
  link.setAttribute('download', `${baseName}_cleaned.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads full audit report as structured JSON.
 */
export function downloadAuditReportJSON(reportData, filename = 'dataset.csv') {
  if (!reportData) return;

  const jsonStr = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const baseName = filename.replace(/\.[^/.]+$/, '');
  link.setAttribute('href', url);
  link.setAttribute('download', `${baseName}_audit_report.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a formatted Markdown audit report summary.
 */
export function downloadAuditReportMarkdown(reportData, filename = 'dataset.csv') {
  if (!reportData) return;

  const { report_metadata, quality_metrics, dataset_overview, cleaning_summary, approved_operations } = reportData;

  const md = `# IntelliAudit — Data Quality Audit Report
**Report ID**: \`${report_metadata.report_id}\`  
**Generated At**: ${report_metadata.formatted_date}  
**Source Dataset**: \`${report_metadata.source_file}\`  
**Auditor**: ${report_metadata.auditor}  

---

## 1. Executive Quality Summary

| Metric | Before Cleaning | After Cleaning | Delta / Change |
| :--- | :--- | :--- | :--- |
| **Overall Quality Score** | **${quality_metrics.before_score}%** (${quality_metrics.grade_before}) | **${quality_metrics.after_score}%** (${quality_metrics.grade_after}) | **+${quality_metrics.after_score - quality_metrics.before_score}%** (${quality_metrics.improvement_percentage}% relative) |
| **Completeness** | ${quality_metrics.dimensions_before.completeness}% | ${quality_metrics.dimensions_after.completeness}% | +${quality_metrics.dimensions_after.completeness - quality_metrics.dimensions_before.completeness}% |
| **Uniqueness** | ${quality_metrics.dimensions_before.uniqueness}% | ${quality_metrics.dimensions_after.uniqueness}% | +${quality_metrics.dimensions_after.uniqueness - quality_metrics.dimensions_before.uniqueness}% |
| **Validity** | ${quality_metrics.dimensions_before.validity}% | ${quality_metrics.dimensions_after.validity}% | +${quality_metrics.dimensions_after.validity - quality_metrics.dimensions_before.validity}% |
| **Consistency** | ${quality_metrics.dimensions_before.consistency}% | ${quality_metrics.dimensions_after.consistency}% | +${quality_metrics.dimensions_after.consistency - quality_metrics.dimensions_before.consistency}% |
| **Anomaly Health** | ${quality_metrics.dimensions_before.anomalyHealth}% | ${quality_metrics.dimensions_after.anomalyHealth}% | +${quality_metrics.dimensions_after.anomalyHealth - quality_metrics.dimensions_before.anomalyHealth}% |

---

## 2. Dataset Dimensions

- **Original Record Count**: ${dataset_overview.original_rows.toLocaleString()}
- **Final Cleaned Record Count**: ${dataset_overview.cleaned_rows.toLocaleString()}
- **Attribute Count**: ${dataset_overview.columns_count}
- **Attributes**: \`${dataset_overview.headers.join('`, `')}\`

---

## 3. Cleaning Operations Summary

- **Missing Values Handled**: ${cleaning_summary.missing_values_imputed}
- **Duplicates Removed**: ${cleaning_summary.duplicates_removed}
- **Anomalies Handled**: ${cleaning_summary.anomalies_handled}
- **Category Typos Standardized**: ${cleaning_summary.typos_corrected}
- **Rule Violations Corrected**: ${cleaning_summary.rule_violations_fixed}
- **Total Approved Actions Applied**: ${cleaning_summary.approved_operations_count}

---

## 4. Applied Operations Log

${approved_operations.length > 0 ? approved_operations.map((op, idx) => `
### ${idx + 1}. ${op.action}
- **Timestamp**: ${op.timestamp}
- **Category**: ${op.category}
- **Confidence**: ${op.confidence}% (${op.confidenceLevel})
- **Details**: ${op.details}
`).join('\n') : '*No cleaning operations were approved or executed.*'}

---
*Report generated autonomously by IntelliAudit Explainable AI Pipeline.*
`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const baseName = filename.replace(/\.[^/.]+$/, '');
  link.setAttribute('href', url);
  link.setAttribute('download', `${baseName}_audit_summary.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
