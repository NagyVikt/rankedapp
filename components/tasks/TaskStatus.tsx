import React from 'react';
import { Chip, type ChipProps } from '@heroui/react';
import type { TaskStatusOptions } from './data-tasks'; // Import status options

// Define status colors using HeroUI Chip color props or Tailwind classes
const statusColorMap: Record<TaskStatusOptions, ChipProps['color']> = {
  running: 'secondary', // Or use "primary" or custom class
  paused: 'warning',
  completed: 'success',
  canceled: 'default', // Grayish
  error: 'danger',
};

const statusTextMap: Record<TaskStatusOptions, string> = {
  running: 'Running',
  paused: 'Paused',
  completed: 'Completed',
  canceled: 'Canceled',
  error: 'Error',
};

interface TaskStatusProps {
  status: TaskStatusOptions;
}

export const TaskStatus: React.FC<TaskStatusProps> = ({ status }) => {
  return (
    <Chip
      className="rounded-md border border-transparent capitalize" // Base styles
      color={statusColorMap[status]}
      size="sm"
      variant="dot" // Use dot variant for a subtle look, or "flat", "bordered"
    >
      {statusTextMap[status]}
    </Chip>
  );
};
