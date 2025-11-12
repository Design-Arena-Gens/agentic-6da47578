"use client";

import { useMemo, useState } from "react";
import { Player, Team } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface PlayerPanelProps {
  teams: Team[];
  players: Player[];
  onUpsert: (player: Player) => void;
}

const statuses: Player["status"][] = ["active", "injured", "suspended", "retired"];

export const PlayerPanel = ({ teams, players, onUpsert }: PlayerPanelProps) => {
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [nationality, setNationality] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [status, setStatus] = useState<Player["status"]>("active");

  const playersByTeam = useMemo(
    () =>
      teams.map((team) => ({
        team,
        players: players.filter((player) => player.teamId === team.id)
      })),
    [teams, players]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!teamId || !name.trim() || !position.trim() || !nationality.trim()) return;
    onUpsert({
      id: generateId("player"),
      teamId,
      name: name.trim(),
      position: position.trim(),
      nationality: nationality.trim(),
      dateOfBirth: dateOfBirth || undefined,
      status
    });
    setName("");
    setPosition("");
    setNationality("");
    setDateOfBirth("");
    setStatus("active");
  };

  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <header>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Player Registry</h3>
        <p className="text-xs text-slate-500">Track roster availability to inform trading and integrity teams.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Team</span>
          <select
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Player Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full name"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Position</span>
          <input
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            placeholder="e.g. Forward"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Nationality</span>
          <input
            value={nationality}
            onChange={(event) => setNationality(event.target.value)}
            placeholder="e.g. Norway"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Date of Birth</span>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as Player["status"])}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          >
            {statuses.map((option) => (
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
          Add Player
        </button>
      </form>

      <div className="space-y-3">
        {playersByTeam.map(({ team, players: teamPlayers }) => (
          <div key={team.id} className="rounded-xl border border-slate-900 bg-slate-950/60 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{team.name}</h4>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {teamPlayers.map((player) => (
                <div key={player.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-300">
                  <div className="text-sm font-semibold text-white">{player.name}</div>
                  <div className="text-slate-400">{player.position}</div>
                  <div className="mt-2 text-[0.65rem] text-slate-500">
                    {player.nationality} · {player.status}
                    {player.dateOfBirth ? ` · DOB ${player.dateOfBirth}` : ""}
                  </div>
                </div>
              ))}
              {!teamPlayers.length && (
                <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/40 p-4 text-center text-xs text-slate-500">
                  No players attributed yet.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
