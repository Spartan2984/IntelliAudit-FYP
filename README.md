# IntelliAudit

IntelliAudit is a modern, React-based web application designed for comprehensive data auditing and cleaning workflows. It provides an intuitive interface for users to upload datasets, analyze data quality, and apply various cleaning operations such as handling missing values and removing duplicates.

## Features

- **Interactive Dashboard:** Visualize key data metrics and project status.
- **Data Upload & Preview:** Easily upload datasets and preview raw data.
- **Data Auditing Workflow:**
  - **Missing Values Management:** Identify and resolve missing data points.
  - **Duplicate Detection:** Find and manage duplicate records effectively.
  - **Cleaning Actions:** Apply custom cleaning transformations to the dataset.
- **Cleaned Data Preview:** Review the dataset after cleaning operations have been applied.
- **Reporting:** Generate summaries and reports of the data auditing process.
- **Dark/Light Theme:** Built-in theme toggling for a comfortable user experience.

## Technology Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Linting:** ESLint

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your system.

### Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd IntelliAudit
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

To create a production build:

```bash
npm run build
```

This will generate a `dist` folder containing the optimized production assets. You can preview the production build locally using:

```bash
npm run preview
```

## Project Structure

- `src/`
  - `components/`: Reusable UI components.
  - `contexts/`: React contexts (e.g., `ThemeContext` for light/dark mode).
  - `layouts/`: Page layouts (e.g., `DashboardLayout`).
  - `pages/`: Individual application pages (Dashboard, Upload, Preview, MissingValues, Duplicates, etc.).
  - `App.jsx`: Main application component and routing configuration.
  - `main.jsx`: Entry point for the React application.
- `package.json`: Project dependencies and scripts.
- `vite.config.js`: Vite configuration.
- `postcss.config.js` / `tailwind.config.js`: Tailwind CSS and PostCSS configuration.

