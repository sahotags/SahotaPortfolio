import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  MapPin,
  Tag,
  DollarSign,
  Calendar,
  X,
  CheckCircle,
} from 'lucide-react';
import { PropertyItem, PropertyStatus } from '../types';
import { usePortfolio } from '../services/store';

export const PropertyPortfolio: React.FC = () => {
  const {
    properties,
    currentUser,
    addProperty,
    updateProperty,
    deleteProperty,
    triggerMfaChallenge,
  } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    status: 'Held' as PropertyStatus,
    totalCosts: 0,
    totalIncome: 0,
    country: 'AU' as 'NZ' | 'AU' | 'India',
    entityOwner: 'Sahota Family Trust',
    notes: '',
  });

  const canEdit = currentUser.permissions.canEditProperties;

  // Filtered Properties
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.entityOwner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prop.notes && prop.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || prop.status === statusFilter;
    const matchesCountry = countryFilter === 'All' || prop.country === countryFilter;

    return matchesSearch && matchesStatus && matchesCountry;
  });

  // Totals of filtered list
  const totalCostFiltered = filteredProperties.reduce((acc, p) => acc + p.totalCosts, 0);
  const totalIncomeFiltered = filteredProperties.reduce((acc, p) => acc + p.totalIncome, 0);
  const totalProfitFiltered = filteredProperties.reduce((acc, p) => acc + p.grossProfit, 0);

  const handleOpenAdd = () => {
    if (!canEdit) return;
    setFormData({
      name: '',
      status: 'Held',
      totalCosts: 0,
      totalIncome: 0,
      country: 'AU',
      entityOwner: 'Sahota Family Trust',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (property: PropertyItem) => {
    if (!canEdit) return;
    setEditingProperty(property);
    setFormData({
      name: property.name,
      status: property.status,
      totalCosts: property.totalCosts,
      totalIncome: property.totalIncome,
      country: property.country,
      entityOwner: property.entityOwner,
      notes: property.notes || '',
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const executeAdd = () => {
      const grossProfit = formData.totalIncome - formData.totalCosts;
      const marginPercentage =
        formData.totalCosts > 0 ? (grossProfit / formData.totalCosts) * 100 : 0;

      addProperty({
        name: formData.name,
        status: formData.status,
        totalCosts: Number(formData.totalCosts),
        totalIncome: Number(formData.totalIncome),
        grossProfit,
        marginPercentage,
        country: formData.country,
        entityOwner: formData.entityOwner,
        notes: formData.notes,
      });

      setIsAddModalOpen(false);
    };

    triggerMfaChallenge(
      'Add New Property',
      `Confirm adding "${formData.name}" to Sahota Group property portfolio.`,
      executeAdd
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    const executeEdit = () => {
      const grossProfit = Number(formData.totalIncome) - Number(formData.totalCosts);
      const marginPercentage =
        Number(formData.totalCosts) > 0 ? (grossProfit / Number(formData.totalCosts)) * 100 : 0;

      updateProperty(editingProperty.id, {
        name: formData.name,
        status: formData.status,
        totalCosts: Number(formData.totalCosts),
        totalIncome: Number(formData.totalIncome),
        grossProfit,
        marginPercentage,
        country: formData.country,
        entityOwner: formData.entityOwner,
        notes: formData.notes,
      });

      setEditingProperty(null);
    };

    triggerMfaChallenge(
      'Modify Property Data',
      `Confirm editing property financial values for "${editingProperty.name}".`,
      executeEdit
    );
  };

  const handleDelete = (property: PropertyItem) => {
    if (!canEdit) return;

    const executeDelete = () => {
      deleteProperty(property.id);
    };

    triggerMfaChallenge(
      'Delete Property Record',
      `Are you sure you want to permanently delete "${property.name}" from the portfolio?`,
      executeDelete
    );
  };

  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case 'Sold':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'In progress':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Property Portfolio</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 font-mono font-bold">
              {properties.length} Properties
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real estate assets across New Zealand, Australia, and India held by Sahota Family Trust & Sahota Trading
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {canEdit ? (
            <button
              onClick={handleOpenAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          ) : (
            <div className="text-xs text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Read-Only View ({currentUser.role})</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search address, notes, entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 w-full font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Sold">Sold Only</option>
            <option value="Held">Held Only</option>
            <option value="In progress">In Progress Only</option>
          </select>
        </div>

        {/* Country Filter */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Region:</span>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 w-full font-medium"
          >
            <option value="All">All Regions</option>
            <option value="AU">Australia (AU)</option>
            <option value="NZ">New Zealand (NZ)</option>
            <option value="India">India</option>
          </select>
        </div>
      </div>

      {/* Filter Summary Banner */}
      <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 shadow-xs">
        <div className="flex items-center space-x-4">
          <span>Showing <strong className="text-slate-900">{filteredProperties.length}</strong> properties</span>
          <span className="text-slate-300">|</span>
          <span>Costs: <strong className="font-mono text-slate-900">${totalCostFiltered.toLocaleString('en-AU')}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Income: <strong className="font-mono text-emerald-700">${totalIncomeFiltered.toLocaleString('en-AU')}</strong></span>
        </div>
        <div>
          <span>Gross Profit: <strong className={`font-mono ${totalProfitFiltered >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>${totalProfitFiltered.toLocaleString('en-AU')}</strong></span>
        </div>
      </div>

      {/* Property Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Property & Region</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Total Costs</th>
                <th className="py-3.5 px-3 text-right">Total Income</th>
                <th className="py-3.5 px-3 text-right">Gross Profit</th>
                <th className="py-3.5 px-3 text-center">Margin %</th>
                <th className="py-3.5 px-3">Owner Entity</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredProperties.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{prop.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{prop.notes}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(prop.status)}`}>
                      {prop.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-700">
                    {prop.totalCosts > 0 ? `$${prop.totalCosts.toLocaleString('en-AU')}` : '-'}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">
                    {prop.totalIncome > 0 ? `$${prop.totalIncome.toLocaleString('en-AU')}` : '-'}
                  </td>

                  <td className={`py-3.5 px-3 text-right font-mono font-bold ${prop.grossProfit > 0 ? 'text-emerald-700' : prop.grossProfit < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {prop.grossProfit !== 0 ? (
                      `${prop.grossProfit > 0 ? '+' : ''}$${prop.grossProfit.toLocaleString('en-AU')}`
                    ) : (
                      '-'
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono">
                    {prop.status === 'Sold' ? (
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${prop.marginPercentage >= 20 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : prop.marginPercentage < 0 ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-700'}`}>
                        {prop.marginPercentage.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-[11px]">
                      {prop.entityOwner}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {canEdit ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(prop)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-md transition-colors cursor-pointer"
                            title="Edit Property"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(prop)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                            title="Delete Property"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">View Only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Property Modal Overlay */}
      {(isAddModalOpen || editingProperty) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>{editingProperty ? 'Edit Property Record' : 'Add New Property'}</span>
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProperty(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingProperty ? handleSaveEdit : handleSaveAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Property Name & Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15 Ocean View Terrace, Sydney"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Held">Held (Owned)</option>
                    <option value="Sold">Sold (Realized)</option>
                    <option value="In progress">In Progress (Build)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Region / Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="AU">Australia (AU)</option>
                    <option value="NZ">New Zealand (NZ)</option>
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Costs ($ AUD)</label>
                  <input
                    type="number"
                    value={formData.totalCosts}
                    onChange={(e) => setFormData({ ...formData, totalCosts: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Income ($ AUD)</label>
                  <input
                    type="number"
                    value={formData.totalIncome}
                    onChange={(e) => setFormData({ ...formData, totalIncome: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Holding Entity</label>
                <select
                  value={formData.entityOwner}
                  onChange={(e) => setFormData({ ...formData, entityOwner: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Sahota Family Trust">Sahota Family Trust</option>
                  <option value="Sahota Nominees Pty Ltd">Sahota Nominees Pty Ltd</option>
                  <option value="Sahota Trading Pty Ltd">Sahota Trading Pty Ltd</option>
                  <option value="Gagandeep & Manroop Sahota">Gagandeep & Manroop Sahota (Personal)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Description</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Development notes, settlement details, build contract info..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProperty(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Record (MFA Verified)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
