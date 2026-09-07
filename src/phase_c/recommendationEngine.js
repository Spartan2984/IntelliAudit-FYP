/**
 * Phase C — Explainable Recommendation Engine
 * Module: Sudhanshu
 * 
 * Objective:
 * Converts raw detection evidence from Phase A (missing values) and
 * Phase B (exact duplicates, fuzzy duplicates, statistical anomalies,
 * Isolation Forest multivariate anomalies, business rule violations,
 * cross-column inconsistencies, and category typos) into actionable,
 * explainable recommendations with categorized confidence scores.
 * 
 * Logic:
 * Detection Evidence -> Explanation -> Proposed Action -> Confidence Score -> Recommendation Object
 */

/**
 * Categorize a numeric confidence value (0 to 1 or 0 to 100) into standard tiers:
 * - High: 90% - 100%
 * - Medium: 70% - 89%
 * - Low: < 70%
 * 
 * @param {number} confidence - Decimal (0.0 to 1.0) or percentage (0 to 100)
 * @returns {{ level: 'High' | 'Medium' | 'Low', percentage: number, colorClass: string }}
 */
export function classifyConfidence(confidence) {
  // Normalize to percentage 0 - 100
  const pct = confidence <= 1.0 && confidence > 0 ? Math.round(confidence * 100) : Math.min(100, Math.max(0, Math.round(confidence || 0)));
  
  if (pct >= 90) {
    return {
      level: 'High',
      percentage: pct,
      colorClass: 'emerald' // Green for High Confidence
    };
  } else if (pct >= 70) {
    return {
      level: 'Medium',
      percentage: pct,
      colorClass: 'amber' // Amber/Yellow for Medium Confidence
    };
  } else {
    return {
      level: 'Low',
      percentage: pct,
      colorClass: 'rose' // Red for Low Confidence
    };
  }
}

/**
 * Generates explainable recommendations from Phase A and Phase B outputs.
 * 
 * @param {Object} params
 * @param {Array<Object>} params.rows - Working dataset rows
 * @param {Array<string>} params.headers - Dataset column headers
 * @param {Array<Object>} params.columnMetadata - Column profile metadata from Phase A
 * @param {Array<Object>} params.missingRecommendations - Phase A missing recommendations
 * @param {Object} params.detectionResults - Phase B detection engine output
 * @returns {Array<Object>} List of structured explainable recommendations
 */
export function generateExplainableRecommendations({
  rows = [],
  headers = [],
  columnMetadata = [],
  missingRecommendations = [],
  detectionResults = {}
}) {
  const recommendations = [];
  let recCounter = 1;

  const {
    duplicate_results = [],
    fuzzy_duplicate_results = [],
    anomaly_results = [],
    rule_violation_results = [],
    inconsistency_results = []
  } = detectionResults || {};

  // =========================================================================
  // 1. EXACT DUPLICATE RECOMMENDATIONS (C.1 & C.3)
  // =========================================================================
  duplicate_results.forEach((dup) => {
    const targetRowIndex = dup.row;
    const masterRowIndex = dup.duplicateOf;
    const targetRow = rows[targetRowIndex] || dup.values || {};
    const rowId = targetRow.__row_id !== undefined ? targetRow.__row_id : targetRowIndex + 1;
    const masterRowId = (rows[masterRowIndex] && rows[masterRowIndex].__row_id !== undefined)
      ? rows[masterRowIndex].__row_id
      : masterRowIndex + 1;

    const confObj = classifyConfidence(dup.confidence || 1.0);

    recommendations.push({
      id: `rec-dup-${recCounter++}`,
      type: 'exact_duplicate',
      category: 'Duplicates',
      rowIndex: targetRowIndex,
      rowId: rowId,
      column: 'All Columns (Whole Record)',
      currentValue: 'Identical to Row #' + masterRowId,
      suggestedValue: 'Remove Duplicate Row',
      suggestedAction: 'remove_row',
      issueTitle: `Exact Duplicate Record (Row #${rowId})`,
      explanation: `Row #${rowId} is a 100% exact duplicate of Master Row #${masterRowId} across all ${headers.length} attributes.`,
      reason: dup.reason || `Identical values across all attributes with row #${masterRowId}.`,
      detectionMethod: dup.detectionMethod || 'Exact Row Hashing',
      severity: dup.severity || 'High',
      confidence: confObj.percentage,
      confidenceLevel: confObj.level,
      confidenceColor: confObj.colorClass,
      status: 'pending', // 'pending' | 'approved' | 'rejected' | 'ignored' | 'edited'
      userCustomValue: null,
      metadata: {
        masterRowIndex,
        masterRowId,
        values: targetRow
      }
    });
  });

  // =========================================================================
  // 2. FUZZY DUPLICATE RECOMMENDATIONS (B.7 & C.1)
  // =========================================================================
  fuzzy_duplicate_results.forEach((fuzzy) => {
    const targetRowIndex = fuzzy.row;
    const similarRowIndex = fuzzy.similarTo;
    const targetRow = rows[targetRowIndex] || fuzzy.values || {};
    const rowId = targetRow.__row_id !== undefined ? targetRow.__row_id : targetRowIndex + 1;
    const similarRowId = (rows[similarRowIndex] && rows[similarRowIndex].__row_id !== undefined)
      ? rows[similarRowIndex].__row_id
      : similarRowIndex + 1;

    const simPct = Math.round((fuzzy.similarity || fuzzy.confidence || 0.85) * 100);
    const confObj = classifyConfidence(fuzzy.confidence || (simPct / 100));

    recommendations.push({
      id: `rec-fuzzy-${recCounter++}`,
      type: 'fuzzy_duplicate',
      category: 'Duplicates',
      rowIndex: targetRowIndex,
      rowId: rowId,
      column: 'Multi-column',
      currentValue: `Approx. ${simPct}% similar to Row #${similarRowId}`,
      suggestedValue: 'Merge or Remove Duplicate',
      suggestedAction: 'remove_row',
      issueTitle: `Fuzzy Duplicate Match (${simPct}% similarity)`,
      explanation: `Row #${rowId} shares ${simPct}% string and value similarity with Row #${similarRowId} (detected via Levenshtein edit distance).`,
      reason: fuzzy.reason || `High textual similarity (${simPct}%) indicating probable re-entry or slight typo.`,
      detectionMethod: fuzzy.detectionMethod || 'Levenshtein Similarity',
      severity: fuzzy.severity || 'Medium',
      confidence: confObj.percentage,
      confidenceLevel: confObj.level,
      confidenceColor: confObj.colorClass,
      status: 'pending',
      userCustomValue: null,
      metadata: {
        similarRowIndex,
        similarRowId,
        similarity: simPct,
        values: targetRow,
        comparedWith: fuzzy.comparedWith
      }
    });
  });

  // =========================================================================
  // 3. TYPO & CATEGORY INCONSISTENCY RECOMMENDATIONS (B.8 & C.3)
  // =========================================================================
  inconsistency_results.forEach((incons) => {
    const rowIndex = incons.row;
    const row = rows[rowIndex] || {};
    const rowId = row.__row_id !== undefined ? row.__row_id : rowIndex + 1;
    const confObj = classifyConfidence(incons.confidence || 0.92);

    recommendations.push({
      id: `rec-typo-${recCounter++}`,
      type: 'category_inconsistency',
      category: 'Inconsistencies',
      rowIndex: rowIndex,
      rowId: rowId,
      column: incons.column,
      currentValue: String(incons.originalValue ?? ''),
      suggestedValue: incons.suggestedValue,
      suggestedAction: 'replace_value',
      issueTitle: `Category Typo in '${incons.column}'`,
      explanation: `Value "${incons.originalValue}" has high string similarity (${confObj.percentage}%) to dominant category "${incons.suggestedValue}".`,
      reason: incons.reason || `Probable spelling variant or typo of standard category "${incons.suggestedValue}".`,
      detectionMethod: incons.detectionMethod || 'String Similarity (Levenshtein)',
      severity: incons.severity || 'Medium',
      confidence: confObj.percentage,
      confidenceLevel: confObj.level,
      confidenceColor: confObj.colorClass,
      status: 'pending',
      userCustomValue: null,
      metadata: {
        originalValue: incons.originalValue,
        suggestedValue: incons.suggestedValue
      }
    });
  });

  // =========================================================================
  // 4. BUSINESS RULE & CROSS-COLUMN VIOLATION RECOMMENDATIONS (B.6, B.9 & C.3)
  // =========================================================================
  rule_violation_results.forEach((violation) => {
    const rowIndex = violation.row;
    const row = rows[rowIndex] || {};
    const rowId = row.__row_id !== undefined ? row.__row_id : rowIndex + 1;
    const confObj = classifyConfidence(violation.confidence || 0.95);

    // Formulate a smart suggested fix based on the violated rule
    let suggestedVal = 'Review Value';
    let suggestedAction = 'replace_value';
    const ruleText = violation.rule || '';
    const origVal = violation.originalValue;

    if (ruleText.toLowerCase().includes('greater than or equal to 0') || ruleText.toLowerCase().includes('cannot be negative')) {
      // e.g. Salary = -5000 -> 0 or positive absolute
      const numVal = Number(origVal);
      suggestedVal = !isNaN(numVal) && numVal < 0 ? String(Math.abs(numVal)) : '0';
    } else if (ruleText.toLowerCase().includes('age must be between 0 and 120')) {
      const numVal = Number(origVal);
      if (numVal < 0) suggestedVal = '0';
      else if (numVal > 120) suggestedVal = '65'; // default reasonable median clamp
    } else if (ruleText.toLowerCase().includes('percentage must be between 0 and 100')) {
      const numVal = Number(origVal);
      suggestedVal = numVal < 0 ? '0' : '100';
    } else if (ruleText.toLowerCase().includes('quantity × unit price')) {
      // Recalculate total
      suggestedVal = 'Recalculate (Qty × Price)';
      suggestedAction = 'recalculate_cross_column';
    }

    recommendations.push({
      id: `rec-rule-${recCounter++}`,
      type: violation.issueType === 'Cross-Column Violation' ? 'cross_column_violation' : 'rule_violation',
      category: 'Rule Violations',
      rowIndex: rowIndex,
      rowId: rowId,
      column: violation.column,
      currentValue: String(origVal ?? ''),
      suggestedValue: suggestedVal,
      suggestedAction: suggestedAction,
      issueTitle: `${violation.issueType}: ${violation.column}`,
      explanation: violation.reason || `Violates constraint: ${ruleText}`,
      reason: `Rule failed: "${ruleText}". ${violation.reason || ''}`,
      detectionMethod: violation.detectionMethod || 'Business Rule Engine',
      severity: violation.severity || 'High',
      confidence: confObj.percentage,
      confidenceLevel: confObj.level,
      confidenceColor: confObj.colorClass,
      status: 'pending',
      userCustomValue: null,
      metadata: {
        rule: ruleText,
        originalValue: origVal
      }
    });
  });

  // =========================================================================
  // 5. STATISTICAL & MULTIVARIATE ANOMALY RECOMMENDATIONS (B.3, B.4, B.5 & C.3)
  // =========================================================================
  anomaly_results.forEach((anom) => {
    const rowIndex = anom.row;
    const row = rows[rowIndex] || {};
    const rowId = row.__row_id !== undefined ? row.__row_id : rowIndex + 1;
    const confObj = classifyConfidence(anom.confidence || 0.85);

    let suggestedVal = 'Review & Handle Outlier';
    let suggestedAction = 'winsorize'; // default clamp or median impute
    
    // Check if column has numerical stats to provide winsorized bound
    if (anom.upperBound !== undefined && anom.originalValue > anom.upperBound) {
      suggestedVal = `Clamp to Upper Bound (${Math.round(anom.upperBound)})`;
      suggestedAction = 'clamp_upper';
    } else if (anom.lowerBound !== undefined && anom.originalValue < anom.lowerBound) {
      suggestedVal = `Clamp to Lower Bound (${Math.round(anom.lowerBound)})`;
      suggestedAction = 'clamp_lower';
    } else if (anom.detectionMethod === 'Isolation Forest') {
      suggestedVal = 'Flag / Review Multi-feature Pattern';
      suggestedAction = 'review';
    }

    const valDisplay = typeof anom.originalValue === 'object' 
      ? JSON.stringify(anom.originalValue) 
      : String(anom.originalValue ?? '');

    recommendations.push({
      id: `rec-anom-${recCounter++}`,
      type: anom.detectionMethod === 'Isolation Forest' ? 'isolation_forest_anomaly' : 'statistical_anomaly',
      category: 'Anomalies',
      rowIndex: rowIndex,
      rowId: rowId,
      column: anom.column,
      currentValue: valDisplay,
      suggestedValue: suggestedVal,
      suggestedAction: suggestedAction,
      issueTitle: `${anom.issueType} in ${anom.column} (Row #${rowId})`,
      explanation: anom.reason || `Value deviates significantly from the statistical distribution.`,
      reason: anom.reason || `Identified as an outlier using ${anom.detectionMethod}.`,
      detectionMethod: anom.detectionMethod || 'Z-Score / IQR Analysis',
      severity: anom.severity || (confObj.percentage >= 90 ? 'High' : 'Medium'),
      confidence: confObj.percentage,
      confidenceLevel: confObj.level,
      confidenceColor: confObj.colorClass,
      status: 'pending',
      userCustomValue: null,
      metadata: {
        ...anom
      }
    });
  });

  // =========================================================================
  // 6. MISSING VALUE RECOMMENDATIONS (Phase A -> Phase C Integration)
  // =========================================================================
  missingRecommendations.forEach((miss) => {
    if (miss.missingCount > 0) {
      const confObj = classifyConfidence(miss.confidence || 88);
      const colMeta = columnMetadata.find(c => c.name === miss.column) || {};

      recommendations.push({
        id: `rec-miss-${miss.column}`,
        type: 'missing_value',
        category: 'Missing Values',
        rowIndex: null, // applies to all missing cells in this column
        rowId: 'Multiple',
        column: miss.column,
        currentValue: `${miss.missingCount} empty cells (${miss.missingPercentage}%)`,
        suggestedValue: `${miss.recommendedMethod} (${miss.suggestedValue !== undefined ? miss.suggestedValue : 'Computed'})`,
        suggestedAction: 'impute',
        issueTitle: `Missing Values in Column '${miss.column}'`,
        explanation: miss.reason || `Contains ${miss.missingCount} missing values. Recommended: ${miss.recommendedMethod} imputation.`,
        reason: miss.reason || `Distribution profile indicates ${miss.recommendedMethod} is optimal for ${colMeta.dataType || 'data type'}.`,
        detectionMethod: 'Phase-A Profile Analysis',
        severity: miss.missingPercentage > 20 ? 'High' : (miss.missingPercentage > 5 ? 'Medium' : 'Low'),
        confidence: confObj.percentage,
        confidenceLevel: confObj.level,
        confidenceColor: confObj.colorClass,
        status: 'pending',
        userCustomValue: null,
        metadata: {
          column: miss.column,
          method: miss.recommendedMethod,
          suggestedValue: miss.suggestedValue,
          missingCount: miss.missingCount,
          missingPercentage: miss.missingPercentage,
          dataType: colMeta.dataType
        }
      });
    }
  });

  return recommendations;
}
