/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { formatISO } from "date-fns";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from "react";
import { initialState } from "@/lib/sampleData";
import {
  CollaborationNote,
  Competition,
  Fixture,
  FixtureMapping,
  MarketClassification,
  OperationIssue,
  Player,
  PricingSnapshot,
  SportsState,
  Team
} from "@/lib/types";

type SportsAction =
  | { type: "UPSERT_COMPETITION"; payload: Competition }
  | { type: "UPSERT_TEAM"; payload: Team }
  | { type: "UPSERT_PLAYER"; payload: Player }
  | { type: "UPSERT_FIXTURE"; payload: Fixture }
  | { type: "UPSERT_MAPPING"; payload: FixtureMapping }
  | { type: "UPSERT_CLASSIFICATION"; payload: MarketClassification }
  | { type: "UPSERT_ISSUE"; payload: OperationIssue }
  | { type: "UPSERT_NOTE"; payload: CollaborationNote }
  | { type: "UPSERT_PRICING"; payload: PricingSnapshot }
  | { type: "DELETE_FIXTURE"; payload: string }
  | { type: "DELETE_MAPPING"; payload: string }
  | { type: "DELETE_NOTE"; payload: string };

const SportsStateContext = createContext<SportsState | undefined>(undefined);
const SportsDispatchContext = createContext<SportsStoreActions | undefined>(undefined);

const STORAGE_KEY = "agentic_sports_state_v1";

const upsert = <T extends { id: string }>(collection: T[], record: T) => {
  const exists = collection.some((item) => item.id === record.id);
  if (exists) {
    return collection.map((item) => (item.id === record.id ? record : item));
  }
  return [record, ...collection];
};

const removeById = <T extends { id: string }>(collection: T[], id: string) =>
  collection.filter((item) => item.id !== id);

const sportsReducer = (state: SportsState, action: SportsAction): SportsState => {
  switch (action.type) {
    case "UPSERT_COMPETITION":
      return { ...state, competitions: upsert(state.competitions, action.payload) };
    case "UPSERT_TEAM":
      return { ...state, teams: upsert(state.teams, action.payload) };
    case "UPSERT_PLAYER":
      return { ...state, players: upsert(state.players, action.payload) };
    case "UPSERT_FIXTURE":
      return { ...state, fixtures: upsert(state.fixtures, action.payload) };
    case "UPSERT_MAPPING":
      return { ...state, mappings: upsert(state.mappings, action.payload) };
    case "UPSERT_CLASSIFICATION":
      return { ...state, classifications: upsert(state.classifications, action.payload) };
    case "UPSERT_ISSUE":
      return { ...state, issues: upsert(state.issues, action.payload) };
    case "UPSERT_NOTE":
      return { ...state, notes: upsert(state.notes, action.payload) };
    case "UPSERT_PRICING":
      return { ...state, pricing: upsert(state.pricing, action.payload) };
    case "DELETE_FIXTURE":
      return {
        ...state,
        fixtures: removeById(state.fixtures, action.payload),
        mappings: state.mappings.filter((mapping) => mapping.fixtureId !== action.payload),
        issues: state.issues.filter((issue) => issue.fixtureId !== action.payload),
        classifications: state.classifications.filter((cls) => cls.fixtureId !== action.payload),
        notes: state.notes.filter((note) => note.fixtureId !== action.payload)
      };
    case "DELETE_MAPPING":
      return { ...state, mappings: removeById(state.mappings, action.payload) };
    case "DELETE_NOTE":
      return { ...state, notes: removeById(state.notes, action.payload) };
    default:
      return state;
  }
};

interface SportsStoreActions {
  upsertCompetition: (competition: Competition) => void;
  upsertTeam: (team: Team) => void;
  upsertPlayer: (player: Player) => void;
  upsertFixture: (fixture: Fixture) => void;
  upsertMapping: (mapping: FixtureMapping) => void;
  upsertClassification: (classification: MarketClassification) => void;
  upsertIssue: (issue: OperationIssue) => void;
  upsertNote: (note: CollaborationNote) => void;
  recordPricing: (snapshot: PricingSnapshot) => void;
  deleteFixture: (fixtureId: string) => void;
  deleteMapping: (mappingId: string) => void;
  deleteNote: (noteId: string) => void;
}

const loadFromStorage = (): SportsState => {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as SportsState;
    return { ...initialState, ...parsed };
  } catch (error) {
    console.warn("Failed to load sports state, using initial data", error);
    return initialState;
  }
};

export const SportsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(sportsReducer, initialState, () => loadFromStorage());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const actions = useMemo<SportsStoreActions>(
    () => ({
      upsertCompetition: (competition) => dispatch({ type: "UPSERT_COMPETITION", payload: competition }),
      upsertTeam: (team) => dispatch({ type: "UPSERT_TEAM", payload: team }),
      upsertPlayer: (player) => dispatch({ type: "UPSERT_PLAYER", payload: player }),
      upsertFixture: (fixture) =>
        dispatch({
          type: "UPSERT_FIXTURE",
          payload: { ...fixture, notes: fixture.notes?.trim() || undefined }
        }),
      upsertMapping: (mapping) =>
        dispatch({
          type: "UPSERT_MAPPING",
          payload: { ...mapping, lastSynced: mapping.lastSynced ?? formatISO(new Date()) }
        }),
      upsertClassification: (classification) =>
        dispatch({
          type: "UPSERT_CLASSIFICATION",
          payload: {
            ...classification,
            notes: classification.notes?.trim() || undefined
          }
        }),
      upsertIssue: (issue) =>
        dispatch({
          type: "UPSERT_ISSUE",
          payload: { ...issue, detectedAt: issue.detectedAt ?? formatISO(new Date()) }
        }),
      upsertNote: (note) =>
        dispatch({
          type: "UPSERT_NOTE",
          payload: { ...note, createdAt: note.createdAt ?? formatISO(new Date()) }
        }),
      recordPricing: (snapshot) =>
        dispatch({
          type: "UPSERT_PRICING",
          payload: { ...snapshot, recordedAt: snapshot.recordedAt ?? formatISO(new Date()) }
        }),
      deleteFixture: (fixtureId) => dispatch({ type: "DELETE_FIXTURE", payload: fixtureId }),
      deleteMapping: (mappingId) => dispatch({ type: "DELETE_MAPPING", payload: mappingId }),
      deleteNote: (noteId) => dispatch({ type: "DELETE_NOTE", payload: noteId })
    }),
    []
  );

  return (
    <SportsStateContext.Provider value={state}>
      <SportsDispatchContext.Provider value={actions}>{children}</SportsDispatchContext.Provider>
    </SportsStateContext.Provider>
  );
};

export const useSportsState = () => {
  const context = useContext(SportsStateContext);
  if (!context) {
    throw new Error("useSportsState must be used within SportsProvider");
  }
  return context;
};

export const useSportsActions = () => {
  const context = useContext(SportsDispatchContext);
  if (!context) {
    throw new Error("useSportsActions must be used within SportsProvider");
  }
  return context;
};
