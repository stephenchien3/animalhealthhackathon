/**
 * Table for displaying soy sale records.
 * Sortable, filterable, and paginated using TanStack Table.
 */
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel, flexRender,
  type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import type { SoyRecord } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface SoyRecordTableProps {
  data: SoyRecord[];
}

const columns: ColumnDef<SoyRecord>[] = [
  {
    accessorKey: "soldAt",
    header: "Date",
    cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
  },
  { accessorKey: "buyerCompany", header: "Buyer" },
  {
    accessorKey: "soyType",
    header: "Soy Type",
    cell: ({ getValue }) => <span className="capitalize">{getValue<string>()}</span>,
  },
  {
    accessorKey: "quantityTonnes",
    header: "Quantity",
    cell: ({ getValue }) => `${getValue<number>().toLocaleString()}t`,
  },
  {
    accessorKey: "priceUsd",
    header: "Price (USD)",
    cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
  },
  { accessorKey: "shedLocation", header: "Shed Location" },
];

export default function SoyRecordTable({ data }: SoyRecordTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <Input
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search records..."
        className="max-w-sm"
      />
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(header.column.getCanSort() && "cursor-pointer select-none")}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <ArrowUpDown className="ml-1 size-3" />}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} records
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
