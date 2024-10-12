"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
// , ChevronDown, MoreHorizontal
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  // SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { CourseObject } from "@/lib/getRmd";


export interface CourseListProps {
  data: CourseObject[];
  title: string;
  pageSize: number;
}

export default function SearchTable({
  data,
  title,
  pageSize = 10,
}: CourseListProps) {
  const router = useRouter();

  if (title !== "Recommendation") {
    if (typeof window !== "undefined" && window.localStorage) {
      const user = localStorage.getItem("user");
      if (!user) router.push("/login"); // Navigate to login page
    }
  }

  // console.log("data ", data);

  const columns: ColumnDef<CourseObject>[] = [
    {
      accessorKey: "id",
      header: "id",
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "course_title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="font-bold text-black -ml-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {title}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="ml-3 mr-3 my-2">
          <a href={`/course/${row.getValue("id")}`}>
            {/* target="_blank" */}
            <p className="font-bold">{row.getValue("course_title")}</p>
            {title === "Recommendation" && (
              <p className="text-xs mt-2">Course ID: {row.getValue("id")}</p>
            )}
            <div className="my-2">
              <p>
                {/* <span className="font-semibold">Division:</span>{" "} */}
                {row.getValue("keyword")}
              </p>
            </div>

            <div className="my-2">
              <p>
                <span className="font-semibold">Instructor:</span>{" "}
                {row.getValue("instructor")}
              </p>
            </div>
            <div className="my-2">
              <p>{row.getValue("what_you_will_learn")}</p>
            </div>
          </a>
        </div>
      ),
    },
    {
      accessorKey: "what_you_will_learn",
      header: "what_you_will_learn",
      cell: ({ row }) => <div>{row.getValue("what_you_will_learn")}</div>,
    },
    {
      accessorKey: "keyword",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="font-bold text-black -ml-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Department
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("keyword")}</div>,
    },
    {
      accessorKey: "instructor",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Instructor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="">{row.getValue("instructor")}</div>,
    },
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
      instructor: false,
      what_you_will_learn: false,
      keyword: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        {title !== "Recommendation" && (
          <div className="flex flex-row w-full space-x-3">
            <Input
              placeholder="Search course"
              value={
                (table.getColumn("course_title")?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn("course_title")
                  ?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <Select
              onValueChange={(value) =>
                table.getColumn("keyword")?.setFilterValue(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {/* <SelectLabel>Fruits</SelectLabel> */}
                  <SelectItem value="Arts and Humanities">
                    Arts and Humanities
                  </SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Computer Science">
                    Computer Science
                  </SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Information Technology">
                    Information Technology
                  </SelectItem>
                  <SelectItem value="Math and Logic">Math and Logic</SelectItem>
                  <SelectItem value="Personal Development">
                    Personal Development
                  </SelectItem>
                  <SelectItem value="Physical Science and Engineering">
                    Physical Science and Engineering
                  </SelectItem>
                  <SelectItem value="Social Sciences">
                    Social Sciences
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="md:flex items-center justify-end space-x-2 py-4">
        <div className="md:flex items-center gap-2">
          <button
            className="border rounded px-2 py-1 "
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="border rounded px-2 py-1 "
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="border rounded px-2 py-1 "
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="border rounded px-2 py-1 "
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
          <span className="ml-2 flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount().toLocaleString()}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            | Go to page:
            <input
              type="number"
              min="1"
              max={table.getPageCount()}
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border p-1 rounded w-16"
            />
          </span>
          {title !== "Recommendation" && (
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          {/* Showing {table.getRowModel().rows.length.toLocaleString()} of{' '} */}
          of {table.getRowCount().toLocaleString()} Results
        </div>
      </div>
    </div>
  );
}
