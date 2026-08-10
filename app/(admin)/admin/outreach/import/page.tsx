// app/admin/outreach/import/page.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Upload,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface PreviewResult {
  newRows: any[];
  alreadyExists: string[];
  invalid: { row: any; reason: string }[];
  summary: {
    total: number;
    willImport: number;
    skippedExisting: number;
    skippedInvalid: number;
  };
}

export default function ImportPage() {
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setImported(null);
    setPreview(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/outreach/import/preview", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setPreview(data);
    setLoading(false);
  }

  async function handleConfirm() {
    if (!preview) return;
    setLoading(true);

    const res = await fetch("/api/admin/outreach/import/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: preview.newRows }),
    });
    const data = await res.json();
    setImported(data.imported);
    setPreview(null);
    setLoading(false);
  }

  const stats = preview
    ? [
        {
          label: "Total rows",
          value: preview.summary.total,
          icon: Upload,
          sub: "parsed from file",
          alert: false,
        },
        {
          label: "Will import",
          value: preview.summary.willImport,
          icon: CheckCircle2,
          sub: "new leads",
          alert: false,
          good: true,
        },
        {
          label: "Already exist",
          value: preview.summary.skippedExisting,
          icon: FileCheck2,
          sub: "skipped — duplicate",
          alert: preview.summary.skippedExisting > 0,
        },
        {
          label: "Invalid",
          value: preview.summary.skippedInvalid,
          icon: XCircle,
          sub: "skipped — bad data",
          alert: preview.summary.skippedInvalid > 0,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
          Import Leads
        </h1>
        <p className="text-xs sm:text-sm text-ash mt-1">
          Upload a CSV to add outreach leads.
        </p>
      </div>

      {/* Upload Card */}
      <Card className="p-5 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <label
          htmlFor="csv-upload"
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-10 px-4 cursor-pointer hover:border-ember/40 hover:bg-steam/20 transition-colors"
        >
          <div className="p-2.5 rounded-lg bg-steam/40 text-ash">
            <Upload size={18} />
          </div>
          <p className="text-sm font-semibold text-char text-center">
            {fileName ?? "Click to upload CSV"}
          </p>
          <p className="text-[11px] text-ash/80 text-center">
            Columns: email, name, company, phone, source
          </p>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
        </label>
      </Card>

      {loading && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-ash">
          <Loader2 size={14} className="animate-spin" />
          Processing...
        </div>
      )}

      {/* Summary Stat Cards */}
      {preview && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, sub, alert, good }) => (
              <Card
                key={label}
                className={`p-5 flex flex-col justify-between transition-all duration-200 ${
                  alert
                    ? "border-amber-300 bg-amber-50/20 shadow-[0_4px_12px_rgba(245,158,11,0.02)]"
                    : "border-gray-150"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      alert
                        ? "bg-amber-100/50 text-amber-600"
                        : good
                        ? "bg-ember/10 text-ember"
                        : "bg-steam/40 text-ash"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                </div>
                <p className="font-display font-bold text-2xl sm:text-3xl text-char tracking-tight">
                  {value}
                </p>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-char">{label}</p>
                  <p className="text-[11px] text-ash/80 mt-0.5">{sub}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Invalid rows detail */}
          {preview.invalid.length > 0 && (
            <Card className="p-5 border-amber-200 bg-amber-50/20 shadow-[0_2px_12px_rgba(245,158,11,0.02)]">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={15} className="text-amber-600" />
                <p className="text-sm font-semibold text-char">
                  Invalid rows ({preview.invalid.length})
                </p>
              </div>
              <div className="overflow-x-auto -mx-5 px-5">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full text-xs sm:text-sm divide-y divide-amber-200/40">
                    <thead>
                      <tr className="text-[11px] text-ash uppercase tracking-wider text-left">
                        <th className="pb-2 font-semibold">Row data</th>
                        <th className="pb-2 font-semibold">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200/30">
                      {preview.invalid.map((item, i) => (
                        <tr key={i}>
                          <td className="py-2 pr-2 text-char truncate max-w-[220px] sm:max-w-none">
                            {JSON.stringify(item.row)}
                          </td>
                          <td className="py-2 pl-2 text-amber-700 font-medium whitespace-nowrap">
                            {item.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {/* Confirm action */}
          <Card className="p-5 border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-ash">
              Ready to import{" "}
              <span className="font-semibold text-char">
                {preview.summary.willImport}
              </span>{" "}
              leads.
            </p>
            <button
              onClick={handleConfirm}
              disabled={preview.summary.willImport === 0 || loading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-ember text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm import
              <ArrowRight size={14} />
            </button>
          </Card>
        </>
      )}

      {/* Success state */}
      {imported !== null && (
        <Card className="p-5 border-gray-150 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-ember/10 text-ember">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-sm text-char">
            Successfully imported{" "}
            <span className="font-semibold">{imported}</span> leads.
          </p>
        </Card>
      )}
    </div>
  );
}