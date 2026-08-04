import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Mail,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Save,
  Settings2,
  RefreshCw,
} from 'lucide-react';
import { usePortfolio } from '../services/store';

interface MFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStepUpChallenge?: boolean;
}

export const MFAModal: React.FC<MFAModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    pendingMfaAction,
    clearMfaChallenge,
    toggleMfaForUser,
    updateUserContact,
    addAuditLog,
  } = usePortfolio();

  // Contact Config State
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [mfaMethod, setMfaMethod] = useState<'SMS' | 'EMAIL' | 'TOTP'>(
    currentUser.preferredMfaMethod || 'SMS'
  );

  // Verification State
  const [otpCode, setOtpCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeSentMessage, setCodeSentMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [contactSavedMsg, setContactSavedMsg] = useState<string | null>(null);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [activeTab, setActiveTab] = useState<'verify' | 'config'>(
    pendingMfaAction ? 'verify' : 'verify'
  );

  // Sync state when currentUser changes
  useEffect(() => {
    const currentPhone = currentUser.phone || '+61 0449 732 561';
    setPhone(currentPhone);
    setEmail(currentUser.email || 'sahotags@gmail.com');
    setMfaMethod(currentUser.preferredMfaMethod || 'SMS');
  }, [currentUser]);

  // Auto-send code on modal open if not sent
  useEffect(() => {
    if ((isOpen || pendingMfaAction) && !generatedCode) {
      handleSendCode();
    }
  }, [isOpen, pendingMfaAction]);

  // Timer countdown for resend code
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  if (!isOpen && !pendingMfaAction) return null;

  const currentAction = pendingMfaAction || {
    title: 'Multi-Factor Authentication (MFA) Security Settings',
    description: `Verify identity or configure 2FA security settings for ${currentUser.name}.`,
    onSuccess: () => {},
  };

  const dummyBackupCodes = ['7739-2018', '6585-2373', '9065-8733', '6065-8447'];

  const handleSendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setResendTimer(30);
    setErrorMsg(null);

    const activePhone = phone || currentUser.phone || '+61 0449 732 561';
    const activeEmail = email || currentUser.email || 'sahotags@gmail.com';

    let destination = '';
    if (mfaMethod === 'SMS') {
      destination = `SMS text code sent to ${activePhone}`;
    } else if (mfaMethod === 'EMAIL') {
      destination = `Email OTP sent to ${activeEmail}`;
    } else {
      destination = 'Authenticator App (TOTP)';
    }

    setCodeSentMessage(destination);
  };

  const handleSendTestSms = () => {
    const activePhone = phone || '+61 0449 732 561';
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(testCode);
    setOtpCode(testCode);
    setContactSavedMsg(`📲 Test SMS dispatched to ${activePhone}! Code: ${testCode}`);
    setTimeout(() => setContactSavedMsg(null), 5000);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    const activePhone = phone || '+61 0449 732 561';
    updateUserContact(currentUser.id, {
      phone: activePhone,
      email: email || currentUser.email,
      preferredMfaMethod: mfaMethod,
    });
    setContactSavedMsg(`✅ MFA contact updated! Mobile phone (${activePhone}) verified.`);
    addAuditLog(
      'UPDATE',
      'MFA Settings',
      `Updated MFA contact details for ${currentUser.name}: Phone (${activePhone}), Email (${email}), Method (${mfaMethod})`
    );
    setTimeout(() => setContactSavedMsg(null), 4000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter a valid 6-digit MFA verification code.');
      return;
    }

    // Accept generated code, demo 123456, or any 6-digit code after SMS dispatch
    const isValid =
      otpCode === generatedCode ||
      otpCode === '123456' ||
      (generatedCode !== null && otpCode.length === 6);

    if (!isValid) {
      setErrorMsg(`Code mismatch. Please enter ${generatedCode || '123456'}.`);
      return;
    }

    setSuccessMsg(`MFA Verification Successful! Identity confirmed for ${currentUser.name}.`);

    setTimeout(() => {
      if (pendingMfaAction) {
        pendingMfaAction.onSuccess();
        clearMfaChallenge();
      } else {
        addAuditLog(
          'SECURITY_ALERT',
          'MFA Security Layer',
          `Verified Multi-Factor Authentication challenge for ${currentUser.name} via ${mfaMethod}.`
        );
        onClose();
      }
      setSuccessMsg(null);
      setOtpCode('');
      setGeneratedCode(null);
      setCodeSentMessage(null);
    }, 600);
  };

  const handleToggleMfaState = () => {
    toggleMfaForUser(currentUser.id);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(dummyBackupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8.5 h-8.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{currentAction.title}</h2>
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Step-Up MFA Security
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              clearMfaChallenge();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('verify')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'verify'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verify Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>MFA Phone / Email Setup</span>
          </button>
        </div>

        {activeTab === 'verify' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">{currentAction.description}</p>

            {/* Quick Send Code Control */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                  {mfaMethod === 'SMS' && <Smartphone className="w-4 h-4 text-blue-600" />}
                  {mfaMethod === 'EMAIL' && <Mail className="w-4 h-4 text-blue-600" />}
                  {mfaMethod === 'TOTP' && <KeyRound className="w-4 h-4 text-blue-600" />}
                  <span>
                    Method: <strong className="text-blue-700">{mfaMethod}</strong> (
                    {mfaMethod === 'SMS' ? phone || 'No phone set' : email || 'No email set'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={resendTimer > 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Send Verification Code'}
                  </span>
                </button>
              </div>

              {codeSentMessage && (
                <div className="bg-white p-2.5 rounded-lg border border-blue-200 text-slate-800 space-y-1">
                  <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{codeSentMessage}</span>
                  </div>

                  {generatedCode && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        Demo Code: <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded tracking-widest">{generatedCode}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(generatedCode)}
                        className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer text-[11px]"
                      >
                        Auto-Fill Code
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* OTP Code Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex justify-between">
                  <span>Enter 6-Digit MFA Code</span>
                  <span className="text-slate-400 text-[10px]">(or enter 123456)</span>
                </label>

                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="e.g. 849201"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-center text-lg font-mono font-bold text-slate-900 tracking-widest focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    clearMfaChallenge();
                    onClose();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Verify & Authorize
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'config' && (
          <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>MFA Contact Information ({currentUser.name})</span>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Mobile Phone Number (SMS 2FA)</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="+61 0449 732 561"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestSms}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Test SMS</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address (Email OTP)</label>
                <input
                  type="email"
                  placeholder="sahotags@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Preferred Verification Method</label>
                <select
                  value={mfaMethod}
                  onChange={(e) => setMfaMethod(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="SMS">SMS Text Code (+61 Mobile)</option>
                  <option value="EMAIL">Email One-Time Passcode</option>
                  <option value="TOTP">Authenticator App (Google / Authy TOTP)</option>
                </select>
              </div>
            </div>

            {contactSavedMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{contactSavedMsg}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Contact Info</span>
              </button>
            </div>
          </form>
        )}

        {/* Toggle MFA status & Backup codes */}
        <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <div className="font-semibold text-slate-900">MFA Enforced for {currentUser.name}</div>
              <div className="text-[11px] text-slate-500">
                {currentUser.mfaEnabled
                  ? 'Step-up security active for updates & keys'
                  : 'MFA is currently turned off'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleMfaState}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                currentUser.mfaEnabled
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentUser.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
            </button>
          </div>

          {/* Emergency Recovery Codes */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 uppercase">
              <span>Emergency Backup Recovery Codes</span>
              <button
                type="button"
                onClick={handleCopyBackupCodes}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 lowercase cursor-pointer"
              >
                {copiedBackup ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedBackup ? 'copied' : 'copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-slate-800">
              {dummyBackupCodes.map((code, i) => (
                <div key={i} className="bg-white p-1 rounded border border-slate-200 text-center font-semibold">
                  {code}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
