// components/previews/link.ts
export const linkPreviewHtml = `
  <!-- subtle grid overlay -->
  <div class="absolute inset-0 bg-transparent bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),radial-gradient(#27272A_.0313rem,transparent_.0313rem)] opacity-80 [background-position:0_0,.625rem_.625rem] [background-size:1.25rem_1.25rem]"></div>

  <!-- Link skeleton: 4 bars + dot -->
  <div class="relative flex flex-col items-center justify-center w-full h-full gap-2">
    <!-- 1) full-length grey bar -->
    <div class="h-2 w-[80%] rounded-sm bg-slate-7"></div>
    <!-- 2) medium grey bar -->
    <div class="h-2 w-[60%] rounded-sm bg-slate-7"></div>
    <!-- 3) teal bar -->
    <div class="h-2 w-[30%] rounded-sm bg-[#25AEBA]"></div>
    <!-- 4) bottom grey bar + teal dot -->
    <div class="relative w-[80%] flex items-center justify-between">
      <div class="h-2 w-full rounded-sm bg-slate-7"></div>
      <div class="h-2 w-2 rounded-full bg-[#25AEBA]"></div>
    </div>
  </div>
`;
