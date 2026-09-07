import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

// Walk the DOM tree to find all text node matches
function findAllMatches(container, query) {
  if (!container || !query) return [];
  const matches = [];
  const lowerQuery = query.toLowerCase();
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  
  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent;
    if (!text) continue;
    const lowerText = text.toLowerCase();
    let startIdx = 0;
    while (true) {
      const idx = lowerText.indexOf(lowerQuery, startIdx);
      if (idx === -1) break;
      matches.push({ node, offset: idx, length: query.length });
      startIdx = idx + 1;
    }
  }
  return matches;
}

// Get the SuperDoc editor container element
function getEditorContainer() {
  return (
    document.querySelector('.superdoc__sub-document') ||
    document.querySelector('.superdoc-editor-container') ||
    document.querySelector('.ProseMirror') ||
    document.querySelector('[contenteditable="true"]')
  );
}

// Clear all our custom highlights
function clearHighlights() {
  document.querySelectorAll('mark[data-find-highlight]').forEach((mark) => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    }
  });
}

// Highlight a specific match by wrapping it in a <mark> tag
function highlightMatch(match, isCurrent = false) {
  const { node, offset, length } = match;
  const range = document.createRange();
  range.setStart(node, offset);
  range.setEnd(node, offset + length);

  const mark = document.createElement('mark');
  mark.setAttribute('data-find-highlight', 'true');
  mark.style.backgroundColor = isCurrent ? '#FFA500' : '#FFFF00';
  mark.style.color = '#000';
  mark.style.padding = '0';
  mark.style.borderRadius = '2px';

  range.surroundContents(mark);
  return mark;
}

export default function FindReplacePanel({ onClose }) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const inputRef = useRef(null);
  const highlightMarksRef = useRef([]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    return () => clearHighlights();
  }, []);

  // Run search whenever findText changes
  const runSearch = useCallback((query) => {
    clearHighlights();
    highlightMarksRef.current = [];
    
    if (!query) {
      setMatchCount(0);
      setCurrentIdx(-1);
      return;
    }

    const container = getEditorContainer();
    if (!container) {
      setMatchCount(0);
      setCurrentIdx(-1);
      return;
    }

    const matches = findAllMatches(container, query);
    setMatchCount(matches.length);

    if (matches.length === 0) {
      setCurrentIdx(-1);
      return;
    }

    // Highlight all matches (go in reverse to preserve DOM offsets)
    const marks = [];
    for (let i = matches.length - 1; i >= 0; i--) {
      const mark = highlightMatch(matches[i], i === 0);
      marks.unshift(mark);
    }
    
    highlightMarksRef.current = marks;
    setCurrentIdx(0);

    // Scroll to first match
    if (marks[0]) {
      marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch(findText);
    }, 300);
    return () => clearTimeout(timer);
  }, [findText, runSearch]);

  const goToMatch = useCallback((idx) => {
    const marks = highlightMarksRef.current;
    if (marks.length === 0) return;

    marks.forEach((m) => {
      if (m && m.parentNode) m.style.backgroundColor = '#FFFF00';
    });

    const mark = marks[idx];
    if (mark && mark.parentNode) {
      mark.style.backgroundColor = '#FFA500';
      mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setCurrentIdx(idx);
  }, []);

  const handleFindNext = () => {
    if (highlightMarksRef.current.length === 0) return;
    const nextIdx = (currentIdx + 1) % highlightMarksRef.current.length;
    goToMatch(nextIdx);
  };

  const handleFindPrev = () => {
    if (highlightMarksRef.current.length === 0) return;
    const prevIdx = (currentIdx - 1 + highlightMarksRef.current.length) % highlightMarksRef.current.length;
    goToMatch(prevIdx);
  };

  const handleReplace = () => {
    if (!findText || highlightMarksRef.current.length === 0 || currentIdx < 0) return;

    const mark = highlightMarksRef.current[currentIdx];
    if (!mark || !mark.parentNode) return;

    const textNode = document.createTextNode(replaceText);
    mark.parentNode.replaceChild(textNode, mark);
    textNode.parentNode.normalize();

    runSearch(findText);
  };

  const handleReplaceAll = () => {
    if (!findText || highlightMarksRef.current.length === 0) return;

    const count = highlightMarksRef.current.length;

    for (let i = highlightMarksRef.current.length - 1; i >= 0; i--) {
      const mark = highlightMarksRef.current[i];
      if (mark && mark.parentNode) {
        const textNode = document.createTextNode(replaceText);
        mark.parentNode.replaceChild(textNode, mark);
        textNode.parentNode.normalize();
      }
    }

    highlightMarksRef.current = [];
    setMatchCount(0);
    setCurrentIdx(-1);

    alert(`Replaced ${count} occurrence(s).`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        handleFindPrev();
      } else {
        handleFindNext();
      }
    }
  };

  const handleClose = () => {
    clearHighlights();
    onClose();
  };

  return (
    <div className="absolute top-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-neutral-200 p-3 w-80 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
          <Search className="w-4 h-4" /> Find & Replace
        </h3>
        <button onClick={handleClose} className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-700 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Find Row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 bg-neutral-100 border border-neutral-200 rounded-md px-2 focus-within:ring-1 focus-within:border-[#2B579A] transition-all">
          <input
            ref={inputRef}
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find text..."
            className="flex-1 bg-transparent border-none outline-none text-sm py-1.5 min-w-0"
          />
          <span className="text-[10px] text-neutral-500 font-medium px-1 whitespace-nowrap">
            {matchCount > 0 ? `${currentIdx + 1}/${matchCount}` : '0/0'}
          </span>
          <div className="w-[1px] h-4 bg-neutral-300 mx-0.5"></div>
          <button onClick={handleFindPrev} className="p-1 hover:bg-neutral-200 rounded text-neutral-500 transition-colors" title="Previous (Shift+Enter)">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={handleFindNext} className="p-1 hover:bg-neutral-200 rounded text-neutral-500 transition-colors" title="Next (Enter)">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Replace Row */}
        <div className="flex items-center gap-1 bg-neutral-100 border border-neutral-200 rounded-md px-2 focus-within:ring-1 focus-within:border-[#2B579A] transition-all">
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace with..."
            className="flex-1 bg-transparent border-none outline-none text-sm py-1.5 min-w-0"
          />
          <button
            onClick={handleReplace}
            disabled={matchCount === 0}
            className="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 disabled:opacity-40 rounded text-[11px] font-medium text-neutral-700 transition-colors"
            title="Replace current"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={matchCount === 0}
            className="px-2 py-1 bg-[#2B579A]/10 hover:bg-[#2B579A]/20 disabled:opacity-40 text-[#2B579A] rounded text-[11px] font-bold transition-colors"
            title="Replace all"
          >
            All
          </button>
        </div>
      </div>
    </div>
  );
}
