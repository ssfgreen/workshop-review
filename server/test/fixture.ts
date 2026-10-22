import type { Catalog } from "../../shared/catalog.js";

/** A two-question catalogue with invented content, shaped like the real bundle. */
export function fixtureCatalog(): Catalog {
  return {
    generated: "2026-10-02",
    component_definitions: { data: "What the agent is given.", skill: "A procedure it follows." },
    epics: [
      { id: "adapt", title: "Adapt my resource", description: "The core job." },
      { id: "review", title: "Review and approve", description: "Checking." },
    ],
    structures: [
      {
        id: "A", title: "The teacher's terms", purpose: "practical: reporting back", intro: "Reads the workshop as a set of terms.", notes: "A8 is the checking cluster.",
        groups: [
          { id: "A1", title: "Tell it what it needs", annotation: "context only the teacher can supply", tier: "", action: "", note: "", codes: ["KNOW_THE_CLASS"], sublabels: {}, remarks: {} },
          { id: "A8", title: "Make checking cheap", annotation: "the economics of trust", tier: "", action: "", note: "", codes: ["CHECK_QUICKLY"], sublabels: {}, remarks: {} },
        ],
      },
      {
        id: "E", title: "Build structure", purpose: "layers, with buildability tiers", intro: "Groups codes by layer.", notes: "",
        groups: [
          { id: "E1", title: "Context store", annotation: "", tier: "T2", action: "", note: "Build notes: a class profile schema.", codes: ["KNOW_THE_CLASS", "CHECK_QUICKLY"], sublabels: { CHECK_QUICKLY: "Metrics" }, remarks: { KNOW_THE_CLASS: "schema" } },
        ],
      },
    ],
    sections: [
      {
        key: "q1_grounding", label: "Grounding", question: "What should it know?", prompt: "Before an agent helps…",
        columns: [{ column_key: "1", column_label: "What would it need to know?" }],
        groups: [{
          title: "Knowing the class",
          codes: [{
            id: "KNOW_THE_CLASS", title: "Know the class", gist: "Needs the class basics.", definition: "Year, subject, level.",
            participants: ["W01", "P07"], rooms: ["Room 1", "Room 2"], sections: ["q1_grounding"],
            evidence: [
              { ref: "R1-0001", kind: "turn", room: "Room 1", who: "W01", section: "q1_grounding", text: "It needs to know the year group. And the level.", example: true, span: [0, 32] },
              { ref: "note:6d569606-1f2e-4a3b-9c8d-0123456789ab", kind: "note", room: "Room 2", who: "P07", section: "q1_grounding", text: "Year group", example: false, column: "What would it need to know?", scribed: false },
            ],
            stories: [{ as: "class teacher", want: "to set up a class once", so_that: "I don't repeat it", kind: "setting", components: ["data"], epics: ["adapt"] }],
          }],
        }],
      },
      {
        key: "q3_conditions", label: "Conditions", question: "Delegating and how", prompt: "It hands you three versions…",
        columns: [],
        groups: [{
          title: "How teachers check",
          codes: [{
            id: "CHECK_QUICKLY", title: "Check quickly", gist: "Checking is quick if you know the course.", definition: "…",
            participants: ["W03"], rooms: ["Room 3"], sections: ["q3_conditions"],
            evidence: [{ ref: "R3-0010", kind: "turn", room: "Room 3", who: "W03", section: "q3_conditions", text: "I check it against what I know.", example: false, span: null }],
            stories: [
              { as: "class teacher", want: "output I can check at a glance", so_that: "checking is quick", kind: "feature", components: ["skill"], epics: ["review"] },
              { as: "class teacher", want: "a checklist", so_that: "I verify it", kind: "feature", components: ["skill", "data"], epics: ["review", "adapt"] },
            ],
          }],
        }],
      },
    ],
  };
}
