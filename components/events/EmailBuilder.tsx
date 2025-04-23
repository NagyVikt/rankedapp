// components/events/EmailBuilder.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import grapesjs, { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import newsletterPlugin from "grapesjs-preset-newsletter";
import customCodePlugin from "grapesjs-custom-code";
import { render } from "@react-email/render";

// templates
import { BasicNewsletter } from "../email-templates/basic";
import { PromoEmail } from "../email-templates/promo";
import { MarketingEmail } from "../email-templates/marketing";
import { ComponentItem } from "./types";

// grid display
import ComponentGrid from "./ComponentGrid";
// raw HTML previews
// import each preview widget
import { galleryPreviewHtml }    from "./previews/gallery";
import { galleryCode } from './codeSnippets/gallery';
import { ecommercePreviewHtml }  from "./previews/ecommerce";
import { articlesPreviewHtml }   from "./previews/articles";
import { buttonsPreviewHtml }   from "./previews/buttons";
import { headersPreviewHtml }   from "./previews/headers";
import { footersPreviewHtml }   from "./previews/footers";
import { dividerPreviewHtml } from "./previews/divider";
import { featuresPreviewHtml } from "./previews/features";
import { gridPreviewHtml } from "./previews/grid";
import { headingPreviewHtml } from "./previews/heading";
import { linkPreviewHtml } from "./previews/link";
import { imagePreviewHtml } from "./previews/image";
import { marketingPreviewHtml } from "./previews/marketing";
import { pricingPreviewHtml } from "./previews/pricing";
import  { textPreviewHtml } from "./previews/text";
export default function EmailBuilder() {
  const editorRef = useRef<Editor>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      render(<BasicNewsletter title="Monthly Update" />),
      render(<PromoEmail />),
      render(<MarketingEmail />),
    ]).then(([basicHTML, promoHTML, marketingHTML]) => {
      const wrappedMarketing = `…`;
  
      const editor = grapesjs.init({
        container: "#gjs",
        fromElement: false,
        storageManager: false,
        height: "100%",
        plugins: [newsletterPlugin, customCodePlugin],
               pluginsOpts: {
                   // 👇 use the plugin’s package name (or ID) as the key
                   "grapesjs-preset-newsletter": {},
                   "grapesjs-custom-code": {
                     // any custom-code options here
                  },
                 },
        canvas: { styles: ["/css/tailwind.css"] },
        components: wrappedMarketing,
        styleManager: { /* … */ },
      });
  
      const bm = editor.BlockManager;
  
      // 1) Your HTML newsletter blocks
      bm.add("basic-newsletter", {
        label: "Basic Newsletter",
        category: "Templates",
        content: basicHTML,
      });
      bm.add("promo-email", {
        label: "Promo Email",
        category: "Templates",
        content: promoHTML,
      });
      bm.add("marketing-email", {
        label: "Marketing Email",
        category: "Templates",
        content: wrappedMarketing,
      });
  
      // 2) Your React‑Email TSX blocks
      gridItems.forEach((item) => {
        if (item.code && item.blockId) {
          bm.add(item.blockId, {
            label: item.title,
            category: "React‑Email",
            content: {
              type: "custom-code",
              code: item.code.trim(),
            },
          });
        }
      });
  
      // 3) Only after registering *all* blocks:
      editorRef.current = editor;
      setReady(true);
    });
  }, []);
  

  const exportHtml = () => {
    const html = editorRef.current!.getHtml();
    const css  = editorRef.current!.getCss();
    return `<style>${css}</style>${html}`;
  };

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

  // build the grid items — each uses the raw HTML widget
  const gridItems: ComponentItem[] = [
    {
      href: "/components/gallery",
      title: "Gallery",
      count: 4,
      previewHtml: galleryPreviewHtml,
    },
    {
      href: "/components/ecommerce",
      title: "Ecommerce",
      count: 5,
      previewHtml: ecommercePreviewHtml,
    },
    {
      href: "/components/articles",
      title: "Articles",
      count: 6,
      previewHtml: articlesPreviewHtml,
    },
    {
      href: "/components/buttons",
      title: "Buttons",
      count: 6,
      previewHtml: buttonsPreviewHtml,
    },
    {
      href: "/components/headers",
      title: "Headers",
      count: 6,
      previewHtml: headersPreviewHtml,
    },
    {
      href: "/components/footers",
      title: "Footers",
      count: 2,
      previewHtml: footersPreviewHtml,
    },
    {
      href: "/components/divider",
      title: "Divider",
      count: 1,
      previewHtml: dividerPreviewHtml,
    },
    {
      href: "/components/features",
      title: "Features",
      count: 4,
      previewHtml: featuresPreviewHtml,
    },
    {
      href: "/components/grid",
      title: "Grid",
      count: 4,
      previewHtml: gridPreviewHtml,
    },
    {
      href: "/components/heading",
      title: "Heading",
      count: 1,
      previewHtml: headingPreviewHtml,
    },
    {
      href: "/components/link",
      title: "Link",
      count: 1,
      previewHtml: linkPreviewHtml,
    },
    {
      href: "/components/image",
      title: "Image",
      count: 1,
      previewHtml: imagePreviewHtml,
    },
    {
      href: "/components/marketing",
      title: "Marketing",
      count: 1,
      previewHtml: marketingPreviewHtml,
    },
    {
      href: "/components/pricing",
      title: "Pricing",
      count: 1,
      previewHtml: pricingPreviewHtml,
    },
    {
      href: "/components/text",
      title: "Text",
      count: 1,
      previewHtml: textPreviewHtml,
    },

  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Templates</h1>
        <p className="text-slate-400">
          Pick one of our React‑Email templates to get started.
        </p>
      </div>

      <ComponentGrid items={gridItems} />

      <div className="min-h-[800px] grid grid-cols-[240px_1fr_260px] bg-neutral-900 text-neutral-100">
        <div id="blocks" className="overflow-auto p-4" />
        <div className="p-4 bg-neutral-800">
          <div id="gjs" style={{
            width: "100%", height: "100%", minHeight: "900px",
            border: "1px solid #374151",
          }} />
        </div>
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
    </div>
  );
}
