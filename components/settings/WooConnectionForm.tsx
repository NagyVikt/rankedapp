// components/settings/WooConnectionForm.tsx
'use client';

import React from 'react';
import { Input, Button } from '@heroui/react';

import type { Shop } from '@/lib/shops';

interface Props {
  shops: Shop[];
  ck: string;
  cs: string;
  sel: string;
  onCkChange: (v: string) => void;
  onCsChange: (v: string) => void;
  onSelChange: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function WooConnectionForm({
  shops,
  ck,
  cs,
  sel,
  onCkChange,
  onCsChange,
  onSelChange,
  onCancel,
  onSave,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-small font-medium mb-1">
            Consumer Key
          </label>
          <Input
            value={ck}
            onChange={(e) => onCkChange(e.target.value)}
            placeholder="ck_xxxxx"
          />
        </div>
        <div>
          <label className="block text-small font-medium mb-1">
            Consumer Secret
          </label>
          <Input
            value={cs}
            onChange={(e) => onCsChange(e.target.value)}
            placeholder="cs_xxxxx"
          />
        </div>
      </div>
      <div>
        <label className="block text-small font-medium mb-1">
          Select Webshop
        </label>
        <select
          className="block w-full border border-gray-300 rounded p-2"
          value={sel}
          onChange={(e) => onSelChange(e.target.value)}
        >
          <option value="">— choose —</option>
          {shops.map((s) => (
            <option key={s.url} value={s.url}>
              {s.name} ({s.url})
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="light" color="default" onPress={onCancel}>
          Cancel
        </Button>
        <Button onPress={onSave} disabled={!ck.trim() || !cs.trim() || !sel}>
          Save Connection
        </Button>
      </div>
    </div>
  );
}
