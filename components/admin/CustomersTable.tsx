"use client";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type CustomerRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  orderCount: number;
  totalSpend: number;
  lastOrderDate: string | null;
  createdAt: string;
};

const columns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <Link
        href={`/admin/customers/${row.original.id}`}
        className="text-ember hover:underline font-semibold text-char hover:text-ember transition-colors"
      >
        {row.getValue("email")}
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.getValue("name") ?? (
      <span className="text-ash italic font-normal text-xs">No name provided</span>
    ),
  },
  {
    accessorKey: "orderCount",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ash hover:text-char transition-colors group"
      >
        Orders <ArrowUpDown size={11} className="text-gray-300 group-hover:text-char transition-colors" />
      </button>
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-char">{row.getValue("orderCount")}</span>
    ),
  },
  {
    accessorKey: "totalSpend",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ash hover:text-char transition-colors group"
      >
        Total Spend <ArrowUpDown size={11} className="text-gray-300 group-hover:text-char transition-colors" />
      </button>
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-char">
        {`$${((row.getValue("totalSpend") as number) / 100).toFixed(2)}`}
      </span>
    ),
  },
  {
    accessorKey: "lastOrderDate",
    header: "Last Order",
    cell: ({ row }) => {
      const date = row.getValue("lastOrderDate") as string | null;
      return date ? (
        <span className="font-medium text-char">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ) : (
        <span className="text-ash text-xs">—</span>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
          row.getValue("role") === "ADMIN"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-steam text-ash border-gray-200/40"
        }`}
      >
        {row.getValue("role")}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <span className="text-ash font-medium text-xs">
        {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
];

export default function CustomersTable({ data }: { data: CustomerRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize: 25 } },
  });

  return (
    <div className="space-y-6">
      {/* Table Filter Control */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-ash">
          <Search size={16} />
        </span>
        <Input
          placeholder="Filter customer accounts..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("email")?.setFilterValue(e.target.value)
          }
          className="pl-10 rounded-xl border-gray-150 focus-visible:ring-char text-xs font-semibold placeholder:text-gray-300"
        />
      </div>

      {/* Styled Table Canvas */}
      <Card className="overflow-hidden border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl">
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-[#FBFBFA] border-b border-gray-150">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-ash"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-ash text-sm font-medium">
                    No customers registered yet matching query.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-steam/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-char">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modern Table Pagination Footnotes */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold text-ash">
        <p>
          Showing {table.getFilteredRowModel().rows.length} customer
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </p>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-9 w-9 p-0 rounded-xl border-gray-150 hover:bg-steam"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={14} className="text-char" />
          </Button>
          <span className="text-char">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            className="h-9 w-9 p-0 rounded-xl border-gray-150 hover:bg-steam"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={14} className="text-char" />
          </Button>
        </div>
      </div>
    </div>
  );
}