import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PropertyItem,
  ManagedInvestment,
  MonthlyLedgerEntry,
  CorporateEntity,
  ScheduledPayment,
  DocumentItem,
  FamilyUser,
  AuditLog,
  UserRole,
} from '../types';
import {
  INITIAL_PROPERTIES,
  INITIAL_MANAGED_INVESTMENTS,
  INITIAL_MONTHLY_LEDGER,
  INITIAL_CORPORATE_ENTITIES,
  INITIAL_SCHEDULED_PAYMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

interface PortfolioContextType {
  properties: PropertyItem[];
  managedInvestments: ManagedInvestment[];
  monthlyLedger: MonthlyLedgerEntry[];
  corporateEntities: CorporateEntity[];
  scheduledPayments: ScheduledPayment[];
  documents: DocumentItem[];
  users: FamilyUser[];
  auditLogs: AuditLog[];
  currentUser: FamilyUser;
  lastLiveSyncTime: string | null;
  liveSyncCount: number;

  // MFA Challenge State
  pendingMfaAction: {
    title: string;
    description: string;
    onSuccess: () => void;
  } | null;

  // Actions
  setCurrentUser: (user: FamilyUser) => void;
  triggerMfaChallenge: (title: string, description: string, onSuccess: () => void) => boolean;
  clearMfaChallenge: () => void;

  addProperty: (item: Omit<PropertyItem, 'id' | 'lastUpdated'>) => void;
  updateProperty: (id: string, updates: Partial<PropertyItem>) => void;
  deleteProperty: (id: string) => void;

  addManagedInvestment: (item: Omit<ManagedInvestment, 'id' | 'lastUpdated'>) => void;
  updateManagedInvestment: (id: string, updates: Partial<ManagedInvestment>) => void;
  deleteManagedInvestment: (id: string) => void;
  addValuationHistoryEntry: (
    investmentId: string,
    entry: { date: string; value: number; contribution: number; notes?: string }
  ) => void;
  updateValuationHistoryEntry: (
    investmentId: string,
    entryIndex: number,
    entry: { date: string; value: number; contribution: number; notes?: string }
  ) => void;
  deleteValuationHistoryEntry: (investmentId: string, entryIndex: number) => void;

  addMonthlyLedgerEntry: (entry: Omit<MonthlyLedgerEntry, 'id'>) => void;
  updateMonthlyLedgerEntry: (id: string, updates: Partial<MonthlyLedgerEntry>) => void;
  deleteMonthlyLedgerEntry: (id: string) => void;

  addCorporateEntity: (entity: Omit<CorporateEntity, 'id'>) => void;
  updateCorporateEntity: (id: string, updates: Partial<CorporateEntity>) => void;
  deleteCorporateEntity: (id: string) => void;

  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadDate'>) => void;
  deleteDocument: (id: string) => void;

  addFamilyMember: (user: Omit<FamilyUser, 'id' | 'lastActive'>) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyUser>) => void;
  deleteFamilyMember: (id: string) => void;
  updateUserContact: (
    userId: string,
    contact: { phone?: string; email?: string; preferredMfaMethod?: 'SMS' | 'EMAIL' | 'TOTP' }
  ) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  toggleMfaForUser: (userId: string) => void;

  addAuditLog: (
    action: AuditLog['action'],
    targetEntity: string,
    description: string,
    details?: AuditLog['details']
  ) => void;

  resetToDefaultData: () => void;
}

const STORAGE_KEYS = {
  PROPERTIES: 'sahota_properties_v2',
  INVESTMENTS: 'sahota_investments_v3',
  MONTHLY_LEDGER: 'sahota_monthly_ledger_v1',
  ENTITIES: 'sahota_entities_v2',
  PAYMENTS: 'sahota_payments_v2',
  DOCUMENTS: 'sahota_documents_v2',
  USERS: 'sahota_users_v2',
  AUDIT: 'sahota_audit_v2',
  CURRENT_USER: 'sahota_current_user_v2',
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<PropertyItem[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    return local ? JSON.parse(local) : INITIAL_PROPERTIES;
  });

  const [managedInvestments, setManagedInvestments] = useState<ManagedInvestment[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    return local ? JSON.parse(local) : INITIAL_MANAGED_INVESTMENTS;
  });

  const [monthlyLedger, setMonthlyLedger] = useState<MonthlyLedgerEntry[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.MONTHLY_LEDGER);
    return local ? JSON.parse(local) : INITIAL_MONTHLY_LEDGER;
  });

  const [corporateEntities, setCorporateEntities] = useState<CorporateEntity[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.ENTITIES);
    return local ? JSON.parse(local) : INITIAL_CORPORATE_ENTITIES;
  });

  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return local ? JSON.parse(local) : INITIAL_SCHEDULED_PAYMENTS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return local ? JSON.parse(local) : INITIAL_DOCUMENTS;
  });

  const [users, setUsers] = useState<FamilyUser[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.USERS);
    return local ? JSON.parse(local) : INITIAL_USERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return local ? JSON.parse(local) : INITIAL_AUDIT_LOGS;
  });

  const [currentUser, setCurrentUser] = useState<FamilyUser>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (local) {
      const parsed = JSON.parse(local);
      const found = INITIAL_USERS.find((u) => u.id === parsed.id);
      if (found) return found;
    }
    return INITIAL_USERS[0]; // Gagandeep Singh Sahota by default
  });

  const [pendingMfaAction, setPendingMfaAction] = useState<{
    title: string;
    description: string;
    onSuccess: () => void;
  } | null>(null);

  const [lastLiveSyncTime, setLastLiveSyncTime] = useState<string | null>(null);
  const [liveSyncCount, setLiveSyncCount] = useState<number>(0);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(managedInvestments));
  }, [managedInvestments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_LEDGER, JSON.stringify(monthlyLedger));
  }, [monthlyLedger]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENTITIES, JSON.stringify(corporateEntities));
  }, [corporateEntities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Real-time BroadcastChannel for Multi-tab Live Sync
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const channel = new BroadcastChannel('sahota_portfolio_sync_channel');

    channel.onmessage = (event) => {
      if (event.data && event.data.type === 'PORTFOLIO_STATE_UPDATE') {
        const payload = event.data.payload;
        if (payload.properties) setProperties(payload.properties);
        if (payload.managedInvestments) setManagedInvestments(payload.managedInvestments);
        if (payload.documents) setDocuments(payload.documents);
        if (payload.users) setUsers(payload.users);
        if (payload.auditLogs) setAuditLogs(payload.auditLogs);

        setLastLiveSyncTime(new Date().toLocaleTimeString());
        setLiveSyncCount((prev) => prev + 1);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const broadcastStateChange = (payload: Record<string, any>) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('sahota_portfolio_sync_channel');
      channel.postMessage({
        type: 'PORTFOLIO_STATE_UPDATE',
        sender: currentUser.name,
        timestamp: new Date().toISOString(),
        payload,
      });
      channel.close();
    }
  };

  const addAuditLog = (
    action: AuditLog['action'],
    targetEntity: string,
    description: string,
    details?: AuditLog['details']
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      targetEntity,
      description,
      details,
      ipAddress: '110.142.88.19 (Sydney, AU)',
    };

    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      broadcastStateChange({ auditLogs: updated });
      return updated;
    });
  };

  const triggerMfaChallenge = (title: string, description: string, onSuccess: () => void): boolean => {
    if (!currentUser.mfaEnabled) {
      // If user hasn't enabled MFA, proceed directly or ask to prompt
      onSuccess();
      return true;
    }
    setPendingMfaAction({
      title,
      description,
      onSuccess,
    });
    return false;
  };

  const clearMfaChallenge = () => {
    setPendingMfaAction(null);
  };

  const addProperty = (item: Omit<PropertyItem, 'id' | 'lastUpdated'>) => {
    const id = `prop-${Date.now()}`;
    const newProperty: PropertyItem = {
      ...item,
      id,
      lastUpdated: new Date().toISOString(),
    };

    setProperties((prev) => {
      const updated = [newProperty, ...prev];
      broadcastStateChange({ properties: updated });
      return updated;
    });

    addAuditLog(
      'CREATE',
      newProperty.name,
      `Added new property "${newProperty.name}" with cost $${newProperty.totalCosts.toLocaleString()}`
    );
  };

  const updateProperty = (id: string, updates: Partial<PropertyItem>) => {
    setProperties((prev) => {
      const existing = prev.find((p) => p.id === id);
      const updated = prev.map((p) =>
        p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p
      );
      broadcastStateChange({ properties: updated });

      if (existing) {
        addAuditLog(
          'UPDATE',
          existing.name,
          `Updated property "${existing.name}" details.`,
          {
            field: Object.keys(updates).join(', '),
            oldValue: JSON.stringify(updates),
            newValue: 'Updated',
          }
        );
      }
      return updated;
    });
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => {
      const existing = prev.find((p) => p.id === id);
      const updated = prev.filter((p) => p.id !== id);
      broadcastStateChange({ properties: updated });

      if (existing) {
        addAuditLog('DELETE', existing.name, `Removed property "${existing.name}" from portfolio.`);
      }
      return updated;
    });
  };

  const addManagedInvestment = (item: Omit<ManagedInvestment, 'id' | 'lastUpdated'>) => {
    const id = `mgt-${Date.now()}`;
    const newItem: ManagedInvestment = {
      ...item,
      id,
      lastUpdated: new Date().toISOString(),
    };

    setManagedInvestments((prev) => {
      const updated = [...prev, newItem];
      broadcastStateChange({ managedInvestments: updated });
      return updated;
    });

    addAuditLog('CREATE', newItem.name, `Added managed investment holding "${newItem.name}".`);
  };

  const updateManagedInvestment = (id: string, updates: Partial<ManagedInvestment>) => {
    setManagedInvestments((prev) => {
      const existing = prev.find((m) => m.id === id);
      const updated = prev.map((m) =>
        m.id === id ? { ...m, ...updates, lastUpdated: new Date().toISOString() } : m
      );
      broadcastStateChange({ managedInvestments: updated });

      if (existing) {
        addAuditLog('UPDATE', existing.name, `Updated managed investment valuation for "${existing.name}".`);
      }
      return updated;
    });
  };

  const deleteManagedInvestment = (id: string) => {
    setManagedInvestments((prev) => {
      const existing = prev.find((m) => m.id === id);
      const updated = prev.filter((m) => m.id !== id);
      broadcastStateChange({ managedInvestments: updated });
      if (existing) {
        addAuditLog('DELETE', existing.name, `Deleted managed investment fund "${existing.name}".`);
      }
      return updated;
    });
  };

  const addValuationHistoryEntry = (
    investmentId: string,
    entry: { date: string; value: number; contribution: number; notes?: string }
  ) => {
    setManagedInvestments((prev) => {
      const target = prev.find((m) => m.id === investmentId);
      if (!target) return prev;

      const newHistory = [...(target.history || []), entry];
      const latestEntry = newHistory[newHistory.length - 1];
      const latestValue = Number(latestEntry.value);
      const netContributions = Number(latestEntry.contribution);
      const totalGain = latestValue - netContributions;
      const gainPercentage = netContributions > 0 ? (totalGain / netContributions) * 100 : 0;

      const updated = prev.map((m) =>
        m.id === investmentId
          ? {
              ...m,
              latestValue,
              netContributions,
              totalGain,
              gainPercentage,
              history: newHistory,
              lastUpdated: new Date().toISOString(),
            }
          : m
      );

      broadcastStateChange({ managedInvestments: updated });
      addAuditLog(
        'UPDATE',
        target.name,
        `Added valuation history entry (${entry.date}: $${entry.value.toLocaleString()}) for "${target.name}".`
      );
      return updated;
    });
  };

  const updateValuationHistoryEntry = (
    investmentId: string,
    entryIndex: number,
    entry: { date: string; value: number; contribution: number; notes?: string }
  ) => {
    setManagedInvestments((prev) => {
      const target = prev.find((m) => m.id === investmentId);
      if (!target) return prev;

      const newHistory = (target.history || []).map((h, i) => (i === entryIndex ? entry : h));
      const latestEntry = newHistory[newHistory.length - 1] || entry;
      const latestValue = Number(latestEntry.value);
      const netContributions = Number(latestEntry.contribution);
      const totalGain = latestValue - netContributions;
      const gainPercentage = netContributions > 0 ? (totalGain / netContributions) * 100 : 0;

      const updated = prev.map((m) =>
        m.id === investmentId
          ? {
              ...m,
              latestValue,
              netContributions,
              totalGain,
              gainPercentage,
              history: newHistory,
              lastUpdated: new Date().toISOString(),
            }
          : m
      );

      broadcastStateChange({ managedInvestments: updated });
      addAuditLog(
        'UPDATE',
        target.name,
        `Updated valuation history entry #${entryIndex + 1} (${entry.date}: $${entry.value.toLocaleString()}) for "${target.name}".`
      );
      return updated;
    });
  };

  const deleteValuationHistoryEntry = (investmentId: string, entryIndex: number) => {
    setManagedInvestments((prev) => {
      const target = prev.find((m) => m.id === investmentId);
      if (!target) return prev;

      const newHistory = (target.history || []).filter((_, i) => i !== entryIndex);
      const latestEntry = newHistory[newHistory.length - 1];
      const latestValue = latestEntry ? Number(latestEntry.value) : target.latestValue;
      const netContributions = latestEntry ? Number(latestEntry.contribution) : target.netContributions;
      const totalGain = latestValue - netContributions;
      const gainPercentage = netContributions > 0 ? (totalGain / netContributions) * 100 : 0;

      const updated = prev.map((m) =>
        m.id === investmentId
          ? {
              ...m,
              latestValue,
              netContributions,
              totalGain,
              gainPercentage,
              history: newHistory,
              lastUpdated: new Date().toISOString(),
            }
          : m
      );

      broadcastStateChange({ managedInvestments: updated });
      addAuditLog(
        'DELETE',
        target.name,
        `Deleted valuation history entry #${entryIndex + 1} for "${target.name}".`
      );
      return updated;
    });
  };

  const addDocument = (doc: Omit<DocumentItem, 'id' | 'uploadDate'>) => {
    const id = `doc-${Date.now()}`;
    const newDoc: DocumentItem = {
      ...doc,
      id,
      uploadDate: new Date().toISOString().split('T')[0],
    };

    setDocuments((prev) => {
      const updated = [newDoc, ...prev];
      broadcastStateChange({ documents: updated });
      return updated;
    });

    addAuditLog('DOC_ATTACH', newDoc.entityName, `Attached document "${newDoc.title}" to ${newDoc.entityName}.`);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => {
      const existing = prev.find((d) => d.id === id);
      const updated = prev.filter((d) => d.id !== id);
      broadcastStateChange({ documents: updated });

      if (existing) {
        addAuditLog('DELETE', existing.entityName, `Deleted document "${existing.title}".`);
      }
      return updated;
    });
  };

  const addMonthlyLedgerEntry = (entry: Omit<MonthlyLedgerEntry, 'id'>) => {
    const id = `mled-${Date.now()}`;
    const newEntry: MonthlyLedgerEntry = { ...entry, id };
    setMonthlyLedger((prev) => {
      const updated = [...prev, newEntry];
      broadcastStateChange({ monthlyLedger: updated });
      return updated;
    });
    addAuditLog('CREATE', 'Monthly Ledger', `Added monthly ledger entry for ${entry.month}.`);
  };

  const updateMonthlyLedgerEntry = (id: string, updates: Partial<MonthlyLedgerEntry>) => {
    setMonthlyLedger((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      broadcastStateChange({ monthlyLedger: updated });
      return updated;
    });
    addAuditLog('UPDATE', 'Monthly Ledger', `Updated monthly ledger entry.`);
  };

  const deleteMonthlyLedgerEntry = (id: string) => {
    setMonthlyLedger((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      broadcastStateChange({ monthlyLedger: updated });
      return updated;
    });
    addAuditLog('DELETE', 'Monthly Ledger', `Deleted monthly ledger entry.`);
  };

  const addCorporateEntity = (entity: Omit<CorporateEntity, 'id'>) => {
    const id = `corp-${Date.now()}`;
    const newEntity: CorporateEntity = { ...entity, id };
    setCorporateEntities((prev) => {
      const updated = [...prev, newEntity];
      broadcastStateChange({ corporateEntities: updated });
      return updated;
    });
    addAuditLog('CREATE', newEntity.name, `Created corporate entity/trust "${newEntity.name}".`);
  };

  const updateCorporateEntity = (id: string, updates: Partial<CorporateEntity>) => {
    setCorporateEntities((prev) => {
      const existing = prev.find((e) => e.id === id);
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      broadcastStateChange({ corporateEntities: updated });
      if (existing) {
        addAuditLog('UPDATE', existing.name, `Updated details for corporate entity/trust "${existing.name}".`);
      }
      return updated;
    });
  };

  const deleteCorporateEntity = (id: string) => {
    setCorporateEntities((prev) => {
      const existing = prev.find((e) => e.id === id);
      const updated = prev.filter((e) => e.id !== id);
      broadcastStateChange({ corporateEntities: updated });
      if (existing) {
        addAuditLog('DELETE', existing.name, `Deleted corporate entity "${existing.name}".`);
      }
      return updated;
    });
  };

  const addFamilyMember = (user: Omit<FamilyUser, 'id' | 'lastActive'>) => {
    const id = `usr-${Date.now()}`;
    const newUser: FamilyUser = {
      ...user,
      id,
      lastActive: new Date().toISOString(),
    };
    setUsers((prev) => {
      const updated = [...prev, newUser];
      broadcastStateChange({ users: updated });
      return updated;
    });
    addAuditLog('CREATE', newUser.name, `Added new family member profile "${newUser.name}" (${newUser.role}).`);
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyUser>) => {
    setUsers((prev) => {
      const existing = prev.find((u) => u.id === id);
      const updated = prev.map((u) => (u.id === id ? { ...u, ...updates } : u));
      broadcastStateChange({ users: updated });

      if (currentUser.id === id) {
        setCurrentUser((prev) => ({ ...prev, ...updates }));
      }

      if (existing) {
        addAuditLog('UPDATE', existing.name, `Updated family profile details for "${existing.name}".`);
      }
      return updated;
    });
  };

  const deleteFamilyMember = (id: string) => {
    setUsers((prev) => {
      const existing = prev.find((u) => u.id === id);
      const updated = prev.filter((u) => u.id !== id);
      broadcastStateChange({ users: updated });
      if (existing) {
        addAuditLog('DELETE', existing.name, `Removed family member profile "${existing.name}".`);
      }
      return updated;
    });
  };

  const updateUserContact = (
    userId: string,
    contact: { phone?: string; email?: string; preferredMfaMethod?: 'SMS' | 'EMAIL' | 'TOTP' }
  ) => {
    updateFamilyMember(userId, contact);
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) => {
      const targetUser = prev.find((u) => u.id === userId);
      const updated = prev.map((u) => {
        if (u.id === userId) {
          const isOwner = newRole === 'Owner / Appointor';
          const isTrustee = newRole === 'Trustee / Editor';
          return {
            ...u,
            role: newRole,
            permissions: {
              canEditProperties: isOwner || isTrustee,
              canEditInvestments: isOwner || isTrustee,
              canManageUsers: isOwner,
              canViewTaxReports: true,
              canUploadDocuments: isOwner || isTrustee,
              canViewCorporateKeys: isOwner,
            },
          };
        }
        return u;
      });

      broadcastStateChange({ users: updated });

      if (targetUser) {
        addAuditLog(
          'ROLE_CHANGE',
          targetUser.name,
          `Changed role for ${targetUser.name} from "${targetUser.role}" to "${newRole}".`,
          { oldValue: targetUser.role, newValue: newRole }
        );
      }
      return updated;
    });
  };

  const toggleMfaForUser = (userId: string) => {
    setUsers((prev) => {
      const targetUser = prev.find((u) => u.id === userId);
      const updated = prev.map((u) => (u.id === userId ? { ...u, mfaEnabled: !u.mfaEnabled } : u));
      broadcastStateChange({ users: updated });

      if (targetUser) {
        const nextState = !targetUser.mfaEnabled;
        addAuditLog(
          'MFA_TOGGLE',
          targetUser.name,
          `${nextState ? 'Enabled' : 'Disabled'} MFA security layer for ${targetUser.name}.`,
          { oldValue: targetUser.mfaEnabled, newValue: nextState }
        );
      }
      return updated;
    });
  };

  const resetToDefaultData = () => {
    setProperties(INITIAL_PROPERTIES);
    setManagedInvestments(INITIAL_MANAGED_INVESTMENTS);
    setMonthlyLedger(INITIAL_MONTHLY_LEDGER);
    setCorporateEntities(INITIAL_CORPORATE_ENTITIES);
    setScheduledPayments(INITIAL_SCHEDULED_PAYMENTS);
    setDocuments(INITIAL_DOCUMENTS);
    setUsers(INITIAL_USERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(INITIAL_USERS[0]);

    localStorage.clear();
    addAuditLog('SECURITY_ALERT', 'System', 'Reset portfolio data to official initial snapshot.');
  };

  return (
    <PortfolioContext.Provider
      value={{
        properties,
        managedInvestments,
        monthlyLedger,
        corporateEntities,
        scheduledPayments,
        documents,
        users,
        auditLogs,
        currentUser,
        lastLiveSyncTime,
        liveSyncCount,
        pendingMfaAction,
        setCurrentUser,
        triggerMfaChallenge,
        clearMfaChallenge,
        addProperty,
        updateProperty,
        deleteProperty,
        addManagedInvestment,
        updateManagedInvestment,
        deleteManagedInvestment,
        addValuationHistoryEntry,
        updateValuationHistoryEntry,
        deleteValuationHistoryEntry,
        addMonthlyLedgerEntry,
        updateMonthlyLedgerEntry,
        deleteMonthlyLedgerEntry,
        addCorporateEntity,
        updateCorporateEntity,
        deleteCorporateEntity,
        addDocument,
        deleteDocument,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        updateUserContact,
        updateUserRole,
        toggleMfaForUser,
        addAuditLog,
        resetToDefaultData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
