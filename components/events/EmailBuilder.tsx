// components/events/EmailBuilder.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import grapesjs, { Editor, Block } from "grapesjs"; // Import Block type
import "grapesjs/dist/css/grapes.min.css";
// GrapesJS Plugins
import newsletterPlugin from "grapesjs-preset-newsletter";
const blocksBasicPlugin = require('grapesjs-blocks-basic');

// React Email Rendering
import { render } from "@react-email/render";

// Email Templates (Used for Template Blocks)
import { BasicNewsletter } from "../email-templates/basic";
import { PromoEmail } from "../email-templates/promo";
import { MarketingEmail } from "../email-templates/marketing";
// Import the component used for the GALLERY TEMPLATE block
import { GalleryComponent as GalleryTemplateComponent } from "../email-templates/gallery"; // Renamed to avoid conflict

// Types
import { ComponentItem } from "./types"; // Ensure this type is defined correctly

// --- Import Previews from './previews/' ---
// These define the look in the block manager
import { galleryPreviewHtml } from "./previews/gallery";
// import { ecommercePreviewHtml } from "./previews/ecommerce";
// ... import ALL other previews needed for gridItems ...
import { textPreviewHtml } from "./previews/text";


// --- Import ACTUAL Components from './codeSnippets/' ---
// These define the content inserted on drop for component blocks
import { GalleryComponent } from './codeSnippets/gallery'; // Component for the draggable block
// import { EcommerceComponent } from './codeSnippets/ecommerce';
// ... import ALL other components needed for gridItems ...
// import { TextComponent } from './codeSnippets/text';


// Placeholders (Only needed if components/previews aren't ready)
const PlaceholderComponent = () => React.createElement('div', {}, 'Placeholder');
const placeholderPreviewHtml = '<div style="padding:10px; border:1px dashed #999; text-align:center; font-size:10px; color:#999;">Placeholder</div>';


export default function EmailBuilder() {
  const editorRef = useRef<Editor | null>(null);
  const [ready, setReady] = useState(false);

  // --- Define Grid Items for Draggable Components ---
  // Uses previews from './previews' and components from './codeSnippets'
  const gridItems: Omit<ComponentItem, 'count' | 'href'>[] = [
    // --- Gallery Component Block Definition ---
    {
      blockId: "react-gallery",             // Unique ID
      title: "Gallery",
      previewHtml: galleryPreviewHtml,      // Use the specific preview from ./previews/gallery.ts
      component: GalleryComponent,          // Use the component from ./codeSnippets/gallery.tsx
    },
    // --- Text Component Block Definition ---
    {
      blockId: "react-text",
      title: "Text",
      previewHtml: textPreviewHtml,         // Use preview from ./previews/text.ts (ensure it exists)
      component: <PlaceholderComponent />,  // Replace with TextComponent from ./codeSnippets/
    },
    // ... other component definitions ...
  ];


  // --- Main useEffect for GrapesJS Initialization ---
  useEffect(() => {
    if (editorRef.current) return; // Already initialized
    console.log("EmailBuilder: Initializing GrapesJS...");

    // Render initial templates (including the Gallery Template)
    Promise.all([
      render(<BasicNewsletter title="Monthly Update" />, { pretty: true }),
      render(<PromoEmail />, { pretty: true }),
      render(<MarketingEmail />, { pretty: true }),
      // Render the component imported from email-templates for the template block
      render(<GalleryTemplateComponent />, { pretty: true }),
    ]).then(([basicHTML, promoHTML, marketingHTML, galleryTemplateHTML]) => { // <-- Renamed variable
        console.log("EmailBuilder: Templates rendered.");

      // Initialize GrapesJS Editor
      const editor = grapesjs.init({
        container: "#gjs",
        // ...(your existing config)...
        fromElement: false,
        storageManager: false,
        height: "calc(100vh - 220px)",
        width: 'auto',
        plugins: [ newsletterPlugin, blocksBasicPlugin ],
        pluginsOpts: {
            'gjs-preset-newsletter': { /* options */ },
            'gjs-blocks-basic': { /* options */ }
        },
        styleManager: { /* config */
            sectors: [{ name: 'General', properties:['display', 'position', 'top', 'right', 'left', 'bottom'] }, { name: 'Dimension', open: false, properties: [ 'width', 'height', 'max-width', 'min-height', 'margin', 'padding' ]},{ name: 'Typography', open: false, properties:['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-shadow'] }, { name: 'Decorations', open: false, properties: ['background-color', 'border-radius', 'border', 'box-shadow', 'background']}]
        },
        blockManager: { appendTo: '#blocks' },
        dragMode: 'absolute',
        protectedCss: '',
        canvas: { styles: ['body { margin: 0; padding: 0; }'], scripts: [] }
      });
      console.log("EmailBuilder: GrapesJS instance created.");
      editorRef.current = editor; // Store ref immediately

      const bm = editor.BlockManager;
      const templatesCategory = 'Templates';
      const reactEmailCategory = 'React Email Components';

      // --- Add Template Blocks ---
      // These add pre-rendered full email structures
      bm.add("template-basic", { label: "Basic Newsletter", category: templatesCategory, content: basicHTML, attributes: { class: 'gjs-block-template' }});
      bm.add("template-promo", { label: "Promo Email", category: templatesCategory, content: promoHTML, attributes: { class: 'gjs-block-template' } });
      bm.add("template-marketing", { label: "Marketing Email", category: templatesCategory, content: marketingHTML, attributes: { class: 'gjs-block-template' } });
      // Add the Gallery *Template* block
      bm.add("template-gallery", { label: "Gallery Email", category: templatesCategory, content: galleryTemplateHTML, attributes: { class: 'gjs-block-template' } }); // <-- Use galleryTemplateHTML
      console.log("EmailBuilder: Template blocks added.");

      // --- Add React-Email Component Blocks ---
      // These use previews from ./previews and components from ./codeSnippets
      // They have NO content property here; content is added on drop via event listener
      console.log(`EmailBuilder: Defining ${gridItems.length} React-Email blocks...`);
      gridItems.forEach((item) => {
        // Use the specific previewHtml imported for this item
        const previewContent = typeof item.previewHtml === 'string'
            ? item.previewHtml
            : placeholderPreviewHtml;

        if (typeof item.previewHtml !== 'string') {
             console.warn(`Preview for ${item.title} (${item.blockId}) is not a string! Using placeholder.`);
        }

        bm.add(item.blockId, {
          // The label now renders the imported previewHtml
          label: `<div class="gjs-block-label-preview" style="width: 95%; height: 70px; overflow: hidden; margin: 2px auto; border: 1px solid #444; position: relative; background-color: #0F0F10;">${previewContent}</div><div class="gjs-block-label-title" style="margin-top: 3px; font-size: 0.75rem; text-align: center; white-space: normal; padding: 0 2px;">${item.title}</div>`,
          category: reactEmailCategory,
          // ** NO 'content' property here **
          attributes: { class: 'gjs-block-react-email' }
        });
      });
      console.log("EmailBuilder: React-Email blocks defined.");

      // --- Event Listener to Handle Component Drop (to replace content) ---
      const handleBlockDrop = (block: Block) => {
          const blockId = block.getId();
          const droppedItem = gridItems.find(item => item.blockId === blockId);

          // Only act if it's one of our specific component blocks
          if (droppedItem) {
              console.log(`Handling drop for React Email component: ${droppedItem.title}`);
              try {
                  const componentHtml = render(droppedItem.component, { pretty: true });
                  // Replace canvas content
                  editor.setComponents(componentHtml);
                  console.log(`Canvas content replaced with ${droppedItem.title}`);
                  editor.select(editor.getComponents().models[0]); // Select the new content
              } catch (error) {
                  console.error(`Error rendering component ${droppedItem.title} on drop:`, error);
                  editor.setComponents(`<div style="padding: 20px; text-align: center; color: red;">Error loading ${droppedItem.title}. Check console.</div>`);
              }
          }
          // Let template blocks handle their drop normally (if needed, otherwise they also might need setComponents)
          // Note: If template blocks *also* need to replace content reliably, they might need similar handling,
          // or ensure they are only dropped on an empty canvas.
      };

      editor.on('canvas:drop', (event: Event, block: Block) => {
          if (block && block instanceof grapesjs.Block) {
              handleBlockDrop(block);
          }
      });
      console.log("EmailBuilder: Drop event listener added.");

      // --- Editor Ready ---
      setReady(true);
      console.log("EmailBuilder: Editor is ready.");

    }).catch(error => {
        console.error("EmailBuilder: Error rendering initial templates:", error);
    });

    // --- Cleanup Function ---
    return () => {
        console.log("EmailBuilder: Cleanup running.");
        const editorToDestroy = editorRef.current;
        if (editorToDestroy) {
            editorToDestroy.off('canvas:drop');
            console.log("EmailBuilder: Destroying GrapesJS instance.");
            editorToDestroy.destroy();
            editorRef.current = null;
        }
        setReady(false);
        console.log("EmailBuilder: Cleanup finished.");
    };

  }, []); // Empty dependency array []

  // --- Event Handlers ---
  // ... (exportHtml and handleSend functions remain the same) ...
   const exportHtml = () => {
     if (!editorRef.current) {
        console.warn("Export HTML called but editor not ready.");
        return "";
    }
    const html = editorRef.current.getHtml({ cleanId: true });
    const css = editorRef.current.getCss();
    return `<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style type="text/css">${css}</style></head><body>${html}</body></html>`;
  };

  const handleSend = async () => {
     const htmlContent = exportHtml();
     if (!htmlContent) {
         alert("Editor not ready or no content.");
         return;
     }
     const to = prompt("Send to:");
     if (!to) return;
     const subject = prompt("Subject?", "Your Campaign");
     if (!subject) return;

     console.log("Sending email with HTML:", htmlContent.substring(0, 200) + "...");

     try {
         const res = await fetch("/api/send-email", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ to, subject, html: htmlContent }),
         });
         if (!res.ok) {
             throw new Error(`HTTP error! status: ${res.status}`);
         }
         const { success, error } = await res.json();
         alert(success ? "✔ Sent!" : `❌ Send failed: ${error || 'Unknown error'}`);
     } catch (err) {
         console.error("Failed to send email:", err);
         alert(`❌ Failed to send email: ${err instanceof Error ? err.message : String(err)}`);
     }
  };

  // --- Render Component ---
  return (
      // The outer structure provides the dark background and padding
      <div className="space-y-6 bg-neutral-800 text-white p-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Email Builder</h2>
        <p className="text-slate-400 mb-4">
          Drag components from the left panel onto the canvas. Select elements on the canvas to style them using the right panel.
        </p>
      </div>
      <div className="flex flex-row border border-neutral-700" style={{ height: 'calc(100vh - 180px)' }}>
         {/* Block panel styling (bg-neutral-900) provides the dark background */}
         <div id="blocks" className="w-[240px] bg-neutral-900 text-neutral-100 overflow-y-auto p-1" />
         <div className="flex-grow bg-white"> {/* Canvas */}
           <div id="gjs" style={{ border: 'none' }} />
         </div>
         <div className="w-[260px] bg-neutral-900 text-neutral-100 overflow-y-auto relative flex flex-col"> {/* Right Panel */}
             <div className="flex-grow">
                 <div className="gjs-pn-buttons"></div>
                 <div className="gjs-pn-views" style={{ height: 'calc(100% - 40px)'}}></div>
             </div>
             {/* Buttons */}
             <div className="flex flex-col gap-2 p-2 border-t border-neutral-700 bg-neutral-900 mt-auto">
                <button
                    onClick={() => { /* Preview logic */ }}
                    disabled={!ready}
                    className="w-full py-2 px-4 bg-indigo-600 rounded hover:bg-indigo-500 disabled:opacity-50 text-sm"
                >
                    Preview HTML
                </button>
                <button
                    onClick={handleSend}
                    disabled={!ready}
                    className="w-full py-2 px-4 bg-emerald-600 rounded hover:bg-emerald-500 disabled:opacity-50 text-sm"
                >
                    Send Test Email
                </button>
             </div>
         </div>
      </div>
    </div>
  );
}