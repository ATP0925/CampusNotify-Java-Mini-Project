import React, { useEffect, useState } from 'react';
import {
  Bell,
  Search,
  Filter,
  FileText,
  Printer,
  Calendar,
  Eye,
  AlertCircle,
  Download,
  Building,
} from 'lucide-react';
import { Notice, NoticeCategory } from '../../types';
import { noticeService } from '../../services/noticeService';
import { OfficialLetterheadModal } from './OfficialLetterheadModal';

export const NoticeBoard: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoticeForLetterhead, setSelectedNoticeForLetterhead] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const cat = selectedCategory === 'ALL' ? undefined : selectedCategory;
        const res = await noticeService.getNotices(cat, searchQuery);
        setNotices(res);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-[#151e32] border border-slate-800 rounded-xl shadow-lg">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars by title, reference number, or keywords..."
            className="w-full pl-9 pr-4 py-2 bg-[#0b1120] border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'ACADEMIC', 'EXAM', 'PLACEMENT', 'CULTURAL'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 bg-[#0b1120] border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notice Circulars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notices.map((notice) => {
          const isUrgent = notice.priority === 'URGENT';
          const isHigh = notice.priority === 'HIGH';

          return (
            <div
              key={notice.id}
              className={`flex flex-col justify-between p-5 bg-[#151e32] border rounded-xl shadow-lg transition hover:border-slate-700 hover:translate-y-[-2px] ${
                isUrgent
                  ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/10 to-[#151e32]'
                  : isHigh
                  ? 'border-amber-500/30'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Notice Top Meta Bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                      {notice.refNo}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        notice.category === 'EXAM'
                          ? 'bg-rose-500/15 text-rose-300'
                          : notice.category === 'PLACEMENT'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : notice.category === 'ACADEMIC'
                          ? 'bg-blue-500/15 text-blue-300'
                          : 'bg-purple-500/15 text-purple-300'
                      }`}
                    >
                      {notice.category}
                    </span>
                  </div>

                  {isUrgent && (
                    <span className="flex items-center space-x-1 text-rose-400 text-xs font-mono font-semibold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>URGENT</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                  {notice.title}
                </h3>

                {/* Body Excerpt */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                  {notice.body}
                </p>
              </div>

              {/* Action / Issuing Footbar */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                  {notice.issuingAuthority}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedNoticeForLetterhead(notice)}
                    className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium border border-slate-700 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-400" />
                    <span>Official Letterhead</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Official Printable Letterhead Modal View */}
      {selectedNoticeForLetterhead && (
        <OfficialLetterheadModal
          notice={selectedNoticeForLetterhead}
          onClose={() => setSelectedNoticeForLetterhead(null)}
        />
      )}
    </div>
  );
};
