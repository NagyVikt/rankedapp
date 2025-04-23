'use client'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import type { EmailEditorProps, EditorRef } from 'react-email-editor'

const EmailEditor = dynamic<EmailEditorProps>(
  () => import('react-email-editor'),
  { ssr: false }
)

export default function MyEmailEditor() {
  const editorRef = useRef<EditorRef>(null)

  // build your HTML once
  const snippetHTML = `
    <div style="padding:20px; background:#eee; text-align:center;">
      <h2>🚀 Welcome!</h2>
      <p>Your HTML block.</p>
    </div>
  `

  const customToolJS = `
    // register our new tool inside the iframe
    unlayer.registerTool({
      name: 'my_html_snippet',
      label: 'My HTML Snippet',
      icon: 'fa-code',
      supportedDisplayModes: ['web','email'],
      options: {},
      values: {},
      renderer: {
        // <-- wrap in createViewer
        Viewer: unlayer.createViewer({
          render: function() {
            return \`${snippetHTML}\`
          }
        }),
        // need both web & email exporters
        exporters: {
          web: function() { return \`${snippetHTML}\` },
          email: function() { return \`${snippetHTML}\` }
        },
        // stub out head.css/js or the layout code will call these
        head: {
          css: function() { return '' },
          js: function() { return '' }
        }
      },
      validator: function() { return [] }
    });
  `

  return (
    <div style={{ height: 600 }}>
      <EmailEditor
        ref={editorRef}
        projectId={1234}
        displayMode="email"
        options={{
          customJS: [ customToolJS ]
        }}
      />
    </div>
  )
}
