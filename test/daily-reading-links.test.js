"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const D = require("../src/lib/daily-reading");

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
