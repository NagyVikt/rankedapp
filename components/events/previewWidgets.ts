// components/previewWidgets.ts
// — you can rename your previewWidgets.js to .ts and export these as strings
export const galleryPreviewHtml = `
  <div class="absolute inset-0 bg-transparent
              bg-[radial-gradient(#27272A_.0313rem,transparent_.0313rem),
                       radial-gradient(#27272A_.0313rem,transparent_.0313rem)]
              opacity-80
              [background-position:0_0,.625rem_.625rem]
              [background-size:1.25rem_1.25rem]"></div>
  <div class="relative flex h-full w-full items-stretch gap-2 overflow-visible">
    <div class="flex h-max shrink grow basis-0 flex-col items-end gap-2 overflow-visible pb-2">
      <div class="aspect-square w-[30%] rounded-sm bg-[#0F0F10]
                  bg-gradient-to-b from-transparent via-black/20 to-black/20 p-2 shadow-sm">
        <div class="h-full w-full rounded-sm bg-slate-3"></div>
      </div>
      <div class="aspect-square w-[30%] rounded-sm bg-[#0F0F10]
                  bg-gradient-to-b from-transparent via-black/20 to-black/20 p-2 shadow-sm">
        <div class="flex h-full w-full items-center justify-center rounded-sm bg-slate-3
                    transition-colors group-hover:bg-slate-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               class="lucide lucide-image opacity-5 transition-opacity group-hover:opacity-20">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
          </svg>
        </div>
      </div>
      <div class="aspect-square w-[30%] rounded-sm bg-[#0F0F10]
                  bg-gradient-to-b from-transparent via-black/20 to-black/20 p-2 shadow-sm">
        <div class="h-full w-full rounded-sm bg-slate-3"></div>
      </div>
    </div>
    <div class="flex h-max shrink grow basis-0 flex-col items-start gap-2 overflow-visible pt-2">
      <div class="aspect-square w-[30%] rounded-sm bg-[#0F0F10]
                  bg-gradient-to-b from-transparent via-black/20 to-black/20 p-2 shadow-sm">
        <div class="h-full w-full rounded-sm bg-slate-3"></div>
      </div>
      <div class="aspect-square w-[30%] rounded-sm bg-[#0F0F10]
                  bg-gradient-to-b from-transparent via-black/20 to-black/20 p-2 shadow-sm">
        <div class="h-full w-full rounded-sm bg-slate-3"></div>
      </div>
      <div class="aspect-square w-[30%] rounded-sm bg-[#0F0F10]
                  bg-gradient-to-b from-transparent via-black/20 to-black/20 p-2 shadow-sm">
        <div class="h-full w-full rounded-sm bg-slate-3"></div>
      </div>
    </div>
  </div>
`;

// Add other previews here...
export const ecommercePreviewHtml = `…`;
export const articlesPreviewHtml  = `…`;
