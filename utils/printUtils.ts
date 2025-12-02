/**
 * Creates a hidden iframe, injects the HTML content with Tailwind CSS,
 * and triggers the browser's print dialog.
 */
export const printHtmlContent = (htmlContent: string, title: string = "Document") => {
  // Remove any existing print iframe
  const existingIframe = document.getElementById('print-iframe');
  if (existingIframe) {
    document.body.removeChild(existingIframe);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'print-iframe';
  
  // Improved hiding technique:
  // Using 'left: -10000px' sometimes causes browsers to treat the iframe as "inactive" and block print calls.
  // Using opacity: 0 and fixed positioning is safer for ensuring the render engine processes it.
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.opacity = '0.01';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-1';
  iframe.style.border = 'none';
  
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    console.error("Could not access iframe document");
    return;
  }

  // Inject content with robust print trigger
  const content = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
            @page { 
              margin: 1.5cm; 
              size: auto;
            }
          }
          body {
            font-family: ui-sans-serif, system-ui, sans-serif;
            padding: 2rem;
            color: #000;
            background: #fff;
          }
          /* Ensure images don't break layout */
          img { max-width: 100%; height: auto; }
          /* Better table formatting for print */
          table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
          th, td { border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; }
        </style>
      </head>
      <body>
        <div class="prose max-w-none">
          ${htmlContent}
        </div>
        <script>
          function attemptPrint() {
            if (window.tailwind) {
               // Small buffer to allow Tailwind to apply classes
               setTimeout(() => {
                 try {
                   document.close();
                   window.focus(); 
                   window.print();
                   
                   // Optional: clean up self after print dialog closes (though flaky across browsers)
                 } catch(e) {
                   console.error("Print error:", e);
                 }
               }, 500);
            } else {
               // Retry if tailwind script hasn't run yet
               setTimeout(attemptPrint, 100);
            }
          }

          if (document.readyState === 'complete') {
            attemptPrint();
          } else {
            window.addEventListener('load', attemptPrint);
          }
        </script>
      </body>
    </html>
  `;

  doc.open();
  doc.write(content);
  doc.close();
};

/**
 * Fallback method: Opens content in a new tab for manual printing
 */
export const openHtmlInNewTab = (htmlContent: string, title: string = "Document") => {
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert("Please allow popups to view the printable version.");
        return;
    }

    const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Print View</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { margin: 2cm; }
            .no-print { display: none; }
          }
          body {
            font-family: ui-sans-serif, system-ui, sans-serif;
            padding: 3rem;
            max-width: 210mm;
            margin: 0 auto;
            color: #1e293b;
          }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; padding: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; text-align: center; font-family: sans-serif;">
            <p style="margin: 0 0 12px 0; color: #0369a1; font-weight: 500;">Ready to convert. Click the button below.</p>
            <div style="font-size: 14px; color: #64748b; margin-bottom: 12px;">Destination: Select <strong>"Save as PDF"</strong></div>
            <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🖨️ Print / Save as PDF
            </button>
        </div>
        <div class="prose max-w-none">
          ${htmlContent}
        </div>
        <script>
            // Auto-trigger print for convenience
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 800);
            }
        </script>
      </body>
    </html>
  `;
  
  newWindow.document.write(content);
  newWindow.document.close();
};