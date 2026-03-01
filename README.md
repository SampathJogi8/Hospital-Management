# Hospital Operations Dashboard

## Overview
The Hospital Operations Dashboard is a comprehensive, real-time analytics platform designed to help hospital administrators and medical staff monitor key performance indicators (KPIs), manage resources, and respond to critical situations efficiently. 

This application simulates a live hospital environment by generating realistic patient data and providing actionable insights through interactive visualizations and smart alerts.

## Key Features

- **Real-Time Data Simulation**: Generates and maintains a robust dataset of 800 patient records, simulating live hospital operations.
- **Auto-Refresh Mechanism**: Configurable auto-refresh intervals (5s, 10s, 30s, 60s) to keep metrics and charts up-to-date without manual intervention.
- **Smart Alerts System**: Automatically detects and warns administrators about critical situations:
  - High Bed Occupancy (>90% capacity)
  - Emergency Department Spikes (>25 admissions today)
  - Doctor Overload (>18 active cases per doctor)
  - Department Overload (>45 active cases per department)
- **Comprehensive KPI Tracking**: Monitors Total Revenue, Patient Counts, Active Cases, Discharges, Average Resolution Time, Bed Occupancy, Emergency Cases, and Staff On Duty.
- **Advanced Visualizations**:
  - Admissions Trends (Area Chart)
  - Priority Distribution (Pie Chart)
  - Department Workload (Bar Chart)
  - Resolution Time Trends (Line Chart)
  - Shift Efficiency Heatmap (Area/Bar combination)
- **Resource Management Panels**: Detailed breakdowns of Doctor Workload and Bed Utilization across different wards (ICU, General, Emergency).
- **Interactive Patient Data**: Searchable, filterable data table with detailed patient modal views and CSV export functionality.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Utility-first, responsive design)
- **Charting Library**: Recharts (Declarative, React-based charting)
- **Icons**: Lucide React

## Architecture & Implementation Details

### 1. State Management & Performance
The application relies on React's built-in hooks (`useState`, `useMemo`, `useEffect`) for state management. To ensure high performance despite the large dataset (800 records) and frequent auto-refresh intervals:
- `useMemo` is heavily utilized to cache filtered data, computed metrics, and chart-specific data transformations. This prevents unnecessary recalculations during re-renders.
- The auto-refresh mechanism uses `setInterval` to trigger the mock data generator, simulating a WebSocket or polling-based live data feed.

### 2. Data Simulation (`src/data/mockData.ts`)
Instead of static JSON, the app uses a dynamic data generator. It creates realistic patient records with randomized but logically consistent attributes (e.g., Admission Dates, Departments, Priorities, Billing Amounts, and Resolution Times). This ensures the dashboard feels "alive" during demonstrations.

### 3. Component Modularity
The UI is broken down into highly reusable and focused components:
- `KPICard`: Standardized display for top-level metrics.
- `SmartAlerts`: Evaluates the current dataset against predefined thresholds to render contextual warnings.
- `charts/*`: Encapsulated Recharts implementations, keeping the main dashboard clean.
- `DoctorWorkloadPanel` & `BedUtilizationPanel`: Specialized views for deep-dive resource analytics.

### 4. Responsive Design
Tailwind CSS is used to create a fluid, mobile-first layout. The dashboard gracefully degrades from a multi-column grid on large desktop screens to a stacked, scrollable layout on mobile devices, ensuring accessibility across all form factors.

## Getting Started

To run this project locally:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).
