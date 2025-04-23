"use client"; // Add this directive at the very top


import React, {
  useEffect,
  useState,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { loadScript } from './loadScript';
import type {
  Editor,
  EditorRef,
  EmailEditorProps,
  UnlayerOptions,
} from './types';



// Adjust path as needed to your loadScript utility
// Removed: package.json import is no longer needed

// Augment the Window interface for TypeScript
declare global {
  interface Window {
    unlayer?: {
      createEditor: (options: UnlayerOptions) => Editor;
      init: (options: UnlayerOptions) => void; // If using init mode
      [key: string]: any;
    };
    __unlayer_lastEditorId?: number;
  }
}

// Helper to safely access window properties, useful for SSR
const safeWindow = typeof window === 'undefined' ? null : window;

// Initialize the editor ID counter on the window object if it doesn't exist
if (safeWindow && typeof safeWindow.__unlayer_lastEditorId === 'undefined') {
  safeWindow.__unlayer_lastEditorId = 0;
}

// --- The EmailEditor Component ---


export const EmailEditor = React.forwardRef<EditorRef, EmailEditorProps>(
(props, ref) => {
    const {
      onLoad,
      onReady,
      scriptUrl = '//editor.unlayer.com/embed.js', // Default Unlayer embed script URL
      minHeight = 500, // Default minimum height
      style = {}, // Allow passing custom styles to the container
      options: passedOptions = {}, // Accept Unlayer options object
      ...eventProps // Capture remaining props, assuming they are event handlers (e.g., onDesignLoad)
    } = props;

    const [editor, setEditor] = useState<Editor | null>(null);
    const [hasLoadedEmbedScript, setHasLoadedEmbedScript] = useState<boolean>(false);

    // Ref to store the editor instance, potentially useful for direct access if needed
    const editorInstanceRef = useRef<Editor | null>(null);

    // Generate a unique ID for the editor instance container div
    const editorId = useMemo(
      () => props.editorId || `editor-${safeWindow ? ++safeWindow.__unlayer_lastEditorId : Date.now()}`,
      [props.editorId] // Recompute only if props.editorId changes
    );

    // Memoize the options object passed to Unlayer's createEditor
    const options = useMemo((): UnlayerOptions => ({
      ...passedOptions, // Start with options passed via props
      // Explicit props override values from the passedOptions object
      appearance: props.appearance ?? passedOptions?.appearance,
      displayMode: props.displayMode ?? passedOptions?.displayMode ?? 'email', // Default to 'email' display mode
      locale: props.locale ?? passedOptions?.locale,
      projectId: props.projectId ?? passedOptions?.projectId, // Pass projectId if provided
      tools: props.tools ?? passedOptions?.tools, // Pass tool configuration if provided
      // Ensure the editor container ID is included
      id: editorId,
      // Removed the 'source' property that used pkg.name and pkg.version
    }), [
        passedOptions, props.appearance, props.displayMode, props.locale,
        props.projectId, props.tools, editorId // Dependencies for recalculating options
    ]);

    // Expose the editor instance through the ref using useImperativeHandle
    useImperativeHandle(ref, () => ({
        editor: editor, // Provide access to the editor state
      }),
      [editor] // Update the ref value when the editor state changes
    );

    // --- Effects ---

    // Effect for loading the external Unlayer embed script
    useEffect(() => {
      if (!safeWindow) return; // Prevent execution during SSR

      // If window.unlayer already exists, assume the script is loaded
      if (safeWindow.unlayer) {
         setHasLoadedEmbedScript(true);
         return;
      }

      // If script isn't loaded, initiate loading
      setHasLoadedEmbedScript(false);
      loadScript(() => {
        // Callback function after script attempts to load
        if (safeWindow?.unlayer) {
            console.log('Unlayer Embed Script Loaded successfully.');
            setHasLoadedEmbedScript(true);
        } else {
            // Handle potential script loading errors
            console.error('Unlayer script loaded but window.unlayer is not defined. Check script URL and network.');
        }
      }, scriptUrl); // Pass the script URL to loadScript utility

    }, [scriptUrl]); // This effect runs when the component mounts and if scriptUrl changes

    // Effect for initializing and cleaning up the Unlayer editor instance
    useEffect(() => {
      // Ensure script is loaded and we're in a browser environment
      if (!hasLoadedEmbedScript || !safeWindow?.unlayer) {
        return; // Exit if conditions aren't met
      }

      // Create the Unlayer editor instance using the prepared options
      console.log('Creating Unlayer editor instance with ID:', options.id);
      const newEditorInstance = safeWindow.unlayer.createEditor(options);

      // Update component state and ref with the new editor instance
      setEditor(newEditorInstance);
      editorInstanceRef.current = newEditorInstance;

      // Return a cleanup function to be executed when the component unmounts
      // or when dependencies (options, hasLoadedEmbedScript) change
      return () => {
        if (editorInstanceRef.current) {
            console.log('Destroying Unlayer editor instance:', editorInstanceRef.current.id);
            editorInstanceRef.current.destroy(); // Call Unlayer's destroy method
            setEditor(null); // Reset state
            editorInstanceRef.current = null; // Clear ref
        }
      };
    }, [options, hasLoadedEmbedScript]); // Dependencies trigger re-initialization if they change

    // Effect for managing event listeners passed as props (e.g., onDesignLoad)
    useEffect(() => {
      // Only proceed if the editor instance exists
      if (!editor) return;

      console.log('Attaching event listeners for editor:', editor.id);

      // Trigger the onLoad callback prop immediately once the editor is available
      onLoad?.(editor);

      // Store registered handlers for cleanup
      const eventHandlers: { [key: string]: (...args: any[]) => void } = {};

      // Iterate over props captured in 'eventProps'
      Object.entries(eventProps).forEach(([propName, handler]) => {
        // Check if the prop name follows the 'onEventName' pattern and the value is a function
        if (/^on[A-Z]/.test(propName) && typeof handler === 'function') {
          // Convert React prop name convention (e.g., onDesignLoad) to
          // Unlayer's event name format (e.g., design:loaded).
          // This heuristic mapping might need adjustments for specific Unlayer events.
          const eventName = propName
            .substring(2) // Remove "on" prefix
             // Insert ':' before uppercase letters (except the first) and convert to lowercase
            .replace(/([A-Z])/g, (match, p1, offset) => (offset > 0 ? ':' : '') + p1.toLowerCase())
            .toLowerCase();

           // Apply known accurate mappings for common events
           const finalEventName = {
               'designload': 'design:loaded',
               'imageupload': 'image:uploaded',
               'ready': 'editor:ready', // Map 'onReady' specifically if needed elsewhere
               // Add more known event mappings here if the heuristic fails
           }[eventName] || eventName; // Use heuristic result as fallback

          console.log(`Registering listener for '${finalEventName}' from prop '${propName}'`);
          eventHandlers[finalEventName] = handler; // Store handler for removal
          editor.addEventListener(finalEventName, handler); // Attach listener
        }
      });

      // Special handling for the onReady prop (often corresponds to 'editor:ready')
      const handleEditorReady = () => {
        console.log('Editor is ready:', editor.id);
        onReady?.(editor); // Call the onReady prop callback
      };

      // Attach the specific 'editor:ready' listener if onReady prop is provided
      if (onReady) {
        editor.addEventListener('editor:ready', handleEditorReady);
      }

      // Return cleanup function to remove all attached listeners
      return () => {
        if (!editor) return; // Ensure editor exists during cleanup phase
        console.log('Removing event listeners for editor:', editor.id);

        // Remove listeners attached via eventProps iteration
        Object.entries(eventHandlers).forEach(([eventName, handler]) => {
          editor.removeEventListener(eventName, handler);
        });

        // Remove the specific 'editor:ready' listener if it was attached
        if (onReady) {
          editor.removeEventListener('editor:ready', handleEditorReady);
        }
      };

    // Re-attach listeners if editor instance changes or if callback props change.
    // Using 'eventProps' directly in dependencies is simple but might cause excessive
    // listener re-attachment if parent component re-renders frequently.
    // Consider using useCallback for handlers in the parent component for optimization.
    }, [editor, onLoad, onReady, eventProps]);


    // --- Render ---
    // Render the container div where the Unlayer editor will be mounted
    return (
      <div
        style={{
          flex: 1, // Allow the container to grow and fill available space
          display: 'flex', // Use flex display for internal div sizing
          minHeight: minHeight, // Enforce the minimum height prop
          ...style, // Spread any custom styles passed via the style prop
        }}
      >
        {/* This inner div is targeted by Unlayer using its ID */}
        <div id={editorId} style={{ flex: 1 }} />
      </div>
    );
  }
);

// Assign a display name for easier debugging in React DevTools
EmailEditor.displayName = 'UnlayerEmailEditor';
