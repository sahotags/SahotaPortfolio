import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  PieChart as PieIcon,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Briefcase,
  X,
  History,
  Download,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Search,
  Table as TableIcon,
  Layers,
  FileText,
} from 'lucide-react';
import { ManagedInvestment, MonthlyLedgerEntry } from '../types';
import { usePortfolio } from '../services/store';
import {
  exportManagedInvestmentsCSV,
  exportMonthlyLedgerCSV,
  exportAllPortfolioCSV,
  exportAllPortfolioJSON,
} from '../utils/exportData';

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const ManagedInvestments: React.FC = () => {
  const portfolio = usePortfolio();
  const {
    managedInvestments,
    monthlyLedger = [],
    currentUser,
    addManagedInvestment,
    updateManagedInvestment,
    deleteManagedInvestment,
    addValuationHistoryEntry,
    updateValuationHistoryEntry,
    deleteValuationHistoryEntry,
    addMonthlyLedgerEntry,
    updateMonthlyLedgerEntry,
    deleteMonthlyLedgerEntry,
    triggerMfaChallenge,
  } = portfolio;

  const canEdit = currentUser.permissions.canEditInvestments;

  // View mode tab state
  const [activeTab, setActiveTab] = useState<'ledger' | 'funds'>('ledger');
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState('');

  // Active expanded history fund
  const [expandedFundId, setExpandedFundId] = useState<string | null>(null);

  // Modal State for Monthly Ledger Row
  const [isAddingLedgerRow, setIsAddingLedgerRow] = useState(false);
  const [editingLedgerRow, setEditingLedgerRow] = useState<MonthlyLedgerEntry | null>(null);
  const [ledgerFormData, setLedgerFormData] = useState({
    month: '',
    netFlow: '',
    glpeValue: '',
    ghifValue: '',
    cmcValue: '',
    totalValue: '',
    returnAmount: '',
    returnPercentage: '',
    comments: '',
  });

  // Modal State for New Fund / Edit Fund Details
  const [editingFund, setEditingFund] = useState<ManagedInvestment | null>(null);
  const [isAddingNewFund, setIsAddingNewFund] = useState(false);
  const [fundFormData, setFundFormData] = useState({
    name: '',
    category: 'GLPE' as 'GLPE' | 'GHIF' | 'CMC' | 'Other',
    institution: '',
    accountNumber: '',
    hin: '',
    initialValue: 0,
    initialContribution: 0,
    date: getTodayDate(), // Default to today's date!
  });

  // Modal State for Add / Edit History Entry
  const [addingEntryFund, setAddingEntryFund] = useState<ManagedInvestment | null>(null);
  const [editingEntry, setEditingEntry] = useState<{
    fund: ManagedInvestment;
    index: number;
  } | null>(null);

  const [entryFormData, setEntryFormData] = useState({
    date: getTodayDate(), // Default to today's date!
    value: 0,
    contribution: 0,
    notes: '',
  });

  // Financial KPI calculations
  const totalContributions = managedInvestments.reduce((acc, m) => acc + m.netContributions, 0);
  const totalValue = managedInvestments.reduce((acc, m) => acc + m.latestValue, 0);
  const totalGain = totalValue - totalContributions;
  const overallRoi = totalContributions > 0 ? (totalGain / totalContributions) * 100 : 0;

  // Open modal to add a brand new managed fund
  const handleOpenAddFund = () => {
    if (!canEdit) return;
    setIsAddingNewFund(true);
    setEditingFund(null);
    setFundFormData({
      name: '',
      category: 'GLPE',
      institution: '',
      accountNumber: '',
      hin: '',
      initialValue: 100000,
      initialContribution: 100000,
      date: getTodayDate(), // DEFAULTS TO TODAY'S DATE BY DEFAULT!
    });
  };

  // Open modal to edit existing fund details
  const handleOpenEditFund = (item: ManagedInvestment) => {
    if (!canEdit) return;
    setEditingFund(item);
    setIsAddingNewFund(false);
    setFundFormData({
      name: item.name,
      category: item.category,
      institution: item.institution || '',
      accountNumber: item.accountNumber || '',
      hin: item.hin || '',
      initialValue: item.latestValue,
      initialContribution: item.netContributions,
      date: getTodayDate(),
    });
  };

  // Submit New or Updated Fund Details
  const handleSaveFund = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAddingNewFund) {
      const value = Number(fundFormData.initialValue);
      const contribution = Number(fundFormData.initialContribution);
      const gain = value - contribution;
      const gainPercentage = contribution > 0 ? (gain / contribution) * 100 : 0;

      addManagedInvestment({
        name: fundFormData.name,
        category: fundFormData.category,
        institution: fundFormData.institution,
        accountNumber: fundFormData.accountNumber,
        hin: fundFormData.hin,
        latestValue: value,
        netContributions: contribution,
        totalGain: gain,
        gainPercentage,
        history: [
          {
            date: fundFormData.date || getTodayDate(),
            value,
            contribution,
            notes: 'Initial fund commitment',
          },
        ],
      });
      setIsAddingNewFund(false);
    } else if (editingFund) {
      updateManagedInvestment(editingFund.id, {
        name: fundFormData.name,
        category: fundFormData.category,
        institution: fundFormData.institution,
        accountNumber: fundFormData.accountNumber,
        hin: fundFormData.hin,
      });
      setEditingFund(null);
    }
  };

  // Open Modal to Add New Valuation History Entry for a Fund
  const handleOpenAddHistoryEntry = (fund: ManagedInvestment) => {
    if (!canEdit) return;
    setAddingEntryFund(fund);
    setEditingEntry(null);
    setEntryFormData({
      date: getTodayDate(), // DEFAULTS TO TODAY'S DATE BY DEFAULT!
      value: fund.latestValue,
      contribution: fund.netContributions,
      notes: '',
    });
  };

  // Open Modal to Edit an Existing Historical Entry
  const handleOpenEditHistoryEntry = (
    fund: ManagedInvestment,
    index: number,
    entry: { date: string; value: number; contribution: number; notes?: string }
  ) => {
    if (!canEdit) return;
    setEditingEntry({ fund, index });
    setAddingEntryFund(null);
    setEntryFormData({
      date: entry.date,
      value: entry.value,
      contribution: entry.contribution,
      notes: entry.notes || '',
    });
  };

  // Submit Valuation History Entry (Add or Edit)
  const handleSaveHistoryEntry = (e: React.FormEvent) => {
    e.preventDefault();

    if (addingEntryFund) {
      const fund = addingEntryFund;
      const executeAdd = () => {
        addValuationHistoryEntry(fund.id, {
          date: entryFormData.date || getTodayDate(),
          value: Number(entryFormData.value),
          contribution: Number(entryFormData.contribution),
          notes: entryFormData.notes,
        });
        setAddingEntryFund(null);
      };

      triggerMfaChallenge(
        'Add Valuation Entry',
        `Confirm adding valuation entry for "${fund.name}" dated ${
          entryFormData.date || getTodayDate()
        } ($${Number(entryFormData.value).toLocaleString()} AUD).`,
        executeAdd
      );
    } else if (editingEntry) {
      const { fund, index } = editingEntry;
      const executeUpdate = () => {
        updateValuationHistoryEntry(fund.id, index, {
          date: entryFormData.date,
          value: Number(entryFormData.value),
          contribution: Number(entryFormData.contribution),
          notes: entryFormData.notes,
        });
        setEditingEntry(null);
      };

      triggerMfaChallenge(
        'Update Historical Entry',
        `Confirm updating entry #${index + 1} for "${fund.name}" dated ${
          entryFormData.date
        } ($${Number(entryFormData.value).toLocaleString()} AUD).`,
        executeUpdate
      );
    }
  };

  // Delete Historical Entry
  const handleDeleteEntry = (fund: ManagedInvestment, index: number, entryDate: string) => {
    if (!canEdit) return;

    const executeDelete = () => {
      deleteValuationHistoryEntry(fund.id, index);
    };

    triggerMfaChallenge(
      'Delete Historical Entry',
      `Are you sure you want to delete the valuation entry dated ${entryDate} for "${fund.name}"?`,
      executeDelete
    );
  };

  // Delete Managed Fund
  const handleDeleteFund = (fund: ManagedInvestment) => {
    if (!canEdit) return;

    const executeDelete = () => {
      deleteManagedInvestment(fund.id);
    };

    triggerMfaChallenge(
      'Delete Managed Investment',
      `PERMANENT REMOVAL: Are you sure you want to remove "${fund.name}" from portfolio holdings?`,
      executeDelete
    );
  };

  // Monthly Ledger Handlers
  const getCurrentMonthName = () => {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handleOpenAddLedgerRow = () => {
    if (!canEdit) return;
    setIsAddingLedgerRow(true);
    setEditingLedgerRow(null);
    setLedgerFormData({
      month: getCurrentMonthName(), // Defaults to current month date!
      netFlow: '',
      glpeValue: '',
      ghifValue: '',
      cmcValue: '',
      totalValue: '',
      returnAmount: '',
      returnPercentage: '',
      comments: '',
    });
  };

  const handleOpenEditLedgerRow = (row: MonthlyLedgerEntry) => {
    if (!canEdit) return;
    setEditingLedgerRow(row);
    setIsAddingLedgerRow(false);
    setLedgerFormData({
      month: row.month,
      netFlow: row.netFlow !== null ? String(row.netFlow) : '',
      glpeValue: row.glpeValue !== null ? String(row.glpeValue) : '',
      ghifValue: row.ghifValue !== null ? String(row.ghifValue) : '',
      cmcValue: row.cmcValue !== null ? String(row.cmcValue) : '',
      totalValue: String(row.totalValue),
      returnAmount: row.returnAmount !== null ? String(row.returnAmount) : '',
      returnPercentage: row.returnPercentage !== null ? String(row.returnPercentage) : '',
      comments: row.comments || '',
    });
  };

  const handleSaveLedgerRow = (e: React.FormEvent) => {
    e.preventDefault();
    const netFlow = ledgerFormData.netFlow !== '' ? Number(ledgerFormData.netFlow) : null;
    const glpeValue = ledgerFormData.glpeValue !== '' ? Number(ledgerFormData.glpeValue) : null;
    const ghifValue = ledgerFormData.ghifValue !== '' ? Number(ledgerFormData.ghifValue) : null;
    const cmcValue = ledgerFormData.cmcValue !== '' ? Number(ledgerFormData.cmcValue) : null;
    const returnAmount = ledgerFormData.returnAmount !== '' ? Number(ledgerFormData.returnAmount) : null;
    const returnPercentage = ledgerFormData.returnPercentage !== '' ? Number(ledgerFormData.returnPercentage) : null;

    let calcTotal = Number(ledgerFormData.totalValue);
    if (!calcTotal && (glpeValue || ghifValue || cmcValue)) {
      calcTotal = (glpeValue || 0) + (ghifValue || 0) + (cmcValue || 0);
    }

    const payload = {
      month: ledgerFormData.month,
      netFlow,
      glpeValue,
      ghifValue,
      cmcValue,
      totalValue: calcTotal || 0,
      returnAmount,
      returnPercentage,
      comments: ledgerFormData.comments,
    };

    if (isAddingLedgerRow) {
      addMonthlyLedgerEntry(payload);
      setIsAddingLedgerRow(false);
    } else if (editingLedgerRow) {
      updateMonthlyLedgerEntry(editingLedgerRow.id, payload);
      setEditingLedgerRow(null);
    }
  };

  const handleDeleteLedgerRow = (row: MonthlyLedgerEntry) => {
    if (!canEdit) return;
    triggerMfaChallenge(
      'Delete Ledger Entry',
      `Are you sure you want to remove the monthly valuation entry for "${row.month}"?`,
      () => deleteMonthlyLedgerEntry(row.id)
    );
  };

  const filteredLedger = monthlyLedger.filter((row) => {
    if (!ledgerSearchTerm.trim()) return true;
    const term = ledgerSearchTerm.toLowerCase();
    return (
      row.month.toLowerCase().includes(term) ||
      (row.comments && row.comments.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Managed Investment Holdings</h1>
            <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono font-bold">
              GLPE / GHIF / CMC
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional private equity, yield funds, and ASX CHESS stockbroking portfolios
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {activeTab === 'ledger' ? (
            <button
              onClick={() => exportMonthlyLedgerCSV(monthlyLedger)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export Ledger CSV</span>
            </button>
          ) : (
            <button
              onClick={() => exportManagedInvestmentsCSV(managedInvestments)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export CSV</span>
            </button>
          )}

          {canEdit && (
            activeTab === 'ledger' ? (
              <button
                onClick={handleOpenAddLedgerRow}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Monthly Entry</span>
              </button>
            ) : (
              <button
                onClick={handleOpenAddFund}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Managed Fund</span>
              </button>
            )
          )}

          <div className="text-right pl-2 border-l border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Latest Month Valuation
            </div>
            <div className="text-lg font-extrabold text-emerald-700 font-mono">
              ${(monthlyLedger[monthlyLedger.length - 1]?.totalValue || totalValue).toLocaleString('en-AU')} AUD
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ledger'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>Monthly Portfolio Ledger</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-mono">
            {monthlyLedger.length} Months
          </span>
        </button>

        <button
          onClick={() => setActiveTab('funds')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'funds'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Fund Holdings & History Cards</span>
          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-mono">
            {managedInvestments.length} Holdings
          </span>
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'ledger' ? (
        <div className="space-y-6">
          {/* Search and Summary Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search month or comments (e.g., '12 Coromandel', 'Barwon', 'Bonus', 'GHIF')..."
                value={ledgerSearchTerm}
                onChange={(e) => setLedgerSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-400 uppercase text-[10px] block font-sans">Active Records</span>
                <span className="font-bold text-slate-800">{filteredLedger.length} / {monthlyLedger.length}</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-slate-400 uppercase text-[10px] block font-sans">Peak Month Valuation</span>
                <span className="font-bold text-emerald-700">
                  ${Math.max(...monthlyLedger.map((m) => m.totalValue)).toLocaleString('en-AU')} AUD
                </span>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Month</th>
                    <th className="py-3.5 px-4 text-right">Net Flow</th>
                    <th className="py-3.5 px-4 text-right">GLPE Value</th>
                    <th className="py-3.5 px-4 text-right">GHIF Value</th>
                    <th className="py-3.5 px-4 text-right">CMC Value</th>
                    <th className="py-3.5 px-4 text-right bg-slate-200/50 font-extrabold text-slate-900">Total Value</th>
                    <th className="py-3.5 px-4 text-right">Return ($)</th>
                    <th className="py-3.5 px-4 text-right">Return (%)</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Comments / Remarks</th>
                    {canEdit && <th className="py-3.5 px-4 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredLedger.map((row, idx) => {
                    const isPositiveReturn = (row.returnAmount || 0) >= 0;
                    return (
                      <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 font-sans whitespace-nowrap">
                          {row.month}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {row.netFlow !== null ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                row.netFlow > 0
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : row.netFlow < 0
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : 'text-slate-500'
                              }`}
                            >
                              {row.netFlow > 0 ? `+$${row.netFlow.toLocaleString('en-AU')}` : `$${row.netFlow.toLocaleString('en-AU')}`}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap text-slate-700">
                          {row.glpeValue !== null ? `$${row.glpeValue.toLocaleString('en-AU')}` : <span className="text-slate-300">-</span>}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap text-slate-700">
                          {row.ghifValue !== null ? `$${row.ghifValue.toLocaleString('en-AU')}` : <span className="text-slate-300">-</span>}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap text-slate-700">
                          {row.cmcValue !== null ? `$${row.cmcValue.toLocaleString('en-AU')}` : <span className="text-slate-300">-</span>}
                        </td>

                        <td className="py-3 px-4 text-right font-extrabold text-slate-900 bg-slate-50 whitespace-nowrap">
                          ${row.totalValue.toLocaleString('en-AU')}
                        </td>

                        <td className={`py-3 px-4 text-right whitespace-nowrap font-semibold ${isPositiveReturn ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {row.returnAmount !== null ? (
                            <span>{row.returnAmount > 0 ? `+$${row.returnAmount.toLocaleString('en-AU')}` : `$${row.returnAmount.toLocaleString('en-AU')}`}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {row.returnPercentage !== null ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                row.returnPercentage >= 0
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {row.returnPercentage >= 0 ? `+${row.returnPercentage.toFixed(2)}%` : `${row.returnPercentage.toFixed(2)}%`}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-sans text-slate-600 text-xs">
                          {row.comments || <span className="text-slate-300 italic">No notes</span>}
                        </td>

                        {canEdit && (
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => handleOpenEditLedgerRow(row)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Row"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLedgerRow(row)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Delete Row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
            Net Contributions to Date
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">
            ${totalContributions.toLocaleString('en-AU')} AUD
          </div>
          <p className="text-xs text-slate-500 mt-1">Total invested across all active funds</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
            Latest Portfolio Value
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">
            ${totalValue.toLocaleString('en-AU')} AUD
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+${totalGain.toLocaleString('en-AU')} AUD net gain</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
            Overall Return on Investment
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-2">
            +{overallRoi.toFixed(1)}% ROI
          </div>
          <p className="text-xs text-slate-500 mt-1">Real-time sync across all portfolio entries</p>
        </div>
      </div>

      {/* Holdings Cards */}
      <div className="space-y-6">
        {managedInvestments.map((m) => {
          const isPositive = m.totalGain >= 0;
          const isExpanded = expandedFundId === m.id;

          return (
            <div
              key={m.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all hover:border-slate-300"
            >
              {/* Card Main Row */}
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                        {m.category}
                      </span>
                      {m.institution && (
                        <span className="text-xs font-medium text-slate-500">{m.institution}</span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{m.name}</h2>
                    {(m.accountNumber || m.hin) && (
                      <div className="flex flex-wrap gap-3 text-xs text-slate-600 font-mono pt-1">
                        {m.hin && (
                          <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            CHESS HIN: <strong>{m.hin}</strong>
                          </span>
                        )}
                        {m.accountNumber && (
                          <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            Ref: <strong>{m.accountNumber}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {canEdit && (
                      <>
                        <button
                          onClick={() => handleOpenAddHistoryEntry(m)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Entry</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditFund(m)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                          title="Edit Fund Metadata"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFund(m)}
                          className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                          title="Delete Managed Fund"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Valuation Metrics Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Latest Market Valuation
                    </span>
                    <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                      ${m.latestValue.toLocaleString('en-AU')} AUD
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Net Capital Invested
                    </span>
                    <div className="text-xl font-bold text-slate-700 font-mono mt-0.5">
                      ${m.netContributions.toLocaleString('en-AU')} AUD
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Total Gain / Return
                    </span>
                    <div
                      className={`text-xl font-bold font-mono mt-0.5 flex items-center gap-1 ${
                        isPositive ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span>
                        {isPositive ? '+' : ''}${m.totalGain.toLocaleString('en-AU')} (
                        {m.gainPercentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toggle View History Logs */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setExpandedFundId(isExpanded ? null : m.id)}
                    className="flex items-center space-x-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    <History className="w-4 h-4" />
                    <span>
                      {isExpanded ? 'Hide Previous Valuation Entries' : 'View & Edit Previous Entries'} ({m.history ? m.history.length : 0})
                    </span>
                  </button>

                  <span className="text-[10px] text-slate-400">
                    Last Updated: {new Date(m.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Expanded Valuation History Log Table */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/70 p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Historical Valuation & Contribution Log</span>
                    </h3>

                    {canEdit && (
                      <button
                        onClick={() => handleOpenAddHistoryEntry(m)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Entry</span>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                          <th className="py-2.5 px-4">Date / Period</th>
                          <th className="py-2.5 px-4 text-right">Valuation ($ AUD)</th>
                          <th className="py-2.5 px-4 text-right">Net Contribution ($ AUD)</th>
                          <th className="py-2.5 px-4 text-right">Calculated Gain ($)</th>
                          <th className="py-2.5 px-4">Notes / Remarks</th>
                          {canEdit && <th className="py-2.5 px-4 text-center">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(m.history || []).map((h, idx) => {
                          const gain = h.value - h.contribution;
                          const pos = gain >= 0;

                          return (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                              <td className="py-2.5 px-4 font-bold text-slate-900 font-mono">
                                {h.date}
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono font-extrabold text-slate-900">
                                ${h.value.toLocaleString('en-AU')}
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                                ${h.contribution.toLocaleString('en-AU')}
                              </td>
                              <td
                                className={`py-2.5 px-4 text-right font-mono font-bold ${
                                  pos ? 'text-emerald-700' : 'text-rose-600'
                                }`}
                              >
                                {pos ? '+' : ''}${gain.toLocaleString('en-AU')}
                              </td>
                              <td className="py-2.5 px-4 text-slate-500 italic max-w-xs truncate">
                                {h.notes || '—'}
                              </td>
                              {canEdit && (
                                <td className="py-2.5 px-4 text-center">
                                  <div className="flex items-center justify-center space-x-1.5">
                                    <button
                                      onClick={() => handleOpenEditHistoryEntry(m, idx, h)}
                                      className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                      title="Edit this entry"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEntry(m, idx, h.date)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                      title="Delete entry"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                        {(!m.history || m.history.length === 0) && (
                          <tr>
                            <td
                              colSpan={canEdit ? 6 : 5}
                              className="py-4 text-center text-slate-400 italic"
                            >
                              No history entries logged for this fund yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  )}

      {/* Modal: Add or Edit Historical Valuation Entry */}
      {(addingEntryFund || editingEntry) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>
                  {addingEntryFund
                    ? `Add New Entry - ${addingEntryFund.name}`
                    : `Edit Entry #${(editingEntry?.index || 0) + 1} - ${editingEntry?.fund.name}`}
                </span>
              </h2>
              <button
                onClick={() => {
                  setAddingEntryFund(null);
                  setEditingEntry(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHistoryEntry} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Valuation Date (Defaults to Today)
                </label>
                <input
                  type="date"
                  required
                  value={entryFormData.date}
                  onChange={(e) => setEntryFormData({ ...entryFormData, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Defaults to today's date ({getTodayDate()}) automatically.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Valuation Market Value ($ AUD)
                </label>
                <input
                  type="number"
                  required
                  value={entryFormData.value}
                  onChange={(e) =>
                    setEntryFormData({ ...entryFormData, value: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Net Capital Contributions ($ AUD)
                </label>
                <input
                  type="number"
                  required
                  value={entryFormData.contribution}
                  onChange={(e) =>
                    setEntryFormData({ ...entryFormData, contribution: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={entryFormData.notes}
                  onChange={(e) => setEntryFormData({ ...entryFormData, notes: e.target.value })}
                  placeholder="e.g. Q3 Distribution re-investment / Quarterly statement update"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddingEntryFund(null);
                    setEditingEntry(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Entry (MFA Prompt)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Monthly Ledger Row */}
      {(isAddingLedgerRow || editingLedgerRow) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-blue-600" />
                <span>{isAddingLedgerRow ? 'Add Monthly Portfolio Entry' : `Edit Entry: ${editingLedgerRow?.month}`}</span>
              </h2>
              <button
                onClick={() => {
                  setIsAddingLedgerRow(false);
                  setEditingLedgerRow(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLedgerRow} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Month Name (e.g. Jul 2026 or Aug 2026)
                </label>
                <input
                  type="text"
                  required
                  value={ledgerFormData.month}
                  onChange={(e) => setLedgerFormData({ ...ledgerFormData, month: e.target.value })}
                  placeholder="e.g. Aug 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Net Flow ($ AUD)
                  </label>
                  <input
                    type="number"
                    value={ledgerFormData.netFlow}
                    onChange={(e) => setLedgerFormData({ ...ledgerFormData, netFlow: e.target.value })}
                    placeholder="e.g. 10000 or -5000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Total Value Month-End ($ AUD)
                  </label>
                  <input
                    type="number"
                    required
                    value={ledgerFormData.totalValue}
                    onChange={(e) => setLedgerFormData({ ...ledgerFormData, totalValue: e.target.value })}
                    placeholder="e.g. 957407"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">GLPE Value ($)</label>
                  <input
                    type="number"
                    value={ledgerFormData.glpeValue}
                    onChange={(e) => setLedgerFormData({ ...ledgerFormData, glpeValue: e.target.value })}
                    placeholder="e.g. 918684"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">GHIF Value ($)</label>
                  <input
                    type="number"
                    value={ledgerFormData.ghifValue}
                    onChange={(e) => setLedgerFormData({ ...ledgerFormData, ghifValue: e.target.value })}
                    placeholder="e.g. 122"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">CMC Value ($)</label>
                  <input
                    type="number"
                    value={ledgerFormData.cmcValue}
                    onChange={(e) => setLedgerFormData({ ...ledgerFormData, cmcValue: e.target.value })}
                    placeholder="e.g. 9146"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Return ($ AUD)</label>
                  <input
                    type="number"
                    value={ledgerFormData.returnAmount}
                    onChange={(e) => setLedgerFormData({ ...ledgerFormData, returnAmount: e.target.value })}
                    placeholder="e.g. 2108"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Return (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ledgerFormData.returnPercentage}
                    onChange={(e) => setLedgerFormData({ ...ledgerFormData, returnPercentage: e.target.value })}
                    placeholder="e.g. 0.22"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Comments / Docs / Remarks</label>
                <input
                  type="text"
                  value={ledgerFormData.comments}
                  onChange={(e) => setLedgerFormData({ ...ledgerFormData, comments: e.target.value })}
                  placeholder="e.g. Bonus, 12 Coromandel property sale, Barwon dividend"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingLedgerRow(false);
                    setEditingLedgerRow(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Ledger Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Managed Fund Metadata */}
      {(isAddingNewFund || editingFund) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>{isAddingNewFund ? 'Add New Managed Fund' : `Edit ${editingFund?.name}`}</span>
              </h2>
              <button
                onClick={() => {
                  setIsAddingNewFund(false);
                  setEditingFund(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFund} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fund Name</label>
                <input
                  type="text"
                  required
                  value={fundFormData.name}
                  onChange={(e) => setFundFormData({ ...fundFormData, name: e.target.value })}
                  placeholder="e.g. Global High Income Fund (GHIF)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={fundFormData.category}
                    onChange={(e) =>
                      setFundFormData({
                        ...fundFormData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="GLPE">GLPE</option>
                    <option value="GHIF">GHIF</option>
                    <option value="CMC">CMC</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Institution</label>
                  <input
                    type="text"
                    value={fundFormData.institution}
                    onChange={(e) =>
                      setFundFormData({ ...fundFormData, institution: e.target.value })
                    }
                    placeholder="e.g. CMC Markets"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">CHESS HIN</label>
                  <input
                    type="text"
                    value={fundFormData.hin}
                    onChange={(e) => setFundFormData({ ...fundFormData, hin: e.target.value })}
                    placeholder="e.g. 0135401421"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Ref</label>
                  <input
                    type="text"
                    value={fundFormData.accountNumber}
                    onChange={(e) =>
                      setFundFormData({ ...fundFormData, accountNumber: e.target.value })
                    }
                    placeholder="e.g. CMC-7739201"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {isAddingNewFund && (
                <>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Initial Valuation ($)
                      </label>
                      <input
                        type="number"
                        required
                        value={fundFormData.initialValue}
                        onChange={(e) =>
                          setFundFormData({
                            ...fundFormData,
                            initialValue: Number(e.target.value),
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Initial Capital ($)
                      </label>
                      <input
                        type="number"
                        required
                        value={fundFormData.initialContribution}
                        onChange={(e) =>
                          setFundFormData({
                            ...fundFormData,
                            initialContribution: Number(e.target.value),
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Entry Date (Defaults to Today)
                    </label>
                    <input
                      type="date"
                      required
                      value={fundFormData.date}
                      onChange={(e) => setFundFormData({ ...fundFormData, date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewFund(false);
                    setEditingFund(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isAddingNewFund ? 'Create Managed Fund' : 'Save Fund Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
