// components/previews/text.ts
export const textPreviewHtml = `
  <!-- 1) very subtle grid overlay (opacity only 20%) -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-20
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) 2:1 panel with padding and shadow -->
  <div
    class="relative flex aspect-[2/1] items-center justify-center overflow-hidden
           rounded-sm bg-[#0F0F10] bg-gradient-to-b from-transparent via-black/20 to-black/20
           p-4 shadow-sm
           transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
           group-hover:skew-x-2"
  >
    <!-- 3) centered bars (wider + lighter) -->
    <div class="flex flex-col items-center space-y-3">
      <!-- top bar (75% width) -->
      <div class="h-2 w-3/4 rounded-sm bg-slate-5"></div>
      <!-- bottom bar (50% width) -->
      <div class="h-2 w-1/2 rounded-sm bg-slate-5"></div>
    </div>
  </div>
`;
