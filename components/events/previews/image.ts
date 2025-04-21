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
