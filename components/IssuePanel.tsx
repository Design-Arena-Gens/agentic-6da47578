"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { generateId } from "@/lib/utils";
import { OperationIssue } from "@/lib/types";

interface IssuePanelProps {
  fixtureId: string;
  issues: OperationIssue[];
  onUpsert: (issue: OperationIssue) => void;
}

const severityOptions: OperationIssue["severity"][] = ["critical", "high", "medium", "low"];

export const IssuePanel = ({ fixtureId, issues, onUpsert }: IssuePanelProps) => {
  const [severity, setSeverity] = useState<OperationIssue["severity"]>("medium");
  const [message, setMessage] = useState("");
  const [suggestedAction, setSuggestedAction] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    onUpsert({
      id: generateId("issue"),
      fixtureId,
      severity,
      message: message.trim(),
      suggestedAction: suggestedAction.trim() || "Review with trading team",
      detectedAt: new Date().toISOString()
    });
    setMessage("");
    setSuggestedAction("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Operational Issues</h3>
        <span className="text-xs text-slate-500">{issues.length} open</span>
      </div>
      <div className="flex flex-col gap-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm shadow-black/20"
          >
            <div className="flex items-center justify-between text-xs">
              <span
                className={`rounded-md px-2 py-1 font-semibold capitalize ${
                  issue.severity === "critical"
                    ? "bg-rose-500/20 text-rose-200"
                    : issue.severity === "high"
                      ? "bg-amber-500/20 text-amber-200"
                      : issue.severity === "medium"
                        ? "bg-sky-500/20 text-sky-200"
                        : "bg-slate-700/30 text-slate-200"
                }`}
              >
                {issue.severity}
              </span>
              <span className="text-[0.65rem] text-slate-400">
                detected {formatDistanceToNow(new Date(issue.detectedAt))} ago
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-white">{issue.message}</p>
            <p className="mt-2 text-xs text-slate-300">
              Suggested action: <span className="font-semibold text-slate-100">{issue.suggestedAction}</span>
            </p>
          </div>
        ))}
        {!issues.length && (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-500">
            No issues detected. Keep monitoring bookmaker sync and data completeness.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Severity</span>
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value as OperationIssue["severity"])}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          >
            {severityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Issue Summary</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            placeholder="Describe the issue impacting fixture integrity or mapping."
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Suggested Action</span>
          <textarea
            value={suggestedAction}
            onChange={(event) => setSuggestedAction(event.target.value)}
            rows={2}
            placeholder="Recommended follow-up or internal contact."
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Log Issue for Fixture
        </button>
      </form>
    </div>
  );
};
