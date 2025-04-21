// components/previews/heading.ts
export const headingPreviewHtml = `
  <!-- the dark skeleton panel (fills the 2:1 frame) -->
  <div
    class="relative flex flex-col items-center justify-center
           w-2/5 h-full gap-3
           bg-[#0F0F10] bg-gradient-to-b from-transparent via-black/20 to-black/20
           px-4 py-6 rounded-md shadow-sm"
  >
    <!-- four high‑contrast bars -->
    <div class="h-2 w-11/12 rounded-sm bg-slate-400"></div>
    <div class="h-2 w-3/4    rounded-sm bg-slate-400"></div>
    <div class="h-2 w-2/3    rounded-sm bg-slate-400"></div>
    <div class="h-2 w-1/2    rounded-sm bg-slate-400"></div>
  </div>
`;
