import React, { useState } from 'react';
import {
  Layers,
  Building,
  Key,
  CreditCard,
  FileCheck,
  AlertTriangle,
  Users,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Lock,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { CorporateEntity } from '../types';
import { usePortfolio } from '../services/store';

export const CorporateStructure: React.FC = () => {
  const {
    corporateEntities,
    currentUser,
    addCorporateEntity,
    updateCorporateEntity,
    deleteCorporateEntity,
    triggerMfaChallenge,
  } = usePortfolio();

  const [showKeys, setShowShowKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Edit / Add Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<CorporateEntity | null>(null);

  // Trust Main Deed Info State (first corporate entity or default trust)
  const trustEntity = corporateEntities.find((e) => e.type === 'Trust') || corporateEntities[0];

  // New Entity Form State
  const [newEntity, setNewEntity] = useState({
    name: '',
    type: 'Operating Company' as CorporateEntity['type'],
    acn: '',
    abn: '',
    tfn: '',
    corporateKey: '',
    anzsicCode: '',
    bankAccount: '',
    chessHin: '',
    directorsText: '',
    shareholdersText: '',
    appointorsText: '',
    flagsText: '',
  });

  const canViewKeys = currentUser.permissions.canViewCorporateKeys;

  const toggleShowKey = (entityId: string) => {
    if (!canViewKeys) return;

    if (!showKeys[entityId]) {
      triggerMfaChallenge(
        'View Sensitive Corporate Key',
        'Multi-factor authentication required to unmask 8-digit ASIC Corporate Key.',
        () => {
          setShowShowKeys((prev) => ({ ...prev, [entityId]: true }));
        }
      );
    } else {
      setShowShowKeys((prev) => ({ ...prev, [entityId]: false }));
    }
  };

  const handleCopyKey = (keyVal: string, entityId: string) => {
    navigator.clipboard.writeText(keyVal);
    setCopiedKey(entityId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddEntitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntity.name) return;

    triggerMfaChallenge(
      'Add Corporate Entity / Trust',
      `Confirm registering new entity "${newEntity.name}" into Sahota Group architecture.`,
      () => {
        addCorporateEntity({
          name: newEntity.name,
          type: newEntity.type,
          acn: newEntity.acn || undefined,
          abn: newEntity.abn || undefined,
          tfn: newEntity.tfn || undefined,
          corporateKey: newEntity.corporateKey || undefined,
          anzsicCode: newEntity.anzsicCode || undefined,
          bankAccount: newEntity.bankAccount || undefined,
          chessHin: newEntity.chessHin || undefined,
          directors: newEntity.directorsText
            ? newEntity.directorsText.split(',').map((s) => s.trim())
            : ['Gagandeep Singh Sahota'],
          shareholders: newEntity.shareholdersText
            ? newEntity.shareholdersText.split(',').map((s) => s.trim())
            : ['Sahota Nominees Pty Ltd ATF Sahota Family Trust'],
          appointors: newEntity.appointorsText
            ? newEntity.appointorsText.split(',').map((s) => s.trim())
            : undefined,
          flags: newEntity.flagsText
            ? newEntity.flagsText.split(';').map((s) => s.trim())
            : undefined,
          documents: [],
        });

        setIsAddModalOpen(false);
        setNewEntity({
          name: '',
          type: 'Operating Company',
          acn: '',
          abn: '',
          tfn: '',
          corporateKey: '',
          anzsicCode: '',
          bankAccount: '',
          chessHin: '',
          directorsText: '',
          shareholdersText: '',
          appointorsText: '',
          flagsText: '',
        });
      }
    );
  };

  const handleUpdateEntitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntity) return;

    triggerMfaChallenge(
      'Update Corporate Entity Details',
      `Confirm updating statutory details for "${editingEntity.name}".`,
      () => {
        updateCorporateEntity(editingEntity.id, editingEntity);
        setEditingEntity(null);
      }
    );
  };

  const handleDeleteEntity = (entityId: string, entityName: string) => {
    if (corporateEntities.length <= 1) {
      alert('Cannot delete the primary entity in the portfolio.');
      return;
    }

    triggerMfaChallenge(
      'Delete Corporate Entity',
      `Are you sure you want to permanently delete "${entityName}" from the corporate registry?`,
      () => {
        deleteCorporateEntity(entityId);
        if (editingEntity?.id === entityId) setEditingEntity(null);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Corporate & Trust Structure</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 font-medium">
              {corporateEntities.length} Entities
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sahota Family Trust discretionary deed, trustee company, operating builder entity, and bucket company
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 hidden sm:flex">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <div className="text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                Appointor Succession
              </span>
              <span className="font-semibold text-slate-800">Gagandeep → Manroop Sahota</span>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entity</span>
          </button>
        </div>
      </div>

      {/* Corporate Visual Flow Architecture */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative overflow-hidden space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Ownership Hierarchy & Flow Diagram</span>
          </h2>

          {trustEntity && (
            <button
              onClick={() => setEditingEntity(trustEntity)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Trust Deed Details</span>
            </button>
          )}
        </div>

        {/* Tree Flow */}
        <div className="space-y-6 relative">
          {/* Level 1: Appointors & Settlor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 relative shadow-xs">
              <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                Principal / First Appointor
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">Gagandeep Singh Sahota</div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Lifetime Appointor power under Clause 7.1 • Director ID DIR 036 25262 26458 75
              </p>
            </div>

            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 relative shadow-xs">
              <div className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
                Second Appointor / Director
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">Manroop Sahota</div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Successor Appointor under Clause 7.1(b) • Director ID 36017956150367
              </p>
            </div>
          </div>

          <div className="flex justify-center text-slate-400 font-bold text-xl">↓</div>

          {/* Level 2: Sahota Family Trust & Nominees */}
          {trustEntity && (
            <div className="bg-slate-50 border-2 border-blue-200 rounded-xl p-5 shadow-xs relative">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                    Parent Asset Holding
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{trustEntity.name}</h3>
                  <p className="text-xs text-slate-500">
                    Established 11th April 2022 • Settlor: Sandeep Singh ($10 settlement sum)
                  </p>
                </div>

                <div className="text-right text-xs font-mono">
                  <div className="text-slate-500">
                    Trust TFN: <span className="text-slate-900 font-bold">{trustEntity.tfn || '606 522 103'}</span>
                  </div>
                  <div className="text-slate-500">
                    Bank Account:{' '}
                    <span className="text-slate-900 font-bold">{trustEntity.bankAccount || 'BSB 062-703 Acc 10697122'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-600 text-xs">Trustee Company:</div>
                  <div className="font-bold text-blue-700 mt-0.5">SAHOTA NOMINEES PTY LTD</div>
                  <div className="text-slate-500 text-[11px]">ACN 658 523 730 • Registered 02/04/2022</div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-600 text-xs">Beneficiaries:</div>
                  <div className="text-slate-800 font-medium mt-0.5">
                    {trustEntity.shareholders?.join(', ') || 'Gagandeep Singh Sahota, Children, Grandchildren & Spouses'}
                  </div>
                  <div className="text-slate-500 text-[11px]">Revenue NSW Duty Assessment Paid ($707.24)</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center text-slate-400 font-bold text-xl">↓</div>

          {/* Level 3: Subsidiary Companies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {corporateEntities
              .filter((e) => e.type !== 'Trust')
              .map((entity) => (
                <div
                  key={entity.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            entity.type === 'Operating Company'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : entity.type === 'Bucket Company'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {entity.type}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-2">{entity.name}</h3>
                        {entity.anzsicCode && (
                          <p className="text-xs text-slate-500">ANZSIC: {entity.anzsicCode}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingEntity(entity)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Edit Entity Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntity(entity.id, entity.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Entity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="my-4 space-y-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {entity.acn && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">ACN:</span>
                          <span className="text-slate-900 font-bold">{entity.acn}</span>
                        </div>
                      )}
                      {entity.abn && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">ABN:</span>
                          <span className="text-slate-900 font-bold">{entity.abn}</span>
                        </div>
                      )}
                      {entity.tfn && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Company TFN:</span>
                          <span className="text-slate-900 font-bold">{entity.tfn}</span>
                        </div>
                      )}
                      {entity.chessHin && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">CHESS HIN:</span>
                          <span className="text-emerald-700 font-bold">{entity.chessHin}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <div>
                        <strong>Shareholders:</strong> {entity.shareholders?.join(', ') || 'N/A'}
                      </div>
                      <div>
                        <strong>Directors:</strong> {entity.directors?.join(', ') || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {entity.flags && entity.flags.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                      {entity.flags.map((flag, idx) => (
                        <div key={idx} className="text-[10px] text-amber-700 font-medium flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-600" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Entity Details Table & Corporate Key Vault */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              <span>ASIC Corporate Key & Identity Vault</span>
            </h2>
            <p className="text-xs text-slate-500">Encrypted ASIC 8-digit keys and government registry reference codes</p>
          </div>

          <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>Step-Up MFA Protected</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {corporateEntities.map((entity) => (
            <div key={entity.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <div className="font-bold text-slate-900">{entity.name}</div>
                <button
                  onClick={() => setEditingEntity(entity)}
                  className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-white cursor-pointer"
                  title="Edit Entity"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {entity.acn && (
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>ACN:</span>
                  <span className="text-slate-800 font-semibold">{entity.acn}</span>
                </div>
              )}

              {entity.tfn && (
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>TFN:</span>
                  <span className="text-slate-800 font-semibold">{entity.tfn}</span>
                </div>
              )}

              {entity.corporateKey && (
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-bold flex justify-between">
                    <span>ASIC Corporate Key:</span>
                    {canViewKeys ? (
                      <button
                        onClick={() => toggleShowKey(entity.id)}
                        className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {showKeys[entity.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showKeys[entity.id] ? 'Hide' : 'Reveal'}</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">Owner Only</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between font-mono font-bold text-sm text-blue-700">
                    <span>{showKeys[entity.id] ? entity.corporateKey : '••••••••'}</span>
                    {showKeys[entity.id] && (
                      <button
                        onClick={() => handleCopyKey(entity.corporateKey!, entity.id)}
                        className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        title="Copy Key"
                      >
                        {copiedKey === entity.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {entity.flags && entity.flags.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  {entity.flags.map((flag, idx) => (
                    <div key={idx} className="text-[10px] text-amber-700 font-medium flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-600" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Corporate Entity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Add New Entity or Trust</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntitySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Entity Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAHOTA VENTURES PTY LTD"
                    value={newEntity.name}
                    onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Entity Type</label>
                  <select
                    value={newEntity.type}
                    onChange={(e) => setNewEntity({ ...newEntity, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Operating Company">Operating Company</option>
                    <option value="Trustee Company">Trustee Company</option>
                    <option value="Bucket Company">Bucket Company</option>
                    <option value="Trust">Discretionary / Unit Trust</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="block text-slate-700 font-sans font-semibold mb-1">ACN</label>
                  <input
                    type="text"
                    placeholder="658 000 000"
                    value={newEntity.acn}
                    onChange={(e) => setNewEntity({ ...newEntity, acn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-sans font-semibold mb-1">ABN</label>
                  <input
                    type="text"
                    placeholder="90 658 000 000"
                    value={newEntity.abn}
                    onChange={(e) => setNewEntity({ ...newEntity, abn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-sans font-semibold mb-1">TFN</label>
                  <input
                    type="text"
                    placeholder="606 000 000"
                    value={newEntity.tfn}
                    onChange={(e) => setNewEntity({ ...newEntity, tfn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ASIC Corporate Key (8-digit)</label>
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="87739872"
                    value={newEntity.corporateKey}
                    onChange={(e) => setNewEntity({ ...newEntity, corporateKey: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bank BSB & Account</label>
                  <input
                    type="text"
                    placeholder="BSB 062-703 Acc 1000222"
                    value={newEntity.bankAccount}
                    onChange={(e) => setNewEntity({ ...newEntity, bankAccount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Directors (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Gagandeep Singh Sahota, Manroop Sahota"
                  value={newEntity.directorsText}
                  onChange={(e) => setNewEntity({ ...newEntity, directorsText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Shareholders / Beneficiaries (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Sahota Nominees Pty Ltd ATF Sahota Family Trust (100 ORD)"
                  value={newEntity.shareholdersText}
                  onChange={(e) => setNewEntity({ ...newEntity, shareholdersText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Compliance Flags / Open Action Items (separated by ;)
                </label>
                <input
                  type="text"
                  placeholder="Verify ASIC Annual Statement; Lodge TFN Declaration"
                  value={newEntity.flagsText}
                  onChange={(e) => setNewEntity({ ...newEntity, flagsText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Create Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Corporate Entity / Trust Modal */}
      {editingEntity && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Edit Entity Details: {editingEntity.name}
                </h2>
              </div>
              <button
                onClick={() => setEditingEntity(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEntitySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Entity Name</label>
                  <input
                    type="text"
                    required
                    value={editingEntity.name}
                    onChange={(e) => setEditingEntity({ ...editingEntity, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Entity Type</label>
                  <select
                    value={editingEntity.type}
                    onChange={(e) =>
                      setEditingEntity({ ...editingEntity, type: e.target.value as any })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Trust">Discretionary / Unit Trust</option>
                    <option value="Trustee Company">Trustee Company</option>
                    <option value="Operating Company">Operating Company</option>
                    <option value="Bucket Company">Bucket Company</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="block text-slate-700 font-sans font-semibold mb-1">ACN</label>
                  <input
                    type="text"
                    value={editingEntity.acn || ''}
                    onChange={(e) => setEditingEntity({ ...editingEntity, acn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-sans font-semibold mb-1">ABN</label>
                  <input
                    type="text"
                    value={editingEntity.abn || ''}
                    onChange={(e) => setEditingEntity({ ...editingEntity, abn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-sans font-semibold mb-1">TFN</label>
                  <input
                    type="text"
                    value={editingEntity.tfn || ''}
                    onChange={(e) => setEditingEntity({ ...editingEntity, tfn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-700 font-sans font-semibold mb-1">
                    ASIC Corporate Key
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={editingEntity.corporateKey || ''}
                    onChange={(e) =>
                      setEditingEntity({ ...editingEntity, corporateKey: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-sans font-semibold mb-1">
                    Bank BSB & Account
                  </label>
                  <input
                    type="text"
                    value={editingEntity.bankAccount || ''}
                    onChange={(e) =>
                      setEditingEntity({ ...editingEntity, bankAccount: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Directors (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingEntity.directors?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingEntity({
                      ...editingEntity,
                      directors: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Shareholders / Beneficiaries (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingEntity.shareholders?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingEntity({
                      ...editingEntity,
                      shareholders: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Compliance Flags (separated by ;)
                </label>
                <input
                  type="text"
                  value={editingEntity.flags?.join('; ') || ''}
                  onChange={(e) =>
                    setEditingEntity({
                      ...editingEntity,
                      flags: e.target.value.split(';').map((s) => s.trim()),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                {corporateEntities.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteEntity(editingEntity.id, editingEntity.name)}
                    className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Entity</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingEntity(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Entity Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
