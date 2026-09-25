"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const mask = require("../src/lib/template-mask");

test("a mask holds each template bit at most once", () => {
  let run = mask.EMPTY;
  run = mask.add(run, 3);
  run = mask.add(run, 3);
  run = mask.add(run, 70);
  assert.equal(mask.size(run), 2);
  assert.deepEqual(mask.bits(run), [3, 70]);
  assert.ok(mask.has(run, 70));
  assert.ok(!mask.has(run, 4));
});

test("masks round-trip through their base-36 code beyond 53 bits", () => {
  const run = mask.fromBits([0, 52, 53, 64, 199, 450]);
  const code = mask.toCode(run);
  assert.match(code, /^[0-9a-z]+$/);
  assert.equal(mask.fromCode(code), run);
  assert.deepEqual(mask.bits(mask.fromCode(code)), [0, 52, 53, 64, 199, 450]);
  assert.equal(mask.fromCode("0"), mask.EMPTY);
});

test("history is the union of runs", () => {
  const first = mask.fromBits([1, 2]);
  const second = mask.fromBits([2, 5]);
  assert.deepEqual(mask.bits(mask.union(first, second)), [1, 2, 5]);
});

test("invalid input is rejected", () => {
  assert.throws(() => mask.add(mask.EMPTY, -1), RangeError);
  assert.throws(() => mask.fromCode("not a code!"), SyntaxError);
});
