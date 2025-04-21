export const articlesPreviewHtml = `
  <!-- 1) Subtle grid overlay -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) Inner card panel -->
  <div
    class="relative flex aspect-square w-[45%] translate-y-3 flex-col items-center gap-2
           rounded-md bg-[#0F0F10]
           bg-gradient-to-b from-transparent via-black/20 to-black/10
           px-4 pb-4 pt-3 shadow-sm
           transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
           group-hover:skew-x-2"
  >
    <!-- a) Screen mockup -->
    <div class="aspect-video w-full rounded-sm bg-slate-700 mb-3"></div>

    <!-- b) Two grey text bars -->
    <div class="h-3 w-[66%] rounded-sm bg-slate-600 mb-1"></div>
    <div class="h-3 w-[50%] rounded-sm bg-slate-600 mb-3"></div>

    <!-- c) Teal CTA bar -->
    <div
      class="h-3 w-[24%] rounded-sm border border-[#2EBDC9]
             bg-[#25AEBA]
             shadow-[0px_0px_15px_5px_rgba(37,174,186,0.30)]"
    ></div>
  </div>
`;
