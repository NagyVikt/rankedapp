// components/previews/footers.ts
export const footersPreviewHtml = `
  <!-- 1) subtle grid overlay -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) Inner footer panel (70% width, centered) -->
  <div
    class="relative flex aspect-video w-[70%] translate-y-6
           items-center justify-center overflow-hidden
           rounded-md bg-[#0F0F10] p-4 shadow-sm"
  >
    <div class="flex w-full items-start gap-6">
      <!-- Left column: dot + two grey lines -->
      <div class="flex flex-col items-start gap-2">
        <div
          class="h-3 w-3 rounded-full
                 bg-[#25AEBA]
                 shadow-[0px_0px_8px_3px_rgba(37,174,186,0.2)]"
        ></div>
        <div class="h-2 w-[60%] rounded-sm bg-slate-600"></div>
        <div class="h-2 w-[40%] rounded-sm bg-slate-600"></div>
      </div>

      <!-- Right column: teal header bar + two grey lines -->
      <div class="flex flex-col items-start gap-2 flex-1">
        <div
          class="h-3 w-[30%] rounded-sm
                 bg-[#25AEBA]
                 shadow-[0px_0px_8px_3px_rgba(37,174,186,0.2)]"
        ></div>
        <div class="h-2 w-[80%] rounded-sm bg-slate-600"></div>
        <div class="h-2 w-[60%] rounded-sm bg-slate-600"></div>
      </div>
    </div>
  </div>
`;
