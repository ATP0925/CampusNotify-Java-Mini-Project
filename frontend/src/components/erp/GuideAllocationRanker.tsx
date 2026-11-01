import React, { useEffect, useState } from 'react';
import {
  Users,
  Award,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useErpStore } from '../../stores/useErpStore';
import { useAuthStore } from '../../stores/useAuthStore';

export const GuideAllocationRanker: React.FC = () => {
  const { user } = useAuthStore();
  const {
    facultyGuides,
    selectedPreferences,
    matchedGuide,
    allocationStatus,
    loadFacultyGuides,
    addPreference,
    removePreference,
    movePreference,
    submitPreferences,
  } = useErpStore();

  const [projectTitle, setProjectTitle] = useState(
    'Smart Autonomous Campus Infrastructure with Zero-Lag Synchronization'
  );
  const [domain, setDomain] = useState('AI & Distributed Systems');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFacultyGuides();
  }, [loadFacultyGuides]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitPreferences('GRP_2026_09');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#151e32] border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Users className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Gale-Shapley Major Project Guide Allocation (Deferred Acceptance)
            </h3>
            <p className="text-xs text-slate-400">
              Optimal group matching with composite scoring & deterministic tie-breaking
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
            allocationStatus === 'ALLOCATED'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
          }`}
        >
          {allocationStatus === 'ALLOCATED' ? 'Allocated (Round 1)' : 'Preference Phase'}
        </span>
      </div>

      {/* Matched Guide Notification Banner if Allocated */}
      {allocationStatus === 'ALLOCATED' && matchedGuide && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-emerald-400 font-mono font-semibold uppercase">
                Gale-Shapley Stable Match Confirmed
              </div>
              <div className="text-sm font-bold text-white">{matchedGuide.name}</div>
              <div className="text-xs text-slate-300">
                {matchedGuide.designation} — {matchedGuide.domain}
              </div>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-emerald-400">
            <div>Group: GRP_2026_09</div>
            <div className="text-[10px] text-slate-400">Allocation Letter Ready</div>
          </div>
        </div>
      )}

      {/* Group Project Details Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-[#0b1120] border border-slate-800 rounded-lg text-xs font-mono">
        <div>
          <label className="text-slate-400 block mb-1">Capstone Project Title</label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full p-2 bg-[#151e32] border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Primary Research Domain</label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full p-2 bg-[#151e32] border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="AI & Distributed Systems">AI & Distributed Systems</option>
            <option value="Cybersecurity & Cryptography">Cybersecurity & Cryptography</option>
            <option value="IoT & Edge Computing">IoT & Edge Computing</option>
            <option value="Natural Language Processing">Natural Language Processing</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout: Available Guides vs Selected Top-5 Ranked Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Department Faculty Guide Roster */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Available Faculty Guides</span>
            <span className="text-[10px] text-slate-500 font-mono">Click + to add</span>
          </div>

          <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
            {facultyGuides.map((guide) => {
              const isSelected = selectedPreferences.includes(guide.id);
              return (
                <div
                  key={guide.id}
                  className="flex items-center justify-between p-2.5 bg-[#0b1120] border border-slate-800 rounded-lg text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{guide.name}</div>
                    <div className="text-[11px] text-slate-400">{guide.domain}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Quota: {guide.currentAllocations}/{guide.quota} Slots Filled
                    </div>
                  </div>
                  <button
                    onClick={() => addPreference(guide.id)}
                    disabled={isSelected || selectedPreferences.length >= 5}
                    className="px-2.5 py-1 bg-blue-600/80 hover:bg-blue-500 disabled:opacity-30 text-white rounded text-xs font-semibold transition"
                  >
                    {isSelected ? 'Added' : '+ Rank'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Ordered Top-5 Preferences Ranker */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Ranked Preferences (Top 5)</span>
            <span className="text-[10px] text-purple-400 font-mono">
              {selectedPreferences.length} / 5 Selected
            </span>
          </div>

          {selectedPreferences.length === 0 ? (
            <div className="p-8 bg-[#0b1120] border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500">
              Select guides from the left roster to build your group's Gale-Shapley ranking list.
            </div>
          ) : (
            <div className="space-y-1.5">
              {selectedPreferences.map((guideId, index) => {
                const guide = facultyGuides.find((g) => g.id === guideId);
                if (!guide) return null;

                return (
                  <div
                    key={guideId}
                    className="flex items-center justify-between p-2.5 bg-purple-950/20 border border-purple-500/30 rounded-lg text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-purple-600/40 text-purple-300 font-mono font-bold flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-white">{guide.name}</div>
                        <div className="text-[10px] text-slate-400">{guide.domain}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => movePreference(index, 'UP')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                        title="Move Priority Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => movePreference(index, 'DOWN')}
                        disabled={index === selectedPreferences.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                        title="Move Priority Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removePreference(guideId)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Submit Preferences Button */}
          <button
            onClick={handleSubmit}
            disabled={selectedPreferences.length === 0 || isSubmitting}
            className="w-full mt-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition shadow"
          >
            {isSubmitting ? 'Submitting to Algorithm...' : 'Submit Final Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};
