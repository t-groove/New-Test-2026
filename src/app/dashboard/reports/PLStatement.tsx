"use client";

import type { StatementData } from "./actions";
import type { BankAccount } from "../accounts/actions";

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

function fmtSign(v: number): string {
  if (v === 0) return "—";
  return fmtCurrency.format(v);
}

// ── CSV export ────────────────────────────────────────────────────────────────

function downloadStatementCSV(statement: StatementData, year: number) {
  const { months, incomeRows, totalIncome, totalIncomeAnnual,
          expenseRows, totalExpenses, totalExpensesAnnual,
          grossProfit, grossProfitAnnual, netIncome, netIncomeAnnual, dateRange } = statement;

  const rows: string[][] = [];
  const header = ["", ...months, "Total"];

  const csvVal = (v: number) => v === 0 ? "" : v.toFixed(2);

  rows.push(["Profit and Loss"]);
  rows.push([dateRange]);
  rows.push([]);
  rows.push(header);
  rows.push(["INCOME"]);
  for (const r of incomeRows) {
    rows.push([r.category, ...r.monthly.map(csvVal), csvVal(r.total)]);
  }
  rows.push(["Total Income", ...totalIncome.map(csvVal), csvVal(totalIncomeAnnual)]);
  rows.push([]);
  rows.push(["Gross Profit", ...grossProfit.map(csvVal), csvVal(grossProfitAnnual)]);
  rows.push([]);
  rows.push(["EXPENSES"]);
  for (const r of expenseRows) {
    rows.push([r.category, ...r.monthly.map(csvVal), csvVal(r.total)]);
  }
  rows.push(["Total Expenses", ...totalExpenses.map(csvVal), csvVal(totalExpensesAnnual)]);
  rows.push([]);
  rows.push(["Net Operating Income", ...grossProfit.map(csvVal), csvVal(grossProfitAnnual)]);
  rows.push([]);
  rows.push(["Net Income", ...netIncome.map(csvVal), csvVal(netIncomeAnnual)]);

  const csv = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PL_Statement_${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeaderRow({ label, colCount }: { label: string; colCount: number }) {
  return (
    <tr className="bg-[#0A0F1E]">
      <td
        colSpan={colCount + 2}
        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#6B7A99]"
      >
        {label}
      </td>
    </tr>
  );
}

function SpacerRow({ colCount }: { colCount: number }) {
  return (
    <tr className="h-3 bg-transparent">
      <td colSpan={colCount + 2} />
    </tr>
  );
}

interface CategoryRowProps {
  label: string;
  monthly: number[];
  total: number;
  indent?: boolean;
}

function CategoryRow({ label, monthly, total, indent = true }: CategoryRowProps) {
  return (
    <tr className="hover:bg-[#1E2A45]/20 transition-colors">
      <td className={`px-4 py-1.5 text-sm text-[#E8ECF4] min-w-[180px] lg:min-w-[220px] ${indent ? "pl-8" : "pl-4"}`}>
        {label}
      </td>
      {monthly.map((v, i) => (
        <td
          key={i}
          className={`px-3 py-1.5 text-right text-sm min-w-[80px] lg:min-w-[100px] tabular-nums ${
            v === 0 ? "text-[#6B7A99]" : v < 0 ? "text-[#EF4444]" : "text-[#E8ECF4]"
          }`}
        >
          {fmt(v)}
        </td>
      ))}
      <td
        className={`px-3 py-1.5 text-right text-sm font-semibold min-w-[100px] tabular-nums bg-[#111827] border-l border-[#1E2A45] ${
          total === 0 ? "text-[#6B7A99]" : total < 0 ? "text-[#EF4444]" : "text-[#E8ECF4]"
        }`}
      >
        {fmt(total)}
      </td>
    </tr>
  );
}

interface TotalRowProps {
  label: string;
  monthly: number[];
  total: number;
}

function TotalRow({ label, monthly, total }: TotalRowProps) {
  return (
    <tr className="bg-[#111827] border-t border-[#1E2A45]">
      <td className="px-4 py-2 text-sm font-semibold text-[#E8ECF4] min-w-[180px] lg:min-w-[220px]">
        {label}
      </td>
      {monthly.map((v, i) => (
        <td
          key={i}
          className={`px-3 py-2 text-right text-sm font-semibold min-w-[80px] lg:min-w-[100px] tabular-nums ${
            v === 0 ? "text-[#6B7A99]" : v < 0 ? "text-[#EF4444]" : "text-[#E8ECF4]"
          }`}
        >
          {fmt(v)}
        </td>
      ))}
      <td
        className={`px-3 py-2 text-right text-sm font-semibold min-w-[100px] tabular-nums bg-[#111827] border-l border-[#1E2A45] ${
          total === 0 ? "text-[#6B7A99]" : total < 0 ? "text-[#EF4444]" : "text-[#E8ECF4]"
        }`}
      >
        {fmt(total)}
      </td>
    </tr>
  );
}

interface ProfitRowProps {
  label: string;
  monthly: number[];
  total: number;
}

function ProfitRow({ label, monthly, total }: ProfitRowProps) {
  const color = total > 0 ? "#22C55E" : total < 0 ? "#EF4444" : "#6B7A99";
  return (
    <tr className="bg-[#0A0F1E] border-t-2 border-[#1E2A45]">
      <td className="px-4 py-2.5 text-sm font-bold font-syne text-[#E8ECF4] min-w-[180px] lg:min-w-[220px]">
        {label}
      </td>
      {monthly.map((v, i) => {
        const c = v > 0 ? "#22C55E" : v < 0 ? "#EF4444" : "#6B7A99";
        return (
          <td
            key={i}
            className="px-3 py-2.5 text-right text-sm font-bold min-w-[80px] lg:min-w-[100px] tabular-nums"
            style={{ color: c }}
          >
            {fmtSign(v)}
          </td>
        );
      })}
      <td
        className="px-3 py-2.5 text-right text-sm font-bold min-w-[100px] tabular-nums bg-[#111827] border-l border-[#1E2A45]"
        style={{ color }}
      >
        {fmtSign(total)}
      </td>
    </tr>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PLStatementProps {
  statement: StatementData;
  year: number;
  accounts: BankAccount[];
  selectedAccountId: string;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PLStatement({ statement, year }: PLStatementProps) {
  const {
    months,
    incomeRows,
    totalIncome,
    totalIncomeAnnual,
    expenseRows,
    totalExpenses,
    totalExpensesAnnual,
    grossProfit,
    grossProfitAnnual,
    netIncome,
    netIncomeAnnual,
    dateRange,
  } = statement;

  const colCount = months.length;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-white { background: white !important; color: black !important; }
          body { background: white; color: black; }
          table { font-size: 10px; }
          .overflow-x-auto { overflow: visible !important; }
        }
      `}</style>

      <div className="w-full bg-[#111827] border border-[#1E2A45] rounded-xl p-6">
        {/* Statement header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="font-syne text-xl font-bold text-[#E8ECF4]">Your Business</h2>
            <p className="text-sm text-[#6B7A99]">Profit and Loss</p>
            <p className="text-sm text-[#6B7A99] mt-0.5">{dateRange}</p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7A99] border border-[#1E2A45] rounded-lg hover:text-[#E8ECF4] hover:border-[#4F7FFF] transition-colors"
            >
              Print
            </button>
            <button
              onClick={() => downloadStatementCSV(statement, year)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7A99] border border-[#1E2A45] rounded-lg hover:text-[#E8ECF4] hover:border-[#4F7FFF] transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-[#1E2A45]">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B7A99] uppercase tracking-wider min-w-[180px] lg:min-w-[220px]">
                </th>
                {months.map((m) => (
                  <th
                    key={m}
                    className="px-3 py-2.5 text-right text-xs font-semibold text-[#6B7A99] uppercase tracking-wider min-w-[80px] lg:min-w-[100px]"
                  >
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-[#6B7A99] uppercase tracking-wider min-w-[100px] bg-[#111827] border-l border-[#1E2A45]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {/* INCOME */}
              <SectionHeaderRow label="Income" colCount={colCount} />
              {incomeRows.length === 0 ? (
                <tr>
                  <td colSpan={colCount + 2} className="px-8 py-2 text-sm text-[#6B7A99] italic">
                    No income recorded
                  </td>
                </tr>
              ) : (
                incomeRows.map((row) => (
                  <CategoryRow
                    key={row.category}
                    label={row.category}
                    monthly={row.monthly}
                    total={row.total}
                  />
                ))
              )}
              <TotalRow label="Total Income" monthly={totalIncome} total={totalIncomeAnnual} />

              <SpacerRow colCount={colCount} />
              <ProfitRow label="Gross Profit" monthly={grossProfit} total={grossProfitAnnual} />
              <SpacerRow colCount={colCount} />

              {/* EXPENSES */}
              <SectionHeaderRow label="Expenses" colCount={colCount} />
              {expenseRows.length === 0 ? (
                <tr>
                  <td colSpan={colCount + 2} className="px-8 py-2 text-sm text-[#6B7A99] italic">
                    No expenses recorded
                  </td>
                </tr>
              ) : (
                expenseRows.map((row) => (
                  <CategoryRow
                    key={row.category}
                    label={row.category}
                    monthly={row.monthly}
                    total={row.total}
                  />
                ))
              )}
              <TotalRow label="Total Expenses" monthly={totalExpenses} total={totalExpensesAnnual} />

              <SpacerRow colCount={colCount} />
              <ProfitRow label="Net Operating Income" monthly={grossProfit} total={grossProfitAnnual} />
              <SpacerRow colCount={colCount} />

              {/* NET INCOME */}
              <ProfitRow label="Net Income" monthly={netIncome} total={netIncomeAnnual} />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
