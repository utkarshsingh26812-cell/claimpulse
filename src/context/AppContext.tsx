import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Claim, User, Decision, AgentLogEntry } from '@/types';
import { mockClaims, mockAgentLogs } from '@/data/mockData';

interface AppContextValue {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  claims: Claim[];
  addClaim: (claim: Claim) => void;
  updateClaim: (id: string, updates: Partial<Claim>) => void;
  approveClaim: (id: string, decision: Decision, notes: string) => void;
  rejectClaim: (id: string, notes: string) => void;
  modifyClaim: (id: string, decision: Decision, notes: string) => void;
  getClaim: (id: string) => Claim | undefined;
  agentLogs: AgentLogEntry[];
  addAgentLog: (entry: Omit<AgentLogEntry, 'id'>) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const STORAGE_KEY = 'claimpulse_data_v1';
const USER_KEY = 'claimpulse_user_v1';

interface StoredData {
  claims: Claim[];
  agentLogs: AgentLogEntry[];
}

function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredData;
      if (parsed.claims && parsed.claims.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { claims: mockClaims, agentLogs: mockAgentLogs };
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw) as User;
  } catch {
    // ignore
  }
  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const [data, setData] = useState<StoredData>(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const login = useCallback((email: string, name?: string) => {
    setUser({
      email,
      name: name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: 'Warranty Review Manager',
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addClaim = useCallback((claim: Claim) => {
    setData((prev) => ({ ...prev, claims: [claim, ...prev.claims] }));
  }, []);

  const updateClaim = useCallback((id: string, updates: Partial<Claim>) => {
    setData((prev) => ({
      ...prev,
      claims: prev.claims.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const generateReturnAuth = (claim: Claim, decision: Decision): Claim => {
    const authNumber = `RA-2026-${claim.id.split('-').pop()}`;
    return {
      ...claim,
      finalDecision: decision,
      status: 'Approved',
      returnAuth: {
        authNumber,
        approvedAction: decision,
        reason: claim.reasonForRecommendation,
        date: new Date().toISOString(),
        shippingLabel: `SHIP-${authNumber}`,
        status: 'Generated',
      },
    };
  };

  const approveClaim = useCallback((id: string, decision: Decision, notes: string) => {
    setData((prev) => ({
      ...prev,
      claims: prev.claims.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          finalDecision: decision,
          status: 'Approved',
          reviewerNotes: notes,
          returnAuth: {
            authNumber: `RA-2026-${c.id.split('-').pop()}`,
            approvedAction: decision,
            reason: c.reasonForRecommendation,
            date: new Date().toISOString(),
            shippingLabel: `SHIP-RA-2026-${c.id.split('-').pop()}`,
            status: 'Generated',
          },
        };
      }),
      agentLogs: [
        ...prev.agentLogs,
        {
          id: `log-${Date.now()}`,
          claimId: id,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          message: `Human approval received — ${decision} confirmed`,
          type: 'success' as const,
        },
        {
          id: `log-${Date.now() + 1}`,
          claimId: id,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          message: `Return authorization generated — RA-2026-${id.split('-').pop()}`,
          type: 'success' as const,
        },
      ],
    }));
  }, []);

  const rejectClaim = useCallback((id: string, notes: string) => {
    setData((prev) => ({
      ...prev,
      claims: prev.claims.map((c) =>
        c.id === id ? { ...c, status: 'Rejected', reviewerNotes: notes, finalDecision: 'DENY' } : c
      ),
      agentLogs: [
        ...prev.agentLogs,
        {
          id: `log-${Date.now()}`,
          claimId: id,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          message: `Claim rejected by human reviewer`,
          type: 'error' as const,
        },
      ],
    }));
  }, []);

  const modifyClaim = useCallback((id: string, decision: Decision, notes: string) => {
    setData((prev) => ({
      ...prev,
      claims: prev.claims.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          finalDecision: decision,
          status: 'Approved',
          reviewerNotes: notes,
          returnAuth: {
            authNumber: `RA-2026-${c.id.split('-').pop()}`,
            approvedAction: decision,
            reason: notes || c.reasonForRecommendation,
            date: new Date().toISOString(),
            shippingLabel: `SHIP-RA-2026-${c.id.split('-').pop()}`,
            status: 'Generated',
          },
        };
      }),
      agentLogs: [
        ...prev.agentLogs,
        {
          id: `log-${Date.now()}`,
          claimId: id,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          message: `Decision modified by reviewer — ${decision}`,
          type: 'info' as const,
        },
        {
          id: `log-${Date.now() + 1}`,
          claimId: id,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          message: `Return authorization generated — RA-2026-${id.split('-').pop()}`,
          type: 'success' as const,
        },
      ],
    }));
  }, []);

  const getClaim = useCallback(
    (id: string) => data.claims.find((c) => c.id === id),
    [data.claims]
  );

  const addAgentLog = useCallback((entry: Omit<AgentLogEntry, 'id'>) => {
    setData((prev) => ({
      ...prev,
      agentLogs: [
        ...prev.agentLogs,
        { ...entry, id: `log-${Date.now()}-${Math.random()}` },
      ],
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        claims: data.claims,
        addClaim,
        updateClaim,
        approveClaim,
        rejectClaim,
        modifyClaim,
        getClaim,
        agentLogs: data.agentLogs,
        addAgentLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
