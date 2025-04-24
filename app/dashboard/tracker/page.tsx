"use client";
import React from 'react';
import { Card, CardBody, CardHeader, CardFooter, Button, Spacer } from '@heroui/react';
import { Icon } from '@iconify/react';

// Example tracker entries
type TrackerEntry = {
  id: number;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  date: string;
};

const trackerEntries: TrackerEntry[] = [
  { id: 1, title: 'Design Review', status: 'Completed', date: '2025-04-15' },
  { id: 2, title: 'Sprint Planning', status: 'In Progress', date: '2025-04-20' },
  { id: 3, title: 'Bug Triage', status: 'Pending', date: '2025-04-22' },
  { id: 4, title: 'Release Deploy', status: 'Pending', date: '2025-04-25' },
];

export default function TrackerComponent() {
  return (
    <div className="space-y-6 py-8">
      {/* Header with title and add-button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-default-800">Tracker</h2>
        <Button startContent={<Icon icon="solar:plus-square-bold" width={20} />}>Add Entry</Button>
      </div>

      {/* Grid of tracker cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trackerEntries.map((entry) => (
          <Card key={entry.id} shadow="sm" className="flex flex-col p-4">
            <CardHeader className="flex justify-between items-center">
              <span className="font-semibold text-default-700">{entry.title}</span>
              <span className="text-sm text-default-500">{entry.date}</span>
            </CardHeader>

            <CardBody>
              <p className="text-sm">Status: <strong>{entry.status}</strong></p>
            </CardBody>

            <Spacer y={4} />

            <CardFooter className="flex justify-end">
              <Button size="sm" variant="light">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}