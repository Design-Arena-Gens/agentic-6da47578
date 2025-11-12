"use client";

import { useMemo, useState } from "react";
import { Competition, Sport } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface CompetitionPanelProps {
  sports: Sport[];
  competitions: Competition[];
  onUpsert: (competition: Competition) => void;
}

const tiers: Competition["tier"][] = ["professional", "semi-professional", "international", "youth"];

export const CompetitionPanel = ({ sports, competitions, onUpsert }: CompetitionPanelProps) => {
  const [sportId, setSportId] = useState(sports[0]?.id ?? "");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [governingBody, setGoverningBody] = useState("");
  const [tier, setTier] = useState<Competition["tier"]>("professional");
  const [season, setSeason] = useState("2024/25");

  const groupedCompetitions = useMemo(
    () =>
      sports.map((sport) => ({
        sport,
        competitions: competitions.filter((competition) => competition.sportId === sport.id)
      })),
    [sports, competitions]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sportId || !name.trim() || !region.trim()) return;
    onUpsert({
      id: generateId("comp"),
      sportId,
      name: name.trim(),
      region: region.trim(),
      governingBody: governingBody.trim() || undefined,
      tier,
      season: season.trim()
    });
    setName("");
    setRegion("");
    setGoverningBody("");
  };

  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <header>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Competition Directory</h3>
        <p className="text-xs text-slate-500">Maintain season, governing, and hierarchy alignment.</p>
      </header>

      <div className="space-y-3 rounded-xl border border-slate-900 bg-slate-950/60 p-4">
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Sport</span>
            <select
              value={sportId}
              onChange={(event) => setSportId(event.target.value)}
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
            <span className="font-semibold uppercase tracking-wide text-slate-400">Competition Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Premier League"
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Region</span>
            <input
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              placeholder="e.g. England"
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Season</span>
            <input
              value={season}
              onChange={(event) => setSeason(event.target.value)}
              placeholder="e.g. 2024/25"
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Governing Body</span>
            <input
              value={governingBody}
              onChange={(event) => setGoverningBody(event.target.value)}
              placeholder="e.g. The FA"
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Tier</span>
            <select
              value={tier}
              onChange={(event) => setTier(event.target.value as Competition["tier"])}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              {tiers.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="md:col-span-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Add Competition
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {groupedCompetitions.map(({ sport, competitions: sportCompetitions }) => (
          <div key={sport.id} className="rounded-xl border border-slate-900 bg-slate-950/60 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{sport.name}</h4>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {sportCompetitions.map((competition) => (
                <div key={competition.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs">
                  <div className="text-sm font-semibold text-white">{competition.name}</div>
                  <div className="text-slate-400">
                    {competition.season} · {competition.region}
                  </div>
                  <div className="mt-1 text-[0.65rem] text-slate-500">
                    {competition.governingBody ?? "Governing body N/A"} · {competition.tier}
                  </div>
                </div>
              ))}
              {!sportCompetitions.length && (
                <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/40 p-4 text-center text-xs text-slate-500">
                  No competitions captured for this sport yet.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
