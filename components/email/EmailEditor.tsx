'use client'

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  type Ref,
} from 'react'
import dynamic from 'next/dynamic'
import type { EmailEditorProps, EditorRef } from 'react-email-editor'
import ComponentGrid from './ComponentGrid'
import { gridItems } from './gridItems'
import type { ComponentItem } from './types'

// 1) Import only the default export, and tell TS it’s a ComponentType
//    that takes EmailEditorProps + a ref to EditorRef
const UnlayerEmailEditor = dynamic(
  () => import('react-email-editor').then((mod) => mod.default),
  { ssr: false }
) as React.ComponentType<EmailEditorProps & React.RefAttributes<EditorRef>>

// 2) Wrap it in forwardRef so TS/React both know how to handle `ref`
const EmailEditor = forwardRef<EditorRef, EmailEditorProps>((props, ref) => (
  <UnlayerEmailEditor {...props} ref={ref as Ref<EditorRef>} />
))
EmailEditor.displayName = 'EmailEditor'  // for React DevTools

type SavedDesign = {
  id: string
  name: string
  design: any
}

export default function MyEmailEditor() {
  const [selectedItem, setSelectedItem] = useState<ComponentItem | null>(null)
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([])
  const editorRef = useRef<EditorRef>(null)
  const [isReady, setIsReady] = useState(false)

  const handleLoad: EmailEditorProps['onLoad'] = () => {
    setIsReady(true)
  }

  useEffect(() => {
    if (!isReady || !selectedItem) return

    ;(async () => {
      try {
        const { Unlayer2be } = await import('unlayer2be')
        const rawDesign = Unlayer2be.fromHtml(selectedItem.snippetHtml)
        editorRef.current?.editor?.loadDesign(rawDesign as any)
      } catch (err) {
        console.error('unlayer2be parse failed:', err)
      }
    })()
  }, [selectedItem, isReady])

  const handleSave = () => {
    const inst = editorRef.current?.editor
    if (!inst) return

    inst.exportHtml((data: { design: any; html: string }) => {
      const { design } = data
      const name = prompt('Name your template', `Template ${savedDesigns.length + 1}`)
      if (!name) return
      setSavedDesigns((prev) => [
        ...prev,
        { id: Date.now().toString(), name, design },
      ])
    })
  }

  const loadSaved = (sd: SavedDesign) => {
    const inst = editorRef.current?.editor
    if (!inst) return
    inst.loadDesign(sd.design)
  }

  return (
    <div className="flex w-full h-[calc(100vh-50px)]">
      {/* Sidebar */}
      <div className="w-1/4 border-r bg-gray-50 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-2">Select Template</h2>
        <ComponentGrid items={gridItems} onSelect={setSelectedItem} />

        <hr className="my-4" />

        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">My Saved Designs</h2>
          <button
            onClick={handleSave}
            className="px-2 py-1 text-sm bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>

        {savedDesigns.length === 0 ? (
          <p className="text-gray-500 text-sm">No saved templates yet.</p>
        ) : (
          <div className="space-y-2">
            {savedDesigns.map((sd) => (
              <div
                key={sd.id}
                onClick={() => loadSaved(sd)}
                className="cursor-pointer p-2 border rounded hover:bg-gray-100"
              >
                {sd.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main editor */}
      <div className="flex-1 p-4 bg-gray-100">
        <EmailEditor
          ref={editorRef}
          projectId={1234}
          displayMode="email"
          onLoad={handleLoad}
          minHeight="800px"
        />
      </div>
    </div>
  )
}
