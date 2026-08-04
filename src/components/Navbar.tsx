import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Building2,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  History,
  Lock,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Layers,
  Download,
} from 'lucide-react';
import { usePortfolio } from '../services/store';
import {
  exportAllPortfolioJSON,
  exportAllPortfolioCSV,
  exportManagedInvestmentsCSV,
} from '../utils/exportData';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMfaModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenMfaModal }) => {
  const portfolio = usePortfolio();
  const {
    currentUser,
    users,
    setCurrentUser,
    properties,
    managedInvestments,
    corporateEntities,
    scheduledPayments,
    documents,
    auditLogs,
    lastLiveSyncTime,
    liveSyncCount,
  } = portfolio;

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Calculate live total portfolio valuation
  const totalPropertyCost = properties.reduce((acc, p) => acc + p.totalCosts, 0);
  const totalPropertyIncome = properties.reduce((acc, p) => acc + p.totalIncome, 0);
  const totalPropertyProfit = properties.reduce((acc, p) => acc + p.grossProfit, 0);
  const totalManagedValuation = managedInvestments.reduce((acc, m) => acc + m.latestValue, 0);
  
  // Total Estimated Portfolio Asset Base
  const totalPortfolioAssetBase = totalPropertyIncome + totalManagedValuation + 910000; // Including held residence

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: TrendingUp,
      desc: 'Portfolio Executive Summary & Asset Performance Overview',
    },
    {
      id: 'properties',
      label: 'Properties (11)',
      icon: Building2,
      desc: '11 Real Estate Parcels • Australia & New Zealand Portfolios',
    },
    {
      id: 'investments',
      label: 'Managed Funds',
      icon: TrendingUp,
      desc: 'GLPE, GHIF & CMC Portfolio Ledger & Valuation History',
    },
    {
      id: 'corporate',
      label: 'Entities & Trust',
      icon: Layers,
      desc: 'Sahota Family Trust, Nominees, Trading & Gold Entities',
    },
    {
      id: 'documents',
      label: 'Documents Vault',
      icon: FileText,
      desc: 'Official ASIC, ATO, Trust Deed & CHESS Attachments (Local & Drive)',
    },
    {
      id: 'tax-reports',
      label: 'Tax & CGT Reports',
      icon: FileSpreadsheet,
      badge: 'ATO Ready',
      desc: 'FY2025 Tax Distribution Statement & Capital Gains Tax Estimator',
    },
    {
      id: 'permissions',
      label: 'Family Permissions',
      icon: Users,
      desc: 'Family Member Access Control & Governance Privileges',
    },
    {
      id: 'audit-logs',
      label: 'Audit Trail',
      icon: History,
      desc: 'Compliance Log & Immutable Security Event History',
    },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Owner / Appointor':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Trustee / Editor':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner: Group Info & Live Real-Time Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between border-b border-slate-100 gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-xs tracking-wider text-sm">
            SG
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-2 text-base tracking-tight">
              SAHOTA GROUP
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Family Trust & Portfolio
              </span>
            </div>
            <p className="text-slate-500 text-xs hidden sm:block font-normal">
              Sahota Family Trust • Sahota Nominees • Sahota Trading • Sahota Gold
            </p>
          </div>
        </div>

        {/* Live Net Worth KPI Header Badge */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-right">
            <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">Portfolio Asset Base</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
              ${totalPortfolioAssetBase.toLocaleString('en-AU')} AUD
            </span>
          </div>

          {/* Real-time Multi-User Sync Indicator */}
          <div className="hidden md:flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
            </span>
            <span className="text-green-800 font-semibold">Real-Time Sync</span>
            {lastLiveSyncTime && (
              <span className="text-[10px] text-green-700 bg-white px-1.5 py-0.5 rounded font-mono border border-green-200">
                Updated {lastLiveSyncTime}
              </span>
            )}
          </div>

          {/* Export Data Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Export Portfolio Data"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export Data</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-600 ml-0.5" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Export Portfolio Data
                  </p>
                </div>
                <button
                  onClick={() => {
                    exportAllPortfolioCSV({
                      properties,
                      managedInvestments,
                      corporateEntities,
                      scheduledPayments,
                      documents,
                      users,
                      auditLogs,
                    });
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-800 font-medium flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Consolidated CSV Export</span>
                </button>
                <button
                  onClick={() => {
                    exportManagedInvestmentsCSV(managedInvestments);
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-800 font-medium flex items-center gap-2 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Managed Funds CSV</span>
                </button>
                <button
                  onClick={() => {
                    exportAllPortfolioJSON({
                      properties,
                      managedInvestments,
                      corporateEntities,
                      scheduledPayments,
                      documents,
                      users,
                      auditLogs,
                    });
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-800 font-medium flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1 pt-2"
                >
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Full Portfolio JSON Backup</span>
                </button>
              </div>
            )}
          </div>

          {/* MFA Status Button */}
          <button
            onClick={onOpenMfaModal}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              currentUser.mfaEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {currentUser.mfaEnabled ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>MFA Active</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Enable MFA</span>
              </>
            )}
          </button>

          {/* Active User Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors text-left shadow-xs cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/50"
              />
              <div className="hidden lg:block text-xs">
                <div className="font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Family Member View
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Test role permission levels in real time:
                  </p>
                </div>

                <div className="py-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                        u.id === currentUser.id ? 'bg-blue-50/60 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{u.name}</div>
                          <span
                            className={`inline-block text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getRoleBadgeColor(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </div>
                      </div>

                      {u.id === currentUser.id && <ShieldCheck className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Executive Ribbon Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="bg-slate-900 text-white rounded-2xl p-1.5 shadow-md border border-slate-800">
          <nav className="flex space-x-1 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id || (tab.id === 'dashboard' && activeTab === 'overview');
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-white text-blue-800'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Active Ribbon Status Strip */}
          <div className="hidden md:flex items-center justify-between px-3.5 pt-1.5 pb-0.5 border-t border-slate-800/80 mt-1 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="font-semibold text-slate-200">Ribbon Module:</span>
              <span className="text-blue-300 font-sans">
                {tabs.find((t) => t.id === activeTab || (t.id === 'dashboard' && activeTab === 'overview'))?.desc}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">
              Sahota Group Executive Ribbon
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
