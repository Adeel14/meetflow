import React, { useState } from 'react';
import { Shield, Lock, Mail, Key, AlertCircle, CheckCircle2, X, Crown, Sparkles } from 'lucide-react';
import { OwnerAuth } from '../types/meeting';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (owner: OwnerAuth) => void;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('adeel.techub@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const ownerAuth: OwnerAuth = {
          isLoggedIn: true,
          name: data.owner.name || 'Mirza Adeel',
          email: data.owner.email,
          role: data.owner.role || 'Platform Owner',
          token: data.owner.token,
        };
        localStorage.setItem('meetflow_owner_session', JSON.stringify(ownerAuth));
        localStorage.setItem('meetflow_name', 'Mirza Adeel');
        setSuccessMsg('Welcome back, Mirza Adeel! Owner session verified.');
        setTimeout(() => {
          onLoginSuccess(ownerAuth);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(data.error || 'Invalid credentials. Only Platform Owner can log in.');
      }
    } catch {
      // Offline / client-side verification fallback
      if (
        email.trim().toLowerCase() === 'adeel.techub@gmail.com' &&
        password.trim() === 'mirza204548'
      ) {
        const ownerAuth: OwnerAuth = {
          isLoggedIn: true,
          name: 'Mirza Adeel',
          email: 'adeel.techub@gmail.com',
          role: 'Platform Owner & Creator',
          token: `owner-${Date.now()}`,
        };
        localStorage.setItem('meetflow_owner_session', JSON.stringify(ownerAuth));
        localStorage.setItem('meetflow_name', 'Mirza Adeel');
        setSuccessMsg('Welcome back, Mirza Adeel! Owner session verified.');
        setTimeout(() => {
          onLoginSuccess(ownerAuth);
          onClose();
        }, 1000);
      } else {
        setErrorMsg('Invalid email or password. Portal is strictly for Platform Owner (Mirza Adeel).');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('adeel.techub@gmail.com');
    setPassword('mirza204548');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-b from-amber-500/10 via-indigo-950/40 to-slate-900 border-b border-slate-800/80">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
                <Crown className="w-6 h-6 text-slate-950" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-amber-400">
                <Shield className="w-2.5 h-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Owner Portal</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Mirza Adeel
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Exclusive administrative access for platform owner
              </p>
            </div>
          </div>
        </div>

        {/* Notice for general users */}
        <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2 text-xs text-amber-200/90 leading-tight">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Notice:</strong> This login is strictly for <strong>Mirza Adeel</strong>. Meeting guests do not need to log in to create or join calls.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Owner Gmail ID</span>
              <span className="text-[10px] text-slate-400">adeel.techub@gmail.com</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adeel.techub@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 font-medium"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Owner Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter owner password"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 font-medium"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4 text-slate-950" />
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In as Mirza Adeel'}</span>
          </button>

          {/* 1-click Quick fill for user convenience */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Owner credentials ready?</span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-amber-400 hover:text-amber-300 underline underline-offset-4 text-[11px] cursor-pointer"
            >
              Auto-fill Owner Credentials
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Platform: MeetFlow</span>
          <span className="text-amber-400 font-medium">Owned & Created by Mirza Adeel</span>
        </div>
      </div>
    </div>
  );
};
