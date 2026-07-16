"use client";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type OrderRow = {
  id: string;
  email: string;
  firstItem: string;
  itemCount: number;
  status: string;
  total: number;
  createdAt: string;
};

const statusColor: Record<string, string> = {
  PAID: "bg-emerald-50 border-emerald-100 text-emerald-700",
  PENDING_DEPOSIT: "bg-amber-50 border-amber-100 text-amber-700",
  AWAITING_BALANCE: "bg-blue-50 border-blue-100 text-blue-700",
  IN_PRODUCTION: "bg-purple-50 border-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-50 border-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-50 border-green-100 text-green-800",
  CANCELLED: "bg-red-50 border-red-100 text-red-700",
};

const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "email",
    header: "Customer",
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className="text-ember hover:underline font-semibold block truncate max-w-[150px] sm:max-w-none"
      >
        {row.getValue("email")}
      </Link>
    ),
  },
  {
    accessorKey: "firstItem",
    header: "Item",
    cell: ({ row }) => (
      <span className="font-medium text-char block truncate max-w-[150px] sm:max-w-none">
        {row.getValue("firstItem")}
        {row.original.itemCount > 1 && (
          <span className="text-ash font-normal"> +{row.original.itemCount - 1}</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-ash hover:text-char transition-colors"
      >
        Status <ArrowUpDown size={12} />
      </button>
    ),
    cell: ({ row }) => (
      <span
        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border whitespace-nowrap ${
          statusColor[row.getValue("status") as string] ?? "bg-gray-100 border-gray-200 text-gray-600"
        }`}
      >
        {(row.getValue("status") as string).replace(/_/g, " ")}
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-semibold text-char">
        ${((row.getValue("total") as number) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-ash text-xs whitespace-nowrap">
        {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })}
      </span>
    ),
  },
];

export default function OrdersTable({ data }: { data: OrderRow[] }) {
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
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="space-y-4">
      {/* Filtering Inputs Area */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
          <Input
            placeholder="Search by customer email..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("email")?.setFilterValue(e.target.value)
            }
            className="pl-9 h-10 border-gray-200 placeholder:text-ash text-char bg-white focus-visible:ring-ember"
          />
        </div>
        <div className="relative flex-1 max-w-sm">
          <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
          <Input
            placeholder="Filter by status..."
            value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("status")?.setFilterValue(e.target.value)
            }
            className="pl-9 h-10 border-gray-200 placeholder:text-ash text-char bg-white focus-visible:ring-ember"
          />
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="border border-gray-150 rounded-xl overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-[#FBFBFA] border-b border-gray-150">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-5 py-3.5 text-[11px] font-bold text-ash uppercase tracking-wider"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-steam/10 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs sm:text-sm text-ash font-medium">
        <p>
          Showing {table.getFilteredRowModel().rows.length} order
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 border-gray-200"
          >
            <ChevronLeft size={14} />
          </Button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 border-gray-200"
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}