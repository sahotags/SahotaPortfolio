import React, { useState } from 'react';
import {
  Building2,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  ShieldCheck,
  FileSpreadsheet,
  PlusCircle,
  FileText,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  Users,
  CheckCircle2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { usePortfolio } from '../services/store';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab }) => {
  const {
    properties,
    managedInvestments,
    corporateEntities,
    scheduledPayments,
    auditLogs,
    currentUser,
    liveSyncCount,
    lastLiveSyncTime,
    addAuditLog,
  } = usePortfolio();

  // Property Portfolio Metrics
  const totalPropertyCosts = properties.reduce((acc, p) => acc + p.totalCosts, 0);
  const totalPropertyIncome = properties.reduce((acc, p) => acc + p.totalIncome, 0);
  const totalPropertyGrossProfit = properties.reduce((acc, p) => acc + p.grossProfit, 0);
  const overallPropertyMargin =
    totalPropertyCosts > 0 ? (totalPropertyGrossProfit / totalPropertyCosts) * 100 : 0;

  // Managed Investment Metrics
  const managedContributions = managedInvestments.reduce((acc, m) => acc + m.netContributions, 0);
  const managedLatestValue = managedInvestments.reduce((acc, m) => acc + m.latestValue, 0);
  const managedTotalGain = managedLatestValue - managedContributions;
  const managedRoi = managedContributions > 0 ? (managedTotalGain / managedContributions) * 100 : 0;

  // Annual Outgoings
  const totalOutgoings = scheduledPayments.reduce((acc, s) => acc + s.amount, 0);

  // Asset Base Allocation Data for Pie Chart
  const assetAllocationData = [
    { name: 'Properties Realized Income', value: totalPropertyIncome, color: '#059669' },
    { name: 'Properties Held Cost Base', value: 910000 + 895026, color: '#3b82f6' },
    { name: 'GLPE Managed Equity', value: 918684, color: '#d97706' },
    { name: 'CMC Stockbroking', value: 9146, color: '#8b5cf6' },
    { name: 'GHIF Yield Fund', value: 122, color: '#06b6d4' },
  ];

  // Property ROI Bar Chart Data
  const propertyBarData = properties
    .filter((p) => p.totalCosts > 0)
    .map((p) => ({
      name: p.name.split(',')[0].replace('Apartment ', 'Apt '),
      Costs: p.totalCosts,
      Income: p.totalIncome,
      Profit: p.grossProfit,
    }));

  // Timeline Growth Data for Managed Investments
  const timelineData = [
    { year: '2022 Q2', GLPE: 700000, Contributions: 700000 },
    { year: '2023 Q2', GLPE: 765000, Contributions: 700000 },
    { year: '2024 Q2', GLPE: 830000, Contributions: 700000 },
    { year: '2025 Q2', GLPE: 885000, Contributions: 700000 },
    { year: '2026 Q3', GLPE: 918684, Contributions: 733053 },
  ];

  const handleSimulateSync = () => {
    addAuditLog(
      'UPDATE',
      'Real-Time Sync Engine',
      `Manual sync verification triggered by ${currentUser.name}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Welcome Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                Sahota Family Executive Dashboard
              </span>
              {liveSyncCount > 0 && (
                <span className="text-emerald-300 text-xs bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {liveSyncCount} Sync Events
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight text-white">
              Portfolio Summary & Wealth Snapshot
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Live consolidated data across 11 properties, $957k+ managed funds, and 4 corporate trust entities with real-time family member permissions and audit logging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('tax-reports')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tax & CGT Statement</span>
            </button>

            <button
              onClick={handleSimulateSync}
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Verify Real-Time Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Property Portfolio Income */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase font-semibold tracking-wider">Property Portfolio Income</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              ${totalPropertyIncome.toLocaleString('en-AU')}
            </div>
            <div className="flex items-center text-xs mt-1 text-emerald-700 font-semibold">
              <ArrowUpRight className="w-4 h-4 mr-0.5" />
              <span>${totalPropertyGrossProfit.toLocaleString('en-AU')} Gross Profit</span>
              <span className="text-slate-500 ml-1">({overallPropertyMargin.toFixed(1)}% margin)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Total Property Costs</span>
            <span className="font-mono text-slate-700 font-semibold">${totalPropertyCosts.toLocaleString('en-AU')}</span>
          </div>
        </div>

        {/* Card 2: Managed Investments Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase font-semibold tracking-wider">Managed Investments</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              ${managedLatestValue.toLocaleString('en-AU')}
            </div>
            <div className="flex items-center text-xs mt-1 text-emerald-700 font-semibold">
              <ArrowUpRight className="w-4 h-4 mr-0.5" />
              <span>+${managedTotalGain.toLocaleString('en-AU')} Gain</span>
              <span className="text-slate-500 ml-1">(+{managedRoi.toFixed(1)}% ROI)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Net Contributions</span>
            <span className="font-mono text-slate-700 font-semibold">${managedContributions.toLocaleString('en-AU')}</span>
          </div>
        </div>

        {/* Card 3: Scheduled Annual Outgoings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase font-semibold tracking-wider">Annual Outgoings</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              ${totalOutgoings.toLocaleString('en-AU')}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              ASIC Annual Review fees, NSW Land Tax, Insurance
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Pending Approvals</span>
            <span className="font-semibold text-amber-700">1 Item Pending</span>
          </div>
        </div>

        {/* Card 4: Corporate Entities & Trust Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase font-semibold tracking-wider">Corporate Structure</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900">
              4 Active Entities
            </div>
            <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sahota Family Trust Active</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Appointors</span>
            <span className="font-semibold text-slate-800">Gagandeep & Manroop</span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Property ROI Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Property Costs vs Income & Profit ($ AUD)</h2>
              <p className="text-xs text-slate-500">Comparing acquisition costs, total revenue, and realized profit across properties</p>
            </div>
            <button
              onClick={() => onNavigateTab('properties')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All 11 Properties</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()} AUD`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Costs" fill="#64748b" radius={[4, 4, 0, 0]} name="Total Costs" />
                <Bar dataKey="Income" fill="#059669" radius={[4, 4, 0, 0]} name="Total Income" />
                <Bar dataKey="Profit" fill="#2563eb" radius={[4, 4, 0, 0]} name="Gross Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Asset Allocation Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900">Asset Base Allocation</h2>
              <PieIcon className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mb-2">Distribution across real estate and managed funds</p>

            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {assetAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()} AUD`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Assets</span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                  ${(totalPropertyIncome + 910000 + 895026 + managedLatestValue).toLocaleString('en-AU')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {assetAllocationData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate max-w-[160px] font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">${item.value.toLocaleString('en-AU')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Managed Fund Growth & Corporate Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Managed Fund Timeline */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">GLPE Managed Equity Growth vs Contributions</h2>
              <p className="text-xs text-slate-500">Historical performance from 2022 to 2026 Q3 (Net Contributions: $700,000 → Valuation: $918,684)</p>
            </div>
            <button
              onClick={() => onNavigateTab('investments')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Funds</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGlpe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()} AUD`, '']}
                />
                <Area type="monotone" dataKey="GLPE" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorGlpe)" name="GLPE Portfolio Value" />
                <Area type="monotone" dataKey="Contributions" stroke="#059669" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorContrib)" name="Net Contributions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Corporate Flags & Scheduled Outgoings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Pending Action Flags</span>
            </h2>
            <button
              onClick={() => onNavigateTab('corporate')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Sahota Gold Pty Ltd TFN / ABN
              </div>
              <p className="mt-1 text-slate-700 text-[11px]">
                Gold ABN/TFN registration open items & Class A/B dividend wording verification required in share resolution.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Revenue NSW Duties Assessment Paid
              </div>
              <p className="mt-1 text-slate-700 text-[11px]">
                Assessment #11278692-001 ($707.24) settled for Sahota Nominees Pty Ltd / Sahota Family Trust.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Active Construction Project
              </div>
              <p className="mt-1 text-slate-700 text-[11px]">
                Lot 346, 114 Ridge Square Leppington NSW ($895,026 in progress under Sahota Trading).
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('documents')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Browse 10 Attached Official Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Audit Log Activity Preview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Recent Family Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-500">Real-time log of portfolio modifications, uploads, and MFA checks</p>
          </div>
          <button
            onClick={() => onNavigateTab('audit-logs')}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
          >
            Full Audit Log ({auditLogs.length})
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">{log.description}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="text-slate-700 font-medium">{log.userName}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-semibold">{log.targetEntity}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{log.ipAddress}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-600 font-mono whitespace-nowrap bg-slate-100 px-2 py-1 rounded border border-slate-200">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
