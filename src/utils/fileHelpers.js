/**
 * Utility functions for local DOCX file validation, sizing, and client-side downloads.
 */

export const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/**
 * Validates whether a file is likely a valid DOCX document.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateDocxFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  const name = file.name || '';
  const isDocxExtension = /\.docx$/i.test(name);
  const isDocxMime = file.type === DOCX_MIME_TYPE || file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.type === 'application/octet-stream';

  if (!isDocxExtension && file.type && !isDocxMime) {
    return {
      valid: false,
      error: `"${name}" does not appear to be a .docx file. Only Microsoft Word (.docx) documents are supported.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `"${name}" is empty (0 bytes). Please select a valid document.`,
    };
  }

  // Large file advisory (> 50MB)
  if (file.size > 50 * 1024 * 1024) {
    return {
      valid: true,
      warning: `This file is quite large (${formatFileSize(file.size)}). Processing may take a few moments.`,
    };
  }

  return { valid: true };
}

/**
 * Formats byte count into a readable string (e.g., 42 KB, 3.2 MB)
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Ensures the document file name has a proper .docx extension
 * and strips problematic OS characters.
 * @param {string} rawName
 * @param {string} [defaultName='Document.docx']
 * @returns {string}
 */
export function cleanDocxFileName(rawName, defaultName = 'Document.docx') {
  if (!rawName || typeof rawName !== 'string') return defaultName;
  let cleaned = rawName.trim().replace(/[\\/:*?"<>|]/g, '-');
  if (!cleaned) return defaultName;
  if (!/\.docx$/i.test(cleaned)) {
    cleaned += '.docx';
  }
  return cleaned;
}

/**
 * Client-side file downloader using an ephemeral Object URL.
 * Cleans up memory immediately after trigger.
 * @param {Blob} blob
 * @param {string} filename
 */
export function triggerBrowserDownload(blob, filename = 'document.docx') {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = cleanDocxFileName(filename);
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Revoke object URL after a short timeout to ensure browser has received the stream
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 15000);
}
