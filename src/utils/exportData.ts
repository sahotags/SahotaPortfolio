import {
  PropertyItem,
  ManagedInvestment,
  MonthlyLedgerEntry,
  CorporateEntity,
  ScheduledPayment,
  DocumentItem,
  FamilyUser,
  AuditLog,
} from '../types';

export interface PortfolioExportPayload {
  exportDate: string;
  properties: PropertyItem[];
  managedInvestments: ManagedInvestment[];
  corporateEntities: CorporateEntity[];
  scheduledPayments: ScheduledPayment[];
  documents: DocumentItem[];
  users: FamilyUser[];
  auditLogs: AuditLog[];
}

export function downloadJSON(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAllPortfolioJSON(portfolio: Omit<PortfolioExportPayload, 'exportDate'>) {
  const payload: PortfolioExportPayload = {
    exportDate: new Date().toISOString(),
    ...portfolio,
  };
  const dateStr = new Date().toISOString().split('T')[0];
  downloadJSON(payload, `sahota_family_portfolio_export_${dateStr}.json`);
}

export function exportManagedInvestmentsCSV(managedInvestments: ManagedInvestment[]) {
  const headers = [
    'Fund ID',
    'Fund Name',
    'Category',
    'Institution',
    'Account / HIN',
    'Net Contributions ($ AUD)',
    'Latest Market Value ($ AUD)',
    'Net Gain/Loss ($ AUD)',
    'Gain %',
    'Last Updated',
    'Valuation History Log',
  ];

  const rows = managedInvestments.map((m) => {
    const historySummary = (m.history || [])
      .map((h) => `${h.date}: Val $${h.value} | Contrib $${h.contribution}${h.notes ? ' (' + h.notes + ')' : ''}`)
      .join(' ; ');

    return [
      m.id,
      `"${m.name.replace(/"/g, '""')}"`,
      m.category,
      `"${(m.institution || '').replace(/"/g, '""')}"`,
      `"${(m.hin || m.accountNumber || '').replace(/"/g, '""')}"`,
      m.netContributions,
      m.latestValue,
      m.totalGain,
      m.gainPercentage.toFixed(2),
      m.lastUpdated,
      `"${historySummary.replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `sahota_managed_funds_export_${dateStr}.csv`);
}

export function exportMonthlyLedgerCSV(monthlyLedger: MonthlyLedgerEntry[]) {
  const headers = [
    'Month',
    'Net Flow ($ AUD)',
    'GLPE Value ($ AUD)',
    'GHIF Value ($ AUD)',
    'CMC Value ($ AUD)',
    'Total Value (month-end)',
    'Return ($ AUD)',
    'Return (%)',
    'Comments / Docs',
  ];

  const rows = monthlyLedger.map((row) => [
    `"${row.month}"`,
    row.netFlow !== null ? row.netFlow : '-',
    row.glpeValue !== null ? row.glpeValue : '-',
    row.ghifValue !== null ? row.ghifValue : '-',
    row.cmcValue !== null ? row.cmcValue : '-',
    row.totalValue,
    row.returnAmount !== null ? row.returnAmount : '-',
    row.returnPercentage !== null ? `${row.returnPercentage}%` : '-',
    `"${(row.comments || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `sahota_monthly_managed_funds_ledger_${dateStr}.csv`);
}

export function exportAllPortfolioCSV(portfolio: Omit<PortfolioExportPayload, 'exportDate'>) {
  let sections: string[] = [];

  // Section 1: Properties
  sections.push('=== PROPERTY PORTFOLIO ===');
  sections.push('ID,Name,Status,Total Costs ($),Total Income ($),Gross Profit ($),Margin %,Country,Acquisition Date,Sale Date,Entity Owner,Notes');
  portfolio.properties.forEach((p) => {
    sections.push(
      [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.status,
        p.totalCosts,
        p.totalIncome,
        p.grossProfit,
        p.marginPercentage,
        p.country,
        p.acquisitionDate || '',
        p.saleDate || '',
        `"${p.entityOwner.replace(/"/g, '""')}"`,
        `"${(p.notes || '').replace(/"/g, '""')}"`,
      ].join(',')
    );
  });

  sections.push('\n=== MANAGED INVESTMENTS & FUNDS ===');
  sections.push('ID,Name,Category,Institution,Net Contributions ($),Latest Value ($),Total Gain ($),Gain %,Last Updated,History Summary');
  portfolio.managedInvestments.forEach((m) => {
    const hist = (m.history || []).map((h) => `${h.date}: Val $${h.value}`).join('; ');
    sections.push(
      [
        m.id,
        `"${m.name.replace(/"/g, '""')}"`,
        m.category,
        `"${(m.institution || '').replace(/"/g, '""')}"`,
        m.netContributions,
        m.latestValue,
        m.totalGain,
        m.gainPercentage.toFixed(2),
        m.lastUpdated,
        `"${hist.replace(/"/g, '""')}"`,
      ].join(',')
    );
  });

  sections.push('\n=== CORPORATE ENTITIES & TRUSTS ===');
  sections.push('ID,Name,Type,ACN,ABN,TFN,Bank Account,Directors,Shareholders');
  portfolio.corporateEntities.forEach((c) => {
    sections.push(
      [
        c.id,
        `"${c.name.replace(/"/g, '""')}"`,
        c.type,
        c.acn || '',
        c.abn || '',
        c.tfn || '',
        `"${(c.bankAccount || '').replace(/"/g, '""')}"`,
        `"${(c.directors || []).join('; ').replace(/"/g, '""')}"`,
        `"${(c.shareholders || []).join('; ').replace(/"/g, '""')}"`,
      ].join(',')
    );
  });

  const fullCsv = sections.join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(fullCsv, `sahota_consolidated_portfolio_export_${dateStr}.csv`);
}
