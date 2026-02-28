import React, { useState, useMemo, useEffect } from 'react';
import { Users, Activity, Clock, Bed, AlertCircle, UserCheck, Download, RefreshCw, IndianRupee, LogOut } from 'lucide-react';
import { mockData as initialMockData, generateMockData } from '../data/mockData';
import { FilterState, Department, Priority, PatientRecord } from '../types';
import { filterData, computeMetrics } from '../utils/metrics';
import { KPICard } from './KPICard';
import { Filters } from './Filters';
import { WorkloadBarChart } from './charts/WorkloadBarChart';
import { PriorityPieChart } from './charts/PriorityPieChart';
import { AdmissionsAreaChart } from './charts/AdmissionsAreaChart';
import { ResolutionLineChart } from './charts/ResolutionLineChart';
import { StaffShiftHeatmap } from './charts/StaffShiftHeatmap';
import { PatientTable } from './PatientTable';
import { PatientModal } from './PatientModal';
import { SmartAlerts } from './SmartAlerts';
import { DoctorWorkloadPanel } from './DoctorWorkloadPanel';
import { BedUtilizationPanel } from './BedUtilizationPanel';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<PatientRecord[]>(initialMockData);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: [null, null],
    department: 'All',
    doctor: 'All',
    priority: 'All'
  });
  
  const [refreshInterval, setRefreshInterval] = useState<number>(0); // 0 means off
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  // Auto-refresh mechanism
  useEffect(() => {
    if (refreshInterval === 0) return;

    const intervalId = setInterval(() => {
      setIsRefreshing(true);
      // Simulate fetching new data by generating a fresh set
      setTimeout(() => {
        setData(generateMockData(500));
        setIsRefreshing(false);
      }, 800); // Fake network delay
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  const filteredData = useMemo(() => filterData(data, filters), [data, filters]);
  const metrics = useMemo(() => computeMetrics(filteredData), [filteredData]);

  const departments = Array.from(new Set(data.map(d => d.Department))) as Department[];
  const doctors = Array.from(new Set(data.map(d => d.Doctor_Name)));
  const priorities = Array.from(new Set(data.map(d => d.Priority))) as Priority[];

  const handleExportCSV = (exportAll: boolean) => {
    const dataToExport = exportAll ? data : filteredData;
    
    if (dataToExport.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(row => {
      return Object.values(row).map(value => {
        // Handle nulls and wrap strings in quotes if they contain commas
        if (value === null) return '';
        const strValue = String(value);
        return strValue.includes(',') ? `"${strValue}"` : strValue;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hospital_data_${exportAll ? 'all' : 'filtered'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Hospital Operations</h1>
            <p className="text-gray-500 mt-1">Real-time analytics and decision support</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Auto Refresh Toggle */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
              <RefreshCw size={16} className={`text-gray-500 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
              <select 
                className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
              >
                <option value={0}>Auto-refresh: Off</option>
                <option value={10}>Every 10s</option>
                <option value={30}>Every 30s</option>
                <option value={60}>Every 60s</option>
              </select>
            </div>

            {/* Export Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm transition-colors font-medium text-sm">
                <Download size={16} />
                Export CSV
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <button 
                    onClick={() => handleExportCSV(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    Export Filtered Data
                  </button>
                  <button 
                    onClick={() => handleExportCSV(true)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    Export All Data
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 ml-2">
              <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`}></div>
              <span className="text-sm font-medium text-gray-600">
                {isRefreshing ? 'Updating...' : 'Live System Status: Optimal'}
              </span>
            </div>
          </div>
        </header>

        {/* Smart Alerts */}
        <SmartAlerts data={filteredData} />

        {/* Filters */}
        <Filters 
          filters={filters} 
          setFilters={setFilters} 
          departments={departments} 
          doctors={doctors} 
          priorities={priorities} 
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          <KPICard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} icon={IndianRupee} trend={8.4} />
          <KPICard title="Total Patients" value={metrics.totalPatients} icon={Users} trend={5.2} />
          <KPICard title="Active Cases" value={metrics.activeCases} icon={Activity} trend={-2.1} />
          <KPICard title="Discharges Today" value={metrics.dischargesToday} icon={LogOut} trend={12.5} />
          
          <KPICard title="Avg Resolution" value={`${metrics.avgResolutionTime}h`} icon={Clock} trend={-12.5} trendLabel="faster" />
          <KPICard title="Bed Occupancy" value={`${metrics.bedOccupancy}%`} icon={Bed} trend={1.2} />
          <KPICard title="Emergency Today" value={metrics.emergencyCasesToday} icon={AlertCircle} trend={15.0} />
          <KPICard title="Staff On Duty" value={metrics.staffOnDuty} icon={UserCheck} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdmissionsAreaChart data={filteredData} />
          </div>
          <div className="lg:col-span-1">
            <PriorityPieChart data={filteredData} />
          </div>
          
          <div className="lg:col-span-1">
            <WorkloadBarChart data={filteredData} />
          </div>
          <div className="lg:col-span-2">
            <ResolutionLineChart data={filteredData} />
          </div>
          <div className="lg:col-span-3">
            <StaffShiftHeatmap data={filteredData} />
          </div>
        </div>

        {/* Advanced Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="lg:col-span-1">
            <DoctorWorkloadPanel data={filteredData} />
          </div>
          <div className="lg:col-span-1">
            <BedUtilizationPanel data={filteredData} />
          </div>
        </div>

        {/* Patient Table */}
        <div className="mt-8">
          <PatientTable data={filteredData} onRowClick={setSelectedPatient} />
        </div>

        {/* Patient Details Modal */}
        <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      </div>
    </div>
  );
};


