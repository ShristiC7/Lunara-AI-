import React, { useState } from 'react';
import { PenLine } from 'lucide-react';
import { LoggerModal } from '../logger/LoggerModal';

export const QuickLogFAB: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        id="quick-log-fab"
        aria-label="Log today's symptoms"
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-7 py-3.5 
                   bg-lunara-core text-white font-bold text-sm rounded-premium-2xl
                   shadow-[0_8px_32px_rgba(124,58,237,0.40)]
                   hover:bg-lunara-glow active:scale-[0.97] transition-all duration-200
                   md:left-auto md:right-8 md:translate-x-0"
      >
        <PenLine size={18} strokeWidth={1.5} />
        Log today
      </button>

      {open && <LoggerModal onClose={() => setOpen(false)} />}
    </>
  );
};
