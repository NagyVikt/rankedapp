'use client';

import React, { useMemo } from 'react';

export function PaginationControls({
  page,
  totalPages,
  onChange,
  windowSize = 2,
}: {
  page: number;
  totalPages: number;
  onChange: (n: number) => void;
  windowSize?: number;
}) {
  const pages = useMemo(() => {
    let start = Math.max(1, page - windowSize);
    let end = Math.min(totalPages, page + windowSize);

    // if you’re near the edges, expand the window
    if (page <= windowSize + 1) {
      start = 1;
      end = Math.min(totalPages, 1 + 2 * windowSize);
    }
    if (page + windowSize >= totalPages) {
      start = Math.max(1, totalPages - 2 * windowSize);
      end = totalPages;
    }

    const arr: number[] = [];
    for (let p = start; p <= end; p++) arr.push(p);
    return arr;
  }, [page, totalPages, windowSize]);

  return (
    <div className="flex items-center space-x-2 py-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        ← Prev
      </button>

      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onChange(1)}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            1
          </button>
          {pages[0] > 2 && <span className="px-2">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={
            p === page
              ? 'px-3 py-1 border rounded bg-blue-600 text-white'
              : 'px-3 py-1 border rounded text-blue-600 hover:bg-gray-100'
          }
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-2">…</span>
          )}
          <button
            onClick={() => onChange(totalPages)}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next →
      </button>
    </div>
  );
}
