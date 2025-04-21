// components/previews/ecommerce.ts
export const ecommercePreviewHtml = `
  <!-- subtle grid overlay behind the entire 2:1 region -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- inner card panel -->
  <div
    class="relative flex aspect-video w-[42%] items-center gap-4
           rounded-md bg-slate-800 p-4
           shadow-sm transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
           group-hover:skew-x-2"
  >
    <!-- money icon container -->
    <div class="flex aspect-square w-[30%] items-center justify-center rounded-sm bg-slate-700">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           class="lucide lucide-circle-dollar-sign opacity-50 transition-opacity group-hover:opacity-80"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
        <path d="M12 18V6"></path>
      </svg>
    </div>

    <!-- two grey text bars + teal bar -->
    <div class="flex shrink grow basis-0 flex-col gap-2">
      <div class="h-2 w-[84%] rounded-sm bg-slate-600"></div>
      <div class="h-2 w-[66%] rounded-sm bg-slate-600"></div>
      <div
        class="h-2 w-[40%] rounded-sm bg-teal-400
               shadow-[0px_0px_9px_4px_rgba(37,174,186,0.10)]"
      ></div>
    </div>
  </div>
`;
