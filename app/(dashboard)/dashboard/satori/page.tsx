// File: app/playground/SatoriClient.tsx
"use client"
import React from 'react'
import satori from 'satori' // Assuming 'satori' is correctly installed/resolved
import { LiveProvider, LiveContext, withLive } from 'react-live'
import { useEffect, useState, useRef, useContext, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Editor, { useMonaco } from '@monaco-editor/react'
import toast, { Toaster } from 'react-hot-toast'
import copy from 'copy-to-clipboard'
// Make sure package.json is accessible or remove this import if not needed for version display
// import packageJson from 'satori/package.json';
// --- MOCK packageJson if import fails ---
const packageJson = { version: 'unknown' };
// --- End Mock ---
import * as fflate from 'fflate'
import { Base64 } from 'js-base64'
import PDFDocument from 'pdfkit/js/pdfkit.standalone'
import SVGtoPDF from 'svg-to-pdfkit'
import blobStream from 'blob-stream'
import { createIntlSegmenterPolyfill } from 'intl-segmenter-polyfill'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

// --- Icon Imports (Example using lucide-react, install if needed: npm install lucide-react) ---
import { Settings, Share2, RotateCcw, Download, Code, Image as ImageIcon, FileText, FileType } from 'lucide-react';


// --- ADJUST PATHS BELOW BASED ON YOUR ACTUAL PROJECT STRUCTURE ---
import { loadEmoji, getIconCode, apis } from '@/utils/twemoji' // Adjust path if needed
import Introduction from '@/components/introduction'         // Adjust path if needed
import { languageFontMap } from '@/utils/font'                 // Adjust path if needed
import playgroundTabs, { Tabs as PlaygroundTabsType } from '@/cards/playground-data' // Adjust path if needed, renamed Tabs import
import previewTabs from '@/cards/preview-tabs'                 // Adjust path if needed
// --- END PATH ADJUSTMENTS ---


// Ensure card data is correctly typed and initialized
const cardNames = Object.keys(playgroundTabs)
const editedCards: PlaygroundTabsType = playgroundTabs ? { ...playgroundTabs } : {};


// --- Font and Asset Loading (No AbortSignal) ---
async function init(): Promise<any[]> {
  const fontPaths = [
    '/inter-latin-ext-400-normal.woff',
    '/inter-latin-ext-700-normal.woff',
    '/material-icons-base-400-normal.woff',
  ];
  if (typeof window === 'undefined') return []
  try {
    const results = await Promise.allSettled([
        fetch(fontPaths[0]).then(res => res.ok ? res.arrayBuffer() : Promise.reject(new Error(`Fetch failed: ${fontPaths[0]} (${res.status})`))),
        fetch(fontPaths[1]).then(res => res.ok ? res.arrayBuffer() : Promise.reject(new Error(`Fetch failed: ${fontPaths[1]} (${res.status})`))),
        fetch(fontPaths[2]).then(res => res.ok ? res.arrayBuffer() : Promise.reject(new Error(`Fetch failed: ${fontPaths[2]} (${res.status})`))),
        !globalThis.Intl || !globalThis.Intl.Segmenter
          ? createIntlSegmenterPolyfill(fetch(new URL('intl-segmenter-polyfill/dist/break_iterator.wasm', import.meta.url)))
            .catch(e => Promise.reject(new Error(`IntlSegmenter polyfill failed: ${e.message}`)))
          : Promise.resolve(null),
      ]);
    const fontData: (ArrayBuffer | null)[] = [null, null, null];
    let segmenterPolyfill: any = null; let hasFontError = false;
    results.forEach((result, index) => {
        if (index < 3) { if (result.status === 'fulfilled') fontData[index] = result.value; else { console.error("Font load error:", result.reason); hasFontError = true; } }
        else { if (result.status === 'fulfilled') segmenterPolyfill = result.value; else console.error("Segmenter polyfill error:", result.reason); }
    });
    if (segmenterPolyfill) { globalThis.Intl = globalThis.Intl || {}; //@ts-expect-error
      globalThis.Intl.Segmenter = segmenterPolyfill; }
    (window as any).__resource = [fontData[0], fontData[1], fontData[2], segmenterPolyfill];
    const fonts = [];
    if (fontData[0]) fonts.push({ name: 'Inter', data: fontData[0], weight: 400, style: 'normal' });
    if (fontData[1]) fonts.push({ name: 'Inter', data: fontData[1], weight: 700, style: 'normal' });
    if (fontData[2]) fonts.push({ name: 'Material Icons', data: fontData[2], weight: 400, style: 'normal' });
    if (hasFontError && typeof window !== 'undefined') toast.error("Some base fonts failed to load.", { duration: 4000 });
    return fonts;
  } catch (error: any) { console.error("Error initializing resources:", error); if (typeof window !== 'undefined') toast.error(`Initialization failed: ${error.message}`); return []; }
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
    if (_code === 'emoji') { try { const svgData: string = await loadEmoji(emojiType, getIconCode(text)); return `data:image/svg+xml;base64,${typeof window !== 'undefined' ? window.btoa(svgData) : Buffer.from(svgData).toString('base64')}`; } catch (error) { console.error(`Failed to load emoji (${emojiType}, ${text}):`, error); return undefined; } }
    const codes = _code.split('|'); const names = codes.map((code) => languageFontMap[code as keyof typeof languageFontMap]).filter(Boolean).flat(); if (names.length === 0) return [];
    const params = new URLSearchParams(); names.forEach(name => params.append('fonts', name)); params.set('text', text);
    try { const response = await fetch(`/api/satori/font?${params.toString()}`); if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.arrayBuffer(); const fonts: any[] = [];
      const decodeFontInfoFromArrayBuffer = (buffer: ArrayBuffer) => { let offset = 0; const bufferView = new DataView(buffer); while (offset < buffer.byteLength) { if (offset + 1 > buffer.byteLength) break; const languageCodeLength = bufferView.getUint8(offset); offset += 1; if (offset + languageCodeLength > buffer.byteLength) break; const languageCodeBytes = new Uint8Array(buffer, offset, languageCodeLength); const languageCode = new TextDecoder().decode(languageCodeBytes); offset += languageCodeLength; if (offset + 4 > buffer.byteLength) break; const fontDataLength = bufferView.getUint32(offset, false); offset += 4; if (offset + fontDataLength > buffer.byteLength) break; const fontData = buffer.slice(offset, offset + fontDataLength); offset += fontDataLength; fonts.push({ name: `satori_${languageCode}_fallback_${text}`, data: fontData, weight: 400, style: 'normal', lang: languageCode === 'unknown' ? undefined : languageCode }); } };
      decodeFontInfoFromArrayBuffer(data); return fonts
    } catch (e) { console.error(`Failed to load dynamic font for "${text}" (codes: ${codes.join(', ')}). Error:`, e); return []; }
  }
)

// --- Spinner SVG ---
const spinner = (
  <svg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' className="animate-spin text-blue-600">
    <path fill="currentColor" d='M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z'/>
  </svg>
);

// --- Resvg Worker Initialization ---
function initResvgWorker(): ((msg: object) => Promise<string>) | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const worker = new Worker(new URL('@/components/resvg_worker.ts', import.meta.url), { type: 'module' });
    const pending = new Map<number, { resolve: (value: string) => void; reject: (reason?: any) => void }>();
    worker.onmessage = (e: MessageEvent) => { const { _id, url, error } = e.data; const cb = pending.get(_id); if (cb) { if (error) cb.reject(new Error(error)); else cb.resolve(url); pending.delete(_id); } };
    worker.onerror = (e: ErrorEvent) => { console.error("Error in ResvgWorker:", e.message, e); pending.forEach(p => p.reject(new Error("Worker error: " + e.message))); pending.clear(); };
    return async (msg: object): Promise<string> => { const _id = Math.random(); return new Promise((resolve, reject) => { pending.set(_id, { resolve, reject }); worker.postMessage({ ...msg, _id }); }); };
  } catch (error) { console.error("Failed to initialize ResvgWorker:", error); if (typeof window !== 'undefined') toast.error("PNG/PDF rendering might be unavailable."); return undefined; }
}

const loadFonts = init();
const renderPNG = initResvgWorker();


// --- Styled Tabs Component ---
interface ITabsProps { options: string[]; activeTab: string; onChange: (value: string) => void; children: React.ReactNode; }
function StyledTabs({ options, activeTab, onChange, children }: ITabsProps) {
  return (
    <div className="flex flex-col h-full">
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

// --- LiveEditor Component (Minor style adjustments if needed) ---
function LiveEditor({ id, code, onCodeChange }: { id: string, code: string, onCodeChange: (newCode: string) => void }) {
  const { onChange: liveOnChange } = useContext(LiveContext) as any;
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { // Theme setup
    if (monaco) {
      try {
        monaco.editor.defineTheme('IDLE-Light', { // Example Light Theme
            base: 'vs', inherit: true,
            rules: [ { token: 'comment', foreground: '6A737D' }, { token: 'keyword', foreground: 'D73A49' }, { token: 'string', foreground: '032F62' }, /* ... more rules */ ],
            colors: { 'editor.background': '#FFFFFF', 'editor.foreground': '#24292E', 'editorCursor.foreground': '#044289', 'editor.lineHighlightBackground': '#F6F8FA', /* ... more colors */ },
        });
         monaco.editor.defineTheme('IDLE-Dark', { // Example Dark Theme
            base: 'vs-dark', inherit: true,
            rules: [ { token: 'comment', foreground: '6A737D' }, { token: 'keyword', foreground: 'F97583' }, { token: 'string', foreground: '9ECBFF' }, /* ... more rules */ ],
            colors: { 'editor.background': '#1F2428', 'editor.foreground': '#E1E4E8', 'editorCursor.foreground': '#58A6FF', 'editor.lineHighlightBackground': '#2B3036', /* ... more colors */ },
        });
        // Set initial theme based on system preference or stored value
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        monaco.editor.setTheme(prefersDark ? 'IDLE-Dark' : 'IDLE-Light');
      } catch (error: any) {
          if (!error.message?.includes("already defined")) {
             console.error("Monaco theme error:", error);
             if (typeof window !== 'undefined') toast.error("Failed to set editor theme.");
          }
      }
      // Optional: Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
          monaco.editor.setTheme(event.matches ? "IDLE-Dark" : "IDLE-Light");
      });
    }
  }, [monaco]);

   useEffect(() => { // Resize observer setup
       const currentEditor = editorRef.current;
       const currentContainer = containerRef.current;
       let resizeObserver: ResizeObserver | null = null;
       if (currentContainer && currentEditor) {
           const relayout = () => { const d = currentContainer.getBoundingClientRect(); if (d.width > 0 && d.height > 0) currentEditor.layout({ width: d.width, height: d.height }); };
           resizeObserver = new ResizeObserver(relayout); resizeObserver.observe(currentContainer); relayout();
           return () => { if (resizeObserver && currentContainer) resizeObserver.unobserve(currentContainer); resizeObserver = null; };
       } return undefined;
   }, []);

  const handleEditorChange = (value: string | undefined) => { const newCode = value ?? ''; onCodeChange(newCode); if (liveOnChange) liveOnChange(newCode); };
  const handleEditorDidMount = (editor: any, _monacoInstance: any) => { editorRef.current = editor; if (containerRef.current) { const d = containerRef.current.getBoundingClientRect(); if (d.width > 0 && d.height > 0) editor.layout({ width: d.width, height: d.height }); } };

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden relative bg-white dark:bg-gray-900">
        <Editor
          // Theme is set dynamically in useEffect now
          language='javascript' value={code} onChange={handleEditorChange} onMount={handleEditorDidMount}
          options={{ fontFamily: '"Fira Code", Consolas, "Courier New", monospace', fontSize: 13, wordWrap: 'on', tabSize: 2, minimap: { enabled: false }, smoothScrolling: true, cursorSmoothCaretAnimation: 'on', contextmenu: true, // Enable context menu for copy/paste
            automaticLayout: false, scrollBeyondLastLine: false, renderLineHighlight: 'gutter', readOnly: false, lineNumbers: 'on', roundedSelection: false, overviewRulerLanes: 2, occurrencesHighlight: 'off', renderWhitespace: "boundary", scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8, vertical: 'auto', horizontal: 'auto' }, }}
        />
    </div>
  );
}


// --- LiveSatori Preview Component (Using isMounted/cancelled flag) ---
const LiveSatori = withLive(function LiveSatoriInner({
  live, width, height, debug, fontEmbed, emojiType, renderType, onOptionsChange, backgroundColor // Added backgroundColor
}: {
  live?: { element?: React.ComponentType<any>; error?: string };
  width: number; height: number; debug: boolean; fontEmbed: boolean;
  emojiType: string; renderType: string;
  onOptionsChange: (options: any) => void;
  backgroundColor?: string; // Optional background color prop
}) {

  const [satoriOptions, setSatoriOptions] = useState<{ fonts: any[] } | null>(null);
  const [objectURL, setObjectURL] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [loadingResources, setLoadingResources] = useState(true);
  const [renderedTimeSpent, setRenderTime] = useState<number>(0);
  const [resultSVG, setResultSVG] = useState('');
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [scaleRatio, setScaleRatio] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  // --- Effect: Load Initial Fonts (using isMounted flag) ---
  useEffect(() => {
    let isMounted = true; setLoadingResources(true); setRenderError(null);
    loadFonts.then(fonts => { if (isMounted) { if (fonts?.length > 0) setSatoriOptions({ fonts }); else { console.warn("Initial fonts not loaded."); setSatoriOptions({ fonts: [] }); } } })
             .catch(error => { if (isMounted) { console.error("Failed to resolve fonts promise:", error); setRenderError("Error loading initial font data."); setSatoriOptions({ fonts: [] }); } })
             .finally(() => { if (isMounted) setLoadingResources(false); });
    return () => { isMounted = false; };
  }, []);

  // --- Callback and Effect: Calculate Preview Scale Ratio ---
  const updateScaleRatio = useCallback(() => {
    if (!previewContainerRef.current || width <= 0 || height <= 0) { setScaleRatio(1); return; }
    const container = previewContainerRef.current;
    // Use padding-adjusted dimensions for scale calculation
    const paddingX = parseFloat(getComputedStyle(container).paddingLeft) + parseFloat(getComputedStyle(container).paddingRight);
    const paddingY = parseFloat(getComputedStyle(container).paddingTop) + parseFloat(getComputedStyle(container).paddingBottom);
    const availableWidth = container.clientWidth - paddingX;
    const availableHeight = container.clientHeight - paddingY;
    if (availableWidth <= 0 || availableHeight <= 0) { setScaleRatio(1); return; } // Prevent division by zero or negative scale
    const scale = Math.min(1, availableWidth / width, availableHeight / height);
    setScaleRatio(scale);
  }, [width, height]);
  useEffect(() => {
    const container = previewContainerRef.current; if (!container) return;
    const observer = new ResizeObserver(updateScaleRatio); observer.observe(container); updateScaleRatio();
    return () => observer.disconnect();
  }, [updateScaleRatio]);


  // --- Effect: Satori Rendering Logic (using cancelled flag) ---
  useEffect(() => {
    let cancelled = false;
    let currentObjectURLRef: string | null = null;

    const performRender = async () => {
        if (!live?.element || satoriOptions === null) { if (!cancelled) { setResultSVG(''); setRenderError(null); setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; }); currentObjectURLRef = null; } return; }
        if (renderType === 'png') { await new Promise(resolve => setTimeout(resolve, 50)); if (cancelled) return; }

        const startTime = performance.now(); if (!cancelled) setRenderError(null);
        let currentResultSVG = ''; let elementInputForSatori: React.ReactElement | null = null;

        try {
            if (renderType === 'html') { if (!cancelled) { setResultSVG(''); setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; }); currentObjectURLRef = null; const endTime = performance.now(); setRenderTime(endTime - startTime); onOptionsChange({ width, height, debug, emojiType, fontEmbed, backgroundColor }); } return; }

            // Prepare React Element
             let renderAttemptSuccessful = false;
             if (typeof live.element === 'function' && live.element.prototype?.render) { try { const renderOutput = new (live.element as any)({}).render(); if (React.isValidElement(renderOutput)) { elementInputForSatori = renderOutput; renderAttemptSuccessful = true; } } catch (e) { console.error("Error attempting prototype.render():", e); } }
             if (!renderAttemptSuccessful) elementInputForSatori = React.isValidElement(live.element) ? live.element : React.createElement(live.element);
             if (!React.isValidElement(elementInputForSatori)) throw new Error("Invalid React element for Satori.");

            // Call Satori with background color
            currentResultSVG = await satori( elementInputForSatori, { ...(satoriOptions as any), embedFont: fontEmbed, width, height, debug, loadAdditionalAsset: (code: string, text: string) => loadDynamicAsset(emojiType as keyof typeof apis, code, text), ...(backgroundColor && { backgroundColor }) }); // Add background color if provided
            if (cancelled) return; setResultSVG(currentResultSVG);

            // Generate PNG/PDF
            let newObjectURL: string | null = null;
            if (renderType === 'png' && renderPNG) {
                // Pass scale factor to worker if implemented there
                const pngScale = (window as any).__pngScaleFactor || 1; // Get scale from global or default to 1
                newObjectURL = await renderPNG({ svg: currentResultSVG, width: width * pngScale }); // Apply scale
                if (cancelled) { if (newObjectURL) URL.revokeObjectURL(newObjectURL); return; }
                setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return newObjectURL!; }); currentObjectURLRef = newObjectURL;
                // Note: Hi-res timeout removed for simplicity, scale factor handles quality.
            } else if (renderType === 'pdf') {
                const doc = new PDFDocument({ compress: false, size: [width, height], margin: 0 }); const stream = doc.pipe(blobStream()); SVGtoPDF(doc, currentResultSVG, 0, 0, { width, height, preserveAspectRatio: `xMidYMid meet` }); doc.end();
                newObjectURL = await new Promise<string>((resolve, reject) => { stream.on('finish', () => { try { resolve(URL.createObjectURL(stream.toBlob('application/pdf'))); } catch (e) { reject(e); } }); stream.on('error', reject); });
                if (cancelled) { if (newObjectURL) URL.revokeObjectURL(newObjectURL); return; }
                setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return newObjectURL!; }); currentObjectURLRef = newObjectURL;
            } else { if (!cancelled) { setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; }); currentObjectURLRef = null; } }
        } catch (e: any) { if (!cancelled) { console.error("Satori rendering error object:", e); let errorMsg = 'An unknown rendering error occurred.'; let errorStack = ''; if (e instanceof Error) { errorMsg = e.message || errorMsg; errorStack = e.stack || ''; if (errorMsg.includes('"props" is read-only')) errorMsg = 'Error: Cannot modify "props". Use state.'; else if (errorMsg.includes("Failed to fetch") && errorMsg.includes("/api/satori/font")) errorMsg = 'Error: Failed to load dynamic font API.'; } else if (e && typeof e === 'object') { try { errorMsg = JSON.stringify(e, null, 2); } catch { errorMsg = e.toString(); } } else { try { errorMsg = String(e); } catch { errorMsg = "[Error converting]"; } } setRenderError(`Rendering Error: ${errorMsg}${errorStack ? `\nStack: ${errorStack}` : ''}`); setResultSVG(''); setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; }); currentObjectURLRef = null; } else { console.log('Error occurred but effect was already cancelled:', e); }
        } finally { if (!cancelled && renderType !== 'html') { const endTime = performance.now(); setRenderTime(endTime - startTime); onOptionsChange({ width, height, debug, emojiType, fontEmbed, backgroundColor }); } } // Pass background to parent
    };
    performRender();

    return () => { cancelled = true; if (currentObjectURLRef) { URL.revokeObjectURL(currentObjectURLRef); } setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; }); }; // Cleanup
  }, [ live?.element, satoriOptions, width, height, debug, emojiType, fontEmbed, renderType, onOptionsChange, backgroundColor ]); // Add backgroundColor dependency

  // --- Callback Ref for Iframe Setup (HTML Preview - Unchanged) ---
  const setupIframe = useCallback((node: HTMLIFrameElement | null) => {
    if (node?.contentWindow?.document?.body) {
        const doc = node.contentWindow.document; doc.head.innerHTML = ''; doc.body.innerHTML = ''; doc.body.style.margin = '0';
        const style = doc.createElement('style'); style.textContent = ` @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Material+Icons'); html { height: 100%; box-sizing: border-box; } *, *::before, *::after { box-sizing: inherit; } body { display: flex; height: 100%; margin: 0; font-family: Inter, sans-serif; overflow: hidden; justify-content: center; align-items: center; background-color: #f0f0f0; } body > #react-root { border: 1px dashed #ccc; background-color: white; padding: 10px; max-width: 100%; max-height: 100%; overflow: auto; display: flex; justify-content: center; align-items: center; } `; doc.head.appendChild(style);
        const mountPoint = doc.createElement('div'); mountPoint.id = 'react-root'; doc.body.appendChild(mountPoint); setIframeBody(mountPoint);
    } else { setIframeBody(null); }
  }, []);

  // --- Render the Preview Card ---
  const previewBgClass = renderType === 'html' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'; // Different bg for HTML preview

  return (
    <div className={`flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden ${previewBgClass}`}>
      {/* Error Display Area */}
      {(live?.error || renderError) && (
        <div className='p-4 bg-red-100 dark:bg-red-900 border-b border-red-300 dark:border-red-700 flex-shrink-0'>
          <pre className="text-xs text-red-700 dark:text-red-200 whitespace-pre-wrap break-words">{live?.error || renderError}</pre>
        </div>
      )}

      {/* Main Preview Content Area (Dynamically fills space) */}
      <div ref={previewContainerRef} className="flex-grow flex items-center justify-center p-4 overflow-hidden relative">
        {/* Loading Spinner */}
        {loadingResources && !renderError && (
            <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
                {spinner}
            </div>
        )}

        {/* Conditional rendering based on renderType */}
        {/* SVG Preview */}
        {renderType === 'svg' && resultSVG && !loadingResources && !renderError && (
          <div
            className="origin-center transition-transform duration-150" // Center origin for scaling
            style={{ width: `${width}px`, height: `${height}px`, transform: `scale(${scaleRatio})`, transformOrigin: 'center center' }}
            dangerouslySetInnerHTML={{ __html: resultSVG }}
          />
        )}
        {/* PNG Preview */}
        {renderType === 'png' && objectURL && !loadingResources && !renderError && (
          <img
            src={objectURL} width={width} height={height} // Base dimensions
            className="origin-center transition-transform duration-150 object-contain" // Style for scaling
            style={{ transform: `scale(${scaleRatio})`, transformOrigin: 'center center', maxWidth: '100%', maxHeight: '100%' }}
            alt='PNG Preview' onError={() => setRenderError("Failed to display PNG.")}
          />
        )}
        {/* PDF Preview */}
        {renderType === 'pdf' && objectURL && !loadingResources && !renderError && (
          <iframe
            key='pdf-preview' title="PDF Preview" width={width} height={height} // Base dimensions
            src={`${objectURL}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="origin-center transition-transform duration-150 border-none" // Style for scaling
            style={{ transform: `scale(${scaleRatio})`, transformOrigin: 'center center', maxWidth: '100%', maxHeight: '100%' }}
            onError={() => setRenderError("Failed to display PDF.")}
          />
        )}
        {/* HTML Preview */}
        {renderType === 'html' && !loadingResources && !live?.error && !renderError && (
           <iframe
             ref={setupIframe} key='html-preview' title="HTML Preview" width={width} height={height} // Base dimensions
             className="origin-center transition-transform duration-150 border border-gray-300 dark:border-gray-600 bg-white" // Style for scaling
             style={{ transform: `scale(${scaleRatio})`, transformOrigin: 'center center', maxWidth: '100%', maxHeight: '100%' }}
             onLoad={(e) => setupIframe(e.currentTarget)} onError={() => setRenderError("Failed to display HTML preview.")}
           >
             {iframeBody && live?.element && createPortal( React.isValidElement(live.element) ? live.element : React.createElement(live.element), iframeBody )}
           </iframe>
        )}
      </div>

      {/* Footer with Render Info and Links */}
      <footer className="flex-shrink-0 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <span className='truncate'>
          {renderType === 'html' ? '[HTML Preview]' : `[${renderType.toUpperCase()}] ${renderedTimeSpent > 0 ? `Generated in ${~~(renderedTimeSpent * 100) / 100}ms` : (loadingResources ? 'Loading...' : '...')}` }
        </span>
        <div className="flex items-center space-x-3">
            {(renderType === 'png' || renderType === 'pdf') && objectURL && !renderError && ( <a href={objectURL} target='_blank' rel='noreferrer' download={`preview.${renderType}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title={`Download ${renderType.toUpperCase()}`}> <Download size={14} /> </a> )}
            {renderType === 'svg' && resultSVG && !renderError && ( <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(resultSVG)}`} target='_blank' rel='noreferrer' download="preview.svg" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Download SVG"> <Download size={14} /> </a> )}
            <span>{`[${width}×${height}]`}</span>
        </div>
      </footer>
    </div>
  );
});


// --- Reset Code Button (Using isMounted flag) ---
function ResetCode({ activeCard, onReset }: { activeCard: string, onReset: (code: string) => void }) {
  const { onChange: liveOnChange } = useContext(LiveContext) as any;
  useEffect(() => {
    let isMounted = true; if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search); const shared = params.get('share');
    if (shared) {
      (async () => { try { const decompressedData = fflate.strFromU8( fflate.decompressSync(Base64.toUint8Array(shared)) ); const decoded = JSON.parse(decompressedData); if (!isMounted) return; if (decoded && typeof decoded.code === 'string') { const tabToUpdate = decoded.tab || 'helloworld'; if (editedCards[tabToUpdate] !== undefined) { editedCards[tabToUpdate] = decoded.code; if(tabToUpdate === activeCard) { onReset(decoded.code); if (liveOnChange) liveOnChange(decoded.code); } /* declare var overrideOptions: any; overrideOptions = decoded.options || {}; */ toast.success('Loaded shared code.'); } else { toast.error(`Invalid shared tab: ${tabToUpdate}`); } window.history.replaceState(null, '', window.location.pathname); } else { toast.error('Invalid shared data format.'); window.history.replaceState(null, '', window.location.pathname); } } catch (e) { if (isMounted) { console.error('Failed to parse shared card:', e); toast.error('Could not load shared code.'); window.history.replaceState(null, '', window.location.pathname); } } })(); }
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetClick = () => { const defaultCode = playgroundTabs[activeCard] ?? ''; editedCards[activeCard] = defaultCode; onReset(defaultCode); if (liveOnChange) liveOnChange(defaultCode); window.history.replaceState(null, '', window.location.pathname); toast.success('Content reset to default.'); };
  return ( <button onClick={handleResetClick} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 inline-flex items-center space-x-1.5"> <RotateCcw size={14} /> <span>Reset</span> </button> );
}

// --- Main Playground Component (SatoriClient) ---
export default function SatoriClient() {
  const [activeCard, setActiveCard] = useState<string>('helloworld');
  const [currentCode, setCurrentCode] = useState<string>(editedCards[activeCard] ?? '');
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [satoriConfig, setSatoriConfig] = useState({
      width: 500, height: 900, debug: false, fontEmbed: true, emojiType: 'twemoji',
      backgroundColor: '#ffffff', // Added background color state
      pngScale: 1, // Added PNG scale state
  });
  const [renderType, setRenderType] = useState('svg');
  const latestSatoriOptionsRef = useRef({});

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => { if (typeof window === 'undefined') return; const checkMobile = () => setIsMobileView(window.innerWidth < 768); checkMobile(); window.addEventListener('resize', checkMobile); return () => window.removeEventListener('resize', checkMobile); }, []);
  useEffect(() => { if (typeof window === 'undefined' || typeof localStorage === 'undefined') return; try { if (!localStorage.getItem('_vercel_og_playground_visited')) { setShowIntroduction(true); } } catch (e) { console.error("localStorage access error:", e); } }, []);
  useEffect(() => { setCurrentCode(editedCards[activeCard] ?? ''); }, [activeCard]);

  const handleCodeChange = useCallback((newCode: string) => { editedCards[activeCard] = newCode; setCurrentCode(newCode); }, [activeCard]);
  const handleReset = useCallback((resetCode: string) => { setCurrentCode(resetCode); }, []);
  const handleTabChange = useCallback((newTab: string) => { setActiveCard(newTab); }, []);
  const handleShare = useCallback(() => { if (typeof window === 'undefined') return; try { const codeToShare = editedCards[activeCard] ?? ''; const optionsToShare = latestSatoriOptionsRef.current; const dataToCompress = JSON.stringify({ code: codeToShare, options: optionsToShare, tab: activeCard, }); const compressed = Base64.fromUint8Array( fflate.deflateSync(fflate.strToU8(dataToCompress)), true ); const shareUrl = `${window.location.origin}${window.location.pathname}?share=${compressed}`; copy(shareUrl); window.history.replaceState(null, '', `?share=${compressed}`); toast.success('Share URL copied to clipboard!'); } catch (error) { console.error("Sharing error:", error); toast.error("Could not generate share link."); } }, [activeCard]);
  const handleConfigChange = useCallback((key: keyof typeof satoriConfig, value: any) => {
    const numericKeys: (keyof typeof satoriConfig)[] = ['width', 'height', 'pngScale'];
    const processedValue = numericKeys.includes(key) ? Number(value) : value;
    // Update global for PNG scale if needed by worker
    if (key === 'pngScale' && typeof window !== 'undefined') { (window as any).__pngScaleFactor = Number(value); }
    setSatoriConfig(prev => ({ ...prev, [key]: processedValue }));
   }, []);
  const handleSatoriOptionsUpdate = useCallback((options: any) => { latestSatoriOptionsRef.current = options; }, []);

  if (!hydrated) { return null; }

  const previewTabOptions = previewTabs.map(t => `${t.split(' ')[0].toUpperCase()} Preview`);
  const activePreviewTab = `${renderType.toUpperCase()} Preview`;

  // --- Panel Render Definitions ---
  const editorPanel = (
    <Panel id="editor" defaultSize={isMobileView ? 50 : 40} minSize={20} order={1} className="flex flex-col">
      <StyledTabs options={cardNames} activeTab={activeCard} onChange={handleTabChange}>
        <div className='flex flex-col h-full'>
          <div className='flex-shrink-0 px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-end space-x-2 bg-gray-50 dark:bg-gray-800'>
            <ResetCode activeCard={activeCard} onReset={handleReset}/>
            <button onClick={handleShare} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center space-x-1.5">
                <Share2 size={14} />
                <span>Share</span>
            </button>
          </div>
          {/* Editor takes remaining space */}
          <div className="flex-grow relative">
              <LiveEditor key={activeCard} id={activeCard} code={currentCode} onCodeChange={handleCodeChange} />
          </div>
        </div>
      </StyledTabs>
    </Panel>
  );

  const previewPanel = (
    <Panel id="preview" defaultSize={isMobileView ? 50 : 40} minSize={20} order={isMobileView ? 2 : 3} className="flex flex-col">
       <StyledTabs options={previewTabOptions} activeTab={activePreviewTab} onChange={(text) => setRenderType(text.split(' ')[0].toLowerCase())}>
          {/* LiveSatori now takes full height within its container */}
          <LiveSatori
              width={satoriConfig.width} height={satoriConfig.height} debug={satoriConfig.debug} fontEmbed={satoriConfig.fontEmbed}
              emojiType={satoriConfig.emojiType} renderType={renderType} onOptionsChange={handleSatoriOptionsUpdate}
              backgroundColor={satoriConfig.backgroundColor} // Pass background color
          />
       </StyledTabs>
    </Panel>
  );

   const configPanel = (
       <Panel id="config" defaultSize={20} minSize={15} maxSize={35} collapsible={true} order={2} className="bg-gray-50 dark:bg-gray-800 border-l border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className='p-4 space-y-6'>
             <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center space-x-2'>
                <Settings size={20}/>
                <span>Configurations</span>
             </h2>

             {/* Dimensions Group */}
             <div className='space-y-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-sm'>
                 <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Dimensions</h3>
                 {/* Width Control */}
                 <div className='space-y-1'>
                    <label htmlFor='config-width' className="block text-xs font-medium text-gray-700 dark:text-gray-200">Width (px)</label>
                    <div className="flex space-x-2">
                        <input id='config-width' type='number' value={satoriConfig.width} onChange={(e) => handleConfigChange('width', e.target.value)} min={1} max={5000} step={10} className="flex-grow w-full px-2 py-1 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"/>
                        <input type='range' aria-label="Width Range" value={satoriConfig.width} onChange={(e) => handleConfigChange('width', e.target.value)} min={100} max={2000} step={10} className="w-1/2 h-5 my-auto accent-blue-600"/>
                    </div>
                 </div>
                 {/* Height Control */}
                 <div className='space-y-1'>
                    <label htmlFor='config-height' className="block text-xs font-medium text-gray-700 dark:text-gray-200">Height (px)</label>
                    <div className="flex space-x-2">
                        <input id='config-height' type='number' value={satoriConfig.height} onChange={(e) => handleConfigChange('height', e.target.value)} min={1} max={5000} step={10} className="flex-grow w-full px-2 py-1 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"/>
                        <input type='range' aria-label='Height Range' value={satoriConfig.height} onChange={(e) => handleConfigChange('height', e.target.value)} min={100} max={2000} step={10} className="w-1/2 h-5 my-auto accent-blue-600"/>
                    </div>
                 </div>
                 {/* Size Presets */}
                 <div className='space-y-1 pt-2'>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-200">Presets</label>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => { handleConfigChange('width', 800); handleConfigChange('height', 400); }} className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">Default</button>
                        <button onClick={() => { handleConfigChange('width', 1200); handleConfigChange('height', 630); }} className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">OG</button>
                        <button onClick={() => { handleConfigChange('width', 1080); handleConfigChange('height', 1080); }} className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">Square</button>
                        <button onClick={() => { handleConfigChange('width', 1080); handleConfigChange('height', 1920); }} className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">Story</button>
                    </div>
                </div>
             </div>

             {/* Style & Format Group */}
             <div className='space-y-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-sm'>
                 <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Style & Format</h3>
                 {/* Background Color */}
                 <div className='space-y-1'>
                   <label htmlFor='config-bg' className="block text-xs font-medium text-gray-700 dark:text-gray-200">Background Color</label>
                   <input id='config-bg' type='text' placeholder="#ffffff" value={satoriConfig.backgroundColor} onChange={(e) => handleConfigChange('backgroundColor', e.target.value)} className="w-full px-2 py-1 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"/>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Enter hex code (e.g., #000000)</p>
                 </div>
                 {/* Embed Font */}
                 <div className='flex items-center justify-between'>
                    <label htmlFor='config-font' className="text-xs font-medium text-gray-700 dark:text-gray-200">Embed Fonts (SVG)</label>
                    <input id='config-font' type='checkbox' checked={satoriConfig.fontEmbed} onChange={(e) => handleConfigChange('fontEmbed', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800"/>
                 </div>
                  {/* PNG Scale Factor */}
                 <div className='space-y-1'>
                   <label htmlFor='config-png-scale' className="block text-xs font-medium text-gray-700 dark:text-gray-200">PNG Scale</label>
                   <select id='config-png-scale' value={satoriConfig.pngScale} onChange={(e) => handleConfigChange('pngScale', e.target.value)} className="w-full px-2 py-1 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                      <option value={1}>1x (Default)</option>
                      <option value={2}>2x</option>
                      <option value={3}>3x</option>
                   </select>
                 </div>
                 {/* Debug Mode */}
                 <div className='flex items-center justify-between'>
                    <label htmlFor='config-debug' className="text-xs font-medium text-gray-700 dark:text-gray-200">Debug Mode</label>
                    <input id='config-debug' type='checkbox' checked={satoriConfig.debug} onChange={(e) => handleConfigChange('debug', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800"/>
                 </div>
             </div>

             {/* Assets Group */}
             <div className='space-y-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 shadow-sm'>
                 <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Assets</h3>
                 {/* Emoji Provider */}
                 <div className='space-y-1'>
                    <label htmlFor='config-emoji' className="block text-xs font-medium text-gray-700 dark:text-gray-200">Emoji Provider</label>
                    <select id='config-emoji' value={satoriConfig.emojiType} onChange={(e) => handleConfigChange('emojiType', e.target.value)} className="w-full px-2 py-1 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                       <option value='twemoji'>Twemoji</option> <option value='fluent'>Fluent Emoji</option> <option value='fluentFlat'>Fluent Emoji Flat</option> <option value='noto'>Noto Emoji</option> <option value='blobmoji'>Blobmoji</option> <option value='openmoji'>OpenMoji</option>
                    </select>
                 </div>
             </div>

             {/* Info Group */}
             <div className='space-y-1 text-center pt-4'>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Satori Version</label>
                  <a href='https://github.com/vercel/satori' target='_blank' rel='noreferrer' className="block text-xs text-blue-600 hover:underline dark:text-blue-400">
                      {packageJson.version} ↗
                  </a>
             </div>
          </div>
       </Panel>
   );


  // --- Final Render Structure ---
  return (
    <>
      {showIntroduction && ( <Introduction onClose={() => { setShowIntroduction(false); try { localStorage.setItem('_vercel_og_playground_visited', '1'); } catch (e) {} }} /> )}
      <Toaster position="bottom-right" toastOptions={{ className: 'satori-toast', duration: 4000 }} />

      {/* Main Layout using Resizable Panels */}
      <LiveProvider code={currentCode} enableTypeScript={false} >
        <PanelGroup
          direction={isMobileView ? 'vertical' : 'horizontal'}
          className="h-screen w-screen bg-gray-100 dark:bg-gray-900" // Full screen background
          autoSaveId="satori-playground-panels-v2" // Use new ID for potentially different saved layout
        >
          {/* Render Editor Panel */}
          {editorPanel}
          <PanelResizeHandle className="w-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 active:bg-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" />

          {/* Conditionally Render Config Panel for non-mobile */}
          {!isMobileView && configPanel}
          {!isMobileView && <PanelResizeHandle className="w-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 active:bg-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" />}

          {/* Render Preview Panel */}
          {previewPanel}

        </PanelGroup>
         {/* TODO: Implement a Drawer/Modal for config panel on mobile view */}
      </LiveProvider>
    </>
  );
}

// --- Helper Types/Declarations ---
interface Tabs { [key: string]: string; }
// declare var overrideOptions: any; // Avoid globals
