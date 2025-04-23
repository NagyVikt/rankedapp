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
export const linkIconSvg = `
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

export const linkSnippetHtml = `
  <div style="padding:20px; background:#eee; text-align:center;">
    <h2>🚀 Welcome CULA!</h2>
    <p>Your HTML block.</p>
  </div>
`;

