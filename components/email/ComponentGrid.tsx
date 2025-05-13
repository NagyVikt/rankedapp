// components/ComponentGrid.tsx
import React from 'react';
import type { ComponentItem } from './types';

interface ComponentCardProps {
  item: ComponentItem;
  onSelect: (item: ComponentItem) => void;
}

function ComponentCard({ item, onSelect }: ComponentCardProps) {
  const { title, count, previewHtml, iconSvg } = item;

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(item);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Select ${title}`}
      className="group relative isolate mt-7 cursor-pointer scroll-m-6 rounded-md focus:outline-none focus:ring focus:ring-slate-2
                 before:absolute before:inset-0 before:rounded-md
                 before:border before:border-dashed before:border-slate-4
                 before:transition-colors before:duration-[720ms]
                 before:ease-[cubic-bezier(.24,.9,.32,1.4)]
                 hover:before:border-slate-6 focus:before:border-slate-6
      "
      onClick={() => onSelect(item)}
      onKeyDown={handleKeyDown}
    >
      <div
        className="overflow-hidden relative isolate flex flex-col justify-end rounded-md bg-black p-4
                   focus:ring focus:ring-slate-2
                   transition-transform duration-[240ms] ease-[cubic-bezier(.36,.66,.6,1)]
                   group-hover:-translate-x-2 group-hover:-translate-y-2
                   group-focus:-translate-x-2 group-focus:-translate-y-2"
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-md border border-slate-4
                     transition-colors duration-300 ease-[cubic-bezier(.36,.66,.6,1)]
                     group-hover:border-slate-6 group-focus:border-slate-6"
        />
        <div
          className="relative flex aspect-[2/1] items-center justify-center overflow-hidden rounded-sm text-slate-300"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>

      <h3 className="relative z-10 mt-4 font-semibold capitalize leading-7 tracking-wide text-slate-12">
        {title}
      </h3>
      <span className="relative z-10 text-xs text-slate-11">
        {count} component{count !== 1 && 's'}
      </span>

      <div
        className="pointer-events-none absolute -inset-px opacity-0 mix-blend-color-dodge transition duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(12rem at 50% 50%, rgba(37, 174, 186, 0.3), transparent 80%)',
        }}
      />
    </div>
  );
}

interface ComponentGridProps {
  items: ComponentItem[];
  onSelect: (item: ComponentItem) => void;
}

export default function ComponentGrid({ items, onSelect }: ComponentGridProps) {
  return (
    <div className="relative grid grid-cols-1 gap-x-4 px-1 pb-10 md:grid-cols-2 md:px-0 lg:grid-cols-3">
      {items.map((item) => (
        <ComponentCard key={item.blockId} item={item} onSelect={onSelect} />
      ))}
    </div>
  );
}
