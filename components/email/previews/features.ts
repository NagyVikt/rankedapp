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
export const featuresIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32" viewBox="0 0 64 32">
  <defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.25"/>
  </filter></defs>
  <rect x="12" y="8"  width="40" height="16" rx="8" fill="#25AEBA" filter="url(#shadow)"/>
  <rect x="16" y="14" width="32" height="4"  rx="2" fill="rgba(0,0,0,0.3)"/>
  <g transform="translate(38 12) scale(1.3) rotate(-20)" filter="url(#shadow)">
    <path d="M4.037 4.688 a.495.495 0 0 1 .651-.651 l16 6.5 a.5.5 0 0 1-.063.947 l-6.124 1.58 a2 2 0 0 0-1.438 1.435 l-1.579 6.126 a.5.5 0 0 1-.947.063 z" fill="#fff"/>
  </g>
</svg>
`;

export const featuresSnippetHtml = `
  <div style="padding:20px; background:#eee; text-align:center;">
    <h2>🚀 Welcome CULA!</h2>
    <p>Your HTML block.</p>
  </div>
`;

