import React from 'react';
import { AlertCircle, X, Upload, FileText } from 'lucide-react';

export default function ErrorModal({ error, onClose, onOpenFile }) {
  if (!error) return null;

  return (
    <div
      id="error-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
    >
      <div
        id="error-modal-dialog"
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-50/80 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="error-modal-title" className="text-base font-semibold text-red-950">
                {typeof error === 'string' && error.toLowerCase().includes('export') ? 'Unable to Export Document' : 'Unable to Open Document'}
              </h3>
              <p className="text-xs text-red-700">
                {typeof error === 'string' && error.toLowerCase().includes('export') ? 'File export issue' : 'File parsing or format issue'}
              </p>
            </div>
          </div>
          <button
            id="close-error-modal-btn"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-red-100/50 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-neutral-700 leading-relaxed">
            {typeof error === 'string' ? error : error?.message || 'An unexpected error occurred while parsing the DOCX file.'}
          </p>

          <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
            <p className="font-medium text-neutral-800">Troubleshooting tips:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-600">
              <li>Make sure the file is a standard <span className="font-semibold text-neutral-700">.docx</span> document (not legacy .doc, .rtf, or .pdf).</li>
              <li>Check that the document is not password-protected or corrupted.</li>
              <li>Try opening and re-saving the document in Word or Google Docs.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-neutral-50/80 border-t border-neutral-100">
          <button
            id="error-modal-dismiss-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            Dismiss
          </button>
          {onOpenFile && (
            <button
              id="error-modal-try-another-btn"
              type="button"
              onClick={() => {
                onClose();
                onOpenFile();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2B579A] hover:bg-[#204377] rounded-lg shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              Try Another File
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
