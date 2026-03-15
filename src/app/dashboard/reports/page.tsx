import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import DashboardNavbar from "@/components/dashboard-navbar";
import ReportsClient from "./ReportsClient";
import { getReportData } from "./actions";
import { getBankAccounts } from "../accounts/actions";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [data, bankAccounts] = await Promise.all([
    getReportData(2026),
    getBankAccounts(),
  ]);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-[#0A0F1E] min-h-screen">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8">
          <ReportsClient initialData={data} initialYear={2026} initialAccounts={bankAccounts} />
        </div>
      </main>
    </>
  );
}
