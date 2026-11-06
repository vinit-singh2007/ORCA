/**
 * ORCA 3.0 — O03 Durable Queue and Job Health Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.10 Screen O03 (Durable queue and job health)
 * - UI URL: /admin/jobs
 * - Primary personas: Platform Operator, DevOps Engineer
 * - Highest referenced API gate: P08 (Institutional operations)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.14: GET /v1/admin/jobs (durable worker queue status)
 * - api design.md §3.14: POST /v1/admin/jobs/{id}/retry (retry failed dead-letter task)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Worker node telemetry and execution queues without fake animation graphics
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  Cpu,
  Layers,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Pause,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface WorkerJob {
  id: string;
  taskType: string;
  investigationRef: string;
  workerNode: string;
  durationSeconds: number;
  state: 'running' | 'queued' | 'completed' | 'failed';
  retryCount: number;
}

const MOCK_JOBS: WorkerJob[] = [
  {
    id: 'job-9812',
    taskType: 'science.sst.seasonal_anomaly',
    investigationRef: '00000000-0000-4000-8000-000000000201',
    workerNode: 'worker-ocean-gpu-01',
    durationSeconds: 42,
    state: 'completed',
    retryCount: 0,
  },
  {
    id: 'job-9813',
    taskType: 'catalog.erddap.snapshot_ingest',
    investigationRef: 'incois-hr-sst-snapshot',
    workerNode: 'worker-ingest-io-03',
    durationSeconds: 118,
    state: 'running',
    retryCount: 0,
  },
  {
    id: 'job-9814',
    taskType: 'science.upwelling.bakun_index',
    investigationRef: '00000000-0000-4000-8000-000000000202',
    workerNode: 'worker-ocean-cpu-02',
    durationSeconds: 0,
    state: 'queued',
    retryCount: 0,
  },
];

export default function DurableJobsPage() {
  const [jobs, setJobs] = useState<WorkerJob[]>(MOCK_JOBS);

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/admin/system" className="hover:text-[#111827]">
            Platform Ops
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Job Queues & Workers</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Durable Computation Queues & Node Health</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                O03 · P08
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Hermetic worker pool state, running NetCDF processing jobs, and queue concurrency controllers.
            </p>
          </div>

          <Badge variant="outline">REDIS CELERY BACKEND</Badge>
        </div>

        {/* Worker Pool Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-[#E5E7EB] rounded p-4 bg-[#FFFFFF]">
            <span className="text-xs text-[#6B7280] block">Active Scientific Workers</span>
            <span className="font-mono text-xl font-semibold text-[#111827] mt-1 block">8 / 8 Online</span>
          </div>
          <div className="border border-[#E5E7EB] rounded p-4 bg-[#FFFFFF]">
            <span className="text-xs text-[#6B7280] block">Queued Computation Tasks</span>
            <span className="font-mono text-xl font-semibold text-[#111827] mt-1 block">1 Task</span>
          </div>
          <div className="border border-[#E5E7EB] rounded p-4 bg-[#FFFFFF]">
            <span className="text-xs text-[#6B7280] block">Dead-Letter / Failed Retries</span>
            <span className="font-mono text-xl font-semibold text-[#111827] mt-1 block">0 Failed</span>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F8F9FA] flex justify-between items-center text-xs">
            <span className="font-semibold text-[#111827]">Recent Durable Job Executions</span>
            <span className="font-mono text-[#6B7280] text-[11px]">{jobs.length} jobs tracked</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#FFFFFF] border-b border-[#E5E7EB] text-[#6B7280] font-mono text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Job ID / Type</th>
                <th className="px-4 py-2.5">Target Scope</th>
                <th className="px-4 py-2.5">Worker Node</th>
                <th className="px-4 py-2.5">Elapsed</th>
                <th className="px-4 py-2.5 text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] font-semibold text-[#111827] block">{job.id}</span>
                    <span className="font-mono text-[10px] text-[#6B7280]">{job.taskType}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#4B5563]">
                    {job.investigationRef.slice(0, 16)}...
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#111827]">{job.workerNode}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#6B7280]">{job.durationSeconds}s</td>
                  <td className="px-4 py-3 text-right">
                    <Badge
                      variant={
                        job.state === 'completed'
                          ? 'success'
                          : job.state === 'running'
                          ? 'outline'
                          : 'neutral'
                      }
                    >
                      {job.state.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}

