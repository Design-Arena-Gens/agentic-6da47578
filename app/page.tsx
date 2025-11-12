"use client";

import { useEffect, useMemo, useState } from "react";
import { FixturesTable } from "@/components/FixturesTable";
import { FixtureForm } from "@/components/FixtureForm";
import { MappingWorkbench } from "@/components/MappingWorkbench";
import { IssuePanel } from "@/components/IssuePanel";
import { CollaborationFeed } from "@/components/CollaborationFeed";
import { PricingPanel } from "@/components/PricingPanel";
import { OperationalSummary } from "@/components/OperationalSummary";
import { CompetitionPanel } from "@/components/CompetitionPanel";
import { TeamPanel } from "@/components/TeamPanel";
import { PlayerPanel } from "@/components/PlayerPanel";
import { useSportsActions, useSportsState } from "@/hooks/useSportsStore";
import { sportColor } from "@/lib/utils";
import clsx from "clsx";
import { format } from "date-fns";

const Page = () => {
  const state = useSportsState();
  const actions = useSportsActions();
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(state.fixtures[0]?.id ?? null);

  useEffect(() => {
    if (!selectedFixtureId && state.fixtures.length) {
      setSelectedFixtureId(state.fixtures[0].id);
    }
  }, [state.fixtures, selectedFixtureId]);

  const selectedFixture = useMemo(
    () => state.fixtures.find((fixture) => fixture.id === selectedFixtureId) ?? null,
    [state.fixtures, selectedFixtureId]
  );

  const fixtureSport = useMemo(
    () => state.sports.find((sport) => sport.id === selectedFixture?.sportId) ?? null,
    [state.sports, selectedFixture]
  );

  const fixtureCompetition = useMemo(
    () => state.competitions.find((competition) => competition.id === selectedFixture?.competitionId) ?? null,
    [state.competitions, selectedFixture]
  );

  const fixtureHomeTeam = useMemo(
    () => state.teams.find((team) => team.id === selectedFixture?.homeTeamId) ?? null,
    [state.teams, selectedFixture]
  );

  const fixtureAwayTeam = useMemo(
    () => state.teams.find((team) => team.id === selectedFixture?.awayTeamId) ?? null,
    [state.teams, selectedFixture]
  );

  const fixtureMappings = useMemo(
    () => state.mappings.filter((mapping) => mapping.fixtureId === selectedFixtureId),
    [state.mappings, selectedFixtureId]
  );

  const fixtureIssues = useMemo(
    () => state.issues.filter((issue) => issue.fixtureId === selectedFixtureId),
    [state.issues, selectedFixtureId]
  );

  const fixtureNotes = useMemo(
    () => state.notes.filter((note) => note.fixtureId === selectedFixtureId),
    [state.notes, selectedFixtureId]
  );

  const fixturePricing = useMemo(
    () => state.pricing.filter((pricing) => pricing.fixtureId === selectedFixtureId),
    [state.pricing, selectedFixtureId]
  );

  const fixtureClassification = useMemo(
    () => state.classifications.find((classification) => classification.fixtureId === selectedFixtureId) ?? undefined,
    [state.classifications, selectedFixtureId]
  );

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 md:px-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-xl shadow-black/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Sports Operations Control Center</h1>
            <p className="text-sm text-slate-400">
              Centralise fixtures, bookmaker mapping, and pricing workflows across global competitions.
            </p>
          </div>
          {selectedFixture && fixtureSport ? (
            <div
              className={clsx(
                "rounded-xl border border-slate-800 px-4 py-3 text-xs text-white shadow-inner shadow-black/30",
                "bg-gradient-to-br",
                sportColor(fixtureSport.code)
              )}
            >
              <div className="text-[0.65rem] uppercase tracking-wide text-white/70">Focus Fixture</div>
              <div className="text-sm font-semibold text-white">
                {fixtureHomeTeam?.shortName ?? "TBC"} vs {fixtureAwayTeam?.shortName ?? "TBC"}
              </div>
              <div className="text-[0.65rem] text-white/80">
                {format(new Date(selectedFixture.kickOff), "E dd MMM HH:mm")} · {fixtureCompetition?.name}
              </div>
            </div>
          ) : null}
        </div>
        <OperationalSummary
          fixtures={state.fixtures}
          mappings={state.mappings}
          classifications={state.classifications}
          issues={state.issues}
        />
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <FixturesTable
            fixtures={state.fixtures}
            teams={state.teams}
            classifications={state.classifications}
            mappings={state.mappings}
            issues={state.issues}
            selectedFixtureId={selectedFixtureId ?? undefined}
            onSelect={(fixtureId) => setSelectedFixtureId(fixtureId)}
          />
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              {selectedFixture ? "Update Fixture" : "Create Fixture"}
            </h2>
            <p className="text-xs text-slate-500">
              Maintain fixture accuracy with confirmed venues, kickoff times, and participants.
            </p>
            <div className="mt-4">
              <FixtureForm
                sports={state.sports}
                competitions={state.competitions}
                teams={state.teams}
                fixture={selectedFixture ?? undefined}
                onSubmit={(fixture) => {
                  actions.upsertFixture(fixture);
                  setSelectedFixtureId(fixture.id);
                }}
                onDelete={actions.deleteFixture}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {selectedFixture ? (
            <>
              <MappingWorkbench
                fixtureId={selectedFixture.id}
                bookmakers={state.bookmakers}
                mappings={fixtureMappings}
                onUpsert={actions.upsertMapping}
                onDelete={actions.deleteMapping}
              />
              <PricingPanel
                fixtureId={selectedFixture.id}
                classification={fixtureClassification}
                pricing={fixturePricing}
                bookmakers={state.bookmakers}
                onUpsertClassification={actions.upsertClassification}
                onRecordPricing={actions.recordPricing}
              />
              <IssuePanel fixtureId={selectedFixture.id} issues={fixtureIssues} onUpsert={actions.upsertIssue} />
              <CollaborationFeed
                fixtureId={selectedFixture.id}
                notes={fixtureNotes}
                onUpsert={actions.upsertNote}
                onDelete={actions.deleteNote}
              />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center text-sm text-slate-500">
              Select a fixture to manage bookmaker mapping, pricing readiness, and operational notes.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <CompetitionPanel sports={state.sports} competitions={state.competitions} onUpsert={actions.upsertCompetition} />
        <TeamPanel
          sports={state.sports}
          competitions={state.competitions}
          teams={state.teams}
          onUpsert={actions.upsertTeam}
        />
      </section>

      <PlayerPanel teams={state.teams} players={state.players} onUpsert={actions.upsertPlayer} />
    </main>
  );
};

export default Page;
