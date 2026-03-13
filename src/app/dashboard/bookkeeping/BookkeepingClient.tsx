"use client";

import { useState, useRef, useCallback, useMemo, useTransition } from "react";
import { parseCSV } from "@/lib/bookkeeping/parse-csv";
import type { ParsedTransaction } from "@/lib/bookkeeping/parse-csv";
import { ALL_CATEGORIES } from "@/lib/bookkeeping/categories";
import {
  uploadTransactions,
  getTransactions,
  updateTransactionCategory,
  deleteTransaction,
} from "./actions";
import type { Transaction } from "./actions";
import {
  Upload,
  CloudUpload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  BookOpen,
} from "lucide-react";

const PAGE_SIZE = 50;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ToastState {
  message: string;
  type: "success" | "error";
}

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
        toast.type === "success"
          ? "bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]"
          : "bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]"
      }`}
    >
      {toast.message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

interface UploadPanelProps {
  onImportSuccess: (transactions: Transaction[]) => void;
}

function UploadPanel({ onImportSuccess }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<ParsedTransaction[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      setParseError("Please upload a .csv file.");
      return;
    }
    setParseError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      if (result.transactions.length === 0) {
        setParseError(
          "Could not parse this CSV. Please check the format."
        );
        setPreview(null);
      } else {
        setPreview(result.transactions);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleImport = () => {
    if (!preview) return;
    startTransition(async () => {
      const result = await uploadTransactions(preview);
      if (result.success) {
        setToast({
          message: `${result.count} transactions imported successfully`,
          type: "success",
        });
        // Reload transactions
        const fresh = await getTransactions();
        onImportSuccess(fresh);
        setPreview(null);
      } else {
        setToast({ message: result.error, type: "error" });
      }
    });
  };

  return (
    <div className="bg-[#111827] border border-[#1E2A45] rounded-xl p-6 mb-6">
      <h2 className="font-syne text-xl font-bold text-[#E8ECF4] mb-1">
        Import Bank Transactions
      </h2>
      <p className="text-sm text-[#6B7A99] mb-5">
        Upload a CSV export from your bank. Works with Chase, Bank of America,
        Wells Fargo, and most US banks.
      </p>

      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging
              ? "border-[#4F7FFF] bg-[#4F7FFF]/5"
              : "border-[#1E2A45] bg-[#0A0F1E] hover:border-[#4F7FFF]/50"
          }`}
        >
          <CloudUpload
            size={40}
            className={`mb-3 ${isDragging ? "text-[#4F7FFF]" : "text-[#6B7A99]"}`}
          />
          <p className="text-[#E8ECF4] font-medium mb-1">
            Drag your CSV file here
          </p>
          <p className="text-sm text-[#6B7A99]">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div>
          <p className="text-sm text-[#6B7A99] mb-3">
            Found{" "}
            <span className="text-[#E8ECF4] font-semibold">{preview.length}</span>{" "}
            transactions — showing first 5
          </p>
          <div className="overflow-x-auto rounded-lg border border-[#1E2A45] mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E2A45] bg-[#0A0F1E]">
                  {["Date", "Description", "Amount", "Type"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[#6B7A99] font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map((t, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#1E2A45] last:border-0 hover:bg-[#1E2A45]/30"
                  >
                    <td className="px-4 py-3 text-[#E8ECF4] whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td
                      className="px-4 py-3 text-[#E8ECF4] max-w-xs truncate"
                      title={t.description}
                    >
                      {t.description}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium whitespace-nowrap ${
                        t.type === "income"
                          ? "text-[#22C55E]"
                          : "text-[#EF4444]"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.type === "income"
                            ? "bg-[#22C55E]/10 text-[#22C55E]"
                            : "bg-[#EF4444]/10 text-[#EF4444]"
                        }`}
                      >
                        {t.type === "income" ? "Income" : "Expense"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4F7FFF] hover:bg-[#3D6FEF] disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors"
            >
              <Upload size={16} />
              {isPending
                ? "Importing..."
                : `Import ${preview.length} transactions`}
            </button>
            <button
              onClick={() => setPreview(null)}
              disabled={isPending}
              className="px-5 py-2.5 border border-[#1E2A45] text-[#6B7A99] hover:text-[#E8ECF4] hover:border-[#4F7FFF]/50 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {parseError && (
        <p className="mt-3 text-sm text-[#EF4444]">{parseError}</p>
      )}

      {toast && (
        <Toast toast={toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

interface TransactionListProps {
  initialTransactions: Transaction[];
}

export default function BookkeepingClient({
  initialTransactions,
}: TransactionListProps) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleImportSuccess = (fresh: Transaction[]) => {
    setTransactions(fresh);
    setPage(1);
    showToast("Transactions imported successfully", "success");
  };

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCategory !== "all" && t.category !== filterCategory)
        return false;
      if (filterStart && t.date < filterStart) return false;
      if (filterEnd && t.date > filterEnd) return false;
      if (
        search &&
        !t.description.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [transactions, filterType, filterCategory, filterStart, filterEnd, search]);

  const totalIncome = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + Number(t.amount), 0),
    [filtered]
  );
  const totalExpenses = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount), 0),
    [filtered]
  );
  const netProfit = totalIncome - totalExpenses;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCategoryChange = async (id: string, category: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, category } : t))
    );
    const result = await updateTransactionCategory(id, category);
    if (!result.success) {
      showToast("Failed to update category", "error");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteTransaction(id);
    if (result.success) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } else {
      showToast("Failed to delete transaction", "error");
    }
    setDeletingId(null);
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount"];
    const rows = filtered.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      t.amount,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls =
    "bg-[#0A0F1E] border border-[#1E2A45] text-[#E8ECF4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F7FFF] placeholder:text-[#6B7A99]";

  return (
    <div>
      <UploadPanel onImportSuccess={handleImportSuccess} />

      {/* Transaction List Card */}
      <div className="bg-[#111827] border border-[#1E2A45] rounded-xl p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h2 className="font-syne text-xl font-bold text-[#E8ECF4]">
              Transactions
            </h2>
            <span className="bg-[#1E2A45] text-[#6B7A99] text-xs font-medium px-2.5 py-0.5 rounded-full">
              {filtered.length}
            </span>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-[#1E2A45] text-[#6B7A99] hover:text-[#E8ECF4] hover:border-[#4F7FFF]/50 rounded-lg text-sm transition-colors disabled:opacity-40"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="date"
            value={filterStart}
            onChange={(e) => {
              setFilterStart(e.target.value);
              setPage(1);
            }}
            className={inputCls}
            placeholder="From"
          />
          <input
            type="date"
            value={filterEnd}
            onChange={(e) => {
              setFilterEnd(e.target.value);
              setPage(1);
            }}
            className={inputCls}
            placeholder="To"
          />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className={inputCls}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(1);
            }}
            className={inputCls}
          >
            <option value="all">All Categories</option>
            <option value="Uncategorized">Uncategorized</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search description..."
            className={`${inputCls} min-w-[180px]`}
          />
        </div>

        {/* Summary Bar */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-[#0A0F1E] border border-[#1E2A45] rounded-lg p-4">
              <p className="text-xs text-[#6B7A99] mb-1">Total Income</p>
              <p className="text-lg font-bold text-[#22C55E]">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="bg-[#0A0F1E] border border-[#1E2A45] rounded-lg p-4">
              <p className="text-xs text-[#6B7A99] mb-1">Total Expenses</p>
              <p className="text-lg font-bold text-[#EF4444]">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="bg-[#0A0F1E] border border-[#1E2A45] rounded-lg p-4">
              <p className="text-xs text-[#6B7A99] mb-1">Net Profit / Loss</p>
              <p
                className={`text-lg font-bold ${
                  netProfit >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"
                }`}
              >
                {netProfit >= 0 ? "+" : ""}
                {formatCurrency(netProfit)}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1E2A45] flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-[#6B7A99]" />
            </div>
            <p className="font-syne font-semibold text-[#E8ECF4] text-lg mb-1">
              No transactions yet
            </p>
            <p className="text-sm text-[#6B7A99]">
              Upload a CSV from your bank to get started
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[#6B7A99]">No transactions match your filters</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-[#1E2A45]">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#1E2A45] bg-[#0A0F1E]">
                    {["Date", "Description", "Category", "Type", "Amount", ""].map(
                      (h, i) => (
                        <th
                          key={i}
                          className={`px-4 py-3 text-[#6B7A99] font-medium text-left ${
                            i === 4 ? "text-right" : ""
                          }`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-[#1E2A45] last:border-0 hover:bg-[#1E2A45]/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-[#E8ECF4] whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td
                        className="px-4 py-3 text-[#E8ECF4] max-w-[220px] truncate"
                        title={t.description}
                      >
                        {t.description.length > 40
                          ? t.description.slice(0, 40) + "…"
                          : t.description}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={t.category}
                          onChange={(e) =>
                            handleCategoryChange(t.id, e.target.value)
                          }
                          className="bg-[#0A0F1E] border border-[#1E2A45] text-[#E8ECF4] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#4F7FFF] max-w-[160px]"
                        >
                          <option value="Uncategorized">Uncategorized</option>
                          {ALL_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            t.type === "income"
                              ? "bg-[#22C55E]/10 text-[#22C55E]"
                              : "bg-[#EF4444]/10 text-[#EF4444]"
                          }`}
                        >
                          {t.type === "income" ? "Income" : "Expense"}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                          t.type === "income"
                            ? "text-[#22C55E]"
                            : "text-[#EF4444]"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(Number(t.amount))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="p-1.5 rounded text-[#6B7A99] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors disabled:opacity-40"
                          title="Delete transaction"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1E2A45]">
                <p className="text-sm text-[#6B7A99]">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded border border-[#1E2A45] text-[#6B7A99] hover:text-[#E8ECF4] hover:border-[#4F7FFF]/50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-[#E8ECF4] px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded border border-[#1E2A45] text-[#6B7A99] hover:text-[#E8ECF4] hover:border-[#4F7FFF]/50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
