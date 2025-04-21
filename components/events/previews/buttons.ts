// components/previews/buttons.ts
export const buttonsPreviewHtml = `
  <!-- 1) subtle grid overlay -->
  <div
    class="absolute inset-0 bg-transparent
           bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),_radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
           opacity-80
           [background-position:0_0,.625rem_.625rem]
           [background-size:1.25rem_1.25rem]"
  ></div>

  <!-- 2) button mockup with pointer -->
  <div
    class="relative flex h-6 w-[24%] items-center justify-center
           rounded-md border border-[#2EBDC9] bg-[#25AEBA] p-1 shadow-sm
           transition-transform duration-[240ms] ease-[cubic-bezier(.42,0,.58,1.8)]
           group-hover:rotate-3"
  >
    <!-- the “pressed” bar -->
    <div class="h-2 w-[80%] rounded-sm bg-black/30"></div>

    <!-- pointer cursor icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-mouse-pointer2 absolute -bottom-4 left-[80%]
             transition-transform duration-[240ms] ease-[cubic-bezier(.42,0,.58,1.8)]
             group-hover:-rotate-12"
    >
      <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"></path>
    </svg>
  </div>
`;
