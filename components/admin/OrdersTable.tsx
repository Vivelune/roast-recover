"use client";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
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
  PAID: "bg-green-50 text-green-700",
  PENDING_DEPOSIT: "bg-yellow-50 text-yellow-700",
  AWAITING_BALANCE: "bg-blue-50 text-blue-700",
  IN_PRODUCTION: "bg-purple-50 text-purple-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-50 text-red-700",
};

const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "email",
    header: "Customer",
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className="text-ember hover:underline"
      >
        {row.getValue("email")}
      </Link>
    ),
  },
  {
    accessorKey: "firstItem",
    header: "Item",
    cell: ({ row }) => (
      <span>
        {row.getValue("firstItem")}
        {row.original.itemCount > 1 && (
          <span className="text-ash"> +{row.original.itemCount - 1}</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 text-xs uppercase tracking-wide text-ash hover:text-char"
      >
        Status <ArrowUpDown size={12} />
      </button>
    ),
    cell: ({ row }) => (
      <span
        className={`text-xs px-2.5 py-1 rounded-md font-medium ${
          statusColor[row.getValue("status") as string] ?? "bg-gray-100 text-gray-600"
        }`}
      >
        {(row.getValue("status") as string).replace(/_/g, " ")}
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => `$${((row.getValue("total") as number) / 100).toFixed(2)}`,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.getValue("createdAt")).toLocaleDateString(),
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
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Input
          placeholder="Filter by customer email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("email")?.setFilterValue(e.target.value)
          }
          className="max-w-xs"
        />
        <Input
          placeholder="Filter by status..."
          value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("status")?.setFilterValue(e.target.value)
          }
          className="max-w-xs"
        />
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-steam/40 border-b border-border">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-4 py-3 text-xs font-medium text-ash"
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
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/50 last:border-0 hover:bg-steam/20 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-char">
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

      <div className="flex items-center justify-between mt-4 text-sm text-ash">
        <p>
          {table.getFilteredRowModel().rows.length} order
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
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
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}