import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { HtmlPreview } from './components/HtmlPreview';
import { optimizeHtmlForPdf } from './services/geminiService';
import { printHtmlContent, openHtmlInNewTab } from './utils/printUtils';
import { ViewMode } from './types';

const App: React.FC = () => {
  const [originalHtml, setOriginalHtml] = useState<string | null>(null);
  const [optimizedHtml, setOptimizedHtml] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState<string>("Untitled Document");
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ORIGINAL);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileLoaded = (content: string, filename: string) => {
    setOriginalHtml(content);
    setDocTitle(filename.replace('.html', '').replace('.htm', ''));
    setOptimizedHtml(null);
    setViewMode(ViewMode.ORIGINAL);
    setError(null);
  };

  const handleOptimize = async () => {
    if (!originalHtml) return;
    
    setIsOptimizing(true);
    setError(null);
    
    try {
      const result = await optimizeHtmlForPdf(originalHtml);
      setOptimizedHtml(result.htmlBody);
      setDocTitle(result.title); // Update title if AI found a better one
      setViewMode(ViewMode.OPTIMIZED);
    } catch (err: any) {
      setError("AI Optimization failed. Please try again or use the original version.");
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getContentToPrint = () => {
     return viewMode === ViewMode.OPTIMIZED && optimizedHtml ? optimizedHtml : originalHtml;
  };

  const handlePrint = () => {
    const content = getContentToPrint();
    if (content) {
      printHtmlContent(content, docTitle);
    }
  };

  const handleNewTab = () => {
    const content = getContentToPrint();
    if (content) {
      openHtmlInNewTab(content, docTitle);
    }
  };

  const handleReset = () => {
    setOriginalHtml(null);
    setOptimizedHtml(null);
    setDocTitle("");
    setError(null);
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar / Controls */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-lg z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">
            HTML to PDF
          </h1>
          <p className="text-sm text-slate-500 mt-1">Convert & Optimize</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!originalHtml ? (
             <div className="text-sm text-slate-500">
                Upload a file to get started.
             </div>
          ) : (
            <div className="space-y-6">
              <div>
                 <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Document Info</h2>
                 <p className="font-medium text-slate-800 truncate" title={docTitle}>{docTitle}</p>
                 <div className="mt-2 text-xs text-slate-500 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${viewMode === ViewMode.ORIGINAL ? 'bg-orange-400' : 'bg-green-500'}`}></span>
                    Mode: {viewMode === ViewMode.ORIGINAL ? 'Raw HTML' : 'AI Optimized'}
                 </div>
              </div>

              <div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Actions</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setViewMode(ViewMode.ORIGINAL)}
                    className={`w-full flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                      viewMode === ViewMode.ORIGINAL 
                        ? 'bg-slate-100 text-slate-900 border border-slate-300 font-medium' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      View Original
                  </button>

                  <button
                    onClick={() => setViewMode(ViewMode.OPTIMIZED)}
                    disabled={!optimizedHtml}
                    className={`w-full flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                      viewMode === ViewMode.OPTIMIZED 
                        ? 'bg-brand-50 text-brand-700 border border-brand-200 font-medium' 
                        : 'text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent'
                    }`}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      View Optimized
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {!optimizedHtml && (
                  <button
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    className="w-full mb-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg px-4 py-3 text-sm font-medium shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isOptimizing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Optimizing...
                      </>
                    ) : (
                      <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                         </svg>
                         Clean & Optimize
                      </>
                    )}
                  </button>
                )}

                <div className="space-y-2">
                  <button
                    onClick={handlePrint}
                    className="w-full bg-brand-600 text-white rounded-lg px-4 py-3 text-sm font-medium shadow-md hover:bg-brand-700 transition-colors flex items-center justify-center group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print / Save as PDF
                  </button>

                  <button
                    onClick={handleNewTab}
                    className="w-full text-brand-600 text-xs font-medium hover:underline flex items-center justify-center py-2"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                     Preview in new tab
                  </button>
                </div>

                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800 border border-blue-100 text-center">
                  Tip: In the print dialog, select <strong>"Save as PDF"</strong> as the destination.
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-100 mt-4">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {originalHtml && (
           <div className="p-4 border-t border-slate-200 bg-slate-50">
             <button onClick={handleReset} className="text-slate-500 hover:text-red-500 text-xs font-medium transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear File
             </button>
           </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 h-full overflow-hidden flex flex-col relative">
        <div className="flex-1 h-full w-full max-w-5xl mx-auto flex flex-col">
           {!originalHtml ? (
             <div className="flex-1 flex flex-col justify-center items-center">
               <div className="w-full max-w-md">
                 <FileUpload onFileLoaded={handleFileLoaded} />
               </div>
               <p className="mt-8 text-slate-400 text-sm">
                 Supported formats: .html, .htm (e.g. Word exports, Save as Web Page)
               </p>
             </div>
           ) : (
             <HtmlPreview 
                html={getContentToPrint() || ""} 
                title={docTitle} 
             />
           )}
        </div>
      </main>
    </div>
  );
};

export default App;