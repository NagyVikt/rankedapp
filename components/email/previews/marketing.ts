
export const marketingPreviewHtml = `
  <!-- 1) subtle grid overlay behind the entire 2:1 region -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) the dark 2:1 panel -->
  <div
    class="relative flex aspect-video w-[42%] items-center gap-4
           rounded-md bg-slate-800 p-4 shadow-sm
           transition-transform duration-150 ease-[cubic-bezier(.42,0,.58,1.8)]
           group-hover:skew-x-2"
  >
    <!-- 3) money-icon container -->
    <div
      class="flex aspect-square w-[25%] items-center justify-center
             rounded-sm bg-slate-700"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           class="lucide lucide-circle-dollar-sign opacity-10 transition-opacity group-hover:opacity-20"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
        <path d="M12 18V6"></path>
      </svg>
    </div>

    <!-- 4) single centered teal bar -->
    <div class="flex shrink grow basis-0 justify-center">
      <div
        class="h-2 w-[40%] rounded-sm bg-teal-400
               shadow-[0px_0px_9px_4px_rgba(37,174,186,0.10)]"
      ></div>
    </div>
  </div>
`;

export const marketingIconSvg = `
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

export const marketingSnippetHtml = `
  <div style="padding:20px; background:#eee; text-align:center;">
    <h2>🚀 Welcome CULA!</h2>
    <p>Your HTML block.</p>
  </div>
`;

