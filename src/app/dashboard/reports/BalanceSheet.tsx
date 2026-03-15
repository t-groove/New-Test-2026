"use client";

import type { BalanceSheetData, BalanceSheetItem } from "./actions";

// ── Formatting ────────────────────────────────────────────────────────────────

const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function fmt(v: number): string {
  if (v === 0) return "—";
  return fmtCurrency.format(v);
}

function amtColor(v: number, isContra = false): string {
  if (v === 0) return "text-[#6B7A99]";
  if (isContra || v < 0) return "text-[#EF4444]";
  return "text-[#E8ECF4]";
}

// ── CSV export ────────────────────────────────────────────────────────────────

function downloadCSV(data: BalanceSheetData) {
  const rows: string[][] = [];

  rows.push(["Balance Sheet"]);
  rows.push([`As of ${data.asOfDate}`]);
  rows.push([]);

  rows.push(["ASSETS"]);
  rows.push(["Fixed Assets"]);
  if (data.fixedAssets.length === 0) {
    rows.push(["  (no asset transactions)", ""]);
  } else {
    for (const item of data.fixedAssets) {
      rows.push([`  ${item.label}`, item.amount.toFixed(2)]);
    }
  }
  rows.push(["Total Fixed Assets", data.totalFixedAssets.toFixed(2)]);
  rows.push([]);
  rows.push(["TOTAL ASSETS", data.totalAssets.toFixed(2)]);
  rows.push([]);

  rows.push(["LIABILITIES"]);
  rows.push(["Current Liabilities"]);
  if (data.currentLiabilities.length === 0) {
    rows.push(["  (no liability transactions)", ""]);
  } else {
    for (const item of data.currentLiabilities) {
      rows.push([`  ${item.label}`, item.amount.toFixed(2)]);
    }
  }
  rows.push(["Total Current Liabilities", data.totalCurrentLiabilities.toFixed(2)]);
  rows.push(["Total Liabilities", data.totalLiabilities.toFixed(2)]);
  rows.push([]);

  rows.push(["EQUITY"]);
  for (const item of data.equityItems) {
    rows.push([`  ${item.label}`, item.amount.toFixed(2)]);
  }
  rows.push([`  Retained Earnings`, data.retainedEarnings.toFixed(2)]);
  rows.push(["Total Equity", data.totalEquity.toFixed(2)]);
  rows.push([]);
  rows.push(["TOTAL LIABILITIES + EQUITY", data.totalLiabilitiesAndEquity.toFixed(2)]);

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Balance_Sheet_${data.asOfDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Row sub-components ────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="bg-[#0A0F1E] px-4 py-2 text-[#6B7A99] text-xs font-semibold uppercase tracking-wider">
      {label}
    </div>
  );
}

function SubSectionHeader({ label }: { label: string }) {
  return (
    <div className="pl-4 px-4 py-2 text-[#E8ECF4] text-sm font-medium">
      {label}
    </div>
  );
}

function LineItem({ label, amount, isContra = false }: BalanceSheetItem) {
  const color = amtColor(amount, isContra);
  return (
    <div className="flex justify-between items-center pl-8 px-4 py-2 text-sm hover:bg-[#1E2A45]/20 transition-colors">
      <span className="text-[#E8ECF4]">{label}</span>
      <span className={`tabular-nums ${color}`}>{fmt(amount)}</span>
    </div>
  );
}

function EmptyItem({ label }: { label: string }) {
  return (
    <div className="flex justify-between items-center pl-8 px-4 py-2 text-sm text-[#6B7A99] italic">
      <span>{label}</span>
      <span>—</span>
    </div>
  );
}

function TotalRow({ label, amount }: { label: string; amount: number }) {
  const color = amtColor(amount);
  return (
    <div className="flex justify-between items-center border-t border-[#1E2A45] px-4 py-2 font-semibold">
      <span className="text-[#E8ECF4] text-sm">{label}</span>
      <span className={`tabular-nums text-sm ${color}`}>{fmt(amount)}</span>
    </div>
  );
}

function GrandTotalRow({ label, amount }: { label: string; amount: number }) {
  const color = amtColor(amount);
  return (
    <div className="flex justify-between items-center border-t-2 border-[#E8ECF4]/20 bg-[#0A0F1E] px-4 py-3 font-bold font-syne text-base">
      <span className="text-[#E8ECF4]">{label}</span>
      <span className={`tabular-nums ${color}`}>{fmt(amount)}</span>
    </div>
  );
}

function Spacer() {
  return <div className="h-4" />;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  data: BalanceSheetData;
  asOfDate: string;
  onDateChange: (date: string) => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BalanceSheet({ data, asOfDate, onDateChange }: Props) {
  const displayDate = (() => {
    const [year, month, day] = asOfDate.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  })();

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; color: black; }
        }
      `}</style>

      <div className="w-full bg-[#111827] border border-[#1E2A45] rounded-xl p-6">
        {/* Statement header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="font-syne text-xl font-bold text-[#E8ECF4]">Your Business</h2>
            <p className="text-sm text-[#6B7A99]">Balance Sheet</p>
            <p className="text-sm text-[#6B7A99] mt-0.5">As of {displayDate}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap no-print">
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-[#0A0F1E] border border-[#1E2A45] text-[#E8ECF4] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#4F7FFF]"
            />
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7A99] border border-[#1E2A45] rounded-lg hover:text-[#E8ECF4] hover:border-[#4F7FFF] transition-colors"
            >
              Print
            </button>
            <button
              onClick={() => downloadCSV(data)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7A99] border border-[#1E2A45] rounded-lg hover:text-[#E8ECF4] hover:border-[#4F7FFF] transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Two-column layout: Assets | Liabilities + Equity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── LEFT: ASSETS ──────────────────────────────────────── */}
          <div className="border border-[#1E2A45] rounded-lg overflow-hidden">
            <SectionHeader label="Assets" />

            <SubSectionHeader label="Fixed Assets" />
            {data.fixedAssets.length === 0 ? (
              <EmptyItem label="No asset transactions" />
            ) : (
              data.fixedAssets.map((item) => (
                <LineItem key={item.label} {...item} />
              ))
            )}
            <TotalRow label="Total Fixed Assets" amount={data.totalFixedAssets} />

            <GrandTotalRow label="Total Assets" amount={data.totalAssets} />
          </div>

          {/* ── RIGHT: LIABILITIES + EQUITY ───────────────────────── */}
          <div className="border border-[#1E2A45] rounded-lg overflow-hidden">
            <SectionHeader label="Liabilities" />

            <SubSectionHeader label="Current Liabilities" />
            {data.currentLiabilities.length === 0 ? (
              <EmptyItem label="No liability transactions" />
            ) : (
              data.currentLiabilities.map((item) => (
                <LineItem key={item.label} {...item} />
              ))
            )}
            <TotalRow label="Total Current Liabilities" amount={data.totalCurrentLiabilities} />
            <TotalRow label="Total Liabilities" amount={data.totalLiabilities} />

            <Spacer />

            <SectionHeader label="Equity" />
            {data.equityItems.map((item) => (
              <LineItem key={item.label} {...item} />
            ))}
            <LineItem label="Retained Earnings" amount={data.retainedEarnings} isContra={false} />
            <TotalRow label="Total Equity" amount={data.totalEquity} />

            <GrandTotalRow label="Total Liabilities + Equity" amount={data.totalLiabilitiesAndEquity} />
          </div>
        </div>
      </div>
    </>
  );
}
