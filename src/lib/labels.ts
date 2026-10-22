import type { RankDimension } from "../../shared/activity.js";
import type { Component, Section, StoryKind } from "../../shared/catalog.js";

const SHORT: Record<string, string> = { q1_grounding: "Q1", q2_personalisation: "Q2", q3_conditions: "Q3", q4_development: "Q4" };

/** "Q3 Conditions", or just the label for the closing exercise. */
export function sectionName(key: string, sections: Section[]): string {
  const label = sections.find((s) => s.key === key)?.label ?? key;
  return SHORT[key] ? `${SHORT[key]} ${label}` : label;
}

export const shortSection = (key: string) => SHORT[key] ?? "Closing exercise";
export const questionNumber = (key: string): string | null => SHORT[key] ?? null;

export const KIND_LABEL: Record<StoryKind, string> = { feature: "Feature", setting: "Setting", guardrail: "Guardrail" };
export const COMP_LABEL: Record<Component, string> = { data: "Data", skill: "Skill", tool: "Tool", deployment: "Deployment" };

/** The three ranking scales for user stories: what each asks, and short labels for its values. */
export const RANK_LABEL: Record<RankDimension, { title: string; ask: string; values: Record<string, string> }> = {
  priority: { title: "Priority", ask: "How important is this story?", values: { high: "High", medium: "Medium", low: "Low" } },
  work: { title: "Needs", ask: "What would it mainly take to build: research, software development or AI development?", values: { research: "Research", software: "Software", ai: "AI" } },
  size: { title: "Size", ask: "How big a job is it?", values: { large: "Large", medium: "Medium", small: "Small" } },
};
