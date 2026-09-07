import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Plus,
  ShieldCheck,
  Briefcase,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { validateDocxFile } from '../../utils/fileHelpers.js';

export default function EditorEmptyState({ onNewDocument, onOpenFile, onSelectTemplate }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validation = validateDocxFile(file);
      if (validation.valid) {
        onOpenFile(file);
      } else {
        alert(validation.error || 'Please drop a valid .docx file.');
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onOpenFile(file);
      e.target.value = '';
    }
  };

  return (
    <div
      id="editor-empty-state"
      className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 bg-[#F3F4F6]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="empty-state-file-input"
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Intro */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-[#2B579A] text-xs font-semibold mb-3 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2B579A]" />
            100% Client-Side DOCX Engine • Private & Local
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            MZ Word
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
            Create, format, and edit Word documents directly in your browser. All processing is local — your files never leave your device.
          </p>
        </div>

        {/* Primary Action Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Create Blank Doc */}
          <button
            id="empty-state-new-doc-card"
            onClick={onNewDocument}
            className="group relative flex flex-col items-start p-6 bg-white hover:bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#2B579A] shadow-xs hover:shadow-md transition-all text-left cursor-pointer"
          >
            <div className="w-12 h-12 rounded-lg bg-[#2B579A] group-hover:bg-[#204377] text-white flex items-center justify-center mb-4 shadow-sm transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#2B579A] transition-colors">
                New Blank Document
              </h3>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-[#2B579A] transition-colors" />
            </div>
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
              Start writing a fresh document with standard margins, default formatting, and full Word styling tools.
            </p>
          </button>

          {/* Upload / Drag and Drop */}
          <div
            id="empty-state-drop-zone"
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex flex-col items-start p-6 bg-white hover:bg-gray-50 rounded-xl border-2 transition-all text-left cursor-pointer ${
              isDragging
                ? 'border-[#2B579A] bg-blue-50/50 shadow-md ring-4 ring-[#2B579A]/10'
                : 'border-gray-200 hover:border-[#2B579A] shadow-xs hover:shadow-md'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-gray-800 group-hover:bg-gray-900 text-white flex items-center justify-center mb-4 shadow-sm transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#2B579A] transition-colors">
                Open Existing .docx File
              </h3>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-[#2B579A] transition-colors" />
            </div>
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
              {isDragging ? (
                <span className="font-semibold text-[#2B579A]">Drop your .docx file right here to open</span>
              ) : (
                'Select a file from your computer or drag and drop a .docx file here to inspect and edit.'
              )}
            </p>
          </div>
        </div>

        {/* Quick Starter Templates */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Document Starters
            </h2>
            <span className="text-xs text-gray-400">Pre-styled formats</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              id="template-blank-doc-btn"
              onClick={onNewDocument}
              className="flex items-center gap-3 p-3.5 bg-white hover:bg-blue-50/40 rounded-lg border border-gray-200 hover:border-[#2B579A]/50 transition-all text-left group shadow-xs"
            >
              <div className="w-9 h-9 rounded-md bg-blue-50 text-[#2B579A] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 group-hover:text-[#2B579A] truncate">
                  Blank Letter / A4
                </p>
                <p className="text-xs text-gray-400 truncate">Clean standard sheet</p>
              </div>
            </button>

            <button
              id="template-proposal-btn"
              onClick={() => onSelectTemplate && onSelectTemplate('proposal')}
              className="flex items-center gap-3 p-3.5 bg-white hover:bg-blue-50/40 rounded-lg border border-gray-200 hover:border-[#2B579A]/50 transition-all text-left group shadow-xs"
            >
              <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 group-hover:text-[#2B579A] truncate">
                  Business Proposal
                </p>
                <p className="text-xs text-gray-400 truncate">Headings & table setup</p>
              </div>
            </button>

            <button
              id="template-meeting-btn"
              onClick={() => onSelectTemplate && onSelectTemplate('meeting')}
              className="flex items-center gap-3 p-3.5 bg-white hover:bg-blue-50/40 rounded-lg border border-gray-200 hover:border-[#2B579A]/50 transition-all text-left group shadow-xs"
            >
              <div className="w-9 h-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 group-hover:text-[#2B579A] truncate">
                  Meeting Notes
                </p>
                <p className="text-xs text-gray-400 truncate">Agenda & action items</p>
              </div>
            </button>
          </div>
        </div>

        {/* Privacy footnote */}
        <div className="mt-8 flex items-center gap-2 text-xs text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero cloud uploads. Your documents remain strictly within this browser session.</span>
        </div>
      </div>
    </div>
  );
}
