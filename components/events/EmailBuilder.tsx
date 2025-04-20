// components/events/EmailBuilder.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import grapesjs, { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import newsletterPlugin from "grapesjs-preset-newsletter";
import { render } from "@react-email/render";

// Your React‑Email templates
import { BasicNewsletter } from "../email-templates/basic";
import { PromoEmail } from "../email-templates/promo";
import { MarketingEmail } from "../email-templates/marketing";

export default function EmailBuilder() {
  const editorRef = useRef<Editor>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1) Pre-render all templates to HTML
    Promise.all([
      render(<BasicNewsletter title="Monthly Update" />),
      render(<PromoEmail />),
      render(<MarketingEmail />),
    ]).then(([basicHTML, promoHTML, marketingHTML]) => {
      // 2) Wrap the marketing HTML in a fixed-size, padded light-gray shell
      const wrappedMarketing = `
        <div style="
          background-color: #f5f5f5;
          padding: 140px;
          display: flex;
          justify-content: center;
        ">
          <div style="
            width: 900px;
            height: 900px;
            background: white;
            overflow: hidden;
          ">
            ${marketingHTML}
          </div>
        </div>
      `;

      // 3) Initialize GrapesJS
      const editor = grapesjs.init({
        container: "#gjs",
        fromElement: false,
        storageManager: false,
        height: "100%",
        plugins: [newsletterPlugin],
        pluginsOpts: { [newsletterPlugin]: {} },

        // Inject your compiled Tailwind (or any global CSS) so inline styles are applied
        canvas: {
          styles: ["/css/tailwind.css"],
        },

        // Load the wrapped marketing email by default
        components: wrappedMarketing,

        // Expose a full style inspector
        styleManager: {
          sectors: [
            {
              name: "General",
              open: true,
              buildProps: [
                "display",
                "position",
                "top",
                "right",
                "left",
                "bottom",
              ],
            },
            {
              name: "Dimension",
              open: false,
              buildProps: ["width", "height", "margin", "padding"],
            },
            {
              name: "Typography",
              open: false,
              buildProps: [
                "font-family",
                "font-size",
                "font-weight",
                "letter-spacing",
                "color",
                "line-height",
              ],
            },
            {
              name: "Decorations",
              open: false,
              buildProps: ["background-color", "border-radius", "border"],
            },
            {
              name: "Extra",
              open: false,
              buildProps: ["box-shadow", "opacity"],
            },
          ],
        },
      });

      // 4) Add your three templates to the left panel
      const bm = editor.getBlockManager();
      bm.add("basic-newsletter", {
        label: `<div style="text-align:center;"><strong>Basic</strong><br/><small>Newsletter</small></div>`,
        category: "Templates",
        content: basicHTML,
      });
      bm.add("promo-email", {
        label: `<div style="text-align:center;"><strong>Promo</strong><br/><small>Email</small></div>`,
        category: "Templates",
        content: promoHTML,
      });
      bm.add("marketing-email", {
        label: `<div style="text-align:center;"><strong>Marketing</strong><br/><small>Email</small></div>`,
        category: "Templates",
        // dragging this block in also brings the fixed-size wrapper
        content: wrappedMarketing,
      });

      editorRef.current = editor;
      setReady(true);
    });
  }, []);

  // Export HTML + inlined CSS
  const exportHtml = () => {
    const html = editorRef.current!.getHtml();
    const css = editorRef.current!.getCss();
    return `<style>${css}</style>${html}`;
  };

  // Send test email
  const handleSend = async () => {
    const html = exportHtml();
    const to = prompt("Send to:");
    const subject = prompt("Subject?", "Your Campaign");
    if (!to || !subject) return;
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
    const { success, error } = await res.json();
    alert(success ? "✔ Sent!" : `❌ ${error}`);
  };

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr_260px] bg-neutral-900 text-neutral-100">
      {/* Left: Templates + Default Blocks */}
      <div id="blocks" className="overflow-auto p-4" />

      {/* Center: GrapesJS Canvas */}
      <div className="p-4 bg-neutral-800">
        <div
          id="gjs"
          style={{
            width: "100%",
            height: "100%",
            minHeight: "900px",
            border: "1px solid #374151",
          }}
        />
      </div>

      {/* Right: Style Manager + Actions */}
      <div className="p-4 flex flex-col gap-4">
        <button
          onClick={exportHtml}
          disabled={!ready}
          className="py-2 px-4 bg-indigo-600 rounded hover:bg-indigo-500 disabled:opacity-50"
        >
          Export HTML
        </button>
        <button
          onClick={handleSend}
          disabled={!ready}
          className="py-2 px-4 bg-emerald-600 rounded hover:bg-emerald-500 disabled:opacity-50"
        >
          Send Test Email
        </button>
      </div>
    </div>
  );
}
