"use client";

import type { Selection, SortDescriptor } from "@heroui/react";
import type { ColumnsKey, TaskStatusOptions, Task } from "./data-tasks"; // Import Task types
import type { Key } from "@react-types/shared";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  RadioGroup,
  Radio,
  Chip,
  Pagination,
  Divider,
  Tooltip,
  useButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { SearchIcon } from "@heroui/shared-icons";
// Import useEffect for the hydration fix
import React, { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { Icon } from "@iconify/react"; // Keep for other icons like calendar, filter, sort etc.
import { cn } from "@heroui/react";

// Assuming these utility/icon components exist in separate files
import { CopyText } from "./copy-text";
import { EyeFilledIcon } from "./eye";
import { ArrowDownIcon } from "./arrow-down";
import { ArrowUpIcon } from "./arrow-up";
import { useMemoizedCallback } from "./use-memoized-callback";

// Import the custom SVG icon components from their files
import { RefreshIcon } from "./refresh";
import { CancelIcon } from "./cancel";

// Import task data and status component
import { columns, INITIAL_VISIBLE_COLUMNS, tasks } from "./data-tasks";
import { TaskStatus } from "./TaskStatus";

// Determine the initial sort column (first sortable column or fallback to the first column)
const initialSortColumn = columns.find(col => col.sortable)?.uid || columns[0].uid as Key;

/**
 * AiTaskPanel Component: Displays a table of AI tasks with filtering, sorting,
 * pagination, and actions. Includes fix for hydration errors related to date formatting.
 */
export default function AiTaskPanel() {
  // State for search/filter input value
  const [filterValue, setFilterValue] = useState("");
  // State for selected row keys
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  // State for visible columns
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  // State for rows per page (could be made dynamic)
  const [rowsPerPage] = useState(10);
  // State for the current page number
  const [page, setPage] = useState(1);
  // State for table sorting descriptor (column and direction)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: initialSortColumn,
    direction: "ascending",
  });
  // State for the status filter dropdown
  const [statusFilter, setStatusFilter] = React.useState<TaskStatusOptions | "all">("all");

  // --- Hydration Fix Start ---
  // State to track if the component has mounted on the client
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true only after the component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  // --- Hydration Fix End ---


  // Memoized list of header columns based on visibility and sort direction
  const headerColumns = useMemo(() => {
    return columns
      // Add sortDirection property to the currently sorted column
      .map((col) =>
        col.uid === sortDescriptor.column
          ? { ...col, sortDirection: sortDescriptor.direction }
          : col
      )
      // Filter columns based on the visibleColumns state
      .filter((col) =>
        visibleColumns === "all"
          ? true
          : (visibleColumns as Set<Key>).has(col.uid as Key)
      );
  }, [visibleColumns, sortDescriptor]);

  // Callback function to filter tasks based on the current filter settings
  const itemFilter = useCallback(
    (task: Task) => {
      // Check if the task status matches the filter (or if filter is 'all')
      let matchesStatus = statusFilter === "all" || statusFilter === task.status.toLowerCase();
      // Add other filter criteria here if needed (e.g., date range)
      return matchesStatus;
    },
    [statusFilter] // Dependency: re-run filter if statusFilter changes
  );

  // Memoized list of tasks after applying search and status filters
  const filteredItems = useMemo(() => {
    let filteredTasks = [...tasks]; // Start with all tasks

    // Apply search filter (case-insensitive check on task name)
    if (filterValue) {
      filteredTasks = filteredTasks.filter((task) =>
        task.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // Apply status and other filters using the itemFilter callback
    filteredTasks = filteredTasks.filter(itemFilter);

    return filteredTasks;
  }, [filterValue, itemFilter]); // Dependencies: re-filter if search or status filter changes

  // Calculate the total number of pages based on filtered items and rows per page
  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1; // Ensure at least 1 page

  // Memoized list of tasks to display on the current page
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]); // Dependencies: re-slice if page or filtered items change

  // Memoized list of tasks sorted according to the sortDescriptor
  const sortedItems = useMemo(() => {
    return [...items].sort((a: Task, b: Task) => {
      const col = sortDescriptor.column as keyof Task; // Get the column key to sort by

      // Get the values to compare
      let first = a[col];
      let second = b[col];

      // Specific handling for certain column types
      if (col === "startTime" || col === "endTime") {
        // Convert dates to timestamps for comparison, handle nulls
        const dateA = first ? new Date(first).getTime() : 0;
        const dateB = second ? new Date(second).getTime() : 0;
        first = dateA as any;
        second = dateB as any;
      }
      // Add other specific sorting logic if needed (e.g., numeric IDs)
      // else if (col === 'id') { ... }

      // Perform comparison
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      // Apply sort direction
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]); // Dependencies: re-sort if descriptor or page items change

  // Memoized set of selected keys, ensuring they exist in the currently filtered view
  const filterSelectedKeys = useMemo(() => {
    if (selectedKeys === "all") return selectedKeys; // Handle "select all" case

    let resultKeys = new Set<Key>();
    // Iterate through currently filtered items
    filteredItems.forEach((item) => {
        const stringId = String(item.id);
        // If a filtered item's ID is in the selectedKeys set, add it to the result
        if ((selectedKeys as Set<string>).has(stringId)) {
          resultKeys.add(stringId);
        }
      });
    return resultKeys;
  }, [selectedKeys, filteredItems]); // Dependencies: update if selection or filtered items change


  // Refs for action buttons (can be used for focus management or complex interactions)
  const viewRef = useRef<HTMLButtonElement | null>(null);
  const retryRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  // Get button props for accessibility and event handling using useButton hook
  const { getButtonProps: getViewProps } = useButton({ ref: viewRef });
  const { getButtonProps: getRetryProps } = useButton({ ref: retryRef });
  const { getButtonProps: getCancelProps } = useButton({ ref: cancelRef });

  // Memoized callback to render individual table cells based on the column key
  const renderCell = useMemoizedCallback((task: Task, columnKey: React.Key) => {
    const taskKey = columnKey as ColumnsKey; // Cast columnKey to known keys
    const cellValue = task[taskKey as keyof Task] as any; // Get cell value

    switch (taskKey) {
      case "id":
        // Render task ID with a copy-to-clipboard utility
        return <CopyText>{cellValue}</CopyText>;
      case "name":
        // Render task name
        return (
             <p className="text-nowrap text-small font-medium text-default-foreground">{cellValue}</p>
        );
      case "startTime":
      case "endTime":
        // --- Hydration Fix Start ---
        // Render placeholder on server/before hydration, formatted date only on client
        return cellValue && isClient ? ( // Check if it's a client-side render
          <div className="flex items-center gap-1">
            <Icon // Calendar icon from @iconify/react
              className="h-[16px] w-[16px] text-default-300"
              icon="solar:calendar-minimalistic-linear"
            />
            <p className="text-nowrap text-small capitalize text-default-500">
              {/* Format date using Intl.DateTimeFormat */}
              {new Intl.DateTimeFormat("en-US", { // Use a consistent locale or derive from user prefs if needed post-hydration
                year: "numeric", month: "short", day: "numeric",
                hour: "numeric", minute: "numeric",
                // timeZone: 'UTC' // Optional: Force UTC for consistency if needed
              }).format(new Date(cellValue))}
            </p>
          </div>
        ) : (
            // Render a placeholder during SSR and initial client render
            <span className="text-small text-default-400">-</span>
        );
        // --- Hydration Fix End ---
       case "details":
         // Render task details, truncated with a tooltip for full view
         return (
             <Tooltip content={cellValue || "No details"} placement="top-start">
                <span className="cursor-default text-small text-default-500 truncate max-w-[150px] block">
                    {cellValue || "-"}
                </span>
             </Tooltip>
         );
      case "status":
        // Render the task status using the dedicated TaskStatus component
        return <TaskStatus status={cellValue as TaskStatusOptions} />;
      case "actions":
        // Render action buttons (View, Retry, Cancel/Resume)
        const isRunning = task.status === 'running';
        const isPaused = task.status === 'paused';
        const isFailed = task.status === 'error';
        const isCanceled = task.status === 'canceled';

        return (
          <div className="flex items-center justify-end gap-2">
             {/* View Details Button */}
             <Tooltip content="View Details">
               <button {...getViewProps()} className="text-default-400 cursor-pointer hover:text-primary" onClick={() => console.log("View Task:", task.id)}>
                  {/* Use the imported EyeFilledIcon component */}
                  <EyeFilledIcon height={18} width={18} />
                </button>
             </Tooltip>

             {/* Retry Button (shown for failed or canceled tasks) */}
             {(isFailed || isCanceled) && (
                 <Tooltip content="Retry Task">
                    <button {...getRetryProps()} className="text-default-400 cursor-pointer hover:text-success" onClick={() => console.log("Retry Task:", task.id)}>
                        {/* Use the imported RefreshIcon component */}
                        <RefreshIcon height={18} width={18} />
                    </button>
                 </Tooltip>
              )}

             {/* Cancel/Resume Button (shown for running or paused tasks) */}
             {(isRunning || isPaused) && (
                 <Tooltip content={isRunning ? "Cancel Task" : "Resume Task"}>
                    <button {...getCancelProps()} className="text-default-400 cursor-pointer hover:text-danger" onClick={() => console.log(isRunning ? "Cancel Task:" : "Resume Task:", task.id)}>
                        {/* Use the imported CancelIcon component */}
                        {/* TODO: Add separate Pause/Resume icons and logic if needed */}
                        <CancelIcon height={18} width={18} />
                    </button>
                </Tooltip>
              )}
          </div>
        );
      default:
        // Default rendering for any other columns
        return <span className="text-small text-default-500">{cellValue}</span>;
    }
  // Add isClient to dependency array for renderCell
  }, [isClient, getViewProps, getRetryProps, getCancelProps]);

  // Callback to navigate to the next page
  const onNextPage = useMemoizedCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  });

  // Callback to navigate to the previous page
  const onPreviousPage = useMemoizedCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  });

  // Callback to handle changes in the search input
  const onSearchChange = useMemoizedCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1); // Reset to first page on search
    } else {
      setFilterValue("");
    }
  });

  // Callback to handle changes in row selection
  const onSelectionChange = useMemoizedCallback((keys: Selection) => {
     // Update the selectedKeys state
     // Note: More complex logic might be needed if selection should persist across pages/filters differently
     setSelectedKeys(keys);
  });


  // Memoized component for the top content area (search, filters, sorting, columns)
  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-[6px] py-[4px]">
         {/* Left side: Search and Filters */}
        <div className="flex items-center gap-3">
            {/* Search Input */}
            <Input
              isClearable // Allow clearing the search input
              className="w-full sm:max-w-[44%]" // Responsive width
              placeholder="Search by task name..."
              startContent={<SearchIcon className="text-default-400" />} // Search icon
              value={filterValue}
              onClear={() => setFilterValue("")} // Clear action
              onValueChange={onSearchChange} // Handle input change
              size="sm"
            />
            {/* Filter Popover */}
            <Popover placement="bottom">
              <PopoverTrigger>
                <Button
                  variant="flat" // Use flat variant for filter button
                  className="bg-default-100 text-default-800"
                  size="sm"
                  startContent={<Icon icon="solar:tuning-2-linear" width={16} />} // Filter icon
                >
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="px-2 py-4 w-full">
                  <h4 className="text-small font-bold mb-2">Task Status</h4>
                  {/* Status Filter Radio Group */}
                  <RadioGroup
                      aria-label="Status Filter"
                      value={statusFilter}
                      onValueChange={(val) => setStatusFilter(val as TaskStatusOptions | "all")}
                      size="sm"
                    >
                    <Radio value="all">All</Radio>
                    <Radio value="running">Running</Radio>
                    <Radio value="paused">Paused</Radio>
                    <Radio value="completed">Completed</Radio>
                    <Radio value="canceled">Canceled</Radio>
                    <Radio value="error">Error</Radio>
                  </RadioGroup>
                  {/* Add other filters here (e.g., Date Range) */}
                </div>
              </PopoverContent>
            </Popover>
        </div>

         {/* Right side: Columns, Sort, Actions */}
        <div className="flex items-center gap-3">
           {/* Columns Dropdown */}
           <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  className="bg-default-100 text-default-800"
                  size="sm"
                  endContent={<Icon icon="solar:alt-arrow-down-linear" width={16} />} // Dropdown arrow
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns} // Update visible columns state
              >
                {columns
                  .filter((c) => !["actions"].includes(c.uid)) // Exclude actions column from selection
                  .map((column) => (
                    <DropdownItem key={column.uid} className="capitalize">
                      {column.name}
                    </DropdownItem>
                  ))}
              </DropdownMenu>
            </Dropdown>

            {/* Sort Dropdown */}
            <Dropdown>
              <DropdownTrigger>
                 <Button
                    variant="flat"
                    className="bg-default-100 text-default-800"
                    size="sm"
                    startContent={<Icon icon="solar:sort-linear" width={16} />} // Sort icon
                  >
                    Sort
                  </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Sort"
                items={columns.filter((c) => c.sortable && !["actions"].includes(c.uid))} // Only show sortable columns
              >
                {(item) => (
                  <DropdownItem
                    key={item.uid}
                    onPress={() => { // Update sort descriptor on press
                      setSortDescriptor((prev) => ({
                          column: item.uid,
                          direction:
                            prev.column === item.uid && prev.direction === "ascending"
                              ? "descending"
                              : "ascending", // Toggle direction if same column
                        }));
                    }}
                  >
                    {item.name}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>

            {/* Bulk Actions Dropdown (shown when items are selected) */}
            {(filterSelectedKeys !== "all" && filterSelectedKeys.size > 0) && (
              <>
                <Divider orientation="vertical" className="h-5" />
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="flat"
                      className="bg-default-100 text-default-800"
                      endContent={<Icon icon="solar:alt-arrow-down-linear" width={16} />}
                      size="sm"
                    >
                      {`${filterSelectedKeys.size} Selected Actions`}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Selected Actions"
                    onAction={(key) => console.log("Bulk Action:", key, filterSelectedKeys)} // Log bulk action attempt
                  >
                    <DropdownItem key="retry-selected">Retry Selected</DropdownItem>
                    <DropdownItem key="cancel-selected">Cancel Selected</DropdownItem>
                    <DropdownItem key="delete-logs" className="text-danger" color="danger">
                      Delete Logs
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </>
            )}
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    filterSelectedKeys,
    sortDescriptor,
    onSearchChange,
    setStatusFilter,
    setVisibleColumns,
    columns, // columns is needed for dropdown menus
  ]);

  // Memoized component for the top bar (title and total count)
  const topBar = useMemo(() => {
    return (
      <div className="mb-[18px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold leading-tight">AI Tasks</h1>
          <Chip className="hidden sm:flex" size="sm" variant="flat" color="default">
            {tasks.length} Total
          </Chip>
        </div>
         {/* Optional: Button to trigger new task creation could go here */}
         {/* <Button color="primary" endContent={<Icon icon="solar:add-circle-bold" width={20} />}> Create Task </Button> */}
      </div>
    );
  }, [tasks.length]); // Dependency: update if total tasks change

  // Memoized component for the bottom content area (pagination and selection count)
  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center gap-4 flex-wrap">
        {/* Selection Count */}
        <span className="text-small text-default-400">
          {filterSelectedKeys === "all"
            ? "All items selected"
            : `${filterSelectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        {/* Pagination Controls */}
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage} // Update page state on change
        />
         {/* Previous/Next Buttons (alternative or additional navigation) */}
         {/*
         <div className="hidden sm:flex w-[30%] justify-end gap-2">
            <Button isDisabled={page === 1} size="sm" variant="flat" onPress={onPreviousPage}>
              Previous
            </Button>
            <Button isDisabled={page === pages} size="sm" variant="flat" onPress={onNextPage}>
              Next
            </Button>
          </div>
          */}
      </div>
    );
  }, [filterSelectedKeys, page, pages, filteredItems.length, onPreviousPage, onNextPage, setPage]);

  // Main component render
  return (
    <div className="h-full w-full p-4 md:p-6"> {/* Add padding */}
      {/* Render the top bar */}
      {topBar}
      {/* Render the main table */}
      <Table
        aria-label="Table displaying AI tasks with filtering, sorting, and pagination"
        isHeaderSticky // Keep header visible on scroll
        bottomContent={bottomContent} // Attach bottom content (pagination)
        bottomContentPlacement="outside" // Place pagination outside table scroll area
        classNames={{
          wrapper: "max-h-[calc(100vh-280px)] shadow-md rounded-lg", // Control max height and add shadow/rounding
          th: "bg-default-100 text-default-600", // Style header cells
          td: "before:bg-transparent", // Style data cells
        }}
        selectedKeys={filterSelectedKeys} // Control selected rows
        selectionMode="multiple" // Allow multiple row selection
        sortDescriptor={sortDescriptor} // Control sorting state
        topContent={topContent} // Attach top content (filters, etc.)
        topContentPlacement="outside" // Place top content outside table scroll area
        onSelectionChange={onSelectionChange} // Handle selection changes
        onSortChange={setSortDescriptor} // Handle sort changes
      >
        {/* Table Header Definition */}
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "end" : "start"} // Align 'actions' column to the end
              allowsSorting={column.sortable} // Allow sorting if column is sortable
              className={cn(
                  column.uid === "actions" ? "text-right pr-[20px]" : "pl-[10px]", // Adjust padding
              )}
            >
             {/* Render column name, add tooltip if info exists */}
              {column.info ? (
                <div className="flex items-center gap-1">
                  {column.name}
                  <Tooltip content={column.info}>
                    <Icon
                      className="text-default-400"
                      height={16}
                      icon="solar:info-circle-linear"
                      width={16}
                    />
                  </Tooltip>
                </div>
              ) : (
                column.name
              )}
            </TableColumn>
          )}
        </TableHeader>
        {/* Table Body Definition */}
        <TableBody
          emptyContent={"No tasks found matching your criteria."} // Message when table is empty
          items={sortedItems} // Data items for the table body
        >
          {(item) => (
            // Render a row for each item
            <TableRow key={item.id}>
              {(columnKey) => (
                // Render a cell for each column in the row
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
