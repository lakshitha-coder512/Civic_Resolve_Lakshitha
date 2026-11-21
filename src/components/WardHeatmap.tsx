import { useMemo, useState } from 'react';
import { ArrowRight, Flame, MapPin } from 'lucide-react';
import { Complaint, WARD_DISTRICTS, WARDS } from '../types/civic';
import { PriorityLabel, StatusLabel } from './StatusText';

interface WardHeatmapProps {
  complaints: Complaint[];
  onInspectComplaint: (id: string) => void;
  selectedWardFilter?: string | null;
  onFilterByWard?: (ward: string | null) => void;
}

interface WardGeometry {
  ward: string;
  shortCode: string;
  path: string;
  labelX: number;
  labelY: number;
  countX: number;
  countY: number;
}

const WARD_SHAPES: WardGeometry[] = [
  {
    ward: 'Ward 6',
    shortCode: 'W6',
    path: 'M 24 24 L 210 24 L 230 120 L 130 144 L 24 134 Z',
    labelX: 112,
    labelY: 70,
    countX: 112,
    countY: 96,
  },
  {
    ward: 'Ward 7',
    shortCode: 'W7',
    path: 'M 218 24 L 414 24 L 402 128 L 238 120 Z',
    labelX: 316,
    labelY: 66,
    countX: 316,
    countY: 92,
  },
  {
    ward: 'Ward 8',
    shortCode: 'W8',
    path: 'M 422 24 L 576 24 L 576 176 L 444 164 L 410 128 Z',
    labelX: 498,
    labelY: 88,
    countX: 498,
    countY: 114,
  },
  {
    ward: 'Ward 3',
    shortCode: 'W3',
    path: 'M 24 142 L 132 152 L 176 238 L 116 276 L 24 266 Z',
    labelX: 90,
    labelY: 196,
    countX: 90,
    countY: 222,
  },
  {
    ward: 'Ward 4',
    shortCode: 'W4',
    path: 'M 140 150 L 234 128 L 306 132 L 296 238 L 184 236 Z',
    labelX: 226,
    labelY: 176,
    countX: 226,
    countY: 202,
  },
  {
    ward: 'Ward 5',
    shortCode: 'W5',
    path: 'M 314 132 L 404 136 L 438 170 L 424 248 L 304 240 Z',
    labelX: 368,
    labelY: 184,
    countX: 368,
    countY: 210,
  },
  {
    ward: 'Ward 1',
    shortCode: 'W1',
    path: 'M 184 244 L 300 248 L 424 256 L 404 356 L 210 356 Z',
    labelX: 300,
    labelY: 294,
    countX: 300,
    countY: 320,
  },
  {
    ward: 'Ward 2',
    shortCode: 'W2',
    path: 'M 24 274 L 118 284 L 178 246 L 202 356 L 24 356 Z',
    labelX: 114,
    labelY: 312,
    countX: 114,
    countY: 336,
  },
];

const WARD_8_EXTRA_PATH = 'M 446 172 L 576 184 L 576 356 L 412 356 L 432 252 Z';

interface WardMetrics {
  ward: string;
  district: string;
  total: number;
  active: number;
  resolved: number;
  criticalActive: number;
  highActive: number;
  items: Complaint[];
}

export function WardHeatmap({
  complaints,
  onInspectComplaint,
  selectedWardFilter,
  onFilterByWard,
}: WardHeatmapProps) {
  const [metricMode, setMetricMode] = useState<'active' | 'all'>('active');

  const wardMetricsMap = useMemo(() => {
    const map: Record<string, WardMetrics> = {};
    for (const ward of WARDS) {
      const items = complaints.filter((c) => c.ward === ward);
      const active = items.filter((c) => c.status !== 'Resolved').length;
      const resolved = items.filter((c) => c.status === 'Resolved').length;
      const criticalActive = items.filter(
        (c) => c.status !== 'Resolved' && c.priority === 'Critical'
      ).length;
      const highActive = items.filter(
        (c) => c.status !== 'Resolved' && c.priority === 'High'
      ).length;

      map[ward] = {
        ward,
        district: WARD_DISTRICTS[ward] || ward,
        total: items.length,
        active,
        resolved,
        criticalActive,
        highActive,
        items,
      };
    }
    return map;
  }, [complaints]);

  const hottestWard = useMemo(() => {
    const sorted = [...WARDS].sort((a, b) => {
      const ma = wardMetricsMap[a];
      const mb = wardMetricsMap[b];
      if (mb.criticalActive !== ma.criticalActive) return mb.criticalActive - ma.criticalActive;
      if (mb.active !== ma.active) return mb.active - ma.active;
      return mb.total - ma.total;
    });
    return sorted[0] || 'Ward 4';
  }, [wardMetricsMap]);

  const [focusedWard, setFocusedWard] = useState<string>(hottestWard);
  const currentWard = selectedWardFilter || focusedWard;
  const currentMetrics = wardMetricsMap[currentWard] || wardMetricsMap['Ward 4'];

  const getHeatStyle = (m: WardMetrics) => {
    const count = metricMode === 'active' ? m.active : m.total;
    if (m.criticalActive > 0 && metricMode === 'active') {
      return {
        fill: '#E11D48',
        textFill: '#FFFFFF',
        subFill: '#FFE4E6',
        tierLabel: 'Critical Hotspot',
        tierColor: 'text-rose-700',
        stroke: '#881337',
      };
    }
    if (count >= 2 || (m.highActive > 0 && metricMode === 'active')) {
      return {
        fill: '#F59E0B',
        textFill: '#FFFFFF',
        subFill: '#FEF3C7',
        tierLabel: 'Elevated Density',
        tierColor: 'text-amber-700',
        stroke: '#B45309',
      };
    }
    if (count === 1) {
      return {
        fill: '#0EA5E9',
        textFill: '#FFFFFF',
        subFill: '#E0F2FE',
        tierLabel: 'Moderate Activity',
        tierColor: 'text-sky-700',
        stroke: '#0369A1',
      };
    }
    return {
      fill: '#D1FAE5',
      textFill: '#065F46',
      subFill: '#047857',
      tierLabel: 'Nominal',
      tierColor: 'text-emerald-700',
      stroke: '#34D399',
    };
  };

  return (
    <div className="border border-indigo-200/80 rounded-2xl bg-white overflow-hidden shadow-sm">
      {/* Header Toolbar */}
      <div className="px-6 py-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-sky-50/70 to-teal-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-700">Spatial Density &amp; Hotspots</p>
          <h2 className="mt-0.5 font-display text-xl font-bold text-navy-900">
            City Ward Issue Heatmap
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Vibrant Heat Scale Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-400" aria-hidden="true" />
              <span>Nominal (0)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-500" aria-hidden="true" />
              <span>Moderate (1)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500" aria-hidden="true" />
              <span>Elevated (2+ / High)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-600" aria-hidden="true" />
              <span>Critical Hotspot</span>
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-white/90 border border-indigo-100 rounded-lg" role="tablist" aria-label="Heatmap density mode">
            <button
              type="button"
              role="tab"
              aria-selected={metricMode === 'active'}
              onClick={() => setMetricMode('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                metricMode === 'active'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-indigo-700'
              }`}
            >
              Active Issues
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={metricMode === 'all'}
              onClick={() => setMetricMode('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                metricMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-indigo-700'
              }`}
            >
              All Reports
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map + Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-indigo-100">
        {/* Left: Interactive SVG District Map */}
        <div className="lg:col-span-7 p-5 sm:p-6 bg-gradient-to-br from-sky-50/40 via-white to-teal-50/40">
          <div className="rounded-xl border border-indigo-100 bg-white p-3">
            <svg
              viewBox="0 0 600 380"
              className="w-full h-auto select-none"
              role="img"
              aria-label="Interactive city map of Wards 1 through 8 showing live complaint density"
            >
              <defs>
                <pattern id="wardGridColor" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E0E7FF" strokeWidth="0.7" />
                </pattern>
              </defs>
              <rect width="600" height="380" fill="url(#wardGridColor)" rx="8" />

              {/* River & Transit Lines */}
              <path
                d="M 16 268 Q 130 250 182 240 T 432 252 L 584 260"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.45"
              />
              <path
                d="M 214 16 L 236 126 L 180 242 L 206 364"
                fill="none"
                stroke="#818CF8"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.55"
              />

              {WARD_SHAPES.map((shape) => {
                const m = wardMetricsMap[shape.ward];
                const style = getHeatStyle(m);
                const isSelected = currentWard === shape.ward;
                const displayCount = metricMode === 'active' ? m.active : m.total;

                return (
                  <g
                    key={shape.ward}
                    role="button"
                    tabIndex={0}
                    aria-label={`${shape.ward}, ${m.district}: ${displayCount} ${metricMode === 'active' ? 'active' : 'total'} complaints`}
                    onClick={() => {
                      setFocusedWard(shape.ward);
                      if (onFilterByWard) {
                        onFilterByWard(selectedWardFilter === shape.ward ? null : shape.ward);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setFocusedWard(shape.ward);
                        if (onFilterByWard) {
                          onFilterByWard(selectedWardFilter === shape.ward ? null : shape.ward);
                        }
                      }
                    }}
                    className="cursor-pointer focus:outline-none group"
                  >
                    <path
                      d={shape.path}
                      fill={style.fill}
                      stroke={isSelected ? '#1E1B4B' : style.stroke}
                      strokeWidth={isSelected ? 3.5 : 1.5}
                      className="transition-opacity duration-150 group-hover:opacity-90"
                    />
                    {shape.ward === 'Ward 8' && (
                      <path
                        d={WARD_8_EXTRA_PATH}
                        fill={style.fill}
                        stroke={isSelected ? '#1E1B4B' : style.stroke}
                        strokeWidth={isSelected ? 3.5 : 1.5}
                        className="transition-opacity duration-150 group-hover:opacity-90"
                      />
                    )}

                    <text
                      x={shape.labelX}
                      y={shape.labelY}
                      textAnchor="middle"
                      fill={style.textFill}
                      fontSize="13"
                      fontWeight="700"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {shape.ward}
                    </text>

                    <text
                      x={shape.countX}
                      y={shape.countY}
                      textAnchor="middle"
                      fill={style.subFill}
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {displayCount} {displayCount === 1 ? 'issue' : 'issues'}
                    </text>

                    {m.criticalActive > 0 && (
                      <g transform={`translate(${shape.labelX + 34}, ${shape.labelY - 12})`}>
                        <circle cx="0" cy="0" r="7.5" fill="#1E1B4B" stroke="#FFFFFF" strokeWidth="1.5" />
                        <path d="M0 -3.5V0.5M0 3H0.01" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {WARDS.map((ward) => {
              const m = wardMetricsMap[ward];
              const count = metricMode === 'active' ? m.active : m.total;
              const isSelected = currentWard === ward;
              return (
                <button
                  key={ward}
                  type="button"
                  onClick={() => {
                    setFocusedWard(ward);
                    if (onFilterByWard) {
                      onFilterByWard(selectedWardFilter === ward ? null : ward);
                    }
                  }}
                  className={`px-2 py-2 rounded-lg border text-center transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-gradient-to-br from-indigo-600 to-teal-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-indigo-50 text-navy-900'
                  }`}
                >
                  <span className="block text-[11px] font-semibold whitespace-nowrap">
                    {ward.replace('Ward ', 'W')}
                  </span>
                  <span
                    className={`block font-mono text-xs tabular-nums ${
                      isSelected ? 'text-amber-200' : 'text-indigo-700 font-semibold'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Ward Dossier */}
        <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                  <span>{currentMetrics.district}</span>
                </div>
                <h3 className="mt-1 font-display text-lg font-bold text-navy-900">
                  {currentMetrics.ward} Overview
                </h3>
              </div>

              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${
                  getHeatStyle(currentMetrics).tierColor
                }`}
              >
                {currentMetrics.criticalActive > 0 && (
                  <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{getHeatStyle(currentMetrics).tierLabel}</span>
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <div className="px-3.5 py-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <p className="text-[11px] font-medium text-indigo-700">Total</p>
                <p className="mt-0.5 font-display text-xl font-bold text-indigo-900 tabular-nums">
                  {currentMetrics.total}
                </p>
              </div>
              <div className="px-3.5 py-3 rounded-xl bg-amber-50/70 border border-amber-100">
                <p className="text-[11px] font-medium text-amber-700">Active</p>
                <p className="mt-0.5 font-display text-xl font-bold text-amber-800 tabular-nums">
                  {currentMetrics.active}
                </p>
              </div>
              <div className="px-3.5 py-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <p className="text-[11px] font-medium text-emerald-700">Resolved</p>
                <p className="mt-0.5 font-display text-xl font-bold text-emerald-800 tabular-nums">
                  {currentMetrics.resolved}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-semibold text-navy-900">
                  Reports in {currentMetrics.ward}
                </p>
                {onFilterByWard && selectedWardFilter && (
                  <button
                    type="button"
                    onClick={() => onFilterByWard(null)}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                  >
                    Clear ward filter
                  </button>
                )}
              </div>

              {currentMetrics.items.length === 0 ? (
                <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center">
                  <p className="text-xs font-semibold text-emerald-900">
                    No incidents logged in {currentMetrics.ward}
                  </p>
                  <p className="mt-1 text-xs text-emerald-700">
                    All municipal infrastructure sensors and citizen channels report normal status.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden max-h-[260px] overflow-y-auto">
                  {currentMetrics.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 hover:bg-indigo-50/40 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-mono font-semibold text-indigo-700 tabular-nums">
                            {item.id}
                          </span>
                          <span aria-hidden="true">·</span>
                          <StatusLabel status={item.status} />
                        </div>
                        <p className="mt-1 text-xs font-semibold text-navy-900 line-clamp-1">
                          {item.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                          <PriorityLabel priority={item.priority} />
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{item.category}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onInspectComplaint(item.id)}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-[11px] font-semibold text-indigo-800 cursor-pointer whitespace-nowrap"
                      >
                        <span>Track</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {onFilterByWard && (
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                {selectedWardFilter
                  ? `Operations table filtered to ${selectedWardFilter}`
                  : 'Click a ward on the map to filter the table below'}
              </span>
              <button
                type="button"
                onClick={() =>
                  onFilterByWard(selectedWardFilter === currentWard ? null : currentWard)
                }
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {selectedWardFilter === currentWard ? 'Show All Wards' : `Filter ${currentWard}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
