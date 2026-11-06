/**
 * ORCA Supabase Auth Login Component
 * 
 * Sourced directly from ORCA Frontend Handoff §5 & §7:
 * - Real Supabase email/password authentication
 * - Never loads a fake user or dummy session
 * - Displays actionable server errors
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export function LoginForm({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const { signIn, isBackendAlive } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="space-y-2 mb-6 text-center">
        <div className="w-10 h-10 mx-auto rounded-full bg-[#111827] text-[#FFFFFF] flex items-center justify-center font-bold text-sm">
          <Lock className="w-4 h-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">Sign in to ORCA</h2>
        <p className="text-xs sm:text-sm text-[#4B5563]">
          Use your authenticated Supabase researcher account to access verified organizations and research runs.
        </p>
      </div>

      {isBackendAlive === false && (
        <div className="mb-5 p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Backend Connection Notice:</strong> Unable to connect to ORCA Gateway at <code className="bg-amber-100 px-1 rounded">{process.env.NEXT_PUBLIC_API_BASE_URL || 'https://orca.130.210.15.82.sslip.io'}/livez</code>. Please verify network connectivity.
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase font-mono tracking-wider">
            Researcher Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3 pointer-events-none" />
            <input
              suppressHydrationWarning
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@institution.org"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#111827] bg-[#FFFFFF] text-[#111827]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1.5 uppercase font-mono tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3 pointer-events-none" />
            <input
              suppressHydrationWarning
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#111827] bg-[#FFFFFF] text-[#111827]"
            />
          </div>
        </div>

        <button
          suppressHydrationWarning
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating Session...</span>
            </>
          ) : (
            <>
              <span>Sign In with Supabase</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

