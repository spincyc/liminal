"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const D = require("../src/lib/daily-reading");

test("reader sequence destinations cover every night without escaping the selected grade", () => {
  for (const grade of D.GRADES) for (let position = 0; position < 180; position++) {
    const week = Math.floor(position / 5) + 1, day = position % 5 + 1;
    const pages = D.navigation({ grade, week, day });
    assert.equal(pages.first && pages.first.href, position ? D.route(grade, 1, 1) : null);
    assert.equal(pages.last && pages.last.href, position < 179 ? D.route(grade, 36, 5) : null);
    for (const [direction, delta] of [["previous", -1], ["next", 1]]) {
      const target = position + delta;
      assert.equal(pages[direction] && pages[direction].href, target < 0 || target > 179 ? null : D.route(grade, Math.floor(target / 5) + 1, target % 5 + 1));
    }
  }
});

test("invalid reader selections have no navigation destinations", () => {
  for (const selected of [null, {}, { grade: 17, week: 1, day: 1 }, { grade: 1, week: 37, day: 1 }, { grade: 1, week: 1, day: 6 }]) {
    assert.deepEqual(D.navigation(selected), { first: null, previous: null, next: null, last: null });
  }
});

test("related reading lessons keep the selected school grade and week", () => {
  for (let grade = 0; grade <= 12; grade++) for (const week of [1, 12, 36]) {
    const links = D.lessonLinks(grade, week), key = D.gradeKey(grade);
    assert.equal(links.weekly.href, "weeks.html#common-core-reading/" + key + "/" + week);
    assert.equal(links.plan.href, "curriculum.html#common-core-reading/" + key);
    assert.match(links.weekly.label, new RegExp("Week " + week + "$"));
    assert.ok(links.plan.label.startsWith(D.gradeLabel(grade)));
  }
});

test("advanced reading levels identify related K–12 lessons without implying a school grade", () => {
  for (let grade = 13; grade <= 16; grade++) {
    const links = D.lessonLinks(grade, 20);
    assert.match(links.weekly.label, /Related K–12/);
    assert.match(links.plan.label, /K–12/);
    assert.doesNotMatch(links.weekly.label + links.plan.label, /Advanced|Grade|Week/);
    assert.equal(links.weekly.href, "weeks.html#common-core-reading/k/1");
    assert.equal(links.plan.href, "curriculum.html#common-core-reading/k");
  }
});

test("related lesson links reject invalid grades and weeks", () => {
  for (const grade of [-1, 17, "8", null]) assert.equal(D.lessonLinks(grade), null);
  for (const week of [0, 37, 1.5, "2", null]) assert.equal(D.lessonLinks(8, week), null);
});
