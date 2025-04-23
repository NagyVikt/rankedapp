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

export const footersIconSvg = `
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

export const footersSnippetHtml = `
  <div style="padding:20px; background:#eee; text-align:center;">
    <h2>🚀 Welcome CULA!</h2>
    <p>Your HTML block.</p>
  </div>
`;

