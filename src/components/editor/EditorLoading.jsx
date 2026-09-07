import React from 'react';

export default function EditorLoading({ message = 'Welcome to MZ Word', subMessage = 'Preparing your document environment...' }) {
  return (
    <div
      id="editor-loading-screen"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm select-none"
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Stylized 'W' Logo (scaled up version of the header logo) */}
        <div className="relative mb-6">
          <div className="bg-white p-2 rounded-xl shadow-lg border border-neutral-100 flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2B579A] to-[#1A365D] rounded-lg flex items-center justify-center text-white font-black text-4xl shadow-inner">
              W
            </div>
          </div>
          
          {/* Subtle spinning ring around the logo */}
          <div className="absolute -inset-3 rounded-2xl border-[3px] border-transparent border-t-[#2B579A]/40 border-r-[#2B579A]/40 animate-spin" style={{ animationDuration: '2s' }}></div>
        </div>

        {/* Text content */}
        <h3 className="text-xl font-bold bg-gradient-to-b from-neutral-800 to-neutral-600 bg-clip-text text-transparent tracking-tight">
          {message}
        </h3>
        <p className="mt-2 text-sm text-neutral-500 max-w-xs text-center font-medium">
          {subMessage}
        </p>
        
        {/* Minimal loading bar */}
        <div className="w-32 h-1 bg-neutral-200 rounded-full overflow-hidden mt-6 relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#2B579A] to-[#1A365D] rounded-full w-1/2 animate-[pulse_1s_ease-in-out_infinite]" />
        </div>

      </div>
    </div>
  );
}
