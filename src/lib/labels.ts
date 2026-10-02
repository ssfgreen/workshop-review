import type { Component, Section, StoryKind } from "../../shared/catalog.js";
import type { VoteValue } from "../../shared/activity.js";

const SHORT: Record<string, string> = { q1_grounding: "Q1", q2_personalisation: "Q2", q3_conditions: "Q3", q4_development: "Q4" };

/** "Q3 Conditions", or just the label for the closing exercise. */
export function sectionName(key: string, sections: Section[]): string {
  const label = sections.find((s) => s.key === key)?.label ?? key;
  return SHORT[key] ? `${SHORT[key]} ${label}` : label;
}

export const shortSection = (key: string) => SHORT[key] ?? "Closing exercise";
export const questionNumber = (key: string): string | null => SHORT[key] ?? null;

export const VOTE_LABEL: Record<VoteValue, string> = { keep: "Keep", unsure: "Unsure", drop: "Drop" };
export const KIND_LABEL: Record<StoryKind, string> = { feature: "Feature", setting: "Setting", guardrail: "Guardrail" };
export const COMP_LABEL: Record<Component, string> = { data: "Data", skill: "Skill", tool: "Tool", deployment: "Deployment" };
