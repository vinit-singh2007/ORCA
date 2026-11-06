/**
 * SstDailyChart — Responsive SVG Line Chart & Data Table Fallback
 * 
 * Sourced directly from ORCA Frontend Handoff §10:
 * - Line chart with date on X and °C on Y
 * - Interactive hover tooltips
 * - Chronologically sorted 31-day data points
 * - No interpolation of missing dates, no converting missing values to zero
 * - Readable accessible table fallback
 */

'use client';

import React, { useState } from 'react';
import { BarChart3, Table as TableIcon } from 'lucide-react';

interface SstDailyChartProps {
  dailyMeans: Record<string, number>;
  units?: string;
}

export function SstDailyChart({ dailyMeans, units = '°C' }: SstDailyChartProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; temp: number; x: number; y: number } | null>(null);

  // Convert and sort chronologically per §10
  const points = Object.entries(dailyMeans || {})
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, temperature]) => ({ date, temperature }));

  if (points.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[#6B7280] border border-[#E5E7EB] rounded bg-[#FFFFFF]">
        No daily sample observations available in this result payload.
      </div>
    );
  }

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Temperature domain
  const temps = points.map((p) => p.temperature);
  const rawMin = Math.min(...temps);
  const rawMax = Math.max(...temps);
  // Add 0.2°C margin to avoid clipping
  const minTemp = Math.floor((rawMin - 0.2) * 10) / 10;
  const maxTemp = Math.ceil((rawMax + 0.2) * 10) / 10;
  const tempRange = maxTemp - minTemp || 1;

  // Coordinate scales
  const getX = (index: number) => {
    if (points.length === 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (points.length - 1)) * chartWidth;
  };

  const getY = (temp: number) => {
    const ratio = (temp - minTemp) / tempRange;
    return padding.top + chartHeight - ratio * chartHeight;
  };

  // Build SVG path
  const pathD = points.reduce((acc, point, index) => {
    const x = getX(index);
    const y = getY(point.temperature);
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Horizontal grid lines (4 lines)
  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const tempVal = minTemp + (tempRange * i) / gridSteps;
    const yVal = getY(tempVal);
    return { tempVal, yVal };
  });

  return (
    <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
      {/* Header Bar with View Toggle */}
      <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#111827]">
            Daily Sample Mean Sea Surface Temperature ({points.length} Daily Observations)
          </h3>
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            Preserved historical MUR SST sample series · Foundation temperature ({units})
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#FFFFFF] border border-[#E5E7EB] p-0.5 rounded">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setViewMode('chart')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition ${
              viewMode === 'chart'
                ? 'bg-[#111827] text-[#FFFFFF]'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Line Chart</span>
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition ${
              viewMode === 'table'
                ? 'bg-[#111827] text-[#FFFFFF]'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Data Table</span>
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <div className="p-4 relative">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-h-[380px] select-none"
              style={{ minWidth: '550px' }}
            >
              {/* Horizontal Grid lines and Y-axis labels */}
              {gridLines.map(({ tempVal, yVal }, idx) => (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={yVal}
                    x2={width - padding.right}
                    y2={yVal}
                    stroke="#E5E7EB"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 8}
                    y={yVal + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="#6B7280"
                    fontFamily="monospace"
                  >
                    {tempVal.toFixed(1)} {units}
                  </text>
                </g>
              ))}

              {/* Data Line Path */}
              <path
                d={pathD}
                fill="none"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map((p, index) => {
                const cx = getX(index);
                const cy = getY(p.temperature);
                const isHovered = hoveredPoint?.date === p.date;

                return (
                  <g key={p.date}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5 : 3}
                      fill={isHovered ? '#111827' : '#FFFFFF'}
                      stroke="#111827"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPoint({ date: p.date, temp: p.temperature, x: cx, y: cy })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}

              {/* X-axis labels: show start, mid, end dates */}
              {points.length > 0 && (
                <>
                  <text
                    x={getX(0)}
                    y={height - 12}
                    textAnchor="start"
                    fontSize="10"
                    fill="#6B7280"
                    fontFamily="monospace"
                  >
                    {points[0].date}
                  </text>
                  <text
                    x={getX(Math.floor(points.length / 2))}
                    y={height - 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6B7280"
                    fontFamily="monospace"
                  >
                    {points[Math.floor(points.length / 2)].date}
                  </text>
                  <text
                    x={getX(points.length - 1)}
                    y={height - 12}
                    textAnchor="end"
                    fontSize="10"
                    fill="#6B7280"
                    fontFamily="monospace"
                  >
                    {points[points.length - 1].date}
                  </text>
                </>
              )}
            </svg>
          </div>

          {/* Active tooltip floating bar */}
          <div className="mt-3 py-2 px-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded text-xs flex items-center justify-between">
            <span className="text-[#6B7280]">
              {hoveredPoint ? (
                <>
                  Observation Date: <strong className="font-mono text-[#111827]">{hoveredPoint.date}</strong>
                </>
              ) : (
                'Hover over any point in the chart to inspect daily mean'
              )}
            </span>
            <span className="font-mono text-[#111827] font-semibold">
              {hoveredPoint ? `${hoveredPoint.temp.toFixed(3)} ${units}` : `Sample Extent: ${points.length} Days`}
            </span>
          </div>
        </div>
      ) : (
        /* Data Table Fallback per §10 */
        <div className="max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] sticky top-0 font-mono text-[#4B5563] uppercase">
              <tr>
                <th className="py-2.5 px-4 font-semibold">#</th>
                <th className="py-2.5 px-4 font-semibold">Observation Date (UTC)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Daily Sample Mean</th>
                <th className="py-2.5 px-4 font-semibold text-right">Variance from Mean</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {points.map((p, idx) => {
                const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
                const diff = p.temperature - avg;
                return (
                  <tr key={p.date} className="hover:bg-[#F9FAFB] transition">
                    <td className="py-2 px-4 font-mono text-[#6B7280]">{idx + 1}</td>
                    <td className="py-2 px-4 font-mono font-medium text-[#111827]">{p.date}</td>
                    <td className="py-2 px-4 font-mono font-bold text-[#111827] text-right">
                      {p.temperature.toFixed(4)} {units}
                    </td>
                    <td className="py-2 px-4 font-mono text-xs text-right">
                      <span className={diff >= 0 ? 'text-[#111827]' : 'text-[#6B7280]'}>
                        {diff >= 0 ? `+${diff.toFixed(3)}` : diff.toFixed(3)} {units}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

