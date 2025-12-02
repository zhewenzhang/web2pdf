import React, { useEffect, useRef } from 'react';

interface HtmlPreviewProps {
  html: string;
  title: string;
}

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({ html, title }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // We wrap the content to ensure it renders decently even if it's a fragment
    // We add Tailwind via CDN to the iframe so the "Optimized" view renders correctly
    const wrappedHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { padding: 20px; font-family: system-ui, sans-serif; }
            /* Force white background for preview consistency */
            html, body { background-color: #ffffff; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    doc.open();
    doc.write(wrappedHtml);
    doc.close();
  }, [html, title]);

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview: {title}</span>
      </div>
      <iframe 
        ref={iframeRef} 
        className="w-full flex-1 border-0" 
        sandbox="allow-same-origin allow-scripts" // Needed for Tailwind CDN to run
        title="HTML Preview"
      />
    </div>
  );
};
