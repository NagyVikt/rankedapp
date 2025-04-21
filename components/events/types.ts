import type {SVGProps} from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// components/types.ts
export interface ComponentItem {
  href: string;
  title: string;
  count: number;
  previewHtml: string;
  code?: string;            // <-- new
  blockId?: string;         // <-- optional unique ID for GrapesJS
}
