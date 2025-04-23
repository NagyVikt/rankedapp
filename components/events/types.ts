// ./types.ts (or wherever ComponentItem is defined)
import React from 'react';

export interface ComponentItem {
  href: string;
  blockId: string; // Unique ID for the GrapesJS block
  title: string;
  count?: number;
  previewHtml: string; // HTML for the visual picker grid
  component: React.ReactElement; // The actual React Email component
}