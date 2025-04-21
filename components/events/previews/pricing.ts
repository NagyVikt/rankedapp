// components/previews/pricing.ts
export const pricingPreviewHtml = `
  <!-- 1) subtle dotted background -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) centered square card, a bit narrower -->
  <div
    class="relative flex flex-col items-center gap-2 w-[40%]
           bg-slate-800 bg-gradient-to-b from-transparent via-black/20 to-black/20
           rounded-md p-3 shadow-sm
           transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
           group-hover:-skew-x-2"
  >
    <!-- 2a) square icon placeholder -->
    <div class="aspect-square w-full rounded-sm bg-slate-700 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           class="lucide lucide-circle-dollar-sign opacity-10 transition-opacity group-hover:opacity-20"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
        <path d="M12 18V6"></path>
      </svg>
    </div>

    <!-- 2b) slimmer grey skeleton lines -->
    <div class="h-1.5 w-[70%] rounded-sm bg-slate-600"></div>
    <div class="h-1.5 w-[50%] rounded-sm bg-slate-600"></div>

    <!-- 2c) a full‑width teal bar, slightly thicker -->
    <div
      class="h-2 w-full rounded-sm bg-teal-400
             shadow-[0px_0px_9px_4px_rgba(37,174,186,0.10)]"
    ></div>
  </div>
`;
