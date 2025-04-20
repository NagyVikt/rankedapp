// components/events/EmailBuilder.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

export default function EmailBuilder() {
  const editorRef = useRef<any>(null);
  const [exported, setExported] = useState<{ html: string; css: string } | null>(null);

  useEffect(() => {
    // load only in browser
    import("grapesjs").then((grapesjs) => {
      Promise.all([
        import("grapesjs/dist/css/grapes.min.css"),
        import("grapesjs-preset-newsletter"),
      ]).then(([, newsletter]) => {
        editorRef.current = grapesjs
          .default.init({
            container: "#gjs",
            height: "600px",
            fromElement: false,
            plugins: [newsletter.default],
            pluginsOpts: {
              [newsletter.default]: {}
            },
          });
      });
    });
  }, []);

  const handleExport = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.getHtml();
    const css  = editorRef.current.getCss();
    setExported({ html, css });
  };

  const handleSend = async () => {
    if (!exported) return;
    const { html, css } = exported;
    const to      = window.prompt("Send to email address?");
    const subject = window.prompt("Email subject?", "Newsletter");
    if (!to || !subject) return;

    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        subject,
        html: `<style>${css}</style>${html}`, 
      }),
    });
    const json = await res.json();
    alert(json.success ? "Sent!" : `Error: ${json.error}`);
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <h2>Drag‑and‑Drop Email Builder</h2>
      <div id="gjs" style={{ border: "1px solid #ddd" }} />
      <div style={{ marginTop: 12 }}>
        <button onClick={handleExport} style={{ marginRight: 8 }}>
          Export HTML/CSS
        </button>
        {exported && (
          <button onClick={handleSend}>
            Send Email
          </button>
        )}
      </div>
    </div>
  );
}
