// components/previews/divider.ts
export const dividerPreviewHtml = `
  <!-- 1) subtle grid overlay -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) inner divider panel -->
  <div
    class="relative flex flex-col items-center justify-center
           w-[40%] translate-y-3 gap-4
           bg-[#0F0F10] p-4 rounded-md shadow-sm
           transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
           group-hover:skew-x-3"
  >
    <!-- top grey bar -->
    <div class="h-3 w-2/3 rounded-sm bg-slate-600"></div>

    <!-- vibrant divider line -->
    <div
      class="h-0.5 w-full rounded-sm
             bg-[#25AEBA]
             shadow-[0px_0px_9px_4px_rgba(37,174,186,0.3)]"
    ></div>

    <!-- bottom grey bar -->
    <div class="h-3 w-2/3 rounded-sm bg-slate-600"></div>
  </div>
`;
