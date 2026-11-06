/**
 * ORCA Authentication & Workspace State Provider
 * 
 * Sourced directly from ORCA Frontend Handoff §5 & §7:
 * - Real Supabase session management via @supabase/supabase-js
 * - Loads /v1/me and /v1/organizations with Bearer token
 * - Controlled workspace selection with validation against authorized directory
 * - Clean sign-in and sign-out lifecycle
 * - Explicit error handling without synthetic fallback data
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { CurrentUser, OrganizationSummary } from '@/types/api';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  currentUser: CurrentUser | null;
  organizations: OrganizationSummary[];
  selectedOrg: OrganizationSummary | null;
  selectedOrgId: string | null;
  loading: boolean;
  orgsLoading: boolean;
  error: string | null;
  isBackendAlive: boolean | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  selectOrg: (orgId: string) => void;
  refreshDirectory: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY_SELECTED_ORG = 'orca_selected_org_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendAlive, setIsBackendAlive] = useState<boolean | null>(null);

  // Check backend liveness (/livez) per handoff §2
  const checkBackendLiveness = useCallback(async () => {
    try {
      const res = await apiClient.livez();
      setIsBackendAlive(res?.status === 'alive');
    } catch {
      setIsBackendAlive(false);
    }
  }, []);

  // Fetch verified profile (/v1/me) and authorized organizations (/v1/organizations)
  const fetchDirectory = useCallback(async () => {
    setOrgsLoading(true);
    setError(null);

    try {
      const [meRes, orgsRes] = await Promise.allSettled([
        apiClient.me(),
        apiClient.listOrganizations({ limit: 20 }),
      ]);

      if (meRes.status === 'fulfilled') {
        setCurrentUser(meRes.value);
      }

      if (orgsRes.status === 'fulfilled') {
        const items = orgsRes.value?.items || [];
        setOrganizations(items);

        // Workspace selection logic per handoff §7:
        // - Exactly one organization: auto-select it
        // - Multiple: restore previously saved ID only if still in authorized directory
        const savedOrgId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SELECTED_ORG) : null;
        if (items.length === 1) {
          setSelectedOrgId(items[0].id);
          localStorage.setItem(STORAGE_KEY_SELECTED_ORG, items[0].id);
        } else if (savedOrgId && items.some((o) => o.id === savedOrgId)) {
          setSelectedOrgId(savedOrgId);
        } else {
          setSelectedOrgId(null);
        }
      } else {
        const reason = orgsRes.reason as OrcaApiError;
        setError(reason?.problem?.detail || reason?.message || 'Failed to load organization directory');
        setOrganizations([]);
        setSelectedOrgId(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Directory request failed';
      setError(msg);
      setOrganizations([]);
      setSelectedOrgId(null);
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  // Initialize session and subscribe to auth state changes
  useEffect(() => {
    checkBackendLiveness();

    // 1. Resolve initial Supabase session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setLoading(false);

      if (initialSession) {
        fetchDirectory();
      }
    });

    // 2. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession) {
        await fetchDirectory();
      } else {
        // Clear all state on sign out per handoff §5 & §7
        setCurrentUser(null);
        setOrganizations([]);
        setSelectedOrgId(null);
        setError(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY_SELECTED_ORG);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkBackendLiveness, fetchDirectory]);

  // Explicit sign in
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { error: authError.message };
      }

      if (!data.session) {
        return { error: 'No authenticated session returned from Supabase Auth' };
      }

      setSession(data.session);
      setUser(data.user);
      await fetchDirectory();
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      return { error: msg };
    }
  };

  // Explicit sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setCurrentUser(null);
    setOrganizations([]);
    setSelectedOrgId(null);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_SELECTED_ORG);
    }
  };

  // Select organization
  const selectOrg = (orgId: string) => {
    const valid = organizations.find((o) => o.id === orgId);
    if (valid) {
      setSelectedOrgId(orgId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_SELECTED_ORG, orgId);
      }
    }
  };

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId) || null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        currentUser,
        organizations,
        selectedOrg,
        selectedOrgId,
        loading,
        orgsLoading,
        error,
        isBackendAlive,
        signIn,
        signOut,
        selectOrg,
        refreshDirectory: fetchDirectory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

