import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  FileCheck,
  Building,
  Calendar,
  X,
  Paperclip,
  HardDrive,
  Cloud,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  File,
  FileSpreadsheet,
  Image as ImageIcon,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { usePortfolio } from '../services/store';

export const DocumentRepository: React.FC = () => {
  const { documents, currentUser, addDocument, deleteDocument, triggerMfaChallenge } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [attachTab, setAttachTab] = useState<'local' | 'gdrive'>('local');

  // Selected Local File State
  const [localFile, setLocalFile] = useState<{
    name: string;
    size: string;
    type: string;
    ext: 'pdf' | 'jpg' | 'png' | 'doc' | 'docx' | 'xlsx';
    dataUrl?: string;
  } | null>(null);

  // Google Drive State
  const [gdriveUrl, setGdriveUrl] = useState('');
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    entityType: 'Trust' as any,
    entityName: 'Sahota Family Trust',
    category: 'Trust Deed' as any,
    ocrText: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const canUpload = currentUser.permissions.canUploadDocuments;

  const sampleGDriveFiles = [
    {
      title: 'Sahota Family Trust Executed Trust Deed 2026',
      entityName: 'Sahota Family Trust',
      category: 'Trust Deed',
      url: 'https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9I_Sahota_Trust_Deed/view',
      size: '2.4 MB Google Drive',
    },
    {
      title: 'ASIC Extract & Corporate Register - SAHOTA TRADING PTY LTD',
      entityName: 'SAHOTA TRADING PTY LTD',
      category: 'ASIC Certificate',
      url: 'https://drive.google.com/file/d/1B3c4D5e6F7g8H9i0_Sahota_Trading_ASIC/view',
      size: '1.1 MB Google Drive',
    },
    {
      title: 'ATO TFN & ABN Confirmation Statement',
      entityName: 'SAHOTA NOMINEES PTY LTD',
      category: 'ATO / TFN',
      url: 'https://drive.google.com/file/d/1C4d5E6f7G8h9I0j1_Sahota_ATO_TFN/view',
      size: '890 KB Google Drive',
    },
    {
      title: 'CHESS HIN Sponsorship Statement - CMC Markets',
      entityName: 'SAHOTA TRADING PTY LTD',
      category: 'CHESS Notice',
      url: 'https://drive.google.com/file/d/1D5e6F7g8H9i0J1k2_Sahota_CHESS_CMC/view',
      size: '420 KB Google Drive',
    },
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || doc.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const processSelectedFile = (file: File) => {
    const ext = (file.name.split('.').pop() || 'pdf').toLowerCase();
    let fileType: 'pdf' | 'jpg' | 'png' | 'doc' | 'docx' | 'xlsx' = 'pdf';

    if (ext === 'jpg' || ext === 'jpeg') fileType = 'jpg';
    else if (ext === 'png') fileType = 'png';
    else if (ext === 'doc') fileType = 'doc';
    else if (ext === 'docx') fileType = 'docx';
    else if (ext === 'xls' || ext === 'xlsx') fileType = 'xlsx';

    const sizeStr = formatFileSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLocalFile({
        name: file.name,
        size: sizeStr,
        type: file.type,
        ext: fileType,
        dataUrl,
      });

      if (!uploadForm.title) {
        setUploadForm((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectDriveSample = (sample: (typeof sampleGDriveFiles)[0]) => {
    setGdriveUrl(sample.url);
    setUploadForm((prev) => ({
      ...prev,
      title: sample.title,
      entityName: sample.entityName,
      category: sample.category as any,
    }));
    setIsDrivePickerOpen(false);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) return;

    if (attachTab === 'local' && !localFile) {
      alert('Please select or drop a file from your local drive first.');
      return;
    }

    if (attachTab === 'gdrive' && !gdriveUrl.trim()) {
      alert('Please enter or pick a Google Drive document URL.');
      return;
    }

    const executeUpload = () => {
      const isDrive = attachTab === 'gdrive';

      addDocument({
        title: uploadForm.title,
        entityType: uploadForm.entityType,
        entityName: uploadForm.entityName,
        category: uploadForm.category,
        fileType: isDrive ? 'gdrive' : localFile?.ext || 'pdf',
        uploadedBy: currentUser.name,
        size: isDrive ? 'Google Drive Cloud' : localFile?.size || '1.2 MB',
        isOfficial: false,
        sourceType: isDrive ? 'GOOGLE_DRIVE' : 'LOCAL',
        googleDriveUrl: isDrive ? gdriveUrl : undefined,
        fileDataUrl: localFile?.dataUrl,
        ocrText:
          uploadForm.ocrText ||
          (isDrive
            ? `Attached via Google Drive cloud link: ${gdriveUrl}`
            : `Attached local file "${localFile?.name}" (${localFile?.size})`),
      });

      // Reset Form State
      setIsUploadModalOpen(false);
      setLocalFile(null);
      setGdriveUrl('');
      setUploadForm({
        title: '',
        entityType: 'Trust' as any,
        entityName: 'Sahota Family Trust',
        category: 'Trust Deed' as any,
        ocrText: '',
      });
    };

    triggerMfaChallenge(
      'Attach Document',
      `Confirm uploading "${uploadForm.title}" to ${uploadForm.entityName}.`,
      executeUpload
    );
  };

  const handleDeleteDoc = (doc: DocumentItem) => {
    if (!canUpload) return;

    const executeDelete = () => {
      deleteDocument(doc.id);
      if (selectedDoc?.id === doc.id) setSelectedDoc(null);
    };

    triggerMfaChallenge(
      'Delete Document Attachment',
      `Confirm deleting "${doc.title}" from document repository.`,
      executeDelete
    );
  };

  const handleDownload = (doc: DocumentItem) => {
    if (doc.fileDataUrl) {
      const element = document.createElement('a');
      element.href = doc.fileDataUrl;
      element.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${doc.fileType}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    if (doc.googleDriveUrl) {
      window.open(doc.googleDriveUrl, '_blank');
      return;
    }

    const element = document.createElement('a');
    const fileContent = `========================================================\nSAHOTA GROUP DOCUMENT REPOSITORY - OFFICIAL ATTACHMENT\n========================================================\nDocument Title: ${doc.title}\nEntity: ${doc.entityName}\nCategory: ${doc.category}\nUpload Date: ${doc.uploadDate}\nUploaded By: ${doc.uploadedBy}\nOfficial Badge: ${doc.isOfficial ? 'VERIFIED' : 'USER UPLOADED'}\nSource: ${doc.sourceType || 'ATTACHED'}\n\nKey Information:\n${doc.keyInfo ? JSON.stringify(doc.keyInfo, null, 2) : 'N/A'}\n\nOCR Extract & Content:\n${doc.ocrText || 'No text extracted.'}\n========================================================`;
    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Document Repository & Vault</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 font-mono font-bold">
              {documents.length} Files Attached
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Attach local drive files or Google Drive documents (ASIC certificates, ATO TFN letters, Trust Deeds, Revenue NSW assessments, CHESS statements)
          </p>
        </div>

        {canUpload && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Attach Document (Local or Google Drive)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search document title, entity, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500 w-full font-medium"
          >
            <option value="All">All Document Types</option>
            <option value="ASIC Certificate">ASIC Certificates</option>
            <option value="Trust Deed">Trust Deed</option>
            <option value="ATO / TFN">ATO / TFN Registrations</option>
            <option value="Director ID">Director ID Certificates</option>
            <option value="Duties Assessment">Revenue NSW Duties</option>
            <option value="CHESS Notice">ASX CHESS Statements</option>
            <option value="Share Certificate">Share Certificates</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold uppercase text-xs font-mono ${
                    doc.sourceType === 'GOOGLE_DRIVE' || doc.fileType === 'gdrive'
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}>
                    {doc.fileType === 'gdrive' ? <Cloud className="w-5 h-5 text-amber-600" /> : doc.fileType}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {doc.category}
                    </span>
                    {doc.sourceType === 'GOOGLE_DRIVE' && (
                      <span className="ml-1 text-[9px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                        <Cloud className="w-2.5 h-2.5" /> Google Drive
                      </span>
                    )}
                    {doc.sourceType === 'LOCAL' && (
                      <span className="ml-1 text-[9px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                        <HardDrive className="w-2.5 h-2.5" /> Local Drive
                      </span>
                    )}
                    {doc.isOfficial && (
                      <span className="ml-1 text-[9px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <h2 className="text-sm font-bold text-slate-900 mt-3 line-clamp-2 leading-snug">
                {doc.title}
              </h2>

              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">{doc.entityName}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Uploaded {doc.uploadDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Preview</span>
                </button>

                {doc.googleDriveUrl ? (
                  <a
                    href={doc.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center gap-1"
                    title="Open in Google Drive"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-emerald-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}

                {canUpload && (
                  <button
                    onClick={() => handleDeleteDoc(doc)}
                    className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    title="Delete Attachment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Viewer Modal Overlay */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedDoc.title}</h2>
                  <span className="text-xs text-slate-500">{selectedDoc.entityName} • {selectedDoc.category}</span>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 text-xs text-slate-700">
              {/* Google Drive Link Box */}
              {selectedDoc.googleDriveUrl && (
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-900 font-semibold">
                    <Cloud className="w-5 h-5 text-amber-600" />
                    <div>
                      <div>Google Drive Cloud Document Link</div>
                      <div className="text-[10px] text-amber-700 font-mono truncate max-w-md">{selectedDoc.googleDriveUrl}</div>
                    </div>
                  </div>
                  <a
                    href={selectedDoc.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Drive</span>
                  </a>
                </div>
              )}

              {/* Local File Preview Image or Content */}
              {selectedDoc.fileDataUrl && (selectedDoc.fileType === 'jpg' || selectedDoc.fileType === 'png') && (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 flex justify-center bg-slate-900">
                  <img src={selectedDoc.fileDataUrl} alt={selectedDoc.title} className="object-contain max-h-64" />
                </div>
              )}

              {/* Key Metadata Block */}
              {selectedDoc.keyInfo && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Official Document Metadata & Extraction
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(selectedDoc.keyInfo).map(([k, v]) => (
                      <div key={k} className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 text-[10px] block">{k}:</span>
                        <span className="text-slate-900 font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OCR Text Box */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Extracted Document Content / Remarks
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedDoc.ocrText}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-500">Uploaded by {selectedDoc.uploadedBy}</span>
              <button
                onClick={() => handleDownload(selectedDoc)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export / Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal Overlay */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>Attach Corporate / Property Document</span>
              </h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Tab Picker: Local Drive vs Google Drive */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAttachTab('local')}
                className={`flex-1 py-2 px-3 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  attachTab === 'local'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HardDrive className="w-4 h-4 text-blue-600" />
                <span>Local Drive Upload</span>
              </button>
              <button
                type="button"
                onClick={() => setAttachTab('gdrive')}
                className={`flex-1 py-2 px-3 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  attachTab === 'gdrive'
                    ? 'bg-white text-amber-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cloud className="w-4 h-4 text-amber-600" />
                <span>Google Drive Import</span>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* LOCAL DRIVE TAB */}
              {attachTab === 'local' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select or Drag & Drop File from Local Drive
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.txt"
                    className="hidden"
                  />

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                        : localFile
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80'
                    }`}
                  >
                    {localFile ? (
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                        <div className="flex items-center space-x-3 text-left">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase font-mono">
                            {localFile.ext}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{localFile.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{localFile.size} • Ready to attach</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocalFile(null);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-blue-600" />
                        <div>
                          <span className="font-bold text-blue-700">Click to browse your computer</span>
                          <span className="text-slate-500"> or drag & drop files here</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Supports PDF, Word (DOCX), Excel (XLSX), Images (PNG, JPG), Text
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GOOGLE DRIVE TAB */}
              {attachTab === 'gdrive' && (
                <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 font-bold flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-amber-600" />
                      <span>Google Drive File URL or Share Link</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsDrivePickerOpen(true)}
                      className="text-amber-800 hover:text-amber-900 font-bold bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Search className="w-3 h-3" />
                      <span>Browse Drive Vault</span>
                    </button>
                  </div>

                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9I.../view"
                    value={gdriveUrl}
                    onChange={(e) => setGdriveUrl(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-600"
                  />

                  {gdriveUrl && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Valid Google Drive URL attached. Will link directly in Document Vault.</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY2026 Insurance Certificate - Sahota Trading"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Associated Entity</label>
                  <select
                    value={uploadForm.entityName}
                    onChange={(e) => setUploadForm({ ...uploadForm, entityName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Sahota Family Trust">Sahota Family Trust</option>
                    <option value="SAHOTA NOMINEES PTY LTD">SAHOTA NOMINEES PTY LTD</option>
                    <option value="SAHOTA TRADING PTY LTD">SAHOTA TRADING PTY LTD</option>
                    <option value="SAHOTA GOLD PTY LTD">SAHOTA GOLD PTY LTD</option>
                    <option value="Lot 346 Ridge Square Leppington">Lot 346 Ridge Square Leppington</option>
                    <option value="33 Edgewood Drive">33 Edgewood Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Trust Deed">Trust Deed</option>
                    <option value="ASIC Certificate">ASIC Certificate</option>
                    <option value="ATO / TFN">ATO / TFN Registration</option>
                    <option value="Duties Assessment">Duties Assessment</option>
                    <option value="CHESS Notice">CHESS Notice</option>
                    <option value="Share Certificate">Share Certificate</option>
                    <option value="Tax Report">Tax Report</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document Text / Summary Note</label>
                <textarea
                  rows={2}
                  value={uploadForm.ocrText}
                  onChange={(e) => setUploadForm({ ...uploadForm, ocrText: e.target.value })}
                  placeholder="Key terms, reference numbers, or policy details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Attachment (MFA Required)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Drive Pre-indexed Vault Picker Modal */}
      {isDrivePickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-amber-800 font-bold">
                <Cloud className="w-5 h-5 text-amber-600" />
                <span>Sahota Group Google Drive Cloud Vault</span>
              </div>
              <button onClick={() => setIsDrivePickerOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">Select a verified cloud document from your Google Drive folder:</p>

            <div className="space-y-2 text-xs">
              {sampleGDriveFiles.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectDriveSample(sample)}
                  className="p-3 bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 group-hover:text-amber-900">{sample.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{sample.entityName} • {sample.category}</div>
                  </div>
                  <button className="px-2.5 py-1 bg-amber-600 text-white font-bold rounded-lg text-[10px] whitespace-nowrap shadow-2xs">
                    Select File
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsDrivePickerOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Close Picker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
