// components/previews/features.ts
export const featuresPreviewHtml = `
  <!-- 1) subtle grid overlay -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) left “back” card -->
  <div
    class="absolute left-[30%] top-[30%] aspect-video w-[30%]
           -translate-x-1/2 -rotate-6
           rounded-md bg-[#0d0d0d]
           transition-all duration-300 ease-[cubic-bezier(.36,.66,.6,1)]
           group-hover:rotate-0 group-hover:bg-[#0F0F10]"
  ></div>

  <!-- 3) right “back” card -->
  <div
    class="absolute left-[70%] top-[30%] aspect-video w-[30%]
           -translate-x-1/2 rotate-6
           rounded-md bg-[#0d0d0d]
           transition-all duration-300 ease-[cubic-bezier(.36,.66,.6,1)]
           group-hover:rotate-0 group-hover:bg-[#0F0F10]"
  ></div>

  <!-- 4) front panel -->
  <div
    class="relative flex flex-col items-center gap-2 w-[42%]
           bg-[#0F0F10] bg-gradient-to-b from-transparent via-black/20 to-black/20
           px-2 pt-2 pb-3 rounded-md shadow-sm
           transition-transform duration-300 ease-[cubic-bezier(.36,.66,.6,1)]
           group-hover:-skew-x-2"
  >
    <!-- a) teal dot -->
    <div
      class="h-3 w-3 rounded-full border border-[#2EBDC9]
             bg-[#25AEBA]
             shadow-[0px_0px_9px_4px_rgba(37,174,186,0.10)]"
    ></div>

    <!-- b) two grey bars -->
    <div class="mt-1 h-2 w-2/3 rounded-sm bg-slate-600"></div>
    <div class="h-2 w-1/2 rounded-sm bg-slate-600"></div>

    <!-- c) glowing teal footer bar -->
    <div
      class="mt-1 h-3 w-1/3 rounded-sm border border-[#2EBDC9]
             bg-[#25AEBA]
             shadow-[0px_0px_9px_4px_rgba(37,174,186,0.10)]"
    ></div>
  </div>
`;
