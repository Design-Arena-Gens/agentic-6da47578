"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CollaborationNote } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface CollaborationFeedProps {
  fixtureId: string;
  notes: CollaborationNote[];
  onUpsert: (note: CollaborationNote) => void;
  onDelete: (noteId: string) => void;
}

const teams: CollaborationNote["team"][] = ["trading", "operations", "integrity", "engineering", "risk"];

export const CollaborationFeed = ({ fixtureId, notes, onUpsert, onDelete }: CollaborationFeedProps) => {
  const [message, setMessage] = useState("");
  const [author, setAuthor] = useState("");
  const [team, setTeam] = useState<CollaborationNote["team"]>("operations");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim() || !author.trim()) return;
    onUpsert({
      id: generateId("note"),
      fixtureId,
      author: author.trim(),
      team,
      createdAt: new Date().toISOString(),
      message: message.trim()
    });
    setMessage("");
    setAuthor("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Team Collaboration</h3>
        <span className="text-xs text-slate-500">{notes.length} updates</span>
      </div>

      <div className="space-y-3">
        {notes.length ? (
          notes.map((note) => (
            <article key={note.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
              <header className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-200">{note.team}</div>
                  <div className="text-sm font-semibold text-white">{note.author}</div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{formatDistanceToNow(new Date(note.createdAt))} ago</span>
                  <button onClick={() => onDelete(note.id)} className="text-rose-300 hover:text-rose-200">
                    Remove
                  </button>
                </div>
              </header>
              <p className="mt-3 text-slate-200">{note.message}</p>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-500">
            No collaboration notes yet. Capture trading alignment, risk escalations, or venue updates here.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Author</span>
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Who is logging the update?"
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Team</span>
            <select
              value={team}
              onChange={(event) => setTeam(event.target.value as CollaborationNote["team"])}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              {teams.map((teamOption) => (
                <option key={teamOption} value={teamOption}>
                  {teamOption}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-400">Message</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder="Context for trading, risk, or mapping teams."
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400"
        >
          Share Update
        </button>
      </form>
    </div>
  );
};
