// components/previews/headers.ts
export const headersPreviewHtml = `
  <!-- 1) subtle grid overlay -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) pill‑shaped header bar with dot, text bars, and end highlight -->
  <div
    class="relative flex w-[60%] items-center justify-center gap-2
           rounded-full bg-[#0F0F10] bg-gradient-to-b from-transparent via-black/20 to-black/20
           py-1 pl-2 pr-3 shadow-sm
           transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
           group-hover:skew-x-12"
  >
    <!-- a) teal dot -->
    <div class="flex shrink grow basis-0">
      <div
        class="h-3 w-3 rounded-full border border-[#2EBDC9]
               bg-[#25AEBA]
               shadow-[0px_0px_9px_4px_rgba(37,174,186,0.10)]
               transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
               group-hover:-translate-y-[.125rem]
               group-hover:translate-x-1
               group-hover:scale-x-125"
      ></div>
    </div>

    <!-- b) small text bars -->
    <div
      class="h-2 w-[10%] rounded-sm bg-slate-5
             transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
             group-hover:-translate-y-[.125rem]"
    ></div>
    <div
      class="h-2 w-[10%] rounded-sm bg-slate-5
             transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
             group-hover:-translate-y-[.125rem] group-hover:skew-x-1 group-hover:scale-105"
    ></div>
    <div
      class="h-2 w-[10%] rounded-sm bg-slate-5
             transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
             group-hover:-translate-y-[.125rem]"
    ></div>

    <!-- c) teal highlight at the right -->
    <div
      class="h-2 w-[10%] rounded-sm border border-[#2EBDC9]
             bg-[#25AEBA]
             shadow-[0px_0px_9px_4px_rgba(37,174,186,0.10)]"
    ></div>
  </div>
`;
