import React, { useCallback } from 'react';

interface FileUploadProps {
  onFileLoaded: (content: string, filename: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/html' && !file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert("Please upload a valid .html file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoaded(content, file.name);
    };
    reader.readAsText(file);
  }, [onFileLoaded]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
      <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload HTML Document</h3>
      <p className="text-slate-500 mb-6 max-w-sm">
        Select an HTML file (export from Word, PowerPoint, or saved web page) to convert to PDF.
      </p>
      <label className="cursor-pointer bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all active:scale-95">
        <span>Select File</span>
        <input 
          type="file" 
          accept=".html,.htm" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};
