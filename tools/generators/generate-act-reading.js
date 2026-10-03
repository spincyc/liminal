#!/usr/bin/env node
"use strict";

// ACT Reading is assembled, not generated.
//
// A reading question cannot be produced from a template: the answer has to sit
// in a particular sentence of a particular passage, and the distractors have to
// be misreadings a real student would make of *that* passage. So the passages
// and their question sets are authored by hand in content/sources/act-reading/,
// and this script's job is assembly and enforcement — turning authored sets
// into bank records, balancing answer positions inside each difficulty tier,
// and writing the shared passages to content/passages/act-reading.json.
//
//   node tools/generators/generate-act-reading.js            # rebuild from the authored sets
//
// Run `node tools/check-passages.js` first: it enforces the authoring rules
// (choice length matching, distractor reasons, domain coverage, tier and domain
// totals) that this script assumes have already been met.

const path = require("node:path");
const {
  bankPath,
  loadCatalog,
  passagePath,
  writeJsonAtomic,
} = require("../lib/content");
const { arrangeChoices, hashString } = require("../lib/generation");
const { loadPassages } = require("../../content/sources/act-reading");

const SECTION_KEY = "act-reading";
const GENERATOR = "act-reading-authored-v2";
const CREATED = "2026-08-19";

// The fastest reliable approach genuinely is a property of the task, not of the
// individual item: every vocabulary-in-context question is attacked the same
// way. What must not be shared is the explanation, the steps, the hint, and the
// trap, and none of those come from here — they are authored per question.
const STRATEGIES = {
  "main idea": "State the passage's central point after considering the whole text. Check the opening and ending against the body, then reject options that cover only a detail or extend beyond the passage.",
  "theme": "Connect the important events, contrasts, or reflections, then choose the general idea they support. A theme may be implied rather than stated in a single sentence.",
  "summary": "Reduce each part of the section to a clause, then pick the option that covers all of them; a summary that omits one part is wrong even when everything in it is true.",
  "sequence": "Order the events using the passage's time markers and transitions before comparing choices. Distinguish the order events happened from the order in which a narrator reveals them.",
  "cause and effect": "Identify the effect named in the question and locate the evidence for its cause. Check explicit connections and supported inferences; do not assume that an earlier event caused a later one.",
  "comparison": "State each side in one clause of your own before reading the options, then keep the option that names the point on which the two actually differ rather than a difference the passage never raises.",
  "logical inference": "Find the sentences the inference must rest on and take the smallest step they support; the key is the option you could defend by pointing at the text, not the most interesting one.",
  "conclusion": "Gather the passage's own claims on the question, then choose the conclusion that needs no premise the passage has not supplied.",
  "locate detail": "Go back to the passage and find the sentence the question points at before reading any choice, then check the whole sentence, since these items usually turn on a clause after the obvious phrase.",
  "interpret detail": "Read the detail in its surrounding paragraph and connect it to the question. Distinguish what the text states from what the context supports by inference.",
  "organization": "Label each paragraph with the job it performs in three or four words, then match the sequence of labels against each option and reject any that promotes a minor passage into the spine.",
  "function": "Ask what the passage would lose if the sentence were deleted, then choose the option naming that loss; a choice that merely restates the sentence's content is not a function.",
  "meaning in context": "Substitute each choice into the sentence and keep the one the surrounding clause supports; these items are decided by the words around the term, not by the term's commonest meaning.",
  "connotation": "Weigh the attitude the word carries in this sentence against the passage's stance, and reject choices that fit the dictionary sense but not the tone.",
  "figurative language": "Identify what is being compared to what, then choose the option that names the property being transferred rather than one that reads the figure literally.",
  "author's purpose": "Ask what the author is trying to accomplish with the material. Use its relation to the surrounding argument or narrative; the purpose may be implied across several paragraphs.",
  "perspective": "Separate what the passage reports from what it endorses; the key describes the writer's own stance, and the strongest distractors describe a view the writer merely reports.",
  "narration": "Check the pronouns and ask whose thoughts you are actually given; the answer follows from what the narration can and cannot see rather than from the events.",
  "claims and evidence": "State the precise claim, then compare how directly each detail supports it. Prefer evidence for that claim over a related fact, and keep the strength of the conclusion within the evidence.",
  "reasoning": "Identify the conclusion or distinction named in the question and reconstruct the evidence linking it to the premises. Check whether the question asks about an assumption, an objection, or the role of a step.",
  "strengthen or weaken": "Name the claim's weak point first, then choose the option that bears on that point; new facts that are interesting but land somewhere else are the commonest trap.",
  "compare perspectives": "State each viewpoint separately, distinguishing agreement from disagreement. Do not attribute an unstated claim to either writer just because the other responds to it.",
  "synthesize information": "Identify the information the question asks you to combine, whether across texts or separated parts of one passage. Choose the conclusion jointly supported without adding an unstated premise.",
  "integrate table data": "Read the row and column headings before the numbers, decide whether the question asks about a value or about a change, and compute the comparison rather than reading off the largest figure.",
  "integrate graph data": "Fix the axes and units before reading any point, then locate the extreme or trend the question names rather than the most visually striking feature.",
};

function subskillIndex(section) {
  const index = new Map();
  section.domains.forEach((domain) => {
    Object.entries(domain.skills).forEach(([skill, subskills]) => {
      subskills.forEach((subskill) => index.set(subskill, { domain: domain.name, skill }));
    });
  });
  return index;
}

function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

// Answer positions are balanced inside each difficulty tier rather than
// overall. A bank that is balanced in aggregate can still key most of its Hard
// items to one letter, which is a free point for anyone who notices; the old
// ACT banks did exactly that. Ties break on an item hash so the letter never
// tracks the order the passages were written in.
function positionPlanner() {
  const counts = { Easy: [0, 0, 0, 0], Medium: [0, 0, 0, 0], Hard: [0, 0, 0, 0] };
  const overall = [0, 0, 0, 0];
  return function nextPosition(difficulty, seed) {
    const tier = counts[difficulty] || counts.Medium;
    const fewestInTier = Math.min(...tier);
    const inTier = [0, 1, 2, 3].filter((index) => tier[index] === fewestInTier);
    // Tier balance decides first; among the positions it leaves open, the one
    // used least across the whole bank wins, so the section is balanced both
    // per tier and in total. The shipped validator checks the total.
    const fewestOverall = Math.min(...inTier.map((index) => overall[index]));
    const candidates = inTier.filter((index) => overall[index] === fewestOverall);
    const choice = candidates[hashString(String(seed)) % candidates.length];
    tier[choice] += 1;
    overall[choice] += 1;
    return choice;
  };
}

function passageFormat(passage) {
  if (/^PASSAGE A\b/m.test(passage.content)) return "paired-passages";
  if (/^\s*Table \d/m.test(passage.content)) return "table";
  if (/^\s*Figure \d/m.test(passage.content)) return "figure";
  return "passage";
}

function strategyFor(question) {
  const strategy = STRATEGIES[question.subskill];
  if (!strategy) throw new Error(`No strategy defined for subskill "${question.subskill}"`);
  return strategy;
}

// Every question names its own trap. Where the author wrote one it is used; the
// rest take the misreading recorded against the first distractor, which is
// authored for that item and names the specific wrong turn the item invites.
function trapFor(question) {
  if (question.trap) return question.trap;
  const [text, reason] = question.wrong[0];
  const choice = String(text).replace(/\s*\.$/, "");
  return `Choosing "${choice}" — ${reason}`;
}

function buildRecord({ passage, question, sequence, section, index, position }) {
  const id = `${SECTION_KEY}-${String(sequence).padStart(4, "0")}`;
  const entry = index.get(question.subskill);
  if (!entry) throw new Error(`${id}: subskill "${question.subskill}" is not in the catalog`);
  const arranged = arrangeChoices(
    question.key,
    question.wrong.map(([text, reason]) => ({ text, reason })),
    position,
  );

  return {
    id,
    test: section.test,
    section: section.section,
    sectionKey: SECTION_KEY,
    domain: entry.domain,
    skill: entry.skill,
    subskill: question.subskill,
    difficulty: question.difficulty,
    responseType: "multiple-choice",
    stimulus: null,
    passageId: passage.id,
    stem: question.stem,
    ...arranged,
    hint: question.hint,
    explanation: question.why,
    solutionSteps: question.steps,
    strategy: strategyFor(question),
    trap: trapFor(question),
    estimatedSeconds:
      question.difficulty === "Easy" ? 50 : question.difficulty === "Medium" ? 75 : 100,
    principles: [
      "Every answer to a reading question must be defensible by pointing at a specific place in the passage.",
    ],
    calculatorPolicy: section.calculatorPolicy,
    format: passageFormat(passage),
    tags: ["passage-set", passage.type, `family:${question.family}`],
    provenance: { type: "original", generator: GENERATOR, seed: id, created: CREATED },
    contentVersion: loadCatalog().contentVersion,
    reviewStatus: "automated-verified",
    verification: null,
  };
}

function main() {
  const catalog = loadCatalog();
  const section = catalog.sections.find((item) => item.key === SECTION_KEY);
  if (!section) throw new Error(`Unknown section ${SECTION_KEY}`);
  const index = subskillIndex(section);
  const passages = loadPassages();
  const nextPosition = positionPlanner();

  const questions = [];
  passages.forEach((passage) => {
    passage.questions.forEach((question) => {
      const sequence = questions.length + 1;
      const id = `${SECTION_KEY}-${String(sequence).padStart(4, "0")}`;
      questions.push(
        buildRecord({
          passage,
          question,
          sequence,
          section,
          index,
          position: nextPosition(question.difficulty, id),
        }),
      );
    });
  });

  if (questions.length !== catalog.targetPerSection) {
    throw new Error(
      `Authored sets produce ${questions.length} questions; the catalog target is ${catalog.targetPerSection}`,
    );
  }

  const passageRecords = passages.map((passage) => ({
    id: passage.id,
    sectionKey: SECTION_KEY,
    type: passage.type,
    title: passage.title,
    intro: passage.intro,
    content: passage.content,
    ...(passage.figure ? { figure: passage.figure } : {}),
    wordCount: countWords(passage.content),
    provenance: { type: "original", generator: GENERATOR, seed: passage.id, created: CREATED },
  }));

  writeJsonAtomic(passagePath(SECTION_KEY), passageRecords);
  writeJsonAtomic(bankPath(SECTION_KEY), questions);

  const tiers = questions.reduce((counts, question) => {
    counts[question.difficulty] = (counts[question.difficulty] || 0) + 1;
    return counts;
  }, {});
  console.log(
    `ACT Reading: ${passageRecords.length} passages, ${questions.length} questions ` +
      `(${tiers.Easy} Easy / ${tiers.Medium} Medium / ${tiers.Hard} Hard) ` +
      `written to ${path.relative(process.cwd(), bankPath(SECTION_KEY))}.`,
  );
}

if (require.main === module) main();

module.exports = { STRATEGIES, passageFormat };
