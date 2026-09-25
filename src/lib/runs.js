// Practice runs built from templates.
//
// A run takes at most one question from each template: the templates are
// chosen first, as a set of registry bits (see template-mask.js), and one
// question is then drawn from each. A run is therefore fully described by its
// template mask and its seed, which together form its code. Pure logic with
// no DOM access; loads in Node and as a plain browser script
// (window.LiminalRuns, after window.LiminalTemplateMask).
(function (root, factory) {
  const Mask = typeof module === "object" && module.exports
    ? require("./template-mask")
    : root.LiminalTemplateMask;
  const api = factory(Mask);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalRuns = api;
})(typeof self !== "undefined" ? self : this, function (Mask) {
  "use strict";

  function hash(text) {
    let value = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      value ^= text.charCodeAt(index);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  // Joins families with their registry bits and drops retired templates.
  // `registry` is the parsed content/templates/<section>.json.
  function catalogTemplates(families, registry) {
    const bits = new Map(
      (registry.templates || [])
        .filter((entry) => !entry.retired)
        .map((entry) => [entry.id, entry.bit]),
    );
    return families
      .filter((family) => bits.has(family.id))
      .map((family) => ({
        id: family.id,
        bit: bits.get(family.id),
        family,
        difficulty: family.difficulty || "Hard",
        domain: family.domain,
        skill: family.skill,
      }));
  }

  function matches(template, filters) {
    const settings = filters || {};
    const within = (list, value) => !list || !list.length || list.includes(value);
    return within(settings.difficulties, template.difficulty) &&
      within(settings.domains, template.domain) &&
      within(settings.skills, template.skill);
  }

  // How many distinct templates a run with these filters can draw on, which
  // is the most questions it can hold.
  function available(templates, filters) {
    return templates.filter((template) => matches(template, filters)).length;
  }

  // Chooses up to `count` templates, preferring, in order: templates not yet
  // seen (not in `seen`, a history mask); the skill used least so far in this
  // run; then a seeded shuffle. Never more templates than match.
  function chooseTemplates(templates, options) {
    const settings = options || {};
    const seen = settings.seen || Mask.EMPTY;
    const pool = templates
      .filter((template) => matches(template, settings.filters))
      .map((template) => ({
        template,
        fresh: !Mask.has(seen, template.bit),
        order: hash(`${settings.seed}|${template.id}`),
      }));
    const target = Math.min(Math.max(0, settings.count || 0), pool.length);
    const skillUses = new Map();
    const chosen = [];
    let mask = Mask.EMPTY;
    while (chosen.length < target) {
      let best = null;
      pool.forEach((candidate) => {
        if (Mask.has(mask, candidate.template.bit)) return;
        if (!best) {
          best = candidate;
          return;
        }
        const rank = (entry) => [
          entry.fresh ? 0 : 1,
          skillUses.get(entry.template.skill) || 0,
          entry.order,
        ];
        const [a, b] = [rank(candidate), rank(best)];
        for (let place = 0; place < a.length; place += 1) {
          if (a[place] !== b[place]) {
            if (a[place] < b[place]) best = candidate;
            return;
          }
        }
      });
      chosen.push(best.template);
      mask = Mask.add(mask, best.template.bit);
      skillUses.set(best.template.skill, (skillUses.get(best.template.skill) || 0) + 1);
    }
    return { templates: chosen, mask };
  }

  // Draws one question from each template with `instantiate(family, seed)`
  // and returns them in the run's order. Scenes are settled in bit order and
  // the run's order depends only on its seed, so the same mask and seed always
  // give the same questions in the same order. A template may try a few seeds
  // so that no two questions share a scene (one topic under two templates).
  function drawQuestions(templates, seed, instantiate, idPrefix) {
    const scenes = new Set();
    const byId = new Map();
    templates.slice().sort((left, right) => left.bit - right.bit).forEach((template) => {
      let question = null;
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const itemSeed = `${seed}.${template.id}.${attempt}`;
        question = { ...instantiate(template.family, itemSeed), id: `${idPrefix || ""}${template.id}:${itemSeed}` };
        if (!question.scene || !scenes.has(question.scene)) break;
      }
      if (question.scene) scenes.add(question.scene);
      byId.set(template.id, question);
    });
    return templates
      .slice()
      .sort((left, right) => hash(`${seed}|order|${left.id}`) - hash(`${seed}|order|${right.id}`))
      .map((template) => byId.get(template.id));
  }

  // A run's code: its template mask and its seed, both in base 36.
  function runCode(mask, seed) {
    return `${Mask.toCode(mask)}-${String(seed)}`;
  }

  function parseRunCode(code) {
    const match = /^([0-9a-z]+)-([0-9a-z]+)$/i.exec(String(code || "").trim());
    if (!match) throw new SyntaxError(`Invalid run code "${code}"`);
    return { mask: Mask.fromCode(match[1]), seed: match[2].toLowerCase() };
  }

  // Rebuilds the exact templates of a run from its mask.
  function templatesForMask(templates, mask) {
    return templates.filter((template) => Mask.has(mask, template.bit));
  }

  return {
    available,
    catalogTemplates,
    chooseTemplates,
    drawQuestions,
    parseRunCode,
    runCode,
    templatesForMask,
  };
});
