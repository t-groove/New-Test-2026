"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getUserBusinesses, setActiveBusiness } from "./actions";
import type { Business, BusinessMember } from "./actions";

interface BusinessContextType {
  currentBusiness: Business | null;
  currentRole: string | null;
  businesses: BusinessMember[];
  switchBusiness: (businessId: string) => Promise<void>;
  isLoading: boolean;
}

export const BusinessContext = createContext<BusinessContextType>({
  currentBusiness: null,
  currentRole: null,
  businesses: [],
  switchBusiness: async () => {},
  isLoading: true,
});

export function useBusinessContext() {
  return useContext(BusinessContext);
}

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<BusinessMember[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserBusinesses().then((members) => {
      setBusinesses(members);

      if (members.length === 0) {
        setIsLoading(false);
        return;
      }

      // Restore from localStorage if available
      const savedId =
        typeof window !== "undefined"
          ? localStorage.getItem("centerbase_business_id")
          : null;
      const found = savedId ? members.find((m) => m.business_id === savedId) : null;
      const active = found ?? members[0];

      setCurrentBusiness(active.business);
      setCurrentRole(active.role);
      setIsLoading(false);
    });
  }, []);

  const switchBusiness = useCallback(async (businessId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("centerbase_business_id", businessId);
    }
    await setActiveBusiness(businessId);
    window.location.reload();
  }, []);

  return (
    <BusinessContext.Provider
      value={{ currentBusiness, currentRole, businesses, switchBusiness, isLoading }}
    >
      {children}
    </BusinessContext.Provider>
  );
}
