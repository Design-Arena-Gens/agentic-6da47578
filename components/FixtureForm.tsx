"use client";

import { useEffect, useMemo, useState } from "react";
import { Competition, Fixture, Sport, Team } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface FixtureFormProps {
  sports: Sport[];
  competitions: Competition[];
  teams: Team[];
  fixture?: Fixture;
  onSubmit: (fixture: Fixture) => void;
  onDelete?: (fixtureId: string) => void;
}

const defaultCoverage = {
  feed: true,
  streams: true,
  tracking: false
};

export const FixtureForm = ({ sports, competitions, teams, fixture, onSubmit, onDelete }: FixtureFormProps) => {
  const [sportId, setSportId] = useState(fixture?.sportId ?? sports[0]?.id ?? "");
  const [competitionId, setCompetitionId] = useState(fixture?.competitionId ?? "");
  const [homeTeamId, setHomeTeamId] = useState(fixture?.homeTeamId ?? "");
  const [awayTeamId, setAwayTeamId] = useState(fixture?.awayTeamId ?? "");
  const [venue, setVenue] = useState(fixture?.venue ?? "");
  const [kickOff, setKickOff] = useState(fixture ? fixture.kickOff.slice(0, 16) : "");
  const [status, setStatus] = useState<Fixture["status"]>(fixture?.status ?? "scheduled");
  const [notes, setNotes] = useState(fixture?.notes ?? "");
  const [coverage, setCoverage] = useState(fixture?.coverage ?? defaultCoverage);

  useEffect(() => {
    if (!competitionId && sportId) {
      const fallbackCompetition = competitions.find((comp) => comp.sportId === sportId);
      if (fallbackCompetition) {
        setCompetitionId(fallbackCompetition.id);
      }
    }
  }, [sportId, competitionId, competitions]);

  useEffect(() => {
    if (!homeTeamId || !awayTeamId) {
      const sportTeams = teams.filter((team) => team.sportId === sportId && team.competitionIds.includes(competitionId));
      if (sportTeams.length >= 2) {
        setHomeTeamId((prev) => prev || sportTeams[0].id);
        setAwayTeamId((prev) => prev || sportTeams[1].id);
      }
    }
  }, [sportId, competitionId, teams, homeTeamId, awayTeamId]);

  const filteredCompetitions = useMemo(
    () => competitions.filter((comp) => comp.sportId === sportId),
    [competitions, sportId]
  );

  const filteredTeams = useMemo(
    () => teams.filter((team) => team.sportId === sportId && team.competitionIds.includes(competitionId)),
    [teams, sportId, competitionId]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sportId || !competitionId || !homeTeamId || !awayTeamId || !venue || !kickOff) return;

    const isoKickOff = new Date(kickOff).toISOString();

    const newFixture: Fixture = {
      id: fixture?.id ?? generateId("fix"),
      sportId,
      competitionId,
      homeTeamId,
      awayTeamId,
      venue,
      status,
      kickOff: isoKickOff,
      coverage,
      notes: notes.trim() || undefined
    };

    onSubmit(newFixture);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Sport</span>
          <select
            value={sportId}
            onChange={(event) => {
              setSportId(event.target.value);
              setCompetitionId("");
              setHomeTeamId("");
              setAwayTeamId("");
            }}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          >
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Competition</span>
          <select
            value={competitionId}
            onChange={(event) => {
              setCompetitionId(event.target.value);
              setHomeTeamId("");
              setAwayTeamId("");
            }}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          >
            {filteredCompetitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name} · {competition.season}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Home Team</span>
          <select
            value={homeTeamId}
            onChange={(event) => setHomeTeamId(event.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          >
            {filteredTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Away Team</span>
          <select
            value={awayTeamId}
            onChange={(event) => setAwayTeamId(event.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          >
            {filteredTeams
              .filter((team) => team.id !== homeTeamId)
              .map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Venue</span>
          <input
            value={venue}
            onChange={(event) => setVenue(event.target.value)}
            placeholder="Venue name"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Kick Off</span>
          <input
            type="datetime-local"
            value={kickOff}
            onChange={(event) => setKickOff(event.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as Fixture["status"])}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="delayed">Delayed</option>
            <option value="postponed">Postponed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>

      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Coverage</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Object.entries(coverage).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={value}
                onChange={(event) => setCoverage((prev) => ({ ...prev, [key]: event.target.checked }))}
                className="size-4 rounded border border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-400"
              />
              <span className="capitalize text-slate-300">{key}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Operational Notes</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Add relevant context for trading, mapping, or operations teams."
          className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-400"
        >
          {fixture ? "Update Fixture" : "Create Fixture"}
        </button>
        {fixture && onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(fixture.id)}
            className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
          >
            Remove Fixture
          </button>
        ) : null}
      </div>
    </form>
  );
};
