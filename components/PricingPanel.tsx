"use client";

import { useEffect, useState } from "react";
import { Bookmaker, MarketClassification, PricingSnapshot } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface PricingPanelProps {
  fixtureId: string;
  classification?: MarketClassification;
  pricing: PricingSnapshot[];
  bookmakers: Bookmaker[];
  onUpsertClassification: (classification: MarketClassification) => void;
  onRecordPricing: (snapshot: PricingSnapshot) => void;
}

const riskLevels: MarketClassification["riskLevel"][] = ["low", "medium", "high"];
const statusOptions: MarketClassification["marketStatus"][] = ["ready", "needs-pricing", "awaiting-confirmation"];

export const PricingPanel = ({
  fixtureId,
  classification,
  pricing,
  bookmakers,
  onUpsertClassification,
  onRecordPricing
}: PricingPanelProps) => {
  const [template, setTemplate] = useState(classification?.template ?? "");
  const [pricingLead, setPricingLead] = useState(classification?.pricingLead ?? "");
  const [riskLevel, setRiskLevel] = useState<MarketClassification["riskLevel"]>(classification?.riskLevel ?? "medium");
  const [marketStatus, setMarketStatus] = useState<MarketClassification["marketStatus"]>(
    classification?.marketStatus ?? "needs-pricing"
  );
  const [notes, setNotes] = useState(classification?.notes ?? "");

  const [priceBookmakerId, setPriceBookmakerId] = useState(bookmakers[0]?.id ?? "");
  const [market, setMarket] = useState("match-result");
  const [selection, setSelection] = useState("");
  const [price, setPrice] = useState<number>(1.9);
  const [probability, setProbability] = useState<number>(0.5);

  useEffect(() => {
    if (classification) {
      setTemplate(classification.template);
      setPricingLead(classification.pricingLead);
      setRiskLevel(classification.riskLevel);
      setMarketStatus(classification.marketStatus);
      setNotes(classification.notes ?? "");
    }
  }, [classification]);

  const handleClassificationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!template.trim() || !pricingLead.trim()) return;
    onUpsertClassification({
      id: classification?.id ?? generateId("cls"),
      fixtureId,
      template: template.trim(),
      pricingLead: pricingLead.trim(),
      riskLevel,
      marketStatus,
      notes: notes.trim() || undefined
    });
  };

  const handlePricingSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selection.trim() || !market.trim() || !priceBookmakerId) return;
    onRecordPricing({
      id: generateId("price"),
      fixtureId,
      recordedAt: new Date().toISOString(),
      bookmakerId: priceBookmakerId,
      market: market.trim(),
      selection: selection.trim(),
      price,
      probability
    });
    setSelection("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Market Classification</h3>
        <form onSubmit={handleClassificationSubmit} className="mt-3 space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold uppercase tracking-wide text-slate-400">Template</span>
              <input
                value={template}
                onChange={(event) => setTemplate(event.target.value)}
                placeholder="e.g. soccer-premium"
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold uppercase tracking-wide text-slate-400">Pricing Lead</span>
              <input
                value={pricingLead}
                onChange={(event) => setPricingLead(event.target.value)}
                placeholder="Assigned trader"
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold uppercase tracking-wide text-slate-400">Risk Level</span>
              <select
                value={riskLevel}
                onChange={(event) => setRiskLevel(event.target.value as MarketClassification["riskLevel"])}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                {riskLevels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold uppercase tracking-wide text-slate-400">Market Status</span>
              <select
                value={marketStatus}
                onChange={(event) => setMarketStatus(event.target.value as MarketClassification["marketStatus"])}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace("-", " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Context or actions required from pricing teams."
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400"
          >
            {classification ? "Update Classification" : "Create Classification"}
          </button>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Pricing Snapshots</h4>
          <span className="text-xs text-slate-500">{pricing.length} records</span>
        </div>
        <div className="mt-3 space-y-3">
          {pricing.length ? (
            pricing.map((snapshot) => (
              <div
                key={snapshot.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300"
              >
                <div>
                  <div className="text-sm font-semibold text-white">{snapshot.market}</div>
                  <div className="text-xs text-slate-400">{snapshot.selection}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-brand-200">@ {snapshot.price.toFixed(2)}</div>
                  <div className="text-[0.65rem] text-slate-400">
                    {Math.round(snapshot.probability * 100)}% · {snapshot.bookmakerId.toUpperCase()}
                  </div>
                </div>
                <div className="text-[0.65rem] text-slate-500">
                  {formatDistanceToNow(new Date(snapshot.recordedAt))} ago
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-500">
              No pricing snapshots logged. Capture bookmaker prices pre-match to assist in pricing reviews.
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handlePricingSubmit} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Bookmaker</span>
            <select
              value={priceBookmakerId}
              onChange={(event) => setPriceBookmakerId(event.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              {bookmakers.map((bookmaker) => (
                <option key={bookmaker.id} value={bookmaker.id}>
                  {bookmaker.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Market</span>
            <input
              value={market}
              onChange={(event) => setMarket(event.target.value)}
              placeholder="e.g. match-result"
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Selection</span>
            <input
              value={selection}
              onChange={(event) => setSelection(event.target.value)}
              placeholder="e.g. Arsenal"
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
              required
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold uppercase tracking-wide text-slate-400">Price</span>
              <input
                type="number"
                step="0.01"
                min={1}
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-semibold uppercase tracking-wide text-slate-400">Probability</span>
              <input
                type="number"
                step="0.01"
                min={0}
                max={1}
                value={probability}
                onChange={(event) => setProbability(Number(event.target.value))}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                required
              />
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Log Pricing Snapshot
        </button>
      </form>
    </div>
  );
};
