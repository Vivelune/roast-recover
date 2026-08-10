// app/admin/outreach/leads/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

interface Lead {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  status: string;
  source: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  NEW: "bg-steam text-ash",
  CONTACTED: "bg-blue-50 text-blue-700",
  OPENED: "bg-amber-50 text-amber-700",
  REPLIED: "bg-green-50 text-green-700",
  CONVERTED: "bg-ember/10 text-ember",
  UNSUBSCRIBED: "bg-gray-100 text-gray-500",
  DEAD: "bg-red-50 text-red-600",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/outreach/leads")
      .then((r) => r.json())
      .then((data) => {
        setLeads(data.leads);
        setLoading(false);
      });
  }, []);

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.company?.toLowerCase().includes(search.toLowerCase()) ||
      lead.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["ALL", "NEW", "CONTACTED", "OPENED", "REPLIED", "CONVERTED", "UNSUBSCRIBED", "DEAD"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
          All Leads
        </h1>
        <p className="text-xs sm:text-sm text-ash mt-1">
          {filtered.length} of {leads.length} leads
        </p>
      </div>

      <Card className="p-5 border-gray-150">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash/60" />
            <Input
              placeholder="Search by name, email, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                  statusFilter === s
                    ? "bg-ember text-white"
                    : "bg-steam/40 text-ash hover:bg-steam/60"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-ash py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ash py-8 text-center">No leads match your filters.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium text-char">
                      {lead.company ?? "—"}
                    </TableCell>
                    <TableCell className="text-ash">{lead.name ?? "—"}</TableCell>
                    <TableCell className="text-ash truncate max-w-[180px]">
                      {lead.email}
                    </TableCell>
                    <TableCell className="text-ash text-xs">{lead.source ?? "—"}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[lead.status]} border-0 text-[10px] font-bold`}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-ash text-xs whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}