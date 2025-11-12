"use client";

import { Fixture, FixtureMapping, MarketClassification, OperationIssue, Team } from "@/lib/types";
import clsx from "clsx";
import { format } from "date-fns";
import { useMemo } from "react";

interface FixturesTableProps {
  fixtures: Fixture[];
  teams: Team[];
  classifications: MarketClassification[];
  mappings: FixtureMapping[];
  issues: OperationIssue[];
  selectedFixtureId?: string;
  onSelect: (fixtureId: string) => void;
}

const statusBadge: Record<Fixture["status"], string> = {
  scheduled: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
  "in-progress": "bg-sky-500/10 text-sky-300 border border-sky-500/30",
  delayed: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
  completed: "bg-violet-500/10 text-violet-300 border border-violet-500/30",
  postponed: "bg-amber-700/10 text-amber-200 border border-amber-600/30",
  cancelled: "bg-rose-500/10 text-rose-200 border border-rose-500/30"
};

const mappingBadge: Record<string, string> = {
  complete: "text-emerald-300",
  pending: "text-slate-300",
  issue: "text-rose-300",
  "needs-review": "text-amber-300"
};

export const FixturesTable = ({
  fixtures,
  teams,
  classifications,
  mappings,
  issues,
  selectedFixtureId,
  onSelect
}: FixturesTableProps) => {
  const fixtureRows = useMemo(
    () =>
      fixtures
        .slice()
        .sort((a, b) => a.kickOff.localeCompare(b.kickOff))
        .map((fixture) => {
          const home = teams.find((team) => team.id === fixture.homeTeamId);
          const away = teams.find((team) => team.id === fixture.awayTeamId);
          const classification = classifications.find((cls) => cls.fixtureId === fixture.id);
          const lateMappings = mappings.filter((mapping) => mapping.fixtureId === fixture.id);
          const unresolvedIssues = issues.filter((issue) => issue.fixtureId === fixture.id);
          return {
            fixture,
            home,
            away,
            classification,
            lateMappings,
            unresolvedIssues
          };
        }),
    [fixtures, teams, classifications, mappings, issues]
  );

  if (!fixtures.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-sm text-slate-400">
        No fixtures available. Create your first fixture to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <table className="min-w-full divide-y divide-slate-800">
        <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-5 py-3 text-left">Fixture</th>
            <th className="px-5 py-3 text-left">Kick Off</th>
            <th className="px-5 py-3 text-left">Status</th>
            <th className="px-5 py-3 text-left">Classification</th>
            <th className="px-5 py-3 text-left">Bookmakers</th>
            <th className="px-5 py-3 text-left">Issues</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {fixtureRows.map(({ fixture, home, away, classification, lateMappings, unresolvedIssues }) => (
            <tr
              key={fixture.id}
              onClick={() => onSelect(fixture.id)}
              className={clsx(
                "cursor-pointer bg-gradient-to-r from-transparent via-transparent to-transparent transition-all hover:via-slate-900/30",
                selectedFixtureId === fixture.id ? "via-brand-500/10 hover:via-brand-500/15" : ""
              )}
            >
              <td className="px-5 py-4 text-sm">
                <div className="flex flex-col">
                  <span className="font-semibold text-white">
                    {home?.shortName ?? "TBC"} <span className="text-slate-500">vs</span> {away?.shortName ?? "TBC"}
                  </span>
                  <span className="text-xs text-slate-400">{fixture.venue}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-slate-300">
                <div className="flex flex-col">
                  <span>{format(new Date(fixture.kickOff), "E dd MMM yyyy")}</span>
                  <span className="text-xs text-slate-500">{format(new Date(fixture.kickOff), "HH:mm 'UTC'")}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-sm">
                <span className={clsx("rounded-full px-2.5 py-1 text-xs font-medium", statusBadge[fixture.status])}>
                  {fixture.status.replace("-", " ")}
                </span>
              </td>
              <td className="px-5 py-4 text-sm">
                {classification ? (
                  <div className="flex flex-col text-xs text-slate-300">
                    <span className="font-semibold text-white">{classification.template}</span>
                    <span className="text-slate-400 capitalize">
                      {classification.marketStatus.replace("-", " ")} · {classification.riskLevel} risk
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-amber-300">Missing classification</span>
                )}
              </td>
              <td className="px-5 py-4 text-xs text-slate-300">
                <div className="flex flex-col gap-1">
                  {lateMappings.map((mapping) => (
                    <span key={mapping.id} className={mappingBadge[mapping.status]}>
                      {mapping.bookmakerId} · {Math.round(mapping.confidence * 100)}% conf
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-5 py-4 text-xs">
                {unresolvedIssues.length ? (
                  <div className="flex flex-col gap-1">
                    {unresolvedIssues.map((issue) => (
                      <span
                        key={issue.id}
                        className={clsx(
                          "rounded-md border px-2 py-1 font-medium capitalize",
                          issue.severity === "critical" || issue.severity === "high"
                            ? "border-rose-500/50 bg-rose-500/10 text-rose-200"
                            : issue.severity === "medium"
                              ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                              : "border-slate-600 bg-slate-800/60 text-slate-200"
                        )}
                      >
                        {issue.severity}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500">Clear</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
