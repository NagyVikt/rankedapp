// components/ComponentGrid.tsx
import React from "react";
import Link from "next/link";

import type { ComponentItem } from "./types";
export function ComponentCard({ href, title, count, previewHtml }: ComponentItem) {
  return (
    <Link
      href={href}
      tabIndex={0}
      className="group relative isolate mt-7 cursor-pointer scroll-m-6 rounded-md focus:outline-none focus:ring focus:ring-slate-2
                 md:before:absolute md:before:inset-0 md:before:rounded-md
                 md:before:border md:before:border-dashed md:before:border-slate-4
                 md:before:transition-colors md:before:duration-[720ms]
                 md:before:ease-[cubic-bezier(.24,.9,.32,1.4)]
                 md:hover:before:border-slate-6 md:focus:before:border-slate-6"
    >
      <div className="overflow-hidden relative isolate flex flex-col justify-end rounded-md bg-black p-4
                      group-focus:ring group-focus:ring-slate-2
                      md:transition-transform md:duration-[240ms] md:ease-[cubic-bezier(.36,.66,.6,1)]
                      md:group-hover:-translate-x-2 md:group-hover:-translate-y-2
                      md:group-focus:-translate-x-2 md:group-focus:-translate-y-2"
      >
        <div className="pointer-events-none absolute inset-0 rounded-md border border-slate-4
                        transition-colors duration-300 ease-[cubic-bezier(.36,.66,.6,1)]
                        group-hover:border-slate-6 group-focus:border-slate-6" />

        <div
          className="relative flex aspect-[2/1] items-center justify-center overflow-hidden rounded-sm text-slate-300"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>

      <h3 className="relative z-10 mt-4 font-semibold capitalize leading-7 tracking-wide text-slate-12">
        {title}
      </h3>
      <span className="relative z-10 text-xs text-slate-11">
        {count} component{count !== 1 && "s"}
      </span>

      <div
        className="pointer-events-none absolute -inset-px opacity-0 mix-blend-color-dodge transition duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(12rem at 50% 50%, rgba(37, 174, 186, 0.3), transparent 80%)",
        }}
      />
    </Link>
  );
}



export default function ComponentGrid({ items }: { items: ComponentItem[] }) {
  return (
    <div className="relative grid grid-cols-1 gap-x-4 px-1 pb-10 md:grid-cols-2 md:px-0 lg:grid-cols-3">
      <div className="absolute left-1/2 top-0 h-px w-[100dvw] -translate-x-1/2 border-t border-slate-4" />
      <div className="absolute bottom-0 left-1/2 h-px w-[100dvw] -translate-x-1/2 border-b border-slate-4" />

      {items.map((it) => (
        <ComponentCard key={it.title} {...it} />
      ))}
    </div>
  );
}
