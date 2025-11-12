"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmaker, FixtureMapping } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

interface MappingWorkbenchProps {
  fixtureId: string;
  bookmakers: Bookmaker[];
  mappings: FixtureMapping[];
  onUpsert: (mapping: FixtureMapping) => void;
  onDelete: (mappingId: string) => void;
}

const statusOptions: FixtureMapping["status"][] = ["complete", "pending", "issue", "needs-review"];

export const MappingWorkbench = ({ fixtureId, bookmakers, mappings, onUpsert, onDelete }: MappingWorkbenchProps) => {
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(mappings[0]?.id ?? null);
  const [externalFixtureId, setExternalFixtureId] = useState("");
  const [status, setStatus] = useState<FixtureMapping["status"]>("pending");
  const [confidence, setConfidence] = useState(0.8);
  const [markets, setMarkets] = useState<string>("");
  const [bookmakerId, setBookmakerId] = useState(bookmakers[0]?.id ?? "");
  const [issues, setIssues] = useState<string>("");

  const selectedMapping = useMemo(
    () => mappings.find((mapping) => mapping.id === selectedMappingId) ?? null,
    [mappings, selectedMappingId]
  );

  useEffect(() => {
    if (selectedMapping) {
      setExternalFixtureId(selectedMapping.externalFixtureId);
      setStatus(selectedMapping.status);
      setConfidence(selectedMapping.confidence);
      setMarkets(selectedMapping.marketsCovered.join(", "));
      setBookmakerId(selectedMapping.bookmakerId);
      setIssues(selectedMapping.issues?.join("\n") ?? "");
    } else {
      setExternalFixtureId("");
      setStatus("pending");
      setConfidence(0.8);
      setMarkets("");
      setBookmakerId(bookmakers[0]?.id ?? "");
      setIssues("");
    }
  }, [selectedMapping, bookmakers]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookmakerId) return;
    const marketsCovered = markets
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const normalizedIssues = issues
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
    const mapping: FixtureMapping = {
      id: selectedMapping?.id ?? generateId("map"),
      fixtureId,
      bookmakerId,
      externalFixtureId: externalFixtureId.trim(),
      marketsCovered,
      status,
      confidence,
      lastSynced: selectedMapping?.lastSynced ?? new Date().toISOString(),
      issues: normalizedIssues.length ? normalizedIssues : undefined
    };
    onUpsert(mapping);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Bookmaker Mapping</h3>
        <button
          type="button"
          onClick={() => setSelectedMappingId(null)}
          className="text-xs font-medium text-brand-300 hover:text-brand-200"
        >
          + New mapping
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {mappings.map((mapping) => (
          <button
            key={mapping.id}
            type="button"
            onClick={() => setSelectedMappingId(mapping.id)}
            className={clsx(
              "rounded-lg border px-3 py-2 text-left text-xs transition",
              selectedMappingId === mapping.id
                ? "border-brand-500/70 bg-brand-500/10 text-brand-200"
                : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
            )}
          >
            <div className="font-semibold">{mapping.bookmakerId}</div>
            <div className="text-[0.65rem] text-slate-400">
              {mapping.externalFixtureId ? mapping.externalFixtureId : "Missing external id"}
            </div>
          </button>
        ))}
      </div>

      {selectedMapping ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span>Last sync {formatDistanceToNow(new Date(selectedMapping.lastSynced))} ago</span>
            <button
              type="button"
              onClick={() => onDelete(selectedMapping.id)}
              className="text-rose-300 hover:text-rose-200"
            >
              Delete mapping
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Bookmaker</span>
            <select
              value={bookmakerId}
              onChange={(event) => setBookmakerId(event.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              {bookmakers.map((bookmaker) => (
                <option key={bookmaker.id} value={bookmaker.id}>
                  {bookmaker.name} · {bookmaker.region}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">External Fixture ID</span>
            <input
              value={externalFixtureId}
              onChange={(event) => setExternalFixtureId(event.target.value)}
              placeholder="e.g. EPL-ARS-MCI-2024-07-14"
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as FixtureMapping["status"])}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace("-", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Confidence</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={confidence}
              onChange={(event) => setConfidence(Number(event.target.value))}
            />
            <span className="mt-1 text-xs text-slate-400">{Math.round(confidence * 100)}%</span>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Markets Covered</span>
          <textarea
            value={markets}
            onChange={(event) => setMarkets(event.target.value)}
            rows={2}
            placeholder="Comma separated markets e.g. match-result, double-chance"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Outstanding Issues</span>
          <textarea
            value={issues}
            onChange={(event) => setIssues(event.target.value)}
            rows={2}
            placeholder="One issue per line"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400"
        >
          {selectedMapping ? "Update Mapping" : "Create Mapping"}
        </button>
      </form>
    </div>
  );
};
