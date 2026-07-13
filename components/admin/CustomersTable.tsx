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
        className="text-ember hover:underline"
      >
        {row.getValue("email")}
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.getValue("name") ?? (
      <span className="text-ash">—</span>
    ),
  },
  {
    accessorKey: "orderCount",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 text-xs uppercase tracking-wide text-ash hover:text-char"
      >
        Orders <ArrowUpDown size={12} />
      </button>
    ),
    cell: ({ row }) => row.getValue("orderCount"),
  },
  {
    accessorKey: "totalSpend",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 text-xs uppercase tracking-wide text-ash hover:text-char"
      >
        Total spend <ArrowUpDown size={12} />
      </button>
    ),
    cell: ({ row }) =>
      `$${((row.getValue("totalSpend") as number) / 100).toFixed(2)}`,
  },
  {
    accessorKey: "lastOrderDate",
    header: "Last order",
    cell: ({ row }) => {
      const date = row.getValue("lastOrderDate") as string | null;
      return date
        ? new Date(date).toLocaleDateString()
        : <span className="text-ash">—</span>;
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span
        className={`text-xs px-2 py-0.5 rounded ${
          row.getValue("role") === "ADMIN"
            ? "bg-ember/10 text-ember"
            : "bg-steam text-ash"
        }`}
      >
        {row.getValue("role")}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) =>
      new Date(row.getValue("createdAt")).toLocaleDateString(),
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
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("email")?.setFilterValue(e.target.value)
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
                  <th key={header.id} className="text-left px-4 py-3 text-xs font-medium text-ash">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-ash text-sm">
                  No customers yet.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0 hover:bg-steam/20">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-char">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-ash">
        <p>
          {table.getFilteredRowModel().rows.length} customer
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