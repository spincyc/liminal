"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const L = require("../src/lib/reading-level");
const T = require("../tools/build-reading-level");
const { textHash } = require("../tools/build-daily-reading");

// ---- Synthetic probes for the logic tests (not corpus content) ----
function probe(level, form, words = 300) {
  const count = L.itemCount(level);
  return { id: "rl-" + level + "-" + form, level, form, words,
    items: Array.from({ length: count }, (_, i) => ({ id: "rl-" + level + "-" + form + "-" + (i + 1), skill: L.SKILLS[i % L.SKILLS.length], key: i % 4 })) };
}
function answers(p, correct) { return p.items.map((item, i) => i < correct ? item.key : (item.key + 1) % 4); }
function response(p, correct, wpm = 150, rating = null, extra = {}) { return { answers: answers(p, correct), readingMs: p.words / wpm * 60000, rating, ...extra }; }
const evalAt = (level, correct, wpm, rating, form = "a") => { const p = probe(level, form); return L.evaluate(p, response(p, correct, wpm, rating)); };
const LADDER = [1, 3, 5, 6, 9, 11, 12];

test("scoring counts correct answers by skill; blanks are wrong", () => {
  const p = probe(5, "a"), counts = L.score(p, [p.items[0].key, null, p.items[2].key, 3 - p.items[3].key === p.items[3].key ? 0 : 3 - p.items[3].key]);
  assert.equal(counts.total, 4); assert.equal(counts.correct, 2);
  assert.equal(Object.values(counts.bySkill).reduce((sum, entry) => sum + entry.total, 0), 4);
});
test("comprehension thresholds: 3 of 4 or 3 of 3 strong, under half weak", () => {
  assert.equal(L.comprehension(3, 4), "strong"); assert.equal(L.comprehension(2, 4), "middle"); assert.equal(L.comprehension(1, 4), "weak");
  assert.equal(L.comprehension(3, 3), "strong"); assert.equal(L.comprehension(2, 3), "middle"); assert.equal(L.comprehension(1, 3), "weak");
  assert.equal(L.comprehension(0, 0), "weak");
  assert.equal(L.itemCount(1), 3); assert.equal(L.itemCount(2), 3); assert.equal(L.itemCount(3), 4); assert.equal(L.itemCount(13), 4);
});
test("pace is words per minute from Start to Done, banded per level", () => {
  assert.deepEqual(L.pace(300, 120000, 5), { wpm: 150, band: "comfortable" });
  assert.equal(L.pace(300, 300000, 9).band, "slow"); // 60 wpm under the Grade 9 floor
  assert.equal(L.pace(300, 20000, 1).band, "rushed"); // 900 wpm
  assert.equal(L.pace(300, 0, 5).band, "unknown");
  assert.equal(L.comfortableFloor(12), L.COMFORTABLE_WPM_FLOOR[12]);
  assert.equal(L.comfortableFloor(14), L.COMFORTABLE_WPM_FLOOR[12], "levels past the table use its last floor");
});
test("a probe passes only with strong comprehension, comfortable pace, no 'too hard' and no repeat", () => {
  assert.equal(evalAt(5, 4, 150).result, "pass"); assert.equal(evalAt(5, 4, 150).perfect, true);
  assert.equal(evalAt(5, 3, 150).perfect, false);
  for (const [result, reason] of [[evalAt(5, 4, 40), "slow"], [evalAt(5, 4, 900), "rushed"], [evalAt(5, 4, 150, "hard"), "felt-hard"]]) {
    assert.equal(result.result, "near"); assert.deepEqual(result.reasons, [reason]);
  }
  const p = probe(5, "b"), repeat = L.evaluate(p, response(p, 4, 150, null, { repeat: true }));
  assert.equal(repeat.result, "near"); assert.deepEqual(repeat.reasons, ["repeat"]);
  assert.equal(evalAt(5, 2, 150).result, "near"); assert.equal(evalAt(5, 1, 150).result, "weak");
});
test("ladder levels need both forms and are derived from data, with no ceiling at 12", () => {
  assert.deepEqual(L.ladderLevels([probe(3, "a"), probe(3, "b"), probe(5, "a"), probe(13, "a"), probe(13, "b")]), [3, 13]);
  const D = require("../src/lib/daily-reading");
  assert.equal(L.levelLabel(13), D.gradeLabel(13), "labels come from the daily library"); assert.equal(L.levelLabel(13, { 13: "Override" }), "Override");
  assert.equal(L.levelLabel(5), "Grade 5"); assert.equal(L.levelLabel(0), "Kindergarten"); assert.equal(L.levelLabel(99), "Level 99");
  assert.equal(L.route(13, 2, 3), "daily-reading.html#" + D.gradeKey(13) + "/2/3"); assert.equal(L.route(0, 1, 1), "daily-reading.html#k/1/1");
});
test("the ladder starts at the requested level, or the nearest probed level below it", () => {
  assert.deepEqual(L.nextStep([], LADDER, 5), { done: false, level: 5 });
  assert.equal(L.nextStep([], LADDER, 4).level, 3);
  assert.equal(L.nextStep([], LADDER, 10).level, 9);
  assert.equal(L.nextStep([], LADDER, 0).level, 1);
});
test("the ladder steps up on a pass, down on a miss, and stops at the boundary", () => {
  const up = [evalAt(5, 4, 150)];
  assert.deepEqual(L.nextStep(up, LADDER, 5), { done: false, level: 6 });
  assert.deepEqual(L.nextStep([...up, evalAt(6, 2, 150)], LADDER, 5), { done: true }); // 5 passed below 6
  assert.deepEqual(L.nextStep([evalAt(6, 2, 150)], LADDER, 6), { done: false, level: 5 }); // near steps one
  assert.deepEqual(L.nextStep([evalAt(12, 0, 150)], LADDER, 12), { done: false, level: 9 }); // weak steps two
  assert.deepEqual(L.nextStep([evalAt(12, 0, 150), evalAt(9, 4, 150)], LADDER, 12), { done: false, level: 11 }); // back up one
  assert.deepEqual(L.nextStep([evalAt(12, 4, 150)], LADDER, 12), { done: true }); // top
  assert.deepEqual(L.nextStep([evalAt(1, 1, 150)], LADDER, 1), { done: true }); // bottom
  assert.deepEqual(L.nextStep([evalAt(3, 0, 150)], LADDER, 3), { done: false, level: 1 });
});
test("the ladder never exceeds the probe limit", () => {
  const passes = [1, 3, 5, 6, 9].map(level => evalAt(level, L.itemCount(level), 150));
  assert.equal(passes.length, L.MAX_PROBES); assert.deepEqual(L.nextStep(passes, LADDER, 1), { done: true });
  const place = L.placement(passes, LADDER);
  assert.equal(place.level, 9); assert.match(place.explanation, /stopped before trying Grade 11/);
});
test("placement chooses the week from the boundary evidence", () => {
  const near = L.placement([evalAt(5, 4, 150), evalAt(6, 2, 150)], LADDER);
  assert.deepEqual([near.level, near.week, near.confirmed], [5, L.PLACEMENT_WEEK.near, true]);
  const strong = L.placement([evalAt(5, 4, 150), evalAt(6, 1, 150)], LADDER);
  assert.deepEqual([strong.level, strong.week], [5, L.PLACEMENT_WEEK.strong]);
  const start = L.placement([evalAt(5, 3, 150), evalAt(6, 0, 150)], LADDER);
  assert.deepEqual([start.level, start.week], [5, L.PLACEMENT_WEEK.start]);
  const down = L.placement([evalAt(6, 1, 150), evalAt(5, 3, 150)], LADDER);
  assert.deepEqual([down.level, down.week], [5, 1]);
  const top = L.placement([evalAt(12, 4, 150)], LADDER);
  assert.equal(top.top, true); assert.match(top.explanation, /highest level/);
  assert.equal(near.evidence.length, 2); assert.equal(near.evidence[1].result, "near");
});
test("below the ladder recommends supported reading; running out of probes gives an unconfirmed start", () => {
  const supported = L.placement([evalAt(1, 1, 60)], LADDER);
  assert.deepEqual([supported.level, supported.week, supported.supported, supported.confirmed], [1, 1, true, false]);
  assert.match(supported.explanation, /read with an adult/);
  const misses = [12, 11, 9, 6, 5].map(level => evalAt(level, 1, 150));
  const provisional = L.placement(misses, LADDER);
  assert.deepEqual([provisional.level, provisional.confirmed, provisional.supported], [3, false, false]);
});
test("skill summary adds probes by skill in a stable order", () => {
  const summary = L.skillSummary([evalAt(5, 4, 150), evalAt(6, 2, 150)]);
  assert.deepEqual(summary.map(entry => entry.skill), L.SKILLS.filter(skill => summary.some(entry => entry.skill === skill)));
  assert.equal(summary.reduce((sum, entry) => sum + entry.total, 0), 8);
  assert.equal(summary.reduce((sum, entry) => sum + entry.correct, 0), 6);
});

// ---- Plans ----
const LIBRARY = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
function planFor(place, extra = {}) {
  return { startDate: "2026-10-07", weeks: 12, nights: "weekdays", stage: 0, ...L.planCursors(place, LIBRARY), confirmed: place.confirmed, supported: !!place.supported, ...extra };
}
test("a plan starts on the first reading night on or after the start date and dates every night", () => {
  const plan = L.makePlan({ ...planFor({ level: 5, week: 19, confirmed: true }), libraryLevels: LIBRARY });
  assert.equal(plan.firstNight, "2026-10-12"); // Wednesday start, Monday nights
  assert.equal(plan.weeks.length, 12);
  const nights = plan.weeks.flatMap(week => week.nights);
  assert.equal(nights.length, 60);
  assert.ok(nights.every(night => [1, 2, 3, 4, 5].includes(L.weekday(night.date))));
  assert.deepEqual(nights[0], { date: "2026-10-12", kind: "core", level: 5, week: 19, day: 1, href: "daily-reading.html#5/19/1", title: null, minutes: null });
  const school = L.makePlan({ ...planFor({ level: 5, week: 1, confirmed: true }, { nights: "school-nights" }), libraryLevels: LIBRARY });
  assert.equal(school.firstNight, "2026-10-11"); assert.ok(school.weeks[0].nights.every(night => [0, 1, 2, 3, 4].includes(L.weekday(night.date))));
});
test("stretch nights come from the next level mid-week and grow by stage, never past two of five", () => {
  const plan = L.makePlan({ ...planFor({ level: 5, week: 1, confirmed: true }), libraryLevels: LIBRARY });
  const perWeek = plan.weeks.map(week => week.nights.filter(night => night.kind === "stretch").length);
  assert.deepEqual(perWeek, [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2]);
  assert.equal(plan.weeks[0].nights[2].kind, "stretch"); assert.equal(plan.weeks[0].nights[2].level, 6);
  assert.deepEqual(plan.weeks[4].nights.map(night => night.kind), ["core", "stretch", "core", "stretch", "core"]);
  const stretch = plan.weeks.flatMap(week => week.nights).filter(night => night.kind === "stretch");
  assert.deepEqual(stretch.slice(0, 2).map(night => [night.week, night.day]), [[1, 1], [1, 2]]);
  const core = plan.weeks.flatMap(week => week.nights).filter(night => night.kind === "core");
  core.forEach((night, i) => assert.equal(L.nightIndex(night.week, night.day), i)); // core nights stay in order
});
test("re-checks fall the day after every fourth week's last night", () => {
  const plan = L.makePlan({ ...planFor({ level: 5, week: 1, confirmed: true }), libraryLevels: LIBRARY });
  assert.deepEqual(plan.weeks.map(week => week.recheck && week.recheck.date).filter(Boolean), ["2026-11-07", "2026-12-05", "2027-01-02"]);
});
test("unconfirmed placements get no stretch; the top level has none either", () => {
  const supported = L.makePlan({ ...planFor({ level: 1, week: 1, confirmed: false, supported: true }), libraryLevels: LIBRARY });
  assert.ok(supported.weeks.flatMap(week => week.nights).every(night => night.kind === "core" && night.level === 1));
  const top = L.makePlan({ ...planFor({ level: 12, week: 1, confirmed: true }), libraryLevels: LIBRARY });
  assert.ok(top.weeks.flatMap(week => week.nights).every(night => night.kind === "core"));
});
test("a finished year continues where the stretch nights reached; the library's end is reported", () => {
  const plan = L.makePlan({ ...planFor({ level: 5, week: 35, confirmed: true }, { weeks: 4 }), libraryLevels: LIBRARY });
  const nights = plan.weeks.flatMap(week => week.nights), after = nights.filter(night => night.kind === "core" && night.level === 6);
  assert.ok(after.length > 0); assert.deepEqual([after[0].week, after[0].day], [1, 3]); // two stretch nights were read first
  assert.ok(nights.filter(night => night.kind === "stretch").slice(-1)[0].level === 7);
  const end = L.makePlan({ ...planFor({ level: 12, week: 35, confirmed: true }, { weeks: 4 }), libraryLevels: LIBRARY });
  assert.equal(end.endOfLibrary, true); assert.equal(end.weeks.flatMap(week => week.nights).length, 10);
});
test("plans carry night titles when given and reject bad inputs", () => {
  const titles = { 5: Array.from({ length: 180 }, (_, i) => ["Night " + i, 15]) };
  const plan = L.makePlan({ ...planFor({ level: 5, week: 2, confirmed: false }), libraryLevels: LIBRARY, titles });
  assert.equal(plan.weeks[0].nights[0].title, "Night 5"); assert.equal(plan.weeks[0].nights[0].minutes, 15);
  assert.throws(() => L.makePlan({ ...planFor({ level: 5, week: 1, confirmed: true }), startDate: "2026-02-30" }), /date/);
  assert.throws(() => L.makePlan({ ...planFor({ level: 5, week: 1, confirmed: true }), weeks: 5 }), /length/);
  assert.throws(() => L.makePlan({ ...planFor({ level: 5, week: 1, confirmed: true }), nights: "weekends" }), /night pattern/);
});

// ---- Re-checks ----
test("re-check level: stretch level, a probed stand-in above it, or the placement while unconfirmed", () => {
  const inputs = planFor({ level: 5, week: 1, confirmed: true });
  assert.equal(L.recheckLevel(inputs, LADDER), 6);
  assert.equal(L.recheckLevel(planFor({ level: 9, week: 1, confirmed: true }), LADDER), 11); // 10 has no probes yet
  assert.equal(L.recheckLevel(planFor({ level: 1, week: 1, confirmed: false, supported: true }), LADDER), 1);
  assert.equal(L.recheckLevel(planFor({ level: 12, week: 1, confirmed: true }), LADDER), 12);
});
test("forms: calibrations prefer a, re-checks b; a repeat is the one seen longest ago", () => {
  assert.deepEqual(L.chooseForm(5, [], ["a", "b"]), { form: "a", repeat: false });
  assert.deepEqual(L.chooseForm(5, [{ level: 5, form: "a", order: 0 }]), { form: "b", repeat: false });
  assert.deepEqual(L.chooseForm(5, [{ level: 5, form: "a", order: 0 }, { level: 5, form: "b", order: 3 }]), { form: "a", repeat: true });
  assert.deepEqual(L.chooseForm(5, [{ level: 5, form: "b", order: 0 }, { level: 5, form: "a", order: 3 }]), { form: "b", repeat: true });
});
test("a passing re-check advances to the stretch level, continuing from the stretch nights", () => {
  const inputs = planFor({ level: 5, week: 1, confirmed: true });
  const decision = L.applyRecheck(inputs, evalAt(6, 4, 150, null, "b"), "2026-11-07", LIBRARY);
  assert.equal(decision.action, "advance");
  assert.deepEqual(decision.inputs.core, { level: 6, index: 4 }); // four stretch nights in weeks 1–4
  assert.deepEqual(decision.inputs.stretch, { level: 7, index: 0 });
  assert.equal(decision.inputs.stage, 0); assert.equal(decision.inputs.startDate, "2026-11-08");
  const standIn = L.applyRecheck(planFor({ level: 9, week: 1, confirmed: true }), evalAt(11, 4, 150, null, "b"), "2026-11-07", LIBRARY);
  assert.equal(standIn.action, "advance"); assert.equal(standIn.inputs.core.level, 10); assert.match(standIn.message, /Grade 11 re-check passage/);
});
test("a close re-check holds and keeps stretching; a weak one returns to the first stage", () => {
  const inputs = planFor({ level: 5, week: 1, confirmed: true });
  const near = L.applyRecheck(inputs, evalAt(6, 2, 150, null, "b"), "2026-11-07", LIBRARY);
  assert.equal(near.action, "hold"); assert.equal(near.inputs.stage, 1); assert.deepEqual(near.inputs.core, { level: 5, index: 16 });
  assert.match(near.message, /close/);
  const weak = L.applyRecheck(inputs, evalAt(6, 0, 150, null, "b"), "2026-11-07", LIBRARY);
  assert.equal(weak.action, "hold"); assert.equal(weak.inputs.stage, 0); assert.deepEqual(weak.inputs.stretch, { level: 6, index: 4 });
  const early = L.applyRecheck(inputs, evalAt(6, 2, 150, null, "b"), "2026-10-01", LIBRARY);
  assert.deepEqual(early.inputs.core, { level: 5, index: 0 }); // nothing read yet
});
test("an unconfirmed placement is confirmed by passing its own re-check", () => {
  const inputs = planFor({ level: 1, week: 1, confirmed: false, supported: true });
  const pass = L.applyRecheck(inputs, evalAt(1, 3, 80, null, "b"), "2026-11-07", LIBRARY);
  assert.equal(pass.action, "confirm"); assert.equal(pass.inputs.confirmed, true); assert.deepEqual(pass.inputs.stretch, { level: 2, index: 0 });
  const hold = L.applyRecheck(inputs, evalAt(1, 1, 80, null, "b"), "2026-11-07", LIBRARY);
  assert.equal(hold.action, "hold"); assert.equal(hold.inputs.supported, true); assert.equal(hold.inputs.stretch, null);
});

// ---- Saved state ----
test("saved state round-trips and drops anything malformed", () => {
  const state = L.emptyState();
  state.attempts.push({ id: "cal-abc", kind: "calibration", startedAt: "2026-10-07T10:00:00.000Z", finishedAt: "2026-10-07T10:20:00.000Z", startLevel: 5,
    responses: [{ probeId: "rl-5-a", answers: [0, 1, 2, 3], readingMs: 120000, rating: "right", repeat: false, at: "2026-10-07T10:05:00.000Z" }] });
  state.plan = { ...planFor({ level: 5, week: 19, confirmed: true }), createdAt: "2026-10-07T10:21:00.000Z", note: "Placed." };
  const parsed = L.parseState(L.serializeState(state));
  assert.deepEqual(parsed.attempts, state.attempts); assert.deepEqual(parsed.plan, state.plan);
  for (const raw of [null, "", "{", "[]", JSON.stringify({ version: 2, attempts: state.attempts }), JSON.stringify({ version: 1, attempts: "x" })]) {
    const result = L.parseState(raw); assert.deepEqual(result.attempts, []); assert.equal(result.plan, null);
  }
  const bad = JSON.parse(L.serializeState(state));
  bad.attempts.push({ ...bad.attempts[0], id: "BAD ID" }, { ...bad.attempts[0], id: "cal-2", responses: [{ probeId: "rl-5-a", answers: [7], readingMs: 1 }] },
    { ...bad.attempts[0], id: "cal-3", kind: "other" }, { ...bad.attempts[0], id: "cal-4", responses: [{ probeId: "rl-5-a", answers: [0], readingMs: -5 }] });
  bad.plan.core.index = 180;
  const cleaned = L.parseState(JSON.stringify(bad));
  assert.deepEqual(cleaned.attempts.map(attempt => attempt.id), ["cal-abc"]); assert.equal(cleaned.plan, null);
});
test("an in-progress probe is restored only when it belongs to an unfinished attempt", () => {
  const state = L.emptyState();
  state.attempts.push({ id: "cal-x", kind: "calibration", startedAt: "2026-10-07T10:00:00.000Z", finishedAt: null, startLevel: 5, responses: [] });
  state.current = { attemptId: "cal-x", probeId: "rl-5-a", phase: "questions", answers: [1, null], readingMs: 90000, rating: "hard", repeat: false };
  assert.deepEqual(L.parseState(L.serializeState(state)).current, state.current);
  assert.equal(L.parseState(L.serializeState({ ...state, current: { ...state.current, attemptId: "cal-y" } })).current, null);
  assert.equal(L.parseState(L.serializeState({ ...state, current: { ...state.current, readingMs: null } })).current, null);
  assert.equal(L.parseState(L.serializeState({ ...state, current: { ...state.current, phase: "reading", readingMs: null } })).current.phase, "reading");
  assert.equal(L.parseState(L.serializeState({ ...state, current: { ...state.current, answers: [9] } })).current.answers.length, 0);
});
test("dates are calendar-checked and computed without time-zone drift", () => {
  assert.equal(L.validDate("2026-10-07"), true); assert.equal(L.validDate("2026-02-30"), false); assert.equal(L.validDate("10/07/2026"), false);
  assert.equal(L.addDays("2026-12-31", 1), "2027-01-01"); assert.equal(L.addDays("2026-03-07", 2), "2026-03-09");
  assert.equal(L.weekday("2026-10-07"), 3);
});

// ---- Validator (synthetic courses) ----
const PASSAGE = "The small grey boat drifted past the quiet harbour wall at dawn. A gull followed it, crying, until the fog lifted and the whole bay shone. " +
  "Nobody on the shore noticed the boat until the bell rang twice, and then everyone ran down to the water to see who had come home at last after the long winter. " +
  "The old keeper of the light climbed down from his tower, wiped his hands on his coat, and laughed when he saw the patched red sail he had mended himself the autumn before.";
function course(grade, nights = 4) {
  const days = Array.from({ length: nights }, (_, i) => {
    const id = "reading-" + grade + "-w0" + (i + 1) + "-d1";
    const day = { id, week: i + 1, day: 1, title: "Night " + i, sourceId: "s", genre: "story", readingMode: "independent", time: { readingMinutes: 10, discussionMinutes: 5, totalMinutes: 15 },
      context: "c", contentNote: null, excerpt: { locator: "l", isCompleteWork: true, continuesFrom: null, continuesTo: null, textHash: "" },
      blocks: [{ type: "paragraph", text: PASSAGE + " (night " + grade + "-" + i + ")" }],
      questions: [{ id: id + "-q1", prompt: "Why does everyone run down to the water when the bell rings twice?", facilitatorNotes: ["FACILITATOR_SECRET they want to greet the returning sailors"], evidence: ["the bell rang twice"] }] };
    day.excerpt.textHash = textHash(day); return day;
  });
  return { grade, title: "Grade " + grade, days, sources: [{ id: "s", author: "Test Author", title: "Test Source", translator: null, translationYear: null, edition: "Synthetic", publicationYear: 1900,
    url: "https://example.org/s", textUrl: "https://example.org/t", rights: { basis: "Synthetic fixture.", status: "public-domain", jurisdiction: "US" } }] };
}
function item(id, n, key = 0) {
  const options = ["A boat has come home after the winter", "The fog is too thick to see the harbour", "A gull has stolen some fish from them", "The tide is about to flood the shore"];
  const keyed = options.slice(1); keyed.splice(key, 0, options[0]);
  return { id: id + "-" + n, skill: "inference", stem: "What makes the people hurry to the shore? (" + n + ")", options: keyed, key, rationale: "They ran once “the bell rang twice” to see who had come home." };
}
function probeData(levels) {
  return { schemaVersion: 1, title: "Test probes", review: { status: "unreviewed", note: "Fixture." },
    probes: levels.flatMap(level => ["a", "b"].map((form, i) => {
      const day = course(level).days[i], id = "rl-" + level + "-" + form;
      return { id, level, form, dayId: day.id, textHash: day.excerpt.textHash, intro: "A short test story.", items: Array.from({ length: L.itemCount(level) }, (_, n) => item(id, n + 1, n % 4)) };
    })) };
}
test("the validator admits a well-formed set and reports missing levels without failing", () => {
  const result = T.validateProbes(probeData([1, 3]), [course(1), course(3), course(5)]);
  assert.deepEqual(result.levels, [1, 3]); assert.ok(result.missing.includes(5)); assert.ok(result.missing.includes(12));
  assert.ok(result.pendingGrades.includes(4)); assert.ok(!result.pendingGrades.includes(5));
  assert.throws(() => T.validateProbes(probeData([1, 3]), [course(1), course(3)], { complete: true }), /missing 2, 4/);
  const all = Array.from({ length: 13 }, (_, i) => i + 1);
  assert.equal(T.validateProbes(probeData(all), all.map(level => course(level)), { complete: true }).missing.length, 0, "a level 13 in the library is expected and accepted");
});
test("the validator refuses each structural failure", () => {
  const courses = [course(1), course(3)];
  const cases = [
    [data => { data.probes[0].textHash = "0".repeat(64); }, /textHash mismatch/],
    [data => { data.probes[0].dayId = "reading-1-w09-d9"; }, /does not resolve/],
    [data => { data.probes[1].dayId = data.probes[0].dayId; data.probes[1].textHash = data.probes[0].textHash; }, /used by two probes/],
    [data => { data.probes.push(structuredClone(data.probes[0])); }, /duplicate probe/],
    [data => { data.probes.splice(1, 1); }, /needs both forms/],
    [data => { data.probes[0].items.pop(); }, /needs 3 items/],
    [data => { data.probes[2].items.push(item("rl-3-a", 5)); }, /needs 4 items/],
    [data => { data.probes[0].items[0].key = 4; }, /key must be/],
    [data => { data.probes[0].items[0].options.pop(); }, /four options/],
    [data => { data.probes[0].items[0].options[1] = data.probes[0].items[0].options[0].toUpperCase(); }, /distinct/],
    [data => { data.probes[0].items[0].skill = "trivia"; }, /unknown skill/],
    [data => { data.probes[0].items[0].id = "rl-1-a-9"; }, /item ID/],
    [data => { data.probes[0].items[0].rationale = "Because the text says so."; }, /quote the passage/],
    [data => { data.probes[0].items[0].rationale = "It says “the whale sang loudly” here."; }, /quote the passage/],
    [data => { data.probes[0].items[0].stem = "Why does everyone run down to the water when the boat comes?"; }, /copied from the night's discussion/],
    [data => { data.probes[0].items[0].options[1] = "They want to greet the returning sailors now"; }, /copied/],
    [data => { const it = data.probes[0].items[0]; it.options = ["A boat has come home after the long, cold winter months away", "Fog", "Gulls", "Tide"]; it.key = 0; }, /visibly the longest/],
    [data => { data.probes[0].items[0].stem = "<b>Bold</b> question?"; }, /non-plain/],
    [data => { data.probes[0].level = 2; }, /probe ID must be/],
    [data => { data.probes[0].form = "c"; }, /form must be/],
    [data => { data.probes[0].secret = 1; }, /unknown probe field/],
    [data => { data.probes[0].items[0].hint = "x"; }, /unknown item field/],
    [data => { data.review.status = "approved"; }, /review.status/],
    [data => { data.schemaVersion = 2; }, /schemaVersion/],
  ];
  for (const [mutate, error] of cases) { const data = probeData([1, 3]); mutate(data); assert.throws(() => T.validateProbes(data, courses), error, String(error)); }
  const continued = [course(1), course(3)]; continued[0].days[0].excerpt.continuesFrom = "reading-1-w00-d5";
  assert.throws(() => T.validateProbes(probeData([1, 3]), continued), /continues an earlier night/);
  const absent = probeData([1, 3]); assert.throws(() => T.validateProbes(absent, [course(3)]), /not in the daily library/);
  const long = [course(1), course(3)]; long[0].days[0].blocks[0].text = "word ".repeat(T.MAX_WORDS + 1).trim(); long[0].days[0].excerpt.textHash = textHash(long[0].days[0]);
  const data = probeData([1, 3]); data.probes[0].textHash = long[0].days[0].excerpt.textHash;
  assert.throws(() => T.validateProbes(data, long), /words, outside/);
});
test("the bundle resolves passage text and never includes facilitator notes", () => {
  const courses = [course(1), course(3)], data = probeData([1, 3]);
  const built = T.bundle({ data, courses, ...T.validateProbes(data, courses) }), text = JSON.stringify(built);
  assert.doesNotMatch(text, /FACILITATOR_SECRET|facilitatorNotes|"questions"|"evidence"/);
  assert.equal(built.probes[0].blocks[0].text, courses[0].days[0].blocks[0].text);
  assert.equal(built.probes[0].words, L.wordCount(courses[0].days[0].blocks[0].text));
  assert.deepEqual(built.levels.map(entry => entry.label), ["Grade 1", "Grade 3"]);
  assert.equal(built.library[0].nights[0][0], "Night 0");
});

// ---- The shipped probe set ----
test("the shipped probe set validates against the daily library", () => {
  const { resolved, levels } = T.loadProbes();
  assert.ok(levels.length >= 1);
  for (const level of levels) {
    const forms = resolved.filter(entry => entry.probe.level === level);
    assert.equal(forms.length, 2);
    forms.forEach(entry => assert.equal(entry.probe.items.length, L.itemCount(level)));
  }
  const keys = resolved.flatMap(entry => entry.probe.items.map(item => item.key));
  for (let k = 0; k < 4; k++) assert.ok(keys.filter(key => key === k).length >= keys.length / 6, "answer keys spread across positions");
});
