// components/previews/image.ts
export const imagePreviewHtml = `
  <!-- 1) subtle grid overlay -->
  <div class="absolute inset-0 bg-transparent
              bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                   radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
              opacity-80
              [background-position:0_0,.625rem_.625rem]
              [background-size:1.25rem_1.25rem]"></div>

  <!-- 2) dark panel wrapper -->
  <div
    class="relative flex aspect-square w-1/3 items-center justify-center
           rounded-md bg-[#0F0F10] bg-gradient-to-b from-transparent via-black/20 to-black/20
           p-4 shadow-sm transition-colors duration-[240ms]
           ease-[cubic-bezier(.36,.66,.6,1)] group-hover:bg-[#171717]"
  >
    <!-- 3) faint inner fill for depth -->
    <div class="absolute inset-0 bg-black/10 rounded-md"></div>

    <!-- 4) image icon -->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         class="relative lucide lucide-image opacity-10 transition-opacity group-hover:opacity-20"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
      <circle cx="9" cy="9" r="2"></circle>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
    </svg>
  </div>
`;

export const imageIconSvg = `
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

export const imageSnippetHtml = `
  <div style="padding:20px; background:#eee; text-align:center;">
    <h2>🚀 Welcome CULA!</h2>
    <p>Your HTML block.</p>
  </div>
`;

