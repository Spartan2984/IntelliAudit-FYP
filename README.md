# IntelliAudit

**Explainable Data Quality Assessment and Intelligent Data Cleaning System**

IntelliAudit is an interactive web platform designed to analyze, assess, and intelligently clean structured CSV datasets. The core system architecture adheres to an explainable, human-in-the-loop workflow:
$$\text{Detection} \longrightarrow \text{Explanation} \longrightarrow \text{Recommendation} \longrightarrow \text{User Approval} \longrightarrow \text{Cleaning} \longrightarrow \text{Validation}$$

---

## 📌 Core Modules: Dataset Ingestion, Profiling & Missing-Value Processing

**Objective:**  
Build the foundation of the data quality system by uploading, validating, parsing, profiling, and preprocessing raw datasets while preserving an immutable master dataset and generating an active working dataset for downstream quality auditing.

### Key System Capabilities:

#### **1. CSV Upload & Validation**
* **File Ingestion:** Drag-and-drop or manual CSV file selector with delimiter detection.
* **Validation Engine:**
  - File format validation (standard `.csv` MIME types).
  - Empty file checking ($0\text{ bytes}$).
  - File size threshold checks ($< 50\text{ MB}$).
  - Header row and data row verification.
* **Ingestion Feedback:** Immediate display of file name, total rows, total columns, file size, and upload status (`✓ Successful`).
* **Benchmark Sample Data:** Instant loader for a benchmark test dataset with realistic missing values, outliers, and duplicates.

#### **2. Dual Dataset Architecture**
```
Uploaded CSV
     ↓
Original Dataset (original_dataset)  ───→  Immutable Master (Preserved for Audit & Diffs)
     ↓ (Deep Copy)
Working Dataset (working_dataset)    ───→  Active Copy for Cleaning & Profiling
```
* `original_dataset`: Preserved without modification throughout the entire pipeline.
* `working_dataset`: Active working copy on which approved imputations and transformations are applied.
* `resetToOriginal()`: Rollback feature allowing one-click restoration to raw state.

#### **3. Comprehensive Dataset & Column Profiling**
* **Dataset-Level Information:**
  - Total records count
  - Total columns count
  - Dataset file size
  - Numerical columns list & count
  - Categorical columns list & count
  - Date and ID/Key columns count
  - Total cell count, missing cell count, and overall missingness rate (%)
  - Duplicate rows count
* **Column-Level Information:**
  - Automated data type inference (`Integer`, `Float`, `Categorical`, `Date`, `ID / Key`, `Boolean`)
  - Missing count and missing percentage
  - Unique / Distinct value count and unique percentage
* **Numerical Statistics & Five-Number Summary:**
  - **Mean**
  - **Median** (Q2)
  - **Minimum** & **Maximum**
  - **Standard Deviation**
  - **Q1** (25th percentile)
  - **Q3** (75th percentile)
  - **IQR** (Interquartile Range = $Q3 - Q1$)
  - **Skewness** (Fisher-Pearson coefficient to detect distribution asymmetry)
* **Categorical Statistics:**
  - **Mode**
  - Mode frequency & modal percentage
  - Top-5 frequent classes distribution

#### **4. Missing-Value Detection Engine**
* Scans all standard missing value markers across all fields:
  `NaN`, `NULL`, `N/A`, `NA`, `#N/A`, `none`, `nil`, `-`, `?`, `undefined`, `missing`, and empty strings `""`.
* Generates column-by-column missing distribution charts and detection summaries.

#### **5. Mean / Median / Mode Imputation Algorithms**
* **Numerical Columns:** Mean and Median imputation algorithms.
* **Categorical Columns:** Mode imputation and custom constant replacement (`Unknown`).
* **ID / Key Columns:** Row deletion (`Drop Rows`) or custom key assignment to prevent synthetic collision.
* **Live Before vs After Comparison:** Row-level visual diff highlighting transformed cells.

#### **6. Explainable AI & Statistical Heuristic Recommendations**
* **Heuristic Strategy Selection:**
  - **Skewed Numeric Distributions ($|\text{Skewness}| > 0.8$ or High IQR):** Recommends **Median** with rationale explaining resistance to extreme outlier distortion.
  - **Symmetric Numeric Distributions:** Recommends **Mean** with rationale explaining preservation of central tendency.
  - **Categorical Columns:** Recommends **Mode** with rationale explaining majority class frequency.
* **Confidence Scoring:** Outputs algorithmic confidence metrics ($80\% - 96\%$).
* **Human-in-the-Loop Controls:**
  - Single-column **Approve & Apply**
  - Batch **Approve All Recommendations**
  - Custom method selector (choose alternative methods or enter custom constant values)

#### **7. Standard Data Contracts & Context API**
All pipeline stages consume the following standard objects:
1. `original_dataset` / `originalDataset`: Master raw dataset `{ headers: [], rows: [] }`
2. `working_dataset` / `workingDataset`: Active cleaned dataset `{ headers: [], rows: [] }`
3. `dataset_profile` / `datasetProfile`: Complete dataset-level statistics and metadata
4. `missing_value_report` / `missingRecommendations`: Per-column missing analysis & explanations
5. `imputation_results` / `imputationResults`: Audit log of applied imputations
6. `column_metadata` / `columnMetadata`: Type inferences, 5-number summaries, and cardinality

---

## 🛠️ Technology Stack

* **Frontend Framework:** React 19
* **Build Tool:** Vite
* **Routing:** React Router v7
* **Styling:** Tailwind CSS v4
* **Data Visualization:** Recharts
* **CSV Parsing:** PapaParse
* **Icons:** Lucide React

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

### Building for Production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
IntelliAudit/
├── src/
│   ├── contexts/
│   │   ├── DatasetContext.jsx    # Dual dataset state, profiling & imputation management
│   │   └── ThemeContext.jsx      # Light / Dark theme state
│   ├── layouts/
│   │   └── DashboardLayout.jsx   # Top navigation & auditing pipeline layout
│   ├── pages/
│   │   ├── Home.jsx              # Landing page with interactive hero
│   │   ├── Workflow.jsx          # Auditing stage selection portal
│   │   ├── Upload.jsx            # CSV upload, validation & metadata
│   │   ├── Preview.jsx           # Statistical profiling & data grid
│   │   ├── MissingValues.jsx     # Detection, recommendations & imputation
│   │   ├── Dashboard.jsx         # Live overview of data health & missingness
│   │   ├── Duplicates.jsx        # Duplicate record detection
│   │   ├── CleaningActions.jsx   # Custom cleaning operations
│   │   ├── CleanedPreview.jsx    # Final dataset review
│   │   └── Report.jsx            # Dynamic audit report generation
│   ├── utils/
│   │   ├── dataProfiler.js       # Type detection, 5-number summary, IQR & skewness
│   │   └── missingHandler.js     # Imputation logic & explainable recommendation engine
│   ├── App.jsx                   # Route declarations
│   └── main.jsx                  # React application entry point
├── package.json
└── vite.config.js
```
