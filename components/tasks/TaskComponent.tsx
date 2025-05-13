'use client';

import type { Selection } from '@heroui/react';
// Import TableSortDescriptor from @heroui/react but we'll define our own stricter one for state
import type { SortDescriptor as HerouiSortDescriptor } from '@heroui/react';
import type { ColumnsKey, TaskStatusOptions, Task } from './data-tasks'; // Import Task types
import type { Key } from '@react-types/shared';
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
} from '@heroui/react';
import { SearchIcon } from '@heroui/shared-icons';
import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@heroui/react';

import { CopyText } from './copy-text';
import { EyeFilledIcon } from './eye';
import { ArrowDownIcon } from './arrow-down'; // Not used in current snippet, but kept if needed elsewhere
import { ArrowUpIcon } from './arrow-up'; // Not used in current snippet, but kept if needed elsewhere
import { useMemoizedCallback } from './use-memoized-callback';

import { RefreshIcon } from './refresh';
import { CancelIcon } from './cancel';

import { columns, INITIAL_VISIBLE_COLUMNS, tasks } from './data-tasks';
import { TaskStatus } from './TaskStatus';

// Define a stricter SortDescriptor type for our application state
// This ensures 'column' is always a 'Key' and not 'Key | undefined'.
interface AppSortDescriptor {
  column: Key; // Must be a valid Key
  direction: 'ascending' | 'descending';
}

// Helper function to determine a robust initial sort column UID
const getRobustInitialSortColumn = (): Key => {
  // Try to find the first sortable column
  const firstSortableColumn = columns.find((col) => col.sortable);
  if (firstSortableColumn?.uid) {
    return firstSortableColumn.uid as Key;
  }
  // Fallback to the first column if no sortable one is found, or if columns might be empty
  if (columns.length > 0 && columns[0]?.uid) {
    return columns[0].uid as Key;
  }
  // Absolute fallback if columns array is empty or misconfigured
  // This should ideally not be reached if 'columns' data is always valid.
  console.warn(
    "No valid columns found for initial sort. Defaulting to 'name'. Ensure 'columns' data is correct.",
  );
  return 'name' as Key; // Or any other sensible default column UID
};

export function useRenderCell(
  isClient: boolean,
  getViewProps: () => React.ButtonHTMLAttributes<HTMLButtonElement>,
  getRetryProps: () => React.ButtonHTMLAttributes<HTMLButtonElement>,
  getCancelProps: () => React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return useCallback(
    (task: Task, columnKey: React.Key): React.ReactNode => {
      const key = columnKey as ColumnsKey;
      const rawValue: any = key !== 'actions' ? (task as any)[key] : undefined;

      switch (key) {
        case 'id':
          return <CopyText>{rawValue}</CopyText>;
        case 'name':
          return (
            <p className="text-nowrap text-small font-medium text-default-foreground">
              {rawValue}
            </p>
          );
        case 'startTime':
        case 'endTime': {
          if (rawValue && isClient) {
            const formatted = new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            }).format(new Date(rawValue));
            return (
              <div className="flex items-center gap-1">
                <Icon
                  className="h-[16px] w-[16px] text-default-300"
                  icon="solar:calendar-minimalistic-linear"
                />
                <p className="text-nowrap text-small capitalize text-default-500">
                  {formatted}
                </p>
              </div>
            );
          }
          return <span className="text-small text-default-400">-</span>;
        }
        case 'details':
          return (
            <Tooltip content={rawValue || 'No details'} placement="top-start">
              <span className="cursor-default text-small text-default-500 truncate max-w-[150px] block">
                {rawValue || '-'}
              </span>
            </Tooltip>
          );
        case 'status':
          return <TaskStatus status={rawValue as TaskStatusOptions} />;
        case 'actions': {
          const isRunning = task.status === 'running';
          const isPaused = task.status === 'paused';
          const isFailed = task.status === 'error';
          const isCanceled = task.status === 'canceled';
          return (
            <div className="flex items-center justify-end gap-2">
              <Tooltip content="View Details">
                <button
                  {...getViewProps()}
                  onClick={() => console.log('View Task:', task.id)}
                >
                  <EyeFilledIcon height={18} width={18} />
                </button>
              </Tooltip>
              {(isFailed || isCanceled) && (
                <Tooltip content="Retry Task">
                  <button
                    {...getRetryProps()}
                    onClick={() => console.log('Retry Task:', task.id)}
                  >
                    <RefreshIcon height={18} width={18} />
                  </button>
                </Tooltip>
              )}
              {(isRunning || isPaused) && (
                <Tooltip content={isRunning ? 'Cancel Task' : 'Resume Task'}>
                  <button
                    {...getCancelProps()}
                    onClick={() =>
                      console.log(
                        isRunning ? 'Cancel Task:' : 'Resume Task:',
                        task.id,
                      )
                    }
                  >
                    <CancelIcon height={18} width={18} />
                  </button>
                </Tooltip>
              )}
            </div>
          );
        }
        default:
          return (
            <span className="text-small text-default-500">
              {String(rawValue)}
            </span>
          );
      }
    },
    [isClient, getViewProps, getRetryProps, getCancelProps],
  );
}

export default function AiTaskPanel() {
  const [filterValue, setFilterValue] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // Use the robust function to get the initial sort column UID
  const initialSortColumnUid = getRobustInitialSortColumn();

  // State for table sorting descriptor, using our stricter AppSortDescriptor type
  const [sortDescriptor, setSortDescriptor] = useState<AppSortDescriptor>({
    column: initialSortColumnUid,
    direction: 'ascending',
  });

  const [statusFilter, setStatusFilter] = React.useState<
    TaskStatusOptions | 'all'
  >('all');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const headerColumns = useMemo(() => {
    return columns
      .map((col) =>
        col.uid === sortDescriptor.column
          ? { ...col, sortDirection: sortDescriptor.direction }
          : col,
      )
      .filter((col) =>
        visibleColumns === 'all'
          ? true
          : (visibleColumns as Set<Key>).has(col.uid as Key),
      );
  }, [visibleColumns, sortDescriptor]);

  const itemFilter = useCallback(
    (task: Task) => {
      let matchesStatus =
        statusFilter === 'all' || statusFilter === task.status.toLowerCase();
      return matchesStatus;
    },
    [statusFilter],
  );

  const filteredItems = useMemo(() => {
    let filteredTasks = [...tasks];
    if (filterValue) {
      filteredTasks = filteredTasks.filter((task) =>
        task.name.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    filteredTasks = filteredTasks.filter(itemFilter);
    return filteredTasks;
  }, [filterValue, itemFilter]);

  // REMOVED the duplicate/problematic useState for sortDescriptor here

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Task, b: Task) => {
      // sortDescriptor.column is now guaranteed to be Key by AppSortDescriptor type
      const col = sortDescriptor.column as keyof Task;
      let first: any = a[col];
      let second: any = b[col];

      if (col === 'startTime' || col === 'endTime') {
        first = first ? new Date(first).getTime() : 0;
        second = second ? new Date(second).getTime() : 0;
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [items, sortDescriptor.column, sortDescriptor.direction]);

  // 'hasValidSort' check is no longer strictly necessary if sortDescriptor.column is always Key,
  // but kept for logical clarity if desired, or can be removed.
  // const hasValidSort = typeof sortDescriptor.column !== 'undefined';

  const filterSelectedKeys = useMemo(() => {
    if (selectedKeys === 'all') return selectedKeys;
    let resultKeys = new Set<Key>();
    filteredItems.forEach((item) => {
      const stringId = String(item.id);
      if ((selectedKeys as Set<string>).has(stringId)) {
        resultKeys.add(stringId);
      }
    });
    return resultKeys;
  }, [selectedKeys, filteredItems]);

  const viewRef = useRef<HTMLButtonElement | null>(null);
  const retryRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const { getButtonProps: getViewProps } = useButton({ ref: viewRef });
  const { getButtonProps: getRetryProps } = useButton({ ref: retryRef });
  const { getButtonProps: getCancelProps } = useButton({ ref: cancelRef });

  const renderCell = useRenderCell(
    isClient,
    getViewProps,
    getRetryProps,
    getCancelProps,
  );

  const onNextPage = useMemoizedCallback(() => {
    if (page < pages) setPage(page + 1);
  });

  const onPreviousPage = useMemoizedCallback(() => {
    if (page > 1) setPage(page - 1);
  });

  const onSearchChange = useMemoizedCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue('');
    }
  });

  const onSelectionChange = useMemoizedCallback((keys: Selection) => {
    setSelectedKeys(keys);
  });

  // Handler for the Table's onSortChange event
  // The 'descriptor' from the Table should be the stricter type.
  // We cast it to AppSortDescriptor to satisfy our state's type.
  const handleSortChange = useCallback((descriptor: HerouiSortDescriptor) => {
    // The Table component provides a descriptor. We need to ensure its 'column' is not undefined.
    // If the 'descriptor' from HeroUI's onSortChange can have an undefined column,
    // we must handle that, though the error implies the Table *expects* column to be defined for its prop.
    if (descriptor.column !== undefined) {
      setSortDescriptor({
        column: descriptor.column,
        direction: descriptor.direction || 'ascending', // Default direction if undefined
      });
    } else {
      // Fallback if the table somehow sends an undefined column, though this contradicts the error for the prop.
      // This case should ideally not be hit if the table is consistent.
      console.warn(
        "Table's onSortChange provided a descriptor with an undefined column. Using previous column.",
      );
      setSortDescriptor((prev) => ({
        ...prev, // Keep previous column
        direction: descriptor.direction || 'ascending',
      }));
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-[6px] py-[4px]">
        <div className="flex items-center gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by task name..."
            startContent={<SearchIcon className="text-default-400" />}
            value={filterValue}
            onClear={() => setFilterValue('')}
            onValueChange={onSearchChange}
            size="sm"
          />
          <Popover placement="bottom">
            <PopoverTrigger>
              <Button
                variant="flat"
                className="bg-default-100 text-default-800"
                size="sm"
                startContent={<Icon icon="solar:tuning-2-linear" width={16} />}
              >
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="px-2 py-4 w-full">
                <h4 className="text-small font-bold mb-2">Task Status</h4>
                <RadioGroup
                  aria-label="Status Filter"
                  value={statusFilter}
                  onValueChange={(val) =>
                    setStatusFilter(val as TaskStatusOptions | 'all')
                  }
                  size="sm"
                >
                  <Radio value="all">All</Radio>
                  <Radio value="running">Running</Radio>
                  <Radio value="paused">Paused</Radio>
                  <Radio value="completed">Completed</Radio>
                  <Radio value="canceled">Canceled</Radio>
                  <Radio value="error">Error</Radio>
                </RadioGroup>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-3">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                className="bg-default-100 text-default-800"
                size="sm"
                endContent={
                  <Icon icon="solar:alt-arrow-down-linear" width={16} />
                }
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
              onSelectionChange={setVisibleColumns}
            >
              {columns
                .filter((c) => !['actions'].includes(c.uid))
                .map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                className="bg-default-100 text-default-800"
                size="sm"
                startContent={<Icon icon="solar:sort-linear" width={16} />}
              >
                Sort
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Sort"
              items={columns.filter(
                (c) => c.sortable && !['actions'].includes(c.uid),
              )}
            >
              {(item) => (
                <DropdownItem
                  key={item.uid}
                  onPress={() => {
                    // When a new sort column is chosen, use it.
                    // If the same column is chosen, toggle direction.
                    handleSortChange({
                      column: item.uid as Key, // item.uid is Key
                      direction:
                        sortDescriptor.column === item.uid &&
                        sortDescriptor.direction === 'ascending'
                          ? 'descending'
                          : 'ascending',
                    });
                  }}
                >
                  {item.name}
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
          {filterSelectedKeys !== 'all' && filterSelectedKeys.size > 0 && (
            <>
              <Divider orientation="vertical" className="h-5" />
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    className="bg-default-100 text-default-800"
                    endContent={
                      <Icon icon="solar:alt-arrow-down-linear" width={16} />
                    }
                    size="sm"
                  >
                    {`${filterSelectedKeys.size} Selected Actions`}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Selected Actions"
                  onAction={(key) =>
                    console.log('Bulk Action:', key, filterSelectedKeys)
                  }
                >
                  <DropdownItem key="retry-selected">
                    Retry Selected
                  </DropdownItem>
                  <DropdownItem key="cancel-selected">
                    Cancel Selected
                  </DropdownItem>
                  <DropdownItem
                    key="delete-logs"
                    className="text-danger"
                    color="danger"
                  >
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
    handleSortChange /* columns is stable */,
  ]);

  const topBar = useMemo(
    () => {
      return (
        <div className="mb-[18px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold leading-tight">AI Tasks</h1>
            <Chip
              className="hidden sm:flex"
              size="sm"
              variant="flat"
              color="default"
            >
              {tasks.length} Total
            </Chip>
          </div>
        </div>
      );
    },
    [
      /* tasks.length */
    ],
  ); // tasks.length can be removed if tasks is static

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center gap-4 flex-wrap">
        <span className="text-small text-default-400">
          {filterSelectedKeys === 'all'
            ? 'All items selected'
            : `${filterSelectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
      </div>
    );
  }, [filterSelectedKeys, page, pages, filteredItems.length, setPage]);

  return (
    <div className="h-full w-full p-4 md:p-6">
      {topBar}
      <Table
        aria-label="AI tasks table"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: 'max-h-[calc(100vh-280px)] shadow-md rounded-lg',
          th: 'bg-default-100 text-default-600',
          td: 'before:bg-transparent',
        }}
        selectedKeys={filterSelectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor} // Pass the state which is AppSortDescriptor
        onSortChange={handleSortChange} // Use the new handler
        topContentPlacement="outside"
        // topContent={topContent} // This was missing, re-added
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'end' : 'start'}
              allowsSorting={column.sortable}
              className={cn(
                column.uid === 'actions' ? 'text-right pr-[20px]' : 'pl-[10px]',
              )}
            >
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
        <TableBody
          emptyContent="No tasks found matching your criteria."
          items={sortedItems}
        >
          {(task) => (
            <TableRow key={task.id}>
              {(columnKey) => (
                <TableCell>{renderCell(task, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
