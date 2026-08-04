import React, { useState } from 'react';
import { PortfolioProvider, usePortfolio } from './services/store';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { PropertyPortfolio } from './components/PropertyPortfolio';
import { ManagedInvestments } from './components/ManagedInvestments';
import { CorporateStructure } from './components/CorporateStructure';
import { DocumentRepository } from './components/DocumentRepository';
import { FamilyPermissions } from './components/FamilyPermissions';
import { TaxReportGenerator } from './components/TaxReportGenerator';
import { AuditLogViewer } from './components/AuditLogViewer';
import { MFAModal } from './components/MFAModal';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMfaOpen, setIsMfaOpen] = useState(false);
  const { pendingMfaAction } = usePortfolio();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMfaModal={() => setIsMfaOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {(activeTab === 'overview' || activeTab === 'dashboard') && (
          <DashboardOverview onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'properties' && <PropertyPortfolio />}

        {activeTab === 'investments' && <ManagedInvestments />}

        {activeTab === 'corporate' && <CorporateStructure />}

        {activeTab === 'documents' && <DocumentRepository />}

        {activeTab === 'permissions' && <FamilyPermissions />}

        {(activeTab === 'tax-reports' || activeTab === 'tax-report') && <TaxReportGenerator />}

        {(activeTab === 'audit-logs' || activeTab === 'audit') && <AuditLogViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 print:hidden shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-800">Sahota Family Investment Portfolio</span> • Discretionary Trust Asset Sync Engine
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Real-Time Multi-Tab Sync Active • Step-Up MFA Challenge Ready
          </div>
        </div>
      </footer>

      {/* Step-Up MFA Challenge Modal */}
      <MFAModal
        isOpen={isMfaOpen || !!pendingMfaAction}
        onClose={() => setIsMfaOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <PortfolioProvider>
      <MainAppContent />
    </PortfolioProvider>
  );
}

export default App;
