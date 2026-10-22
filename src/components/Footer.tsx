import React from 'react';
import { Cloud, ExternalLink, Sparkles, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/80 text-slate-400 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Main Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                Official Curriculum Alignment
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Disclaimer: Unofficial AZ-900 study tool based on public Microsoft Learn objectives. Microsoft, Azure, and Microsoft Learn are registered trademarks of Microsoft Corporation.
              </p>
            </div>
          </div>

          <a
            href="https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/?practice-assessment-type=certification"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Microsoft Learn Exam Guide</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Brand and Movement Tribute */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-400" />
            <span className="font-extrabold text-white text-sm">AzureVibe</span>
            <span className="text-slate-600">·</span>
            <span>Empowering the next generation of certified cloud developers</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Built for the</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              #1MillionDevs Movement
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
