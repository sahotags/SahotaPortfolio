import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  Phone,
  Mail,
  Smartphone,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';
import { FamilyUser, UserRole } from '../types';
import { usePortfolio } from '../services/store';

export const FamilyPermissions: React.FC = () => {
  const {
    users,
    currentUser,
    setCurrentUser,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    updateUserRole,
    toggleMfaForUser,
    triggerMfaChallenge,
  } = usePortfolio();

  const isOwner = currentUser.role === 'Owner / Appointor';

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<FamilyUser | null>(null);

  // New Member Form State
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Family Beneficiary' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    mfaEnabled: false,
    permissions: {
      canEditProperties: false,
      canEditInvestments: false,
      canManageUsers: false,
      canViewTaxReports: true,
      canUploadDocuments: false,
      canViewCorporateKeys: false,
    },
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    addFamilyMember({
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone || '+61 0400 000 000',
      role: newMember.role,
      avatar: newMember.avatar,
      mfaEnabled: newMember.mfaEnabled,
      permissions: newMember.permissions,
    });

    setIsAddModalOpen(false);
    setNewMember({
      name: '',
      email: '',
      phone: '',
      role: 'Family Beneficiary',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      mfaEnabled: false,
      permissions: {
        canEditProperties: false,
        canEditInvestments: false,
        canManageUsers: false,
        canViewTaxReports: true,
        canUploadDocuments: false,
        canViewCorporateKeys: false,
      },
    });
  };

  const handleUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    triggerMfaChallenge(
      'Update Family Member Profile',
      `Confirm updating account profile details for ${editingUser.name}.`,
      () => {
        updateFamilyMember(editingUser.id, editingUser);
        setEditingUser(null);
      }
    );
  };

  const handleDeleteMember = (userId: string, userName: string) => {
    if (users.length <= 1) {
      alert('Cannot delete the last remaining family member profile.');
      return;
    }

    triggerMfaChallenge(
      'Delete Family Member Profile',
      `Are you sure you want to permanently remove ${userName} from the family trust directory?`,
      () => {
        deleteFamilyMember(userId);
        if (editingUser?.id === userId) setEditingUser(null);
      }
    );
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    triggerMfaChallenge(
      'Modify Family Role & Permissions',
      `Confirm updating access role for family member to "${newRole}".`,
      () => {
        updateUserRole(userId, newRole);
      }
    );
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Family Members & Permission Levels</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 font-mono font-bold">
              {users.length} Active Profiles
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time access management for Sahota Family Trust appointors, trustees, and beneficiaries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs hidden sm:block">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Active Profile</span>
            <span className="font-bold text-blue-700">{currentUser.name} ({currentUser.role})</span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Family Member</span>
          </button>
        </div>
      </div>

      {/* User Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => {
          const isCurrentActive = u.id === currentUser.id;
          return (
            <div
              key={u.id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all relative ${
                isCurrentActive ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"
                    />
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{u.name}</h2>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{u.email}</span>
                      </p>
                      {u.phone && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Edit Family Member Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {users.length > 1 && (
                      <button
                        onClick={() => handleDeleteMember(u.id, u.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete Family Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Role Switcher Selector */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] text-slate-500 font-semibold uppercase">
                      Access Level / Role
                    </label>
                    {isCurrentActive && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                        Active Tab
                      </span>
                    )}
                  </div>

                  {isOwner ? (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Owner / Appointor">Owner / Appointor (Full Control)</option>
                      <option value="Trustee / Editor">Trustee / Editor (Edit Financials)</option>
                      <option value="Family Beneficiary">Family Beneficiary (View Only)</option>
                    </select>
                  ) : (
                    <div className="bg-white px-3 py-2 rounded-lg text-xs font-semibold text-blue-700 border border-slate-200">
                      {u.role}
                    </div>
                  )}
                </div>

                {/* Granular Permissions Matrix */}
                <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Granted Permissions
                  </span>

                  <div className="grid grid-cols-1 gap-1.5 text-slate-700">
                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-slate-50 border border-slate-100">
                      <span>Edit Property & Asset Values</span>
                      {u.permissions.canEditProperties ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                      )}
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-slate-50 border border-slate-100">
                      <span>Manage Family Users & Roles</span>
                      {u.permissions.canManageUsers ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                      )}
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-slate-50 border border-slate-100">
                      <span>View Tax Reports & Distributions</span>
                      {u.permissions.canViewTaxReports ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                      )}
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-slate-50 border border-slate-100">
                      <span>View ASIC Corporate Keys</span>
                      {u.permissions.canViewCorporateKeys ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer MFA Control */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className={`w-4 h-4 ${u.mfaEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-slate-500">MFA:</span>
                  <span className={`font-semibold ${u.mfaEnabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {u.mfaEnabled ? 'Enforced' : 'Optional'}
                  </span>
                </div>

                {!isCurrentActive && (
                  <button
                    onClick={() => setCurrentUser(u)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-semibold underline cursor-pointer"
                  >
                    Switch View to {u.name.split(' ')[0]}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Family Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Add New Family Member Profile</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jasleen Sahota"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jasleen@sahota.family"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number (SMS MFA)</label>
                  <input
                    type="tel"
                    placeholder="+61 0412 345 678"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Access Role</label>
                  <select
                    value={newMember.role}
                    onChange={(e) => {
                      const role = e.target.value as UserRole;
                      const isOwnerRole = role === 'Owner / Appointor';
                      const isTrusteeRole = role === 'Trustee / Editor';
                      setNewMember({
                        ...newMember,
                        role,
                        permissions: {
                          canEditProperties: isOwnerRole || isTrusteeRole,
                          canEditInvestments: isOwnerRole || isTrusteeRole,
                          canManageUsers: isOwnerRole,
                          canViewTaxReports: true,
                          canUploadDocuments: isOwnerRole || isTrusteeRole,
                          canViewCorporateKeys: isOwnerRole,
                        },
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Family Beneficiary">Family Beneficiary (View Only)</option>
                    <option value="Trustee / Editor">Trustee / Editor (Edit Financials)</option>
                    <option value="Owner / Appointor">Owner / Appointor (Full Control)</option>
                  </select>
                </div>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Profile Avatar</label>
                <div className="flex items-center space-x-2">
                  {presetAvatars.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Avatar preset"
                      onClick={() => setNewMember({ ...newMember, avatar: url })}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer ring-2 ${
                        newMember.avatar === url ? 'ring-blue-600 scale-105' : 'ring-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* MFA Toggle */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">Enforce Step-Up MFA</div>
                  <div className="text-[11px] text-slate-500">Require 2FA code for sensitive financial edits</div>
                </div>
                <input
                  type="checkbox"
                  checked={newMember.mfaEnabled}
                  onChange={(e) => setNewMember({ ...newMember, mfaEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="block font-bold text-slate-800 uppercase text-[11px]">Granular Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <label className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMember.permissions.canEditProperties}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          permissions: { ...newMember.permissions, canEditProperties: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Edit Properties & Valuations</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMember.permissions.canEditInvestments}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          permissions: { ...newMember.permissions, canEditInvestments: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Edit Managed Investments</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMember.permissions.canManageUsers}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          permissions: { ...newMember.permissions, canManageUsers: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Manage Family Users & Roles</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMember.permissions.canViewCorporateKeys}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          permissions: { ...newMember.permissions, canViewCorporateKeys: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Unmask ASIC Corporate Keys</span>
                  </label>
                </div>
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
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Family Member Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Edit Member Profile: {editingUser.name}</h2>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number (MFA SMS)</label>
                  <input
                    type="tel"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Role / Access Level</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => {
                      const role = e.target.value as UserRole;
                      const isOwnerRole = role === 'Owner / Appointor';
                      const isTrusteeRole = role === 'Trustee / Editor';
                      setEditingUser({
                        ...editingUser,
                        role,
                        permissions: {
                          canEditProperties: isOwnerRole || isTrusteeRole,
                          canEditInvestments: isOwnerRole || isTrusteeRole,
                          canManageUsers: isOwnerRole,
                          canViewTaxReports: true,
                          canUploadDocuments: isOwnerRole || isTrusteeRole,
                          canViewCorporateKeys: isOwnerRole,
                        },
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Owner / Appointor">Owner / Appointor (Full Control)</option>
                    <option value="Trustee / Editor">Trustee / Editor (Edit Financials)</option>
                    <option value="Family Beneficiary">Family Beneficiary (View Only)</option>
                  </select>
                </div>
              </div>

              {/* MFA Toggle */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">MFA Enforced for {editingUser.name}</div>
                  <div className="text-[11px] text-slate-500">Require Step-up verification for updates</div>
                </div>
                <input
                  type="checkbox"
                  checked={editingUser.mfaEnabled}
                  onChange={(e) => setEditingUser({ ...editingUser, mfaEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="block font-bold text-slate-800 uppercase text-[11px]">Granular Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <label className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.permissions.canEditProperties}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          permissions: { ...editingUser.permissions, canEditProperties: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Edit Properties & Valuations</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.permissions.canEditInvestments}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          permissions: { ...editingUser.permissions, canEditInvestments: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Edit Managed Investments</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.permissions.canManageUsers}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          permissions: { ...editingUser.permissions, canManageUsers: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Manage Family Users & Roles</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.permissions.canViewCorporateKeys}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          permissions: { ...editingUser.permissions, canViewCorporateKeys: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Unmask ASIC Corporate Keys</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                {users.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(editingUser.id, editingUser.name)}
                    className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Profile</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
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
