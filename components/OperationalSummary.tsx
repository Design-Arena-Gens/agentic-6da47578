"use client";

import { MetricCard } from "./MetricCard";
import { Fixture, FixtureMapping, MarketClassification, OperationIssue } from "@/lib/types";

interface OperationalSummaryProps {
  fixtures: Fixture[];
  mappings: FixtureMapping[];
  classifications: MarketClassification[];
  issues: OperationIssue[];
}

const percent = (part: number, total: number) => {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
};

const trendText = (value: number, label: string) => `${value} ${label}`;

export const OperationalSummary = ({ fixtures, mappings, classifications, issues }: OperationalSummaryProps) => {
  const mappedFixtures = new Set(mappings.filter((mapping) => mapping.status === "complete").map((mapping) => mapping.fixtureId)).size;
  const openIssues = issues.filter((issue) => issue.severity === "critical" || issue.severity === "high").length;
  const pricingReady = classifications.filter((cls) => cls.marketStatus === "ready").length;
  const upcoming = fixtures.filter((fixture) => fixture.status === "scheduled").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Fixtures Scheduled" value={upcoming} trend={trendText(upcoming, "upcoming fixtures requiring monitoring")} />
      <MetricCard label="Mapping Coverage" value={percent(mappedFixtures, fixtures.length)} trend={`${mappedFixtures}/${fixtures.length} fixtures confirmed with bookmakers`} />
      <MetricCard label="Pricing Ready" value={pricingReady} trend={`${percent(pricingReady, fixtures.length)} of fixtures have classifications`} />
      <MetricCard label="High Priority Issues" value={openIssues} trend={openIssues ? "Urgent attention required" : "All clear across priority fixtures"} />
    </div>
  );
};
