import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  User,
  Clock,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { AuditLog } from '../types';
import { usePortfolio } from '../services/store';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'All' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const handleExportCsv = () => {
    const headers = 'ID,Timestamp,User,Email,Role,Action,Target Entity,Description,IP Address\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.userName}","${l.userEmail}","${l.userRole}","${l.action}","${l.targetEntity}","${l.description.replace(/"/g, '""')}","${l.ipAddress}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sahota_family_audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'UPDATE':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'DELETE':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'ROLE_CHANGE':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'MFA_TOGGLE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'DOC_ATTACH':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Audit Logs & Change Ledger</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 font-mono font-bold">
              {auditLogs.length} Recorded Events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log tracking all property edits, valuation updates, document attachments, and role modifications
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search action description, user, or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Action Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 w-full font-medium"
          >
            <option value="All">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="ROLE_CHANGE">ROLE_CHANGE</option>
            <option value="MFA_TOGGLE">MFA_TOGGLE</option>
            <option value="DOC_ATTACH">DOC_ATTACH</option>
            <option value="TAX_REPORT_GENERATE">TAX_REPORT_GENERATE</option>
            <option value="SECURITY_ALERT">SECURITY_ALERT</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-3">Family Member</th>
                <th className="py-3.5 px-3">Action</th>
                <th className="py-3.5 px-3">Target Entity</th>
                <th className="py-3.5 px-4">Change Description</th>
                <th className="py-3.5 px-3">IP / Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-blue-700 font-medium">{log.userRole}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-medium text-slate-900">
                    {log.targetEntity}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    <div>{log.description}</div>
                    {log.details && (
                      <div className="mt-1 text-[11px] font-mono text-blue-900 bg-blue-50 px-2 py-1 rounded border border-blue-200 inline-block">
                        {log.details.oldValue !== undefined && (
                          <span>Was: {String(log.details.oldValue)} → </span>
                        )}
                        <span>New: {String(log.details.newValue || log.details.field)}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
