'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { EmailEditorProps, EditorRef } from 'react-email-editor'
// Import your grid components and types (make sure paths are correct)
import ComponentGrid from './ComponentGrid'
import { gridItems } from './gridItems'
import type { ComponentItem } from './types'

// disable SSR
const EmailEditor = dynamic<EmailEditorProps>(
  () => import('react-email-editor'),
  { ssr: false }
)

export default function MyEmailEditor() {
  const [selectedItem, setSelectedItem] = useState<{ title: string; snippetHtml: string } | null>(null);
  const editorRef = useRef<EditorRef>(null);
  const [isReady, setIsReady] = useState(false);

  // Fired when editor has fully loaded
  const handleReady: EmailEditorProps['onReady'] = (editor) => {
    setIsReady(true);
    // you could load a blank design here if you like:
    // editor.loadDesign({}); 
  }



  // Whenever an item is clicked, build a tiny JSON design that
  // injects an HTML block containing your snippetHtml
  useEffect(() => {
    if (!isReady || !editorRef.current || !selectedItem) return;
     (async () => {
         try {
           const { Unlayer2be } = await import('unlayer2be')
           const design = Unlayer2be.fromHtml(selectedItem.snippetHtml)
           editorRef.current!.editor.loadDesign(design)
         } catch (err) {
           console.error('unlayer2be parse failed:', err)
         }
       })()
  }, [selectedItem, isReady])
  

  // --- Layout: Place Grid and Editor Side-by-Side ---
  return (
    // Use Flexbox for layout. Adjust height/width as needed (e.g., h-screen)
    <div className="flex w-full"> {/* Example: Full viewport height minus a potential header */}

      {/* Sidebar Column for the Component Grid */}
      <div className="w-1/4 max-w-xs border-r border-gray-300 overflow-y-auto p-4 bg-gray-50"> {/* Adjust width, add styling */}
        <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-gray-50 pb-2">Select Template</h2>
        <ComponentGrid
          items={gridItems}
          // When an item is clicked in the grid, update the selectedItem state
          onSelect={(item) => {
            console.log("Grid item selected in parent:", item.title);
            setSelectedItem(item);
          }}
         // You could optionally pass selectedItem to highlight the active item in the grid
         // currentSelection={selectedItem}
        />
      </div>

      <div className="flex-1 p-4 bg-gray-100"> {/* Main content area for the Email Editor */}
        <EmailEditor
          ref={editorRef}
          projectId={1234}
          displayMode="email"
          onLoad={handleReady}
          minHeight="800px" // Adjust as needed

        />
      </div>
    </div>
  );
}