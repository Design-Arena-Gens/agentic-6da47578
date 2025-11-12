"use client";

import { useMemo, useState } from "react";
import { Competition, Sport, Team } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface TeamPanelProps {
  sports: Sport[];
  competitions: Competition[];
  teams: Team[];
  onUpsert: (team: Team) => void;
}

export const TeamPanel = ({ sports, competitions, teams, onUpsert }: TeamPanelProps) => {
  const [sportId, setSportId] = useState(sports[0]?.id ?? "");
  const [competitionId, setCompetitionId] = useState<string>(competitions[0]?.id ?? "");
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#60a5fa");
  const [homeVenue, setHomeVenue] = useState("");

  const filteredCompetitions = useMemo(
    () => competitions.filter((competition) => competition.sportId === sportId),
    [competitions, sportId]
  );

  const groupedTeams = useMemo(
    () =>
      sports.map((sport) => ({
        sport,
        teams: teams.filter((team) => team.sportId === sport.id)
      })),
    [sports, teams]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sportId || !competitionId || !name.trim() || !shortName.trim()) return;
    onUpsert({
      id: generateId("team"),
      sportId,
      competitionIds: [competitionId],
      name: name.trim(),
      shortName: shortName.trim(),
      primaryColor,
      secondaryColor,
      homeVenue: homeVenue.trim() || undefined
    });
    setName("");
    setShortName("");
    setHomeVenue("");
  };

  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <header>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Team Control</h3>
        <p className="text-xs text-slate-500">Ensure each team is mapped to correct competitions and color identity.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Sport</span>
          <select
            value={sportId}
            onChange={(event) => {
              const nextSport = event.target.value;
              setSportId(nextSport);
              const firstComp = competitions.find((comp) => comp.sportId === nextSport);
              setCompetitionId(firstComp?.id ?? "");
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
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Competition</span>
          <select
            value={competitionId}
            onChange={(event) => setCompetitionId(event.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          >
            {filteredCompetitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Team Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full team name"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Short Name</span>
          <input
            value={shortName}
            onChange={(event) => setShortName(event.target.value)}
            placeholder="3-5 character short name"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Home Venue</span>
          <input
            value={homeVenue}
            onChange={(event) => setHomeVenue(event.target.value)}
            placeholder="Stadium or arena"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Primary Color</span>
            <input
              type="color"
              value={primaryColor}
              onChange={(event) => setPrimaryColor(event.target.value)}
              className="h-10 w-full cursor-pointer rounded-lg border border-slate-800 bg-slate-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Secondary Color</span>
            <input
              type="color"
              value={secondaryColor}
              onChange={(event) => setSecondaryColor(event.target.value)}
              className="h-10 w-full cursor-pointer rounded-lg border border-slate-800 bg-slate-900"
            />
          </label>
        </div>

        <button
          type="submit"
          className="md:col-span-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400"
        >
          Add Team
        </button>
      </form>

      <div className="space-y-3">
        {groupedTeams.map(({ sport, teams: sportTeams }) => (
          <div key={sport.id} className="rounded-xl border border-slate-900 bg-slate-950/60 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{sport.name}</h4>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {sportTeams.map((team) => (
                <div
                  key={team.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-300"
                >
                  <div className="text-sm font-semibold text-white">{team.name}</div>
                  <div className="text-slate-400">{team.shortName}</div>
                  <div className="mt-2 flex items-center gap-2 text-[0.65rem] text-slate-500">
                    <span className="inline-flex h-4 w-4 rounded-full" style={{ backgroundColor: team.primaryColor }} />
                    <span className="inline-flex h-4 w-4 rounded-full" style={{ backgroundColor: team.secondaryColor }} />
                    <span>{team.homeVenue ?? "Venue N/A"}</span>
                  </div>
                </div>
              ))}
              {!sportTeams.length && (
                <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/40 p-4 text-center text-xs text-slate-500">
                  No teams recorded for this sport.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
