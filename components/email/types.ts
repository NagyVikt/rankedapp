
import { CSSProperties } from 'react';

import Embed from 'embed/index';
import { Editor as EditorClass } from 'embed/Editor';
import { AppearanceConfig, DisplayMode, ToolsConfig } from 'state/types/types';

export type Unlayer = typeof Embed;
export type UnlayerOptions = Parameters<Unlayer['createEditor']>[0];
export type Editor = InstanceType<typeof EditorClass>;

export interface EditorRef {
  editor: Editor | null;
}

export interface EmailEditorProps {
  editorId?: string | undefined;
  minHeight?: number | string | undefined;
  onLoad?(unlayer: Editor): void;
  onReady?(unlayer: Editor): void;
  options?: UnlayerOptions | undefined;
  scriptUrl?: string | undefined;
  style?: CSSProperties | undefined;

  // redundant props -- already available in options
  /** @deprecated */
  appearance?: AppearanceConfig | undefined;
  /** @deprecated */
  displayMode?: DisplayMode;
  /** @deprecated */
  locale?: string | undefined;
  /** @deprecated */
  projectId?: number | undefined;
  /** @deprecated */
  tools?: ToolsConfig | undefined;
}

declare global {

  interface Window {
    __unlayer_lastEditorId: number;
  }
}

// types.ts
export interface ComponentItem {
  href:       string;
  blockId:    string;
  title:      string;
  count?:     number;
  previewHtml:string;           // ← New: the full HTML for the preview
  iconSvg:    string;  
  snippetHtml:string;           // ← New: the actual HTML you drop into the email
  component:  React.ReactElement;
}
