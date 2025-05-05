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
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels' // Import PanelResizeHandle

// --- ADJUST PATHS BELOW BASED ON YOUR ACTUAL PROJECT STRUCTURE ---
// Example: If utils is in src/utils, path might be ../../src/utils/twemoji
import { loadEmoji, getIconCode, apis } from '@/utils/twemoji' // Adjust path if needed
import Introduction from '@/components/introduction'         // Adjust path if needed
// We will use the PanelResizeHandle from react-resizable-panels directly
import { languageFontMap } from '@/utils/font'                 // Adjust path if needed
import playgroundTabs, { Tabs as PlaygroundTabsType } from '@/cards/playground-data' // Adjust path if needed, renamed Tabs import
import previewTabs from '@/cards/preview-tabs'                 // Adjust path if needed
// --- END PATH ADJUSTMENTS ---


// Ensure card data is correctly typed and initialized
const cardNames = Object.keys(playgroundTabs)
// Ensure playgroundTabs has a default export or handle appropriately
const editedCards: PlaygroundTabsType = playgroundTabs ? { ...playgroundTabs } : {}; // Add fallback if playgroundTabs might be undefined


// --- Font and Asset Loading ---
async function init(): Promise<any[]> { // Explicitly return Promise<any[]> or specific font type array
  // --- VERIFY THESE PATHS --- are the fonts in `/public/` or `/public/fonts/`?
  const fontPaths = [
    '/inter-latin-ext-400-normal.woff', // Assumes file is in /public/inter-latin-ext-400-normal.woff
    '/inter-latin-ext-700-normal.woff', // Assumes file is in /public/inter-latin-ext-700-normal.woff
    '/material-icons-base-400-normal.woff', // Assumes file is in /public/material-icons-base-400-normal.woff
  ];
  // Example if in /public/fonts/: const fontPaths = ['/fonts/inter-latin-ext-400-normal.woff', ...];

  if (typeof window === 'undefined') return []

  try {
    const results = await Promise.allSettled([ // Use allSettled to catch individual errors
        fetch(fontPaths[0]).then(res => res.ok ? res.arrayBuffer() : Promise.reject(new Error(`Failed to fetch ${fontPaths[0]} (Status: ${res.status})`))),
        fetch(fontPaths[1]).then(res => res.ok ? res.arrayBuffer() : Promise.reject(new Error(`Failed to fetch ${fontPaths[1]} (Status: ${res.status})`))),
        fetch(fontPaths[2]).then(res => res.ok ? res.arrayBuffer() : Promise.reject(new Error(`Failed to fetch ${fontPaths[2]} (Status: ${res.status})`))),
        !globalThis.Intl || !globalThis.Intl.Segmenter
          ? createIntlSegmenterPolyfill(
              // Ensure this path is correct relative to where the script runs
              fetch(new URL('intl-segmenter-polyfill/dist/break_iterator.wasm', import.meta.url))
            ).catch(e => Promise.reject(new Error(`Failed to load IntlSegmenter polyfill: ${e.message}`))) // Catch polyfill error too
          : Promise.resolve(null),
      ]);

    // Process results
    const fontData: (ArrayBuffer | null)[] = [null, null, null];
    let segmenterPolyfill: any = null;
    let hasFontError = false;

    results.forEach((result, index) => {
        if (index < 3) { // Font fetches
            if (result.status === 'fulfilled') {
                fontData[index] = result.value;
            } else {
                console.error("Font loading error:", result.reason);
                // Only show toast on client-side
                if (typeof window !== 'undefined') {
                    toast.error(result.reason.message || `Failed to load font: ${fontPaths[index]}`);
                }
                hasFontError = true;
            }
        } else { // Segmenter polyfill
             if (result.status === 'fulfilled') {
                 segmenterPolyfill = result.value;
             } else {
                 console.error("Segmenter polyfill error:", result.reason);
                 if (typeof window !== 'undefined') {
                    toast.error(result.reason.message || 'Failed to load IntlSegmenter polyfill.');
                 }
             }
        }
    });

    // Assign Segmenter if loaded
    if (segmenterPolyfill) {
      globalThis.Intl = globalThis.Intl || {}
      //@ts-expect-error - Assigning to globalThis.Intl
      globalThis.Intl.Segmenter = segmenterPolyfill;
    }

    // Store loaded fonts in window.__resource (consider if this global is necessary or if state management is better)
    (window as any).__resource = [fontData[0], fontData[1], fontData[2], segmenterPolyfill];

    // Return font objects only if data is available
    const fonts = [];
    if (fontData[0]) fonts.push({ name: 'Inter', data: fontData[0], weight: 400, style: 'normal' });
    if (fontData[1]) fonts.push({ name: 'Inter', data: fontData[1], weight: 700, style: 'normal' });
    if (fontData[2]) fonts.push({ name: 'Material Icons', data: fontData[2], weight: 400, style: 'normal' });

    if (hasFontError && typeof window !== 'undefined') {
        // Commented out font error toast as user confirmed fonts are working
        // toast.error("Some fonts failed to load. Rendering might be affected.", { duration: 5000 });
    }

    return fonts;

  } catch (error: any) { // Catch potential errors in Promise.allSettled itself (unlikely)
    console.error("Error initializing resources:", error);
    if (typeof window !== 'undefined') {
        toast.error(`Initialization failed: ${error.message}`);
    }
    return []; // Return empty array on major failure
  }
}

// --- withCache ---
// Caches results of async functions based on string arguments
function withCache(fn: Function) {
  const cache = new Map()
  return async (...args: string[]) => {
    const key = args.join(':') // Simple key generation
    if (cache.has(key)) return cache.get(key)
    try {
        const result = await fn(...args)
        cache.set(key, result)
        return result
    } catch (error) {
        console.error("Caching function error:", error);
        throw error; // Re-throw error to be handled by caller
    }
  }
}

// --- loadDynamicAsset ---
// Loads fonts or emojis dynamically for Satori
type LanguageCode = keyof typeof languageFontMap | 'emoji'
const loadDynamicAsset = withCache(
  async (emojiType: keyof typeof apis, _code: string, text: string): Promise<any[] | string | undefined> => {
    if (_code === 'emoji') {
      try {
        // Ensure loadEmoji returns SVG string data
        const svgData: string = await loadEmoji(emojiType, getIconCode(text));
        // Encode SVG data to base64
        return `data:image/svg+xml;base64,${typeof window !== 'undefined' ? window.btoa(svgData) : Buffer.from(svgData).toString('base64')}`;
      } catch (error) {
        console.error(`Failed to load emoji (${emojiType}, ${text}):`, error);
        return undefined; // Return undefined on error
      }
    }

    // Font loading logic
    const codes = _code.split('|')
    const names = codes
      .map((code) => languageFontMap[code as keyof typeof languageFontMap])
      .filter(Boolean)
      .flat(); // Flatten in case a code maps to multiple font names

    if (names.length === 0) return []; // No known fonts for this code

    const params = new URLSearchParams()
    names.forEach(name => params.append('fonts', name));
    params.set('text', text)

    try {
      // --- IMPORTANT: Ensure this API route exists and works ---
      // It should return font data in the expected custom format
      const response = await fetch(`/api/satori/font?${params.toString()}`) // Use absolute path for API route
      // --- End API Route Check ---

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.arrayBuffer()
      const fonts: any[] = []

      // Decode the custom font format received from the API
      const decodeFontInfoFromArrayBuffer = (buffer: ArrayBuffer) => {
         let offset = 0;
         const bufferView = new DataView(buffer); // Use DataView for easier reading

         while (offset < buffer.byteLength) {
             if (offset + 1 > buffer.byteLength) break; // Bounds check: need 1 byte for length
             const languageCodeLength = bufferView.getUint8(offset);
             offset += 1;

             if (offset + languageCodeLength > buffer.byteLength) break; // Bounds check: need bytes for code
             const languageCodeBytes = new Uint8Array(buffer, offset, languageCodeLength);
             const languageCode = new TextDecoder().decode(languageCodeBytes); // Use TextDecoder for UTF-8
             offset += languageCodeLength;

             if (offset + 4 > buffer.byteLength) break; // Bounds check: need 4 bytes for length
             const fontDataLength = bufferView.getUint32(offset, false); // Read as Big Endian
             offset += 4;

             if (offset + fontDataLength > buffer.byteLength) break; // Bounds check: need bytes for data
             const fontData = buffer.slice(offset, offset + fontDataLength);
             offset += fontDataLength;

             fonts.push({
                 name: `satori_${languageCode}_fallback_${text}`, // Consider a more robust naming scheme if collisions occur
                 data: fontData,
                 weight: 400, // Assuming default weight, might need adjustment based on API response
                 style: 'normal',// Assuming default style
                 lang: languageCode === 'unknown' ? undefined : languageCode,
             });
         }
      };

      decodeFontInfoFromArrayBuffer(data)
      return fonts

    } catch (e) {
      console.error(`Failed to load dynamic font for "${text}" (codes: ${codes.join(', ')}). Error:`, e)
      return []; // Return empty array on error
    }
  }
)

// --- Spinner SVG ---
const spinner = (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
    style={{ /* Styles defined in CSS */ }} // Remove inline styles if handled by CSS
    // Add className if needed for CSS targeting
    className="loading-spinner"
  >
    <path d='M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z'>
      <animateTransform
        attributeName='transform'
        type='rotate'
        dur='0.75s'
        values='0 12 12;360 12 12'
        repeatCount='indefinite'
      />
    </path>
  </svg>
);

// --- Resvg Worker Initialization ---
// Initializes a web worker for PNG/PDF rendering.
function initResvgWorker(): ((msg: object) => Promise<string>) | undefined {
  if (typeof window === 'undefined') return undefined; // Worker only in browser

  try {
    // --- VERIFY WORKER PATH --- Ensure this path is correct relative to the component's location or public serving setup
    const worker = new Worker(new URL('@/components/resvg_worker.ts', import.meta.url), { type: 'module' }); // Specify module type if needed

    const pending = new Map<number, { resolve: (value: string) => void; reject: (reason?: any) => void }>(); // Type the map

    worker.onmessage = (e: MessageEvent) => { // Type the event
      const { _id, url, error } = e.data;
      const promiseCallbacks = pending.get(_id);
      if (promiseCallbacks) {
        if (error) {
          promiseCallbacks.reject(new Error(error));
        } else {
          promiseCallbacks.resolve(url);
        }
        pending.delete(_id);
      }
    };

    worker.onerror = (e: ErrorEvent) => { // Type the error event
        console.error("Error in ResvgWorker:", e.message, e);
        // Reject all pending promises on worker error
        pending.forEach(p => p.reject(new Error("Worker error: " + e.message)));
        pending.clear();
    };

    // Return the function to communicate with the worker
    return async (msg: object): Promise<string> => {
      const _id = Math.random(); // Use a more robust ID if needed
      return new Promise((resolve, reject) => {
        pending.set(_id, { resolve, reject });
        worker.postMessage({ ...msg, _id });
      });
    };
  } catch (error) {
      console.error("Failed to initialize ResvgWorker:", error);
      if (typeof window !== 'undefined') {
        toast.error("PNG/PDF rendering might be unavailable.");
      }
      return undefined; // Return undefined on failure
  }
}

// Initialize fonts and worker on module load
const loadFonts = init();
const renderPNG = initResvgWorker();


// --- Tabs Component ---
// Renders a tabbed interface
interface ITabsProps {
  options: string[]; // Tab labels
  activeTab: string; // Currently active tab label
  onChange: (value: string) => void; // Callback when tab is changed
  children: React.ReactNode; // Content to display below tabs
}

function Tabs({ options, activeTab, onChange, children }: ITabsProps) {
  return (
    <div className='tabs'> {/* Use className from CSS */}
      <div className='tabs-container'> {/* Use className from CSS */}
        {options.map((option) => (
          <div
            title={option}
            // Apply 'active' class conditionally based on props
            className={`tab ${activeTab === option ? ' active' : ''}`}
            key={option}
            onClick={() => onChange(option)} // Call props.onChange
            role="tab" // Accessibility
            aria-selected={activeTab === option}
            tabIndex={0} // Make focusable
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChange(option); }} // Keyboard activation
          >
            {option}
          </div>
        ))}
      </div>
      {/* Render the content associated with the active tab */}
      {children}
    </div>
  );
}

// --- LiveEditor Component ---
// Wrapper around Monaco Editor integrated with React Live
function LiveEditor({ id, code, onCodeChange }: { id: string, code: string, onCodeChange: (newCode: string) => void }) {
  // Get React Live's onChange function from context to keep them in sync
  const { onChange: liveOnChange } = useContext(LiveContext) as any; // Cast context type if needed
  const monaco = useMonaco(); // Hook to get Monaco instance
  const editorRef = useRef<any>(null); // Ref for editor instance
  const containerRef = useRef<HTMLDivElement>(null); // Ref for container div to manage layout

  // Effect to set up Monaco editor theme
  useEffect(() => {
    if (monaco) {
      try {
        // Define theme only once or ensure it can be redefined safely
        monaco.editor.defineTheme('IDLE', {
            base: 'vs', // Base theme ('vs', 'vs-dark', 'hc-black', 'hc-light')
            inherit: true, // Inherit rules from base theme
            rules: [
              // Define syntax highlighting rules
              { token: 'comment', foreground: '919191', fontStyle: 'italic' },
              { token: 'keyword', foreground: 'ff5600', fontStyle: 'bold' },
              { token: 'number', foreground: '3b54bf' },
              { token: 'string', foreground: '00a33f' },
              { token: 'identifier', foreground: '21439c' },
              { token: 'type.identifier', foreground: '21439c' }, // Class names, types
              { token: 'delimiter', foreground: '999999' },
              { token: 'regexp', foreground: 'a535ae' },
              { token: 'operator', foreground: 'ff5600' },
              { token: 'tag', foreground: '21439c' }, // HTML/XML tags
              { token: 'attribute.name', foreground: 'ff5600' }, // HTML/XML attribute names
              { token: 'attribute.value', foreground: '00a33f' }, // HTML/XML attribute values
              { token: 'constant.language', foreground: 'a535ae' }, // true, false, null
              { token: 'support.function', foreground: 'a535ae' }, // Built-in functions
              { token: 'invalid', foreground: 'ffffff', background: 'ff0000' }, // Invalid code
            ],
            colors: {
              // Define editor UI colors
              'editor.foreground': '#333333', // Default text color
              'editor.background': '#FFFFFF', // Editor background
              'editorCursor.foreground': '#333333', // Cursor color
              'editor.lineHighlightBackground': '#00000012', // Current line highlight
              'editorLineNumber.foreground': '#aaaaaa', // Line numbers
              'editor.selectionBackground': '#BAD6FD', // Text selection background
              'editor.inactiveSelectionBackground': '#E0E0E0', // Inactive selection
              'editorWhitespace.foreground': '#BFBFBF', // Visible whitespace
              'editorIndentGuide.background': '#E0E0E0', // Indentation guides
              'editorIndentGuide.activeBackground': '#999999', // Active indentation guide
              'editorHoverWidget.background': '#F0F0F0', // Hover widget background
              'editorHoverWidget.border': '#CCCCCC', // Hover widget border
            },
        });
        monaco.editor.setTheme('IDLE');
      } catch (error: any) {
          // Catch potential "already defined" errors if effect runs multiple times
          if (error.message?.includes("already defined")) {
              // Theme already exists, just set it
              monaco.editor.setTheme('IDLE');
          } else {
             console.error("Monaco theme error:", error);
             if (typeof window !== 'undefined') toast.error("Failed to set editor theme.");
          }
      }
    }
  }, [monaco]); // Rerun only when monaco instance changes

   // Handle editor mount and resize using ResizeObserver
   useEffect(() => {
       const currentEditor = editorRef.current;
       const currentContainer = containerRef.current;
       let resizeObserver: ResizeObserver | null = null;

       if (currentContainer && currentEditor) {
           // Function to relayout editor based on container size
           const relayout = () => {
               const dimensions = currentContainer.getBoundingClientRect();
               currentEditor.layout({ width: dimensions.width, height: dimensions.height });
           };

           // Create and observe the container
           resizeObserver = new ResizeObserver(relayout);
           resizeObserver.observe(currentContainer);
           relayout(); // Initial layout calculation

           // Cleanup function to disconnect observer
           return () => {
               if (resizeObserver && currentContainer) {
                   resizeObserver.unobserve(currentContainer);
               }
           };
       }
       // Return undefined if observer wasn't created
       return undefined;
   }, [editorRef.current, containerRef.current]); // Rerun when editor instance or container ref changes

  // Callback for when editor content changes
  const handleEditorChange = (value: string | undefined) => {
    const newCode = value ?? '';
    onCodeChange(newCode); // Update parent component's state
    if (liveOnChange) {
        liveOnChange(newCode); // Update React Live's internal state
    }
  };

   // Callback for when editor is mounted
   const handleEditorDidMount = (editor: any, _monacoInstance: any) => {
       editorRef.current = editor; // Store editor instance in ref
       // Perform initial layout if container is already available
        if (containerRef.current) {
             const dimensions = containerRef.current.getBoundingClientRect();
             editor.layout({ width: dimensions.width, height: dimensions.height });
        }
   };

  return (
    // Container div for the editor, controls size and positioning
    <div ref={containerRef} className="monaco-editor-container" style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'relative' }}>
        <Editor
          // Ensure editor fills the container defined above
          // No explicit width/height props needed if container controls size
          theme='IDLE' // Use the custom theme defined
          language='javascript' // Set default language
          value={code} // Controlled component: value comes from props
          onChange={handleEditorChange} // Handle content changes
          onMount={handleEditorDidMount} // Handle editor mount
          options={{
            // Common editor options
            fontFamily: '"Fira Code", Consolas, "Courier New", monospace', // Use a coding font with ligatures
            fontSize: 14,
            wordWrap: 'on', // Wrap long lines
            tabSize: 2, // Use 2 spaces for tabs
            minimap: { enabled: false }, // Disable minimap
            smoothScrolling: true, // Enable smooth scrolling
            cursorSmoothCaretAnimation: 'on', // Animate cursor movement
            contextmenu: false, // Disable default context menu
            automaticLayout: false, // IMPORTANT: Disable Monaco's built-in auto layout, use ResizeObserver instead
            scrollBeyondLastLine: false, // Don't allow scrolling past the last line
            renderLineHighlight: 'gutter', // Highlight current line in the gutter
            readOnly: false, // Editor is editable
            lineNumbers: 'on', // Show line numbers
            roundedSelection: false, // Use square selection corners
            overviewRulerLanes: 2, // Reduce lanes in overview ruler
            occurrencesHighlight: 'off', // Disable highlighting occurrences
            renderWhitespace: "boundary", // Show only trailing whitespace
            scrollbar: {
                // Customize scrollbar appearance
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                vertical: 'auto',
                horizontal: 'auto'
            },
          }}
        />
    </div>
  );
}


// --- LiveSatori Preview Component ---
// Renders the preview (SVG, PNG, PDF, HTML) based on live code
const LiveSatori = withLive(function LiveSatoriInner({
  live, // Provided by withLive HOC: { element, error }
  width, height, debug, fontEmbed, emojiType, renderType, // Config props from parent
  onOptionsChange // Callback to notify parent of options used for render
}: {
  live?: { element?: React.ComponentType<any>; error?: string }; // Make live optional
  width: number; height: number; debug: boolean; fontEmbed: boolean;
  emojiType: string; renderType: string;
  onOptionsChange: (options: any) => void;
}) {

  // State for Satori configuration (fonts)
  const [satoriOptions, setSatoriOptions] = useState<{ fonts: any[] } | null>(null); // Initialize with null
  // State for generated output URLs (PNG, PDF)
  const [objectURL, setObjectURL] = useState<string>('');
  // State for rendering errors
  const [renderError, setRenderError] = useState<string | null>(null);
  // State for loading status (initial font load)
  const [loadingResources, setLoadingResources] = useState(true);
  // State for tracking render time
  const [renderedTimeSpent, setRenderTime] = useState<number>(0);
  // State for the raw generated SVG string
  const [resultSVG, setResultSVG] = useState('');

  // Ref for the preview container div (to calculate scaling)
  const previewContainerRef = useRef<HTMLDivElement>(null);
  // State for the calculated scale ratio for the preview
  const [scaleRatio, setScaleRatio] = useState(1);
  // Ref for the HTML preview iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // State to hold the body element of the iframe for React Portal
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  // --- Effect: Load Initial Fonts ---
  useEffect(() => {
    let isMounted = true;
    setLoadingResources(true);
    // `loadFonts` is the promise returned by the `init()` call
    loadFonts.then(fonts => {
      if (isMounted) {
        if (fonts && fonts.length > 0) {
          setSatoriOptions({ fonts }); // Set fonts if loaded successfully
        } else {
          // Handle case where font loading failed in init()
          console.warn("Initial fonts not loaded or empty. Satori might use defaults or fail.");
          setSatoriOptions({ fonts: [] }); // Set empty fonts array
          // Optionally set a render error here if fonts are critical
          // setRenderError("Critical fonts failed to load.");
        }
      }
    }).catch(error => { // Catch errors from the init() promise itself
        console.error("Failed to resolve fonts promise:", error);
        if (isMounted) setRenderError("Error loading initial font data.");
    }).finally(() => {
        // Ensure loading state is turned off regardless of success/failure
        if (isMounted) setLoadingResources(false);
    });

    // Cleanup function to prevent state updates on unmounted component
    return () => { isMounted = false; };
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Callback and Effect: Calculate Preview Scale Ratio ---
  const updateScaleRatio = useCallback(() => {
    if (!previewContainerRef.current || width <= 0 || height <= 0) return; // Guard against invalid dimensions
    const container = previewContainerRef.current;
    // Use clientWidth/Height which accounts for padding
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    // Calculate scale based on passed width/height props
    const scale = Math.min(1, // Max scale is 1
        containerWidth / width,
        containerHeight / height
    );
    setScaleRatio(scale);
  }, [width, height]); // Recalculate when target dimensions change

  // Effect to run scaling calculation on mount and container resize
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    // Create observer
    const observer = new ResizeObserver(updateScaleRatio);
    observer.observe(container);
    updateScaleRatio(); // Initial calculation after mount

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, [updateScaleRatio]); // Rerun if updateScaleRatio function changes


  // --- Effect: Satori Rendering Logic ---
  useEffect(() => {
    let cancelled = false; // Flag to prevent state updates after cancellation

    const performRender = async () => {
        // Guard: Ensure live element and satori options (fonts) are ready
        if (!live?.element || satoriOptions === null) {
            setResultSVG(''); // Clear previous results if prerequisites aren't met
            setRenderError(null); // Clear previous errors
            return;
        }

        // Optional debounce for PNG rendering to reduce calls during rapid changes
        if (renderType === 'png') {
            await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
            if (cancelled) return; // Check cancellation after delay
        }

        const startTime = performance.now();
        setRenderError(null); // Clear previous errors before starting new render
        let currentResultSVG = '';
        let currentObjectURL = ''; // URL specific to this render operation
        let elementInputForSatori: React.ReactElement | null = null; // Variable to hold the element

        try {
            // --- Render SVG, PNG, PDF ---
            if (renderType !== 'html') {

                // --- *** DIAGNOSTIC STEP: Try prototype.render() approach *** ---
                let renderAttemptSuccessful = false;
                if (typeof live.element === 'function' && live.element.prototype && typeof live.element.prototype.render === 'function') {
                    // Looks like a class component constructor - try the non-standard approach
                    console.warn("Attempting non-standard satori render using prototype.render()");
                    try {
                        // Satori expects a React element. The result of prototype.render() might be one.
                        const renderOutput = new (live.element as any)({}).render(); // Instantiate and call render - VERY RISKY
                        if (React.isValidElement(renderOutput)) {
                            elementInputForSatori = renderOutput;
                             console.log("Using output of prototype.render() for Satori.");
                             renderAttemptSuccessful = true;
                        } else {
                            console.warn("prototype.render() did not return a valid React element. Falling back.");
                        }
                    } catch (protoRenderError) {
                         console.error("Error attempting prototype.render():", protoRenderError, "Falling back to standard method.");
                    }
                }

                // --- Standard Approach (Fallback or if not class-like) ---
                if (!renderAttemptSuccessful) {
                    console.log("Using standard React.createElement for Satori.");
                    elementInputForSatori = React.isValidElement(live.element)
                        ? live.element
                        : React.createElement(live.element); // Create element if it's a component type
                }

                // Final validation before calling Satori
                if (!React.isValidElement(elementInputForSatori)) {
                     throw new Error("Invalid or null React element prepared for Satori rendering.");
                }
                 console.log("Element being passed to Satori:", elementInputForSatori);
                // --- *** END DIAGNOSTIC STEP *** ---


                // --- Call Satori ---
                currentResultSVG = await satori(
                    elementInputForSatori, // Use the prepared element
                    {
                        ...(satoriOptions as any), // Spread loaded font options
                        // Pass configuration props
                        embedFont: fontEmbed,
                        width, height, debug,
                        // Provide the dynamic asset loader
                        loadAdditionalAsset: (code: string, text: string) =>
                            loadDynamicAsset(emojiType as keyof typeof apis, code, text),
                    }
                );
                // --- Error Check Point: "props" read-only error occurs inside satori() call ---

                 if (cancelled) return; // Check cancellation after async satori call
                 setResultSVG(currentResultSVG); // Update SVG state

                // --- Generate PNG (if applicable and worker available) ---
                if (renderType === 'png' && renderPNG) {
                    currentObjectURL = await renderPNG({ svg: currentResultSVG, width });
                    if (cancelled) return; // Check cancellation after async PNG render
                    // Revoke previous URL before setting new one
                    setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return currentObjectURL; });

                    // Optional: Background render higher-res PNG
                    if (width * height <= 1_440_000) { // Example size limit
                        setTimeout(async () => {
                            if (cancelled) return; // Check before starting hi-res
                            try {
                                const highResUrl = await renderPNG({ svg: currentResultSVG, width: width * 2 });
                                if (!cancelled) { // Check again before state update
                                    // Revoke previous (1x or old hi-res) URL before setting new one
                                    setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return highResUrl; });
                                } else {
                                    URL.revokeObjectURL(highResUrl); // Clean up if cancelled during hi-res render
                                }
                            } catch(pngError) {
                                console.error("Error rendering high-res PNG:", pngError);
                                // Keep the 1x URL if hi-res fails
                            }
                        }, 50); // Slightly longer delay for background task
                    }
                }
                // --- Generate PDF (if applicable) ---
                else if (renderType === 'pdf') {
                    const doc = new PDFDocument({ compress: false, size: [width, height], margin: 0 });
                    const stream = doc.pipe(blobStream());
                    // Ensure SVGtoPDF is correctly imported and used
                    SVGtoPDF(doc, currentResultSVG, 0, 0, { width, height, preserveAspectRatio: `xMidYMid meet` });
                    doc.end();

                    // Wait for blob stream to finish
                    currentObjectURL = await new Promise<string>((resolve, reject) => {
                        stream.on('finish', () => {
                            try {
                                const blob = stream.toBlob('application/pdf');
                                resolve(URL.createObjectURL(blob));
                            } catch (blobError) {
                                reject(blobError);
                            }
                        });
                        stream.on('error', reject); // Handle stream errors
                    });

                    if (cancelled) { // Check cancellation after PDF generation
                         URL.revokeObjectURL(currentObjectURL); // Clean up if cancelled
                         return;
                    }
                     // Revoke previous URL before setting new one
                    setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return currentObjectURL; });
                } else {
                    // If switching away from PNG/PDF, revoke old URL
                    setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; });
                }
            }
            // --- Handle HTML Preview ---
            else {
                 // Render type is HTML - clear SVG/Object URLs
                 setResultSVG('');
                 setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; });
                 // HTML rendering happens via portal in the return statement
            }

        } catch (e: any) {
            // --- Error Handling ---
            // Add more detailed logging when the specific error occurs
            if (e.message?.includes('"props" is read-only') || e.message?.includes('Cannot assign to read only property')) {
                console.error("Satori 'props' error details:", {
                    message: e.message,
                    elementType: typeof live?.element,
                    isElementValid: React.isValidElement(elementInputForSatori), // Log the element we tried to pass
                    elementDetails: elementInputForSatori, // Log the element structure
                    satoriOptions: satoriOptions, // Log options passed
                    stack: e.stack
                });
                let errorMsg = 'Error in component code: Cannot modify "props". Use state for mutable values.';
                if(typeof window !== 'undefined') toast.error(errorMsg, { duration: 6000 });
                setRenderError(errorMsg); // Set user-friendly error
            } else {
                // Handle other errors
                console.error("Satori rendering error:", e);
                let errorMsg = e.message || 'An unknown rendering error occurred.';
                 if (errorMsg.includes("Failed to fetch") && errorMsg.includes("/api/satori/font")) {
                    errorMsg = 'Error: Failed to load dynamic font from API. Check API route.';
                     if(typeof window !== 'undefined') toast.error(errorMsg, { duration: 6000 });
                }
                setRenderError(errorMsg);
            }

            // Common cleanup on any error
            if (!cancelled) {
                setResultSVG(''); // Clear SVG on error
                setObjectURL(prev => { if (prev) URL.revokeObjectURL(prev); return ''; }); // Clean up URL
            }
        } finally {
            // --- Final Updates (if not cancelled) ---
            if (!cancelled) {
                const endTime = performance.now();
                setRenderTime(endTime - startTime);
                // Notify parent of the options used for this successful/failed render attempt
                onOptionsChange({ width, height, debug, emojiType, fontEmbed });
            }
        }
    };

    performRender(); // Execute the rendering logic

    // --- Cleanup Function ---
    return () => {
      cancelled = true; // Set cancellation flag
      // Revoke any existing object URL when effect re-runs or component unmounts
      setObjectURL(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return '';
      });
    };
  }, [
    // Dependencies: Rerun effect if any of these change
    live?.element, // The component code being rendered
    satoriOptions,   // Base options (fonts)
    width, height, debug, emojiType, fontEmbed, renderType, // Configuration props
    onOptionsChange // Callback to parent (should be stable if wrapped in useCallback)
  ]);

  // --- Callback Ref for Iframe Setup (HTML Preview) ---
  const setupIframe = useCallback((node: HTMLIFrameElement | null) => {
    // Check if node exists and its document is ready
    if (node?.contentWindow?.document?.body) {
        const doc = node.contentWindow.document;

        // Ensure clean slate: Remove old styles/scripts/body content
        doc.head.innerHTML = '';
        doc.body.innerHTML = '';
        doc.body.style.margin = '0'; // Reset body margin

        // Basic styles for HTML preview isolation
        const style = doc.createElement('style');
        style.textContent = `
            /* Import fonts used in preview if needed */
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Material+Icons');
            html { height: 100%; box-sizing: border-box; }
            *, *::before, *::after { box-sizing: inherit; }
            body {
                display: flex; /* Use flex to center content */
                height: 100%;
                margin: 0;
                font-family: Inter, sans-serif; /* Default font */
                overflow: hidden; /* Prevent iframe scrollbars */
                justify-content: center; /* Center horizontally */
                align-items: center; /* Center vertically */
                background-color: #f0f0f0; /* Light background for contrast */
            }
            /* Style the root element rendered by React if needed */
            body > div {
               border: 1px dashed #ccc; /* Optional: visualize component bounds */
               background-color: white; /* White background for component */
               padding: 10px; /* Add padding */
               max-width: 100%; /* Ensure component doesn't overflow iframe */
               max-height: 100%;
               overflow: auto; /* Allow scrolling within component if needed */
            }
        `;
        doc.head.appendChild(style);

        // Add Tailwind CSS script if Satori components rely on it for HTML preview
        // const twScript = doc.createElement('script');
        // twScript.src = 'https://cdn.tailwindcss.com';
        // twScript.onload = () => { /* Initialize Tailwind config if needed */ };
        // doc.head.appendChild(twScript);

        // Create and append the mount point for the React Portal
        const mountPoint = doc.createElement('div');
        mountPoint.id = 'react-root'; // ID for potential styling/selection
        doc.body.appendChild(mountPoint);

        // Set the state to the mount point, triggering portal render
        setIframeBody(mountPoint);
    } else {
        // If iframe is removed or not ready, clear the body state
        setIframeBody(null);
    }
  }, []); // Empty dependency array: setup logic doesn't depend on external state/props


  // --- Render the Preview Card ---
  return (
    <div className='preview-card'> {/* Use className from CSS */}
      {/* Display Error Messages */}
      {(live?.error || renderError) && (
        <div className='error'> {/* Use className from CSS */}
          <pre>{live?.error || renderError}</pre>
        </div>
      )}

      {/* Display Loading Spinner */}
      {loadingResources && spinner}

      {/* Main Preview Area */}
      <div className='result-container' ref={previewContainerRef}> {/* Use className from CSS */}
        {/* Conditional rendering based on renderType */}

        {/* SVG Preview */}
        {renderType === 'svg' && resultSVG && !loadingResources && !renderError && (
          <div
            className="content-wrapper svg-wrapper" // Use className from CSS
            style={{
                width: `${width}px`, // Explicit size for scaling container
                height: `${height}px`,
                transform: `scale(${scaleRatio})`, // Apply calculated scale
                transformOrigin: 'center center', // Scale from center
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            // Render SVG string directly
            dangerouslySetInnerHTML={{ __html: resultSVG }}
          />
        )}

        {/* PNG Preview */}
        {renderType === 'png' && objectURL && !loadingResources && !renderError && (
          <img
            src={objectURL} // Use generated blob URL
            // Set explicit width/height for layout calculation before scaling
            width={width}
            height={height}
            style={{
              transform: `scale(${scaleRatio})`, // Apply scale
              transformOrigin: 'center center',
              // Ensure image fits within container if needed, even after scaling
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain', // Scale image while preserving aspect ratio
            }}
            alt='PNG Preview'
          />
        )}

        {/* PDF Preview */}
        {renderType === 'pdf' && objectURL && !loadingResources && !renderError && (
          <iframe
            key='pdf-preview' // Add key for potential re-renders
            title="PDF Preview"
            // Set explicit width/height for layout calculation before scaling
            width={width}
            height={height}
            src={`${objectURL}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} // Params to hide controls and fit horizontally
            style={{
              transform: `scale(${scaleRatio})`, // Apply scale
              transformOrigin: 'center center',
              border: 'none', // Remove iframe border
              // Ensure iframe fits within container
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        )}

        {/* HTML Preview */}
        {renderType === 'html' && !loadingResources && !live?.error && (
           <iframe
             ref={setupIframe} // Attach the setup callback ref
             key='html-preview' // Add key
             title="HTML Preview"
             // Set explicit width/height for layout calculation before scaling
             width={width}
             height={height}
             style={{
               transform: `scale(${scaleRatio})`, // Apply scale
               transformOrigin: 'center center',
               border: '1px solid #ccc', // Add a border for visibility
               backgroundColor: 'white', // Ensure white background
               maxWidth: '100%', // Allow shrinking
               maxHeight: '100%',// Allow shrinking
             }}
             // Sandbox attribute for security (adjust permissions as needed)
             // sandbox="allow-scripts allow-same-origin"
             // Ensure setup runs on load/reload
             onLoad={(e) => setupIframe(e.currentTarget)}
           >
             {/* React Portal: Render live element into the iframe's body */}
             {iframeBody && live?.element && createPortal(
               // Render the live element provided by react-live
               React.isValidElement(live.element) ? live.element : React.createElement(live.element),
               iframeBody // Target the mount point inside the iframe
             )}
           </iframe>
        )}
      </div>

      {/* Footer with Render Info and Links */}
      <footer> {/* Use className from CSS */}
        <span className='ellipsis'> {/* Use className from CSS */}
          {renderType === 'html'
            ? '[HTML Preview]'
            : `[${renderType.toUpperCase()}] ${renderedTimeSpent > 0 ? `Generated in ${~~(renderedTimeSpent * 100) / 100}ms` : (loadingResources ? 'Loading...' : '...')}`
          }
        </span>
        {/* Download links */}
        {(renderType === 'png' || renderType === 'pdf') && objectURL && (
          <a href={objectURL} target='_blank' rel='noreferrer' download={`preview.${renderType}`}>
            (Download ↗)
          </a>
        )}
         {renderType === 'svg' && resultSVG && (
             <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(resultSVG)}`} target='_blank' rel='noreferrer' download="preview.svg">
                (Download SVG ↗)
             </a>
        )}
        {/* Display dimensions */}
        <span>{`[${width}×${height}]`}</span>
      </footer>
    </div>
  );
});


// --- Reset Code Button ---
// Resets the code in the editor to the default for the active card
function ResetCode({ activeCard, onReset }: { activeCard: string, onReset: (code: string) => void }) {
  // Get react-live's onChange to update its context
  const { onChange: liveOnChange } = useContext(LiveContext) as any;

  // Effect to handle loading shared code from URL on initial mount
  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const shared = params.get('share');
    if (shared) {
      try {
        // Decompress and parse shared data
        const decompressedData = fflate.strFromU8(
          fflate.decompressSync(Base64.toUint8Array(shared))
        );
        const decoded = JSON.parse(decompressedData);

        // Validate decoded data structure
        if (decoded && typeof decoded.code === 'string') {
            const tabToUpdate = decoded.tab || 'helloworld'; // Default tab

            // Update the specific card's code in memory (editedCards)
            if (editedCards[tabToUpdate] !== undefined) {
                 editedCards[tabToUpdate] = decoded.code;

                 // If this is the currently active card, trigger state updates
                 if(tabToUpdate === activeCard) {
                     onReset(decoded.code); // Update parent component's state
                     if (liveOnChange) liveOnChange(decoded.code); // Update react-live context
                 }

                 // Update overrideOptions (used by LiveSatori's useEffect)
                 // WARNING: Using global variable `overrideOptions` is risky.
                 // Prefer passing options via state/props if possible.
                 // Ensure overrideOptions is declared if used globally
                 declare var overrideOptions: any; // Or handle state properly
                 overrideOptions = decoded.options || {};

                 toast.success('Loaded shared code.');
            } else {
                 toast.error(`Invalid shared tab: ${tabToUpdate}`);
            }
            // Clean the URL after processing
            window.history.replaceState(null, '', window.location.pathname);
        } else {
             toast.error('Invalid shared data format.');
             window.history.replaceState(null, '', window.location.pathname);
        }

      } catch (e) {
        console.error('Failed to parse shared card:', e);
        toast.error('Could not load shared code.');
        window.history.replaceState(null, '', window.location.pathname); // Clean URL on error
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Handler for the reset button click
  const handleResetClick = () => {
    // Get default code, handle potential undefined card
    const defaultCode = playgroundTabs[activeCard] ?? '';
    editedCards[activeCard] = defaultCode; // Reset in-memory store
    onReset(defaultCode); // Update parent component's state
    if (liveOnChange) liveOnChange(defaultCode); // Update react-live context
    window.history.replaceState(null, '', window.location.pathname); // Clean URL params
    toast.success('Content reset to default.');
  };

  return (
    <button onClick={handleResetClick} className="reset-button"> {/* Add className if needed */}
      Reset
    </button>
  );
}

// --- Main Playground Component (SatoriClient) ---
// Orchestrates the entire playground UI
export default function SatoriClient() {
  // --- State Declarations ---
  // Active editor tab/card name
  const [activeCard, setActiveCard] = useState<string>('helloworld');
  // Current code content in the editor (synced with editedCards)
  const [currentCode, setCurrentCode] = useState<string>(editedCards[activeCard] ?? ''); // Fallback for undefined card
  // Visibility of the introduction modal
  const [showIntroduction, setShowIntroduction] = useState(false);
  // Flag for mobile view layout adjustments
  const [isMobileView, setIsMobileView] = useState(false);
  // Flag to prevent rendering until client-side hydration is complete
  const [hydrated, setHydrated] = useState(false);
  // Configuration state for Satori rendering (size, debug, etc.)
  const [satoriConfig, setSatoriConfig] = useState({
      width: 800,
      height: 400,
      debug: false,
      fontEmbed: true,
      emojiType: 'twemoji',
  });
  // Active preview render type (svg, png, pdf, html)
  const [renderType, setRenderType] = useState('svg');
  // Ref to store the latest options successfully used by LiveSatori (for sharing)
  const latestSatoriOptionsRef = useRef({});

  // --- Effects ---
  // Set hydration flag on mount
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Detect mobile view based on window width
  useEffect(() => {
    // Ensure window exists before adding listener
    if (typeof window === 'undefined') return;

    const checkMobile = () => setIsMobileView(window.innerWidth < 768); // Adjust breakpoint as needed
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show introduction modal on first visit (using localStorage)
  useEffect(() => {
    // Ensure localStorage exists
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      if (!localStorage.getItem('_vercel_og_playground_visited')) {
        setShowIntroduction(true);
      }
    } catch (e) { console.error("localStorage access error:", e); }
  }, []);

  // Update editor code when the active card (tab) changes
  useEffect(() => {
    setCurrentCode(editedCards[activeCard] ?? ''); // Update state, handle undefined card
  }, [activeCard]);

  // --- Handlers ---
  // Update code state and in-memory store when editor changes
  const handleCodeChange = (newCode: string) => {
    editedCards[activeCard] = newCode; // Update in-memory store for persistence across tabs
    setCurrentCode(newCode); // Update state for controlled editor component
  };

  // Update code state when reset button is clicked
  const handleReset = (resetCode: string) => {
      setCurrentCode(resetCode);
  };

  // Change the active editor card/tab
  const handleTabChange = (newTab: string) => {
    setActiveCard(newTab);
    // Corresponding code update is handled by the useEffect watching activeCard
  };

  // Generate and copy share URL
  const handleShare = () => {
    if (typeof window === 'undefined') return; // Ensure window context
    try {
        const codeToShare = editedCards[activeCard] ?? ''; // Get current code
        const optionsToShare = latestSatoriOptionsRef.current; // Get latest options used by preview
        const dataToCompress = JSON.stringify({
            code: codeToShare,
            options: optionsToShare,
            tab: activeCard,
        });
        // Compress data using fflate and encode as URL-safe Base64
        const compressed = Base64.fromUint8Array(
            fflate.deflateSync(fflate.strToU8(dataToCompress)),
            true // URL-safe flag
        );
        // Construct share URL
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${compressed}`;
        copy(shareUrl); // Copy to clipboard
        window.history.replaceState(null, '', `?share=${compressed}`); // Update URL temporarily (optional)
        toast.success('Share URL copied to clipboard!');
    } catch (error) {
        console.error("Sharing error:", error);
        toast.error("Could not generate share link.");
    }
  };

  // Update Satori configuration state
  const handleConfigChange = (key: keyof typeof satoriConfig, value: any) => {
    setSatoriConfig(prev => ({ ...prev, [key]: value }));
  };

  // Callback for LiveSatori to update the latest used options (for sharing)
  const handleSatoriOptionsUpdate = useCallback((options: any) => {
      latestSatoriOptionsRef.current = options;
  }, []); // Empty dependency array: function doesn't depend on state/props


  // --- Render ---
  // Avoid rendering during SSR or before hydration is complete
  if (!hydrated) {
    return null; // Or return a loading indicator/skeleton screen
  }

  // --- Define Panel Content BEFORE returning JSX ---

  // Calculate preview tab options and active tab *before* defining previewPanel
  const previewTabOptions = previewTabs.map(t => `${t.split(' ')[0].toUpperCase()} Preview`);
  const activePreviewTab = `${renderType.toUpperCase()} Preview`;

  // Define panel components for clarity
  const editorPanel = (
    <Panel id="editor" defaultSize={isMobileView ? 50 : 40} minSize={20}>
      {/* Editor Tabs (File selection) */}
      <Tabs options={cardNames} activeTab={activeCard} onChange={handleTabChange}>
        {/* Editor Content Area */}
        <div className='editor'> {/* Use className from CSS */}
          <div className='editor-controls'> {/* Use className from CSS */}
            <ResetCode activeCard={activeCard} onReset={handleReset}/>
            <button onClick={handleShare}>Share</button>
          </div>
          {/* Monaco Editor Component */}
          <LiveEditor
              key={activeCard} // Re-mount editor when card changes to reset internal state if needed
              id={activeCard}
              code={currentCode} // Pass current code state
              onCodeChange={handleCodeChange} // Pass change handler
          />
        </div>
      </Tabs>
    </Panel>
  );

  const previewPanel = (
    <Panel id="preview" defaultSize={isMobileView ? 50 : 40} minSize={20}>
       {/* Preview Type Tabs (SVG, PNG, PDF, HTML) */}
       {/* Use the calculated variables */}
       <Tabs options={previewTabOptions} activeTab={activePreviewTab} onChange={(text) => setRenderType(text.split(' ')[0].toLowerCase())}>
          {/* Live Satori Preview Component */}
          <LiveSatori
              // Pass necessary configuration props down
              width={satoriConfig.width}
              height={satoriConfig.height}
              debug={satoriConfig.debug}
              fontEmbed={satoriConfig.fontEmbed}
              emojiType={satoriConfig.emojiType}
              renderType={renderType}
              onOptionsChange={handleSatoriOptionsUpdate} // Pass callback to get latest options
              // `live` prop is implicitly provided by the `withLive` HOC via LiveProvider context
          />
       </Tabs>
    </Panel>
  );

   // Configuration Panel (shown on non-mobile)
   const configPanel = (
       <Panel id="config" defaultSize={20} minSize={15} maxSize={35} collapsible={true}>
          <div className='controller'> {/* Use className from CSS */}
             <h2 className='title'>Configurations</h2> {/* Use className from CSS */}
             <div className='content'> {/* Use className from CSS */}
                {/* Width Control */}
                <div className='control'> {/* Use className from CSS */}
                   <label htmlFor='config-width'>Width</label> {/* Use unique id */}
                   <div>
                      <input type='range' id='config-width-range' value={satoriConfig.width} onChange={(e) => handleConfigChange('width', Number(e.target.value))} min={100} max={2000} step={10} aria-labelledby='config-width-label'/>
                      <input id='config-width' type='number' value={satoriConfig.width} onChange={(e) => handleConfigChange('width', Number(e.target.value))} min={100} max={2000} step={1} aria-labelledby='config-width-label'/> px
                   </div>
                </div>
                {/* Height Control */}
                <div className='control'>
                   <label htmlFor='config-height'>Height</label>
                   <div>
                      <input type='range' id='config-height-range' value={satoriConfig.height} onChange={(e) => handleConfigChange('height', Number(e.target.value))} min={100} max={2000} step={10} aria-labelledby='config-height-label'/>
                      <input id='config-height' type='number' value={satoriConfig.height} onChange={(e) => handleConfigChange('height', Number(e.target.value))} min={100} max={2000} step={1} aria-labelledby='config-height-label'/> px
                   </div>
                </div>
                 {/* Size Presets */}
                <div className='control'>
                    <label id='size-presets-label'>Size Presets</label>
                    <div role="group" aria-labelledby="size-presets-label">
                        <button onClick={() => { handleConfigChange('width', 800); handleConfigChange('height', 400); }}>Default (800x400)</button>
                        <button onClick={() => { handleConfigChange('width', 1200); handleConfigChange('height', 630); }}>OG (1200x630)</button>
                        <button onClick={() => { handleConfigChange('width', 1080); handleConfigChange('height', 1080); }}>Square (1080x1080)</button>
                    </div>
                </div>
                {/* Debug Mode */}
                <div className='control'>
                   <label htmlFor='config-debug'>Debug Mode</label>
                   <input id='config-debug' type='checkbox' checked={satoriConfig.debug} onChange={(e) => handleConfigChange('debug', e.target.checked)} />
                </div>
                {/* Embed Font */}
                <div className='control'>
                   <label htmlFor='config-font'>Embed Font</label>
                   <input id='config-font' type='checkbox' checked={satoriConfig.fontEmbed} onChange={(e) => handleConfigChange('fontEmbed', e.target.checked)} />
                </div>
                {/* Emoji Provider */}
                <div className='control'>
                   <label htmlFor='config-emoji'>Emoji Provider</label>
                   <select id='config-emoji' value={satoriConfig.emojiType} onChange={(e) => handleConfigChange('emojiType', e.target.value)}>
                      <option value='twemoji'>Twemoji</option>
                      <option value='fluent'>Fluent Emoji</option>
                      <option value='fluentFlat'>Fluent Emoji Flat</option>
                      <option value='noto'>Noto Emoji</option>
                      <option value='blobmoji'>Blobmoji</option>
                      <option value='openmoji'>OpenMoji</option>
                   </select>
                </div>
                 {/* Satori Version (Display Only) */}
                 <div className='control'>
                     <label>Satori Version</label>
                     <a href='https://github.com/vercel/satori' target='_blank' rel='noreferrer'>
                         {packageJson.version}
                     </a>
                 </div>
             </div>
          </div>
       </Panel>
   );


  // --- Final Render Structure ---
  return (
    // Root fragment
    <>
      {/* Introduction Modal (conditionally rendered) */}
      {showIntroduction && (
        <Introduction
          onClose={() => {
            setShowIntroduction(false);
            try { localStorage.setItem('_vercel_og_playground_visited', '1'); } catch (e) {}
          }}
        />
      )}
      {/* Toast Notifications Container */}
      <Toaster position="bottom-right" toastOptions={{ className: 'satori-toast', duration: 4000 }} />

      {/* React Live Provider: Wraps components using its context (Editor, Preview) */}
      {/* Pass current code state to LiveProvider */}
      <LiveProvider code={currentCode} enableTypeScript={false} /* Set to true if using TSX in editor */ >
        {/* Resizable Panel Layout */}
        <PanelGroup
          direction={isMobileView ? 'vertical' : 'horizontal'} // Adjust direction based on view
          className="satori-panel-group" // Apply CSS class for styling
          autoSaveId="satori-playground-panels" // Persist panel sizes in localStorage
        >
          {/* Render Editor Panel */}
          {editorPanel}
          {/* Resize Handle */}
          <PanelResizeHandle className="satori-resize-handle" />
          {/* Render Preview Panel */}
          {previewPanel}
          {/* Conditionally Render Config Panel for non-mobile */}
          {!isMobileView && (
              <>
                <PanelResizeHandle className="satori-resize-handle" />
                {configPanel}
              </>
          )}
        </PanelGroup>
         {/* TODO: Consider a Drawer or Modal for config panel on mobile view */}
         {/* {isMobileView && <ConfigDrawerOrModal config={satoriConfig} onChange={handleConfigChange} />} */}
      </LiveProvider>
    </>
  );
}

// Helper type for editedCards state (assuming playgroundTabs structure)
// Replace with actual type if available
interface Tabs {
    [key: string]: string;
}

// Declare global variable if used (better to avoid globals)
declare var overrideOptions: any;
