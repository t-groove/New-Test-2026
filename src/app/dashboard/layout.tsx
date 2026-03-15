import { BusinessProvider } from "@/lib/business/context";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <BusinessProvider>{children}</BusinessProvider>;
}
