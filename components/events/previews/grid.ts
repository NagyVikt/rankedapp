// components/previews/grid.ts
export const gridPreviewHtml = `
  <!-- 1) subtle grid overlay -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) 2×2 grid of squares -->
  <div
    class="relative grid aspect-square w-[24%] grid-cols-2 grid-rows-2 gap-2 p-2
           rounded-md bg-[#0F0F10] bg-gradient-to-b from-[#131314] via-[#0F0F10] to-[#0F0F10]
           shadow-sm transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
           group-hover:skew-x-2"
  >
    <!-- top‑left -->
    <div class="h-full w-full rounded-sm bg-slate-800"></div>
    <!-- top‑right -->
    <div class="h-full w-full rounded-sm bg-slate-700"></div>
    <!-- bottom‑left -->
    <div class="h-full w-full rounded-sm bg-slate-800"></div>
    <!-- bottom‑right with teal outline + arrow -->
    <div class="relative h-full w-full rounded-sm border-2 border-[#2EBDC9]
                bg-slate-800 shadow-[0px_0px_9px_4px_rgba(37,174,186,0.10)]
                transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
                group-hover:translate-x-1 group-hover:translate-y-1 group-hover:scale-125"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-move-down-right absolute
               left-[calc(100%-.125rem)] top-[calc(100%-.125rem)]"
      >
        <path d="M19 13V19H13"></path>
        <path d="M5 5L19 19"></path>
      </svg>
    </div>
  </div>
`;
