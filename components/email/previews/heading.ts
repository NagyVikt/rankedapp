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

export const headingIconSvg = `
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

export const headingSnippetHtml = `
  <div style="padding:20px; background:#eee; text-align:center;">
    <h2>🚀 Welcome CULA!</h2>
    <p>Your HTML block.</p>
  </div>
`;

