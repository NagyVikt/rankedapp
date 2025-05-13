"use client"
import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import satori from 'satori';
import { LiveProvider as LiveProviderOrig, LiveContext, withLive } from 'react-live';
import { createPortal } from 'react-dom';
import Editor, { useMonaco } from '@monaco-editor/react';
import toast, { Toaster as ToasterOrig } from 'react-hot-toast';
import copy from 'copy-to-clipboard';
import * as fflate from 'fflate';
import { Base64 } from 'js-base64';
import PDFDocument from 'pdfkit/js/pdfkit.standalone';
import SVGtoPDF from 'svg-to-pdfkit';
import blobStream from 'blob-stream';
import { createIntlSegmenterPolyfill } from 'intl-segmenter-polyfill';
import { Panel as PanelOrig, PanelGroup as PanelGroupOrig, PanelResizeHandle as PanelResizeHandleOrig, type ImperativePanelHandle } from 'react-resizable-panels'; // Added ImperativePanelHandle type
import { motion, AnimatePresence } from 'framer-motion';

// --- Icon Imports ---
import { Settings, Share2, RotateCcw, Download, Settings2, X } from 'lucide-react';

// --- Utilities and data imports ---
import { loadEmoji, getIconCode, apis } from '@/utils/twemoji';
import IntroductionOrig from '@/components/introduction';
import { languageFontMap } from '@/utils/font';
import playgroundTabs, { Tabs as PlaygroundTabsType } from '@/cards/playground-data';
import previewTabs from '@/cards/preview-tabs';

// Cast third-party components
const LiveProvider: React.FC<any> = LiveProviderOrig as any;
const Toaster: React.FC<any> = ToasterOrig as any;
const Panel: React.FC<any> = PanelOrig as any;
const PanelGroup: React.FC<any> = PanelGroupOrig as any;
const PanelResizeHandle: React.FC<any> = PanelResizeHandleOrig as any;

// Ensure card data is correctly typed and initialized
const cardNames = Object.keys(playgroundTabs);
const editedCards: PlaygroundTabsType = playgroundTabs ? { ...playgroundTabs } : {};

const fontData: (ArrayBuffer | null)[] = [null, null, null];
let segmenterPolyfill: typeof Intl.Segmenter | null = null;
let hasFontError = false;

async function init(): Promise<Array<{ name: string; data: ArrayBuffer; weight: number; style: string }>> {
  const fontPaths = [
    '/inter-latin-ext-400-normal.woff',
    '/inter-latin-ext-700-normal.woff',
    '/material-icons-base-400-normal.woff',
  ];

  if (typeof window === 'undefined') return [];

  try {
    const results = await Promise.allSettled([
      // Load each font as an ArrayBuffer
      fetch(fontPaths[0]).then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error(`Fetch failed: ${fontPaths[0]} (${r.status})`))),
      fetch(fontPaths[1]).then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error(`Fetch failed: ${fontPaths[1]} (${r.status})`))),
      fetch(fontPaths[2]).then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error(`Fetch failed: ${fontPaths[2]} (${r.status})`))),
      // Load Intl.Segmenter polyfill only if missing
      (!globalThis.Intl || !globalThis.Intl.Segmenter)
        ? createIntlSegmenterPolyfill(fetch(new URL('intl-segmenter-polyfill/dist/break_iterator.wasm', import.meta.url)))
        : Promise.resolve<typeof Intl.Segmenter | null>(null),
    ]);

    // Distribute results into fontData[] and segmenterPolyfill
    results.forEach((res, idx) => {
      if (idx < 3) {
        if (res.status === 'fulfilled') {
          fontData[idx] = res.value as ArrayBuffer;
        } else {
          console.error("Font load error:", res.reason);
          hasFontError = true;
        }
      } else {
        if (res.status === 'fulfilled' && res.value !== null) {
          // Patch the returned constructor so it has supportedLocalesOf
          const Poly = res.value as any;
          // Copy the static method from native Intl.Segmenter
          Poly.supportedLocalesOf = Intl.Segmenter.supportedLocalesOf;
          segmenterPolyfill = Poly as typeof Intl.Segmenter;
        } else if (res.status === 'rejected') {
          console.error("Segmenter polyfill error:", res.reason);
        }
      }
    });

    // If we got a polyfill, install it globally
    if (segmenterPolyfill) {
      globalThis.Intl = globalThis.Intl || {};
      // now matches the TS type of Intl.Segmenter
      // @ts-expect-error
      globalThis.Intl.Segmenter = segmenterPolyfill;
    }

    // Persist resources for debugging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__resource = [fontData[0], fontData[1], fontData[2], segmenterPolyfill];

    // Build the array of fonts for e.g. Satori
    const fonts: Array<{ name: string; data: ArrayBuffer; weight: number; style: string }> = [];
    if (fontData[0]) fonts.push({ name: 'Inter', data: fontData[0]!, weight: 400, style: 'normal' });
    if (fontData[1]) fonts.push({ name: 'Inter', data: fontData[1]!, weight: 700, style: 'normal' });
    if (fontData[2]) fonts.push({ name: 'Material Icons', data: fontData[2]!, weight: 400, style: 'normal' });

    if (hasFontError) {
      toast.error("Some base fonts failed to load.", { duration: 4000 });
    }

    return fonts;
  } catch (err: any) {
    console.error("Error initializing resources:", err);
    toast.error(`Initialization failed: ${err.message}`);
    return [];
  }
}

// --- withCache (No AbortSignal) ---
function withCache(fn: Function) {
  const cache = new Map()
  return async (...args: string[]) => {
    const key = args.join(':')
    if (cache.has(key)) return cache.get(key)
    try { const result = await fn(...args); cache.set(key, result); return result }
    catch (error) { console.error("Caching function error:", error); throw error; }
  }
}

// --- loadDynamicAsset (No AbortSignal) ---
type LanguageCode = keyof typeof languageFontMap | 'emoji'
const loadDynamicAsset = withCache(
  async (emojiType: keyof typeof apis, _code: string, text: string): Promise<any[] | string | undefined> => {
    if (_code === 'emoji') {
      try {
        const svgData: string = await loadEmoji(emojiType, getIconCode(text));
        return `data:image/svg+xml;base64,${typeof window !== 'undefined' ? window.btoa(svgData) : Buffer.from(svgData).toString('base64')}`;
      } catch (error) {
        console.error(`Failed to load emoji (${emojiType}, ${text}):`, error);
        return undefined;
      }
    }
    const codes = _code.split('|');
    const names = codes.map((code) => languageFontMap[code as keyof typeof languageFontMap]).filter(Boolean).flat();
    if (names.length === 0) return [];
    const params = new URLSearchParams();
    names.forEach(name => params.append('fonts', name));
    params.set('text', text);
    try {
      const response = await fetch(`/api/satori/font?${params.toString()}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.arrayBuffer();
      const fonts: any[] = [];
      const decodeFontInfoFromArrayBuffer = (buffer: ArrayBuffer) => {
        let offset = 0;
        const bufferView = new DataView(buffer);
        while (offset < buffer.byteLength) {
          if (offset + 1 > buffer.byteLength) break;
          const languageCodeLength = bufferView.getUint8(offset);
          offset += 1;
          if (offset + languageCodeLength > buffer.byteLength) break;
          const languageCodeBytes = new Uint8Array(buffer, offset, languageCodeLength);
          const languageCode = new TextDecoder().decode(languageCodeBytes);
          offset += languageCodeLength;
          if (offset + 4 > buffer.byteLength) break;
          const fontDataLength = bufferView.getUint32(offset, false);
          offset += 4;
          if (offset + fontDataLength > buffer.byteLength) break;
          const fontData = buffer.slice(offset, offset + fontDataLength);
          offset += fontDataLength;
          fonts.push({
            name: `satori_${languageCode}_fallback_${text}`,
            data: fontData,
            weight: 400,
            style: 'normal',
            lang: languageCode === 'unknown' ? undefined : languageCode
          });
        }
      };
      decodeFontInfoFromArrayBuffer(data);
      return fonts
    } catch (e) {
      console.error(`Failed to load dynamic font for "${text}" (codes: ${codes.join(', ')}). Error:`, e);
      return [];
    }
  }
)

// --- Spinner SVG ---
const spinner = (
  <svg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' className="animate-spin text-blue-600">
    <path fill="currentColor" d='M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z' />
  </svg>
);

// --- Resvg Worker Initialization ---
function initResvgWorker(): ((msg: object) => Promise<string>) | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const worker = new Worker(new URL('@/components/resvg_worker.ts', import.meta.url), { type: 'module' });
    const pending = new Map<number, { resolve: (value: string) => void; reject: (reason?: any) => void }>();
    worker.onmessage = (e: MessageEvent) => {
      const { _id, url, error } = e.data;
      const cb = pending.get(_id);
      if (cb) {
        if (error) cb.reject(new Error(error));
        else cb.resolve(url);
        pending.delete(_id);
      }
    };
    worker.onerror = (e: ErrorEvent) => {
      console.error("Error in ResvgWorker:", e.message, e);
      pending.forEach(p => p.reject(new Error("Worker error: " + e.message)));
      pending.clear();
    };
    return async (msg: object): Promise<string> => {
      const _id = Math.random();
      return new Promise((resolve, reject) => {
        pending.set(_id, { resolve, reject });
        worker.postMessage({ ...msg, _id });
      });
    };
  } catch (error) {
    console.error("Failed to initialize ResvgWorker:", error);
    if (typeof window !== 'undefined') toast.error("PNG/PDF rendering might be unavailable.");
    return undefined;
  }
}

const loadFonts = init();
const renderPNG = initResvgWorker();


// --- Styled Tabs Component ---
interface ITabsProps {
  options: string[];
  activeTab: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string; // Added className for flexible styling
}
function StyledTabs({ options, activeTab, onChange, children, className }: ITabsProps) {
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {options.map((option) => (
          <button
            key={option}
            title={option}
            onClick={() => onChange(option)}
            role="tab"
            aria-selected={activeTab === option}
            className={`px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-150 ${
              activeTab === option
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {/* Content Area */}
      <div className="flex-grow overflow-auto">
        {children}
      </div>
    </div>
  );
}

// --- LiveEditor Component ---
function LiveEditor({ id, code, onCodeChange }: { id: string, code: string, onCodeChange: (newCode: string) => void }) {
  const { onChange: liveOnChange } = useContext(LiveContext) as any;
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    if (monaco) {
      try {
        monaco.editor.defineTheme('IDLE-Light', { 
          base: 'vs', inherit: true,
          rules: [{ token: 'comment', foreground: '6A737D' }, { token: 'keyword', foreground: 'D73A49' }, { token: 'string', foreground: '032F62' }],
          colors: { 'editor.background': '#FFFFFF', 'editor.foreground': '#24292E', 'editorCursor.foreground': '#044289', 'editor.lineHighlightBackground': '#F6F8FA' },
        });
        monaco.editor.defineTheme('IDLE-Dark', { 
          base: 'vs-dark', inherit: true,
          rules: [{ token: 'comment', foreground: '6A737D' }, { token: 'keyword', foreground: 'F97583' }, { token: 'string', foreground: '9ECBFF' }],
          colors: { 'editor.background': '#1F2428', 'editor.foreground': '#E1E4E8', 'editorCursor.foreground': '#58A6FF', 'editor.lineHighlightBackground': '#2B3036' },
        });
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        monaco.editor.setTheme(prefersDark ? 'IDLE-Dark' : 'IDLE-Light');
      } catch (error: any) {
        if (!error.message?.includes("already defined")) {
          console.error("Monaco theme error:", error);
          if (typeof window !== 'undefined') toast.error("Failed to set editor theme.");
        }
      }
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (event: MediaQueryListEvent) => monaco.editor.setTheme(event.matches ? "IDLE-Dark" : "IDLE-Light");
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [monaco]);

  useEffect(() => { 
    const currentEditor = editorRef.current;
    const currentContainer = containerRef.current;
    let resizeObserver: ResizeObserver | null = null;
    if (currentContainer && currentEditor) {
      const relayout = () => {
        const d = currentContainer.getBoundingClientRect();
        if (d.width > 0 && d.height > 0) currentEditor.layout({ width: d.width, height: d.height });
      };
      resizeObserver = new ResizeObserver(relayout);
      resizeObserver.observe(currentContainer);
      relayout(); // Initial layout
      return () => {
        if (resizeObserver && currentContainer) resizeObserver.unobserve(currentContainer);
        resizeObserver = null; // Help GC
      };
    }
    return undefined;
  }, []); // No dependencies, runs once on mount

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value ?? '';
    onCodeChange(newCode);
    if (liveOnChange) liveOnChange(newCode);
  };
  const handleEditorDidMount = (editor: any, _monacoInstance: any) => {
    editorRef.current = editor;
    if (containerRef.current) { // Ensure container is available
      const d = containerRef.current.getBoundingClientRect();
      if (d.width > 0 && d.height > 0) editor.layout({ width: d.width, height: d.height });
    }
  };

  return (
    <div ref={containerRef} className="h-full overflow-hidden relative bg-white dark:bg-gray-900">
      <Editor
        language='javascript' value={code} onChange={handleEditorChange} onMount={handleEditorDidMount}
        options={{
          fontFamily: '"Fira Code", Consolas, "Courier New", monospace', fontSize: 13, wordWrap: 'on', tabSize: 2, minimap: { enabled: false }, smoothScrolling: true, cursorSmoothCaretAnimation: 'on', contextmenu: true,
          automaticLayout: false, scrollBeyondLastLine: false, renderLineHighlight: 'gutter', readOnly: false, lineNumbers: 'on', roundedSelection: false, overviewRulerLanes: 2, occurrencesHighlight: false, renderWhitespace: "boundary", scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8, vertical: 'auto', horizontal: 'auto' },
        }}
      />
    </div>
  );
}


// --- LiveSatori Preview Component ---
const LiveSatori = withLive(function LiveSatoriInner({
  live, width, height, debug, fontEmbed, emojiType, renderType, onOptionsChange, backgroundColor
}: {
  live?: { element?: React.ComponentType<any>; error?: string };
  width: number; height: number; debug: boolean; fontEmbed: boolean;
  emojiType: string; renderType: string;
  onOptionsChange: (options: any) => void;
  backgroundColor?: string;
}) {

  const [satoriOptions, setSatoriOptions] = useState<{ fonts: any[] } | null>(null);
  const [objectURL, setObjectURL] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [loadingResources, setLoadingResources] = useState(true);
  const [renderedTimeSpent, setRenderTime] = useState<number>(0);
  const [resultSVG, setResultSVG] = useState('');
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [scaleRatio, setScaleRatio] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null); // Keep if needed for specific iframe interactions
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoadingResources(true);
    setRenderError(null); // Reset error on new load
    loadFonts.then(fonts => {
      if (isMounted) {
        if (fonts?.length > 0) setSatoriOptions({ fonts });
        else {
          console.warn("Initial fonts not loaded.");
          setSatoriOptions({ fonts: [] }); // Ensure satoriOptions is not null
        }
      }
    })
    .catch(error => {
      if (isMounted) {
        console.error("Failed to resolve fonts promise:", error);
        setRenderError("Error loading initial font data.");
        setSatoriOptions({ fonts: [] }); // Ensure satoriOptions is not null
      }
    })
    .finally(() => {
      if (isMounted) setLoadingResources(false);
    });
    return () => { isMounted = false; };
  }, []);

  const updateScaleRatio = useCallback(() => {
    if (!previewContainerRef.current || width <= 0 || height <= 0) {
      setScaleRatio(1); return;
    }
    const container = previewContainerRef.current;
    const paddingX = parseFloat(getComputedStyle(container).paddingLeft) + parseFloat(getComputedStyle(container).paddingRight);
    const paddingY = parseFloat(getComputedStyle(container).paddingTop) + parseFloat(getComputedStyle(container).paddingBottom);
    const availableWidth = container.clientWidth - paddingX;
    const availableHeight = container.clientHeight - paddingY;
    if (availableWidth <= 0 || availableHeight <= 0) { setScaleRatio(1); return; }
    const scale = Math.min(availableWidth/width, availableHeight/height)
    setScaleRatio(scale);
  }, [width, height]);

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(updateScaleRatio);
    observer.observe(container);
    updateScaleRatio(); // Initial scale
    return () => observer.disconnect();
  }, [updateScaleRatio]);


  useEffect(() => {
    let cancelled = false;
    let currentObjectURLRef: string | null = null;

    const performRender = async () => {
      if (!live?.element || satoriOptions === null) {
        if (!cancelled) {
          setResultSVG(''); setRenderError(null);
          setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; });
          currentObjectURLRef = null;
        }
        return;
      }
      if (renderType === 'png') { // Slight delay for PNG if needed for resource loading race conditions
        await new Promise(resolve => setTimeout(resolve, 50));
        if (cancelled) return;
      }

      const startTime = performance.now();
      if (!cancelled) setRenderError(null);
      let currentResultSVG = '';
      let elementInputForSatori: React.ReactElement | null = null;

      try {
        if (renderType === 'html') {
          if (!cancelled) {
            setResultSVG('');
            setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; });
            currentObjectURLRef = null;
            const endTime = performance.now(); setRenderTime(endTime - startTime);
            onOptionsChange({ width, height, debug, emojiType, fontEmbed, backgroundColor });
          }
          return;
        }
        
        let renderAttemptSuccessful = false;
        if (typeof live.element === 'function' && live.element.prototype?.render) {
          try {
            const renderOutput = new (live.element as any)({}).render();
            if (React.isValidElement(renderOutput)) { elementInputForSatori = renderOutput; renderAttemptSuccessful = true; }
          } catch (e) { console.error("Error attempting prototype.render():", e); }
        }
        if (!renderAttemptSuccessful) elementInputForSatori = React.isValidElement(live.element) ? live.element : React.createElement(live.element);
        if (!React.isValidElement(elementInputForSatori)) throw new Error("Invalid React element for Satori.");

        currentResultSVG = await satori(
          elementInputForSatori,
          {
            ...(satoriOptions as any), embedFont: fontEmbed, width, height, debug,
            loadAdditionalAsset: (code: string, text: string) => loadDynamicAsset(emojiType as keyof typeof apis, code, text),
            ...(backgroundColor && { backgroundColor }) 
          });
        if (cancelled) return;
        setResultSVG(currentResultSVG);

        let newObjectURL: string | null = null;
        if (renderType === 'png' && renderPNG) {
          const pngScale = (window as any).__pngScaleFactor || 1;
          newObjectURL = await renderPNG({ svg: currentResultSVG, width: width * pngScale });
          if (cancelled) { if (newObjectURL) URL.revokeObjectURL(newObjectURL); return; }
          setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return newObjectURL!; });
          currentObjectURLRef = newObjectURL;
        } else if (renderType === 'pdf') {
          const doc = new PDFDocument({ compress: false, size: [width, height], margin: 0 });
          const stream = doc.pipe(blobStream());
          SVGtoPDF(doc, currentResultSVG, 0, 0, { width, height, preserveAspectRatio: `xMidYMid meet` });
          doc.end();
          newObjectURL = await new Promise<string>((resolve, reject) => {
            stream.on('finish', () => { try { resolve(URL.createObjectURL(stream.toBlob('application/pdf'))); } catch (e) { reject(e); } });
            stream.on('error', reject);
          });
          if (cancelled) { if (newObjectURL) URL.revokeObjectURL(newObjectURL); return; }
          setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return newObjectURL!; });
          currentObjectURLRef = newObjectURL;
        } else { // SVG or other cases
          if (!cancelled) {
            setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; });
            currentObjectURLRef = null;
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error("Satori rendering error object:", e);
          let errorMsg = 'An unknown rendering error occurred.'; let errorStack = '';
          if (e instanceof Error) { errorMsg = e.message || errorMsg; errorStack = e.stack || '';
            if (errorMsg.includes('"props" is read-only')) errorMsg = 'Error: Cannot modify "props". Use state.';
            else if (errorMsg.includes("Failed to fetch") && errorMsg.includes("/api/satori/font")) errorMsg = 'Error: Failed to load dynamic font API.';
          } else if (e && typeof e === 'object') { try { errorMsg = JSON.stringify(e, null, 2); } catch { errorMsg = e.toString(); }
          } else { try { errorMsg = String(e); } catch { errorMsg = "[Error converting]"; } }
          setRenderError(`Rendering Error: ${errorMsg}${errorStack ? `\nStack: ${errorStack}` : ''}`);
          setResultSVG(''); setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; });
          currentObjectURLRef = null;
        } else { console.log('Error occurred but effect was already cancelled:', e); }
      } finally {
        if (!cancelled && renderType !== 'html') {
          const endTime = performance.now(); setRenderTime(endTime - startTime);
          onOptionsChange({ width, height, debug, emojiType, fontEmbed, backgroundColor });
        }
      }
    };
    performRender();

    return () => {
      cancelled = true;
      if (currentObjectURLRef) URL.revokeObjectURL(currentObjectURLRef);
      setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; }); // Ensure cleanup on unmount/re-run
    };
  }, [live?.element, satoriOptions, width, height, debug, emojiType, fontEmbed, renderType, onOptionsChange, backgroundColor]);

  const setupIframe = useCallback((node: HTMLIFrameElement | null) => {
    if (node?.contentWindow?.document?.body) {
      const doc = node.contentWindow.document;
      doc.head.innerHTML = ''; doc.body.innerHTML = ''; doc.body.style.margin = '0';
      const style = doc.createElement('style');
      style.textContent = ` @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Material+Icons'); html { height: 100%; box-sizing: border-box; } *, *::before, *::after { box-sizing: inherit; } body { display: flex; height: 100%; margin: 0; font-family: Inter, sans-serif; overflow: hidden; justify-content: center; align-items: center; background-color: #f0f0f0; } body > #react-root { border: 1px dashed #ccc; background-color: white; padding: 10px; max-width: 100%; max-height: 100%; overflow: auto; display: flex; justify-content: center; align-items: center; } `;
      doc.head.appendChild(style);
      const mountPoint = doc.createElement('div'); mountPoint.id = 'react-root';
      doc.body.appendChild(mountPoint);
      setIframeBody(mountPoint);
    } else { setIframeBody(null); }
  }, []);

  const previewBgClass = renderType === 'html' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700';

  return (
    <div className={`flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden ${previewBgClass}`}>
      {(live?.error || renderError) && (
        <div className='p-4 bg-red-100 dark:bg-red-900 border-b border-red-300 dark:border-red-700 flex-shrink-0'>
          <pre className="text-xs text-red-700 dark:text-red-200 whitespace-pre-wrap break-words">{live?.error || renderError}</pre>
        </div>
      )}
      <div ref={previewContainerRef} className="flex-grow flex items-center justify-center p-4 overflow-hidden relative">
        {loadingResources && !renderError && (
          <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-10">
            {spinner}
          </div>
        )}
        {renderType === 'svg' && resultSVG && !loadingResources && !renderError && (
          <div className="origin-center transition-transform duration-150" style={{ width: `${width}px`, height: `${height}px`, transform: `scale(${scaleRatio})`, transformOrigin: 'center center' }} dangerouslySetInnerHTML={{ __html: resultSVG }} />
        )}
        {renderType === 'png' && objectURL && !loadingResources && !renderError && (
          <img src={objectURL} width={width} height={height} className="origin-center transition-transform duration-150 object-contain" style={{ transform: `scale(${scaleRatio})`, transformOrigin: 'center center', maxWidth: '100%', maxHeight: '100%' }} alt='PNG Preview' onError={() => setRenderError("Failed to display PNG.")} />
        )}
        {renderType === 'pdf' && objectURL && !loadingResources && !renderError && (
          <iframe key='pdf-preview' title="PDF Preview" width={width} height={height} src={`${objectURL}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="origin-center transition-transform duration-150 border-none" style={{ transform: `scale(${scaleRatio})`, transformOrigin: 'center center', maxWidth: '100%', maxHeight: '100%' }} onError={() => setRenderError("Failed to display PDF.")} />
        )}
        {renderType === 'html' && !loadingResources && !live?.error && !renderError && (
          <iframe ref={setupIframe} key='html-preview' title="HTML Preview" width={width} height={height} className="origin-center transition-transform duration-150 border border-gray-300 dark:border-gray-600 bg-white" style={{transform: `scale(${scaleRatio})`, transformOrigin: 'center center', maxWidth: '100%', maxHeight: '100%' }} onError={() => setRenderError("Failed to display HTML preview.")}>
            {iframeBody && live?.element && createPortal(React.isValidElement(live.element) ? live.element : React.createElement(live.element), iframeBody)}
          </iframe>
        )}
      </div>
      <footer className="flex-shrink-0 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <span className='truncate'>
          {renderType === 'html' ? '[HTML Preview]' : `[${renderType.toUpperCase()}] ${renderedTimeSpent > 0 ? `Generated in ${~~(renderedTimeSpent * 100) / 100}ms` : (loadingResources ? 'Loading...' : '...')}`}
        </span>
        <div className="flex items-center space-x-3">
          {(renderType === 'png' || renderType === 'pdf') && objectURL && !renderError && (
            <a href={objectURL} target='_blank' rel='noreferrer' download={`preview.${renderType}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title={`Download ${renderType.toUpperCase()}`}> <Download size={14} /> </a>
          )}
          {renderType === 'svg' && resultSVG && !renderError && (
            <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(resultSVG)}`} target='_blank' rel='noreferrer' download="preview.svg" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Download SVG"> <Download size={14} /> </a>
          )}
          <span>{`[${width}×${height}]`}</span>
        </div>
      </footer>
    </div>
  );
});


// --- Reset Code Button ---
function ResetCode({ activeCard, onReset }: { activeCard: string, onReset: (code: string) => void }) {
  const { onChange: liveOnChange } = useContext(LiveContext) as any;
  useEffect(() => {
    let isMounted = true;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('share');
    if (shared) {
      (async () => {
        try {
          const decompressedData = fflate.strFromU8(fflate.decompressSync(Base64.toUint8Array(shared)));
          const decoded = JSON.parse(decompressedData);
          if (!isMounted) return;
          if (decoded && typeof decoded.code === 'string') {
            const tabToUpdate = decoded.tab || 'helloworld';
            if (editedCards[tabToUpdate] !== undefined) {
              editedCards[tabToUpdate] = decoded.code;
              if (tabToUpdate === activeCard) {
                onReset(decoded.code);
                if (liveOnChange) liveOnChange(decoded.code);
              }
              toast.success('Loaded shared code.');
            } else { toast.error(`Invalid shared tab: ${tabToUpdate}`); }
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            toast.error('Invalid shared data format.');
            window.history.replaceState(null, '', window.location.pathname);
          }
        } catch (e) {
          if (isMounted) {
            console.error('Failed to parse shared card:', e);
            toast.error('Could not load shared code.');
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      })();
    }
    return () => { isMounted = false; };
  }, [activeCard, onReset, liveOnChange]); // Added dependencies

  const handleResetClick = () => {
    const defaultCode = playgroundTabs[activeCard] ?? '';
    editedCards[activeCard] = defaultCode;
    onReset(defaultCode);
    if (liveOnChange) liveOnChange(defaultCode);
    window.history.replaceState(null, '', window.location.pathname);
    toast.success('Content reset to default.');
  };
  return (
    <button onClick={handleResetClick} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 inline-flex items-center space-x-1.5">
      <RotateCcw size={14} />
      <span>Reset</span>
    </button>
  );
}

// --- Main Playground Component (SatoriClient) ---
const initialConfigPanelOpen = false; // Define if the config panel should be open by default on desktop

export default function SatoriClient() {
  const [activeCard, setActiveCard] = useState<string>(cardNames[0] || 'helloworld');
  const [currentCode, setCurrentCode] = useState<string>(editedCards[activeCard] ?? playgroundTabs[activeCard] ?? '');
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [satoriConfig, setSatoriConfig] = useState({
    width: 500, height: 900, debug: false, fontEmbed: true, emojiType: 'twemoji',
    backgroundColor: '#ffffff', pngScale: 1,
  });
  const [renderType, setRenderType] = useState('svg');
  const latestSatoriOptionsRef = useRef({});

  // State and Ref for collapsible config panel
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(initialConfigPanelOpen);
  const configPanelRef = useRef<ImperativePanelHandle>(null);

  // Hydration effect
  useEffect(() => { setHydrated(true); }, []);

  // Mobile view detection and config panel collapse
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;

    let currentIsMobile = window.innerWidth < 768;
    setIsMobileView(currentIsMobile); // Set initial mobile state based on current width

    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      if (newIsMobile !== currentIsMobile) { // Check if mobile state actually changed
        setIsMobileView(newIsMobile);
        // If we transitioned to mobile view AND the panel is open (according to its ref state)
        if (newIsMobile && configPanelRef.current && !configPanelRef.current.isCollapsed()) {
          configPanelRef.current.collapse(); // This will trigger onCollapse, syncing isConfigPanelOpen
        }
        currentIsMobile = newIsMobile; // Update currentIsMobile for next comparison
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Initial check: if starting on mobile and panel was supposed to be open, collapse it.
    if (currentIsMobile && isConfigPanelOpen && configPanelRef.current && !configPanelRef.current.isCollapsed()) {
        configPanelRef.current.collapse();
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [hydrated, isConfigPanelOpen]); // isConfigPanelOpen is a dependency to re-evaluate collapse logic if it changes


  // Introduction modal logic
  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      if (!localStorage.getItem('_vercel_og_playground_visited')) {
        setShowIntroduction(true);
      }
    } catch (e) { console.error("localStorage access error for introduction:", e); }
  }, []);

  // Update current code when active card changes
  useEffect(() => {
    setCurrentCode(editedCards[activeCard] ?? playgroundTabs[activeCard] ?? '');
  }, [activeCard]);

  // Callbacks
  const handleCodeChange = useCallback((newCode: string) => {
    editedCards[activeCard] = newCode;
    setCurrentCode(newCode);
  }, [activeCard]);

  const handleReset = useCallback((resetCode: string) => {
    setCurrentCode(resetCode);
  }, []);

  const handleTabChange = useCallback((newTab: string) => {
    setActiveCard(newTab);
  }, []);

  const handleShare = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const codeToShare = editedCards[activeCard] ?? '';
      const optionsToShare = latestSatoriOptionsRef.current;
      const dataToCompress = JSON.stringify({ code: codeToShare, options: optionsToShare, tab: activeCard, });
      const compressed = Base64.fromUint8Array(fflate.deflateSync(fflate.strToU8(dataToCompress)), true);
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${compressed}`;
      copy(shareUrl);
      window.history.replaceState(null, '', `?share=${compressed}`);
      toast.success('Share URL copied to clipboard!');
    } catch (error) {
      console.error("Sharing error:", error);
      toast.error("Could not generate share link.");
    }
  }, [activeCard]);

  const handleConfigChange = useCallback((key: keyof typeof satoriConfig, value: any) => {
    const numericKeys: (keyof typeof satoriConfig)[] = ['width', 'height', 'pngScale'];
    const processedValue = numericKeys.includes(key) ? Number(value) : value;
    if (key === 'pngScale' && typeof window !== 'undefined') {
      (window as any).__pngScaleFactor = Number(value);
    }
    setSatoriConfig(prev => ({ ...prev, [key]: processedValue }));
  }, []);

  const handleSatoriOptionsUpdate = useCallback((options: any) => {
    latestSatoriOptionsRef.current = options;
  }, []);

  // Toggle function for the configuration panel (Desktop only)
  const toggleConfigPanel = useCallback(() => {
    if (isMobileView) {
      toast('Configuration panel is available on desktop view.');
      return;
    }
    const panel = configPanelRef.current;
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand(); // Triggers onExpand, which sets isConfigPanelOpen(true)
      } else {
        panel.collapse(); // Triggers onCollapse, which sets isConfigPanelOpen(false)
      }
    }
  }, [isMobileView]); // isMobileView is the only dependency needed here.

  if (!hydrated) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
        {spinner}
        <p className="mt-2">Initializing Playground...</p>
      </div>
    );
  }

  const previewTabOptions = previewTabs.map(t => `${t.split(' ')[0].toUpperCase()} Preview`);
  const activePreviewTab = `${renderType.toUpperCase()} Preview`;

  const editorPanelContent = (
    <StyledTabs options={cardNames} activeTab={activeCard} onChange={handleTabChange} className="h-full">
      <div className='flex flex-col h-full'>
        <div className='flex-shrink-0 px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-end items-center space-x-2 bg-gray-50 dark:bg-gray-800'>
          <ResetCode activeCard={activeCard} onReset={handleReset} />
          <button onClick={handleShare} type="button" className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 inline-flex items-center space-x-1.5">
            <Share2 size={14} /><span>Share</span>
          </button>
        </div>
        <div className="flex-grow relative min-h-0"> {/* Ensure flex child can shrink */}
          <LiveEditor key={activeCard} id={activeCard} code={currentCode} onCodeChange={handleCodeChange} />
        </div>
      </div>
    </StyledTabs>
  );

  const previewPanelContent = (
    <StyledTabs options={previewTabOptions} activeTab={activePreviewTab} onChange={(text) => setRenderType(text.split(' ')[0].toLowerCase())} className="h-full">
      <LiveSatori
        width={satoriConfig.width} height={satoriConfig.height} debug={satoriConfig.debug} fontEmbed={satoriConfig.fontEmbed}
        emojiType={satoriConfig.emojiType} renderType={renderType} onOptionsChange={handleSatoriOptionsUpdate}
        backgroundColor={satoriConfig.backgroundColor}
      />
    </StyledTabs>
  );

  const configPanelContent = (
    <div className='p-4 space-y-6 h-full overflow-y-auto'>
      <div className="flex justify-between items-center sticky top-0 bg-gray-50 dark:bg-gray-800 py-2 -mx-4 px-4 border-b border-gray-200 dark:border-gray-700 z-10">
        <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center space-x-2'>
          <Settings2 size={20} /> <span>Configurations</span>
        </h2>
        <button onClick={toggleConfigPanel} type="button" className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Close Configurations">
          <X size={18} />
        </button>
      </div>
      <div className='space-y-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-sm'>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Dimensions</h3>
        <div className='space-y-1'>
          <label htmlFor='config-width' className="block text-xs font-medium text-gray-700 dark:text-gray-200">Width (px)</label>
          <div className="flex space-x-2 items-center">
            <input id='config-width' type='number' value={satoriConfig.width} onChange={(e) => handleConfigChange('width', e.target.value)} min={1} max={5000} step={10} className="flex-grow w-full px-2 py-1 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
            <input type='range' aria-label="Width Range" value={satoriConfig.width} onChange={(e) => handleConfigChange('width', e.target.value)} min={100} max={2000} step={10} className="w-1/2 h-5 accent-blue-600 dark:accent-blue-500" />
          </div>
        </div>
        <div className='space-y-1'>
          <label htmlFor='config-height' className="block text-xs font-medium text-gray-700 dark:text-gray-200">Height (px)</label>
          <div className="flex space-x-2 items-center">
            <input id='config-height' type='number' value={satoriConfig.height} onChange={(e) => handleConfigChange('height', e.target.value)} min={1} max={5000} step={10} className="flex-grow w-full px-2 py-1 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
            <input type='range' aria-label='Height Range' value={satoriConfig.height} onChange={(e) => handleConfigChange('height', e.target.value)} min={100} max={2000} step={10} className="w-1/2 h-5 accent-blue-600 dark:accent-blue-500" />
          </div>
        </div>
        <div className='space-y-1 pt-2'>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-200">Presets</label>
          <div className="flex flex-wrap gap-2">
            {[ {label: 'Default', w: 800, h:450}, {label: 'OG Image', w:1200, h:630}, {label: 'Square', w:1080, h:1080}, {label: 'Story', w:1080, h:1920}].map(p => (
                 <button key={p.label} type="button" onClick={() => { handleConfigChange('width', p.w); handleConfigChange('height', p.h); }} className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">{p.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div className='space-y-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-sm'>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Style & Format</h3>
          <div className='space-y-1'>
            <label htmlFor='config-bg' className="block text-xs font-medium text-gray-700 dark:text-gray-200">Background Color</label>
            <input id='config-bg' type='text' placeholder="#ffffff or transparent" value={satoriConfig.backgroundColor} onChange={(e) => handleConfigChange('backgroundColor', e.target.value)} className="w-full px-2 py-1 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
            <p className="text-xs text-gray-500 dark:text-gray-400">E.g., #000000, transparent, or CSS color name.</p>
          </div>
          <div className='flex items-center justify-between'>
            <label htmlFor='config-font' className="text-xs font-medium text-gray-700 dark:text-gray-200">Embed Fonts (SVG)</label>
            <input id='config-font' type='checkbox' checked={satoriConfig.fontEmbed} onChange={(e) => handleConfigChange('fontEmbed', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
          </div>
          <div className='space-y-1'>
            <label htmlFor='config-png-scale' className="block text-xs font-medium text-gray-700 dark:text-gray-200">PNG Scale Factor</label>
            <select id='config-png-scale' value={satoriConfig.pngScale} onChange={(e) => handleConfigChange('pngScale', e.target.value)} className="w-full px-2 py-1 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
              {[1,2,3,4].map(s => <option key={s} value={s}>{s}x {s===1 && '(Default)'}</option>)}
            </select>
             <p className="text-xs text-gray-500 dark:text-gray-400">Higher scale means larger PNG dimensions.</p>
          </div>
          <div className='flex items-center justify-between'>
            <label htmlFor='config-debug' className="text-xs font-medium text-gray-700 dark:text-gray-200">Satori Debug Mode</label>
            <input id='config-debug' type='checkbox' checked={satoriConfig.debug} onChange={(e) => handleConfigChange('debug', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
          </div>
      </div>
      <div className='space-y-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-sm'>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Assets</h3>
        <div className='space-y-1'>
          <label htmlFor='config-emoji' className="block text-xs font-medium text-gray-700 dark:text-gray-200">Emoji Provider</label>
          <select id='config-emoji' value={satoriConfig.emojiType} onChange={(e) => handleConfigChange('emojiType', e.target.value)} className="w-full px-2 py-1 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
            {Object.keys(apis).map(api => <option key={api} value={api}>{api.charAt(0).toUpperCase() + api.slice(1)}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showIntroduction && (<IntroductionOrig onClose={() => { setShowIntroduction(false); try { localStorage.setItem('_vercel_og_playground_visited', '1'); } catch (e) {console.error("LS Error setting visited flag", e)} }} />)}
      <Toaster position="bottom-right" toastOptions={{ className: 'satori-toast text-sm rounded-md shadow-lg', duration: 4000, success: { style: { background: '#F0FFF4', color: '#2F855A', border: '1px solid #9AE6B4' } }, error: { style: { background: '#FFF5F5', color: '#C53030', border: '1px solid #FEB2B2' } } }} />

      <LiveProvider code={currentCode} enableTypeScript={false} theme={{plain:{}, styles:[]}} >
      <div className="h-screen w-full max-w-screen-xxl mx-auto p-4 flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
          {!isMobileView && (
            <div className="flex-shrink-0 p-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex justify-end items-center">
              <button
                onClick={toggleConfigPanel} type="button"
                className="p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                title={isConfigPanelOpen ? "Hide Configurations" : "Show Configurations"} aria-label={isConfigPanelOpen ? "Hide Configurations Panel" : "Show Configurations Panel"}
                aria-expanded={isConfigPanelOpen}
              >
                <Settings size={20} />
              </button>
            </div>
          )}

          <div className="flex-grow overflow-hidden min-h-0"> {/* Crucial for PanelGroup to not overflow */}
            {isMobileView ? (
              <PanelGroup direction="vertical" className="h-full " autoSaveId="satori-playground-panels-mobile-v5">
                <Panel id="editor-mobile" defaultSize={50} minSize={20} className="flex flex-col min-h-0"> {/* min-h-0 for flex children */}
                  {editorPanelContent}
                </Panel>
                <PanelResizeHandle className="h-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 active:bg-blue-600 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500" />
                <Panel id="preview-mobile" defaultSize={50} minSize={20} className="flex flex-col min-h-0"> {/* min-h-0 for flex children */}
                  {previewPanelContent}
                </Panel>
              </PanelGroup>
            ) : (
              <PanelGroup direction="horizontal"   className="satori-panel-group h-full" autoSaveId="satori-playground-panels-desktop-v6">
                <Panel id="editor" defaultSize={45} minSize={20} order={1} className="flex flex-col min-h-0"> {/* min-h-0 */}
                  {editorPanelContent}
                </Panel>
                <PanelResizeHandle className="w-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 active:bg-blue-600 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500" />
                <Panel id="preview" defaultSize={35} minSize={20} order={2} className="flex flex-col min-h-0"> {/* min-h-0 */}
                  {previewPanelContent}
                </Panel>
                {/* Conditional rendering of the resize handle based on panel state */}
                {/* The handle is only "active" or visible if the panel is not fully collapsed and hidden by choice */}
                <PanelResizeHandle 
                  className={`w-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 active:bg-blue-600 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${
                    (!isConfigPanelOpen && configPanelRef.current?.isCollapsed()) ? 'hidden' : ''
                  }`} 
                />
                <Panel
                  ref={configPanelRef} id="config"
                  defaultSize={initialConfigPanelOpen ? 20 : 0} // Use initial state for default size
                  collapsible={true} collapsedSize={0}
                  minSize={15} // Important: Panel needs a minimum expanded size
                  maxSize={40} order={3}
                  onCollapse={() => { 
                    // This callback is triggered when the panel collapses (by user or programmatically)
                    if (isConfigPanelOpen) setIsConfigPanelOpen(false); 
                  }}
                  onExpand={() => {
                    // This callback is triggered when the panel expands
                    if (!isConfigPanelOpen) setIsConfigPanelOpen(true);
                  }}
                  className="bg-gray-50 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-700 flex flex-col overflow-hidden min-h-0" // min-h-0
                >
                  {/* Content is always rendered; panel's collapse mechanism hides it */}
                  {configPanelContent}
                </Panel>
              </PanelGroup>
            )}
          </div>
        </div>
      </LiveProvider>
    </>
  );
}
