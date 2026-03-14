import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import DashboardNavbar from "@/components/dashboard-navbar";
import ReportsClient from "./ReportsClient";
import { getReportData } from "./actions";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const data = await getReportData(2026);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-[#0A0F1E] min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <ReportsClient initialData={data} initialYear={2026} />
        </div>
      </main>
    </>
  );
}
