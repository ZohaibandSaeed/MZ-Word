import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo
} from 'react';
import { SuperDocEditor } from '@superdoc-dev/react';
import { DOCX } from 'superdoc';
import { triggerBrowserDownload, cleanDocxFileName } from '../../utils/fileHelpers.js';
import EditorLoading from './EditorLoading.jsx';
import { UploadCloud } from 'lucide-react';

const DocxEditor = forwardRef(function DocxEditor(
  {
    documentSource,
    documentMode = 'editing',
    onReady,
    onUpdate,
    onError,
    onZoomChange,
    onDropFile,
    onPageChange,
    className = ''
  },
  ref
) {
  const superDocRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Expose imperative methods to parent
  useImperativeHandle(
    ref,
    () => ({
      getInstance: () => superDocRef.current?.getInstance() || null,

      exportDocument: async (fileName = 'document.docx', preventDownload = false) => {
        const instance = superDocRef.current?.getInstance();
        if (!instance) {
          throw new Error('Editor instance is not initialized.');
        }

        const safeName = cleanDocxFileName(fileName);
        try {
          // SuperDoc export method
          const blob = await instance.export({
            exportType: ['docx'],
            exportedName: safeName,
            triggerDownload: !preventDownload,
          });

          return blob;
        } catch (err) {
          console.error('[DocxEditor] Export failed:', err);
          throw err;
        }
      },

      setZoom: (percent) => {
        const instance = superDocRef.current?.getInstance();
        if (instance && typeof instance.setZoom === 'function') {
          instance.setZoom(percent);
        }
      },

      getZoom: () => {
        const instance = superDocRef.current?.getInstance();
        return instance && typeof instance.getZoom === 'function' ? instance.getZoom() : 100;
      },

      setZoomMode: (mode) => {
        const instance = superDocRef.current?.getInstance();
        if (instance && typeof instance.setZoomMode === 'function') {
          instance.setZoomMode(mode);
        }
      },

      toggleFormattingMarks: () => {
        const instance = superDocRef.current?.getInstance();
        if (instance && typeof instance.toggleFormattingMarks === 'function') {
          instance.toggleFormattingMarks();
        }
      },

      toggleRuler: () => {
        const instance = superDocRef.current?.getInstance();
        if (instance && typeof instance.toggleRuler === 'function') {
          instance.toggleRuler();
        }
      },

      setDocumentMode: (mode) => {
        const instance = superDocRef.current?.getInstance();
        if (instance && typeof instance.setDocumentMode === 'function') {
          instance.setDocumentMode(mode);
        }
      },

      focus: () => {
        const instance = superDocRef.current?.getInstance();
        if (instance && typeof instance.focus === 'function') {
          instance.focus();
        }
      }
    }),
    []
  );

  // Stable event callbacks
  const handleReady = useCallback(
    (event) => {
      setIsReady(true);
      if (onReady) {
        onReady(event);
      }
    },
    [onReady]
  );

  const handleEditorUpdate = useCallback(
    (event) => {
      if (onUpdate) {
        onUpdate(event);
      }
    },
    [onUpdate]
  );

  const handleContentError = useCallback(
    (event) => {
      console.error('[DocxEditor] Content Error:', event);
      if (onError) {
        onError(event?.error || new Error('Error rendering document content.'));
      }
    },
    [onError]
  );

  const handleException = useCallback(
    (event) => {
      console.error('[DocxEditor] Exception Event:', event);
      if (onError) {
        onError(event?.error || new Error('An internal editor exception occurred.'));
      }
    },
    [onError]
  );

  const handleZoomChange = useCallback(
    (event) => {
      if (onZoomChange && event?.zoom) {
        onZoomChange(event.zoom);
      }
    },
    [onZoomChange]
  );

  // Drag-and-drop handling directly over the editor viewport
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if leaving the outer element
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (onDropFile) {
          onDropFile(file);
        }
      }
    },
    [onDropFile]
  );

  // Track current page and total pages
  useEffect(() => {
    if (!isReady || !onPageChange) return;

    let rafId;
    const updatePages = () => {
      // Look for page elements using common superdoc classes/attributes
      const pages = Array.from(document.querySelectorAll('.superdoc-page, [data-page-index], [data-page]'));
      // Remove duplicates if some elements have multiple of these selectors
      const uniquePages = Array.from(new Set(pages));

      const count = uniquePages.length || 1;
      let current = 1;
      let minDistance = Infinity;

      // Calculate which page is closest to the middle of the viewport
      const centerY = window.innerHeight / 2;

      uniquePages.forEach((page, index) => {
        const rect = page.getBoundingClientRect();
        // Distance from center of page to center of viewport
        const pageCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(pageCenterY - centerY);
        if (distance < minDistance) {
          minDistance = distance;
          current = index + 1;
        }
      });

      onPageChange(current, count);
    };

    const root = document.getElementById('docx-editor-root');
    let container = document.querySelector('.superdoc-editor-container');

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePages);
    };

    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      // Fallback if the container isn't found immediately
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Observe DOM changes to detect when pages are added or removed
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePages);
    });

    if (root) {
      observer.observe(root, { childList: true, subtree: true });
    }

    // Initial check
    setTimeout(updatePages, 500);
    setTimeout(updatePages, 2000);

    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [isReady, onPageChange]);

  const renderLoading = useCallback(() => {
    return <EditorLoading message="Welcome to MZ Word" subMessage="Preparing your document environment..." />;
  }, []);

  return (
    <div
      id="docx-editor-root"
      className={`relative flex-1 w-full h-full flex flex-col overflow-hidden bg-neutral-200/70 ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* SuperDoc Editor Component */}
      <SuperDocEditor
        ref={superDocRef}
        document={documentSource}
        documentMode={documentMode}
        findReplace={true}
        contained={true}
        className="flex-1 w-full h-full"
        renderLoading={renderLoading}
        onReady={handleReady}
        onEditorUpdate={handleEditorUpdate}
        onContentError={handleContentError}
        onException={handleException}
        onZoomChange={handleZoomChange}
      />

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div
          id="editor-drag-overlay"
          className="absolute inset-0 z-40 bg-blue-600/10 backdrop-blur-xs border-4 border-dashed border-blue-500 rounded-lg flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150"
        >
          <div className="bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-200">
            <UploadCloud className="w-8 h-8 text-blue-600 animate-bounce" />
            <div>
              <p className="text-sm font-semibold text-neutral-900">Drop your .docx file to open</p>
              <p className="text-xs text-neutral-500">Document will load locally in the editor</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default React.memo(DocxEditor);
