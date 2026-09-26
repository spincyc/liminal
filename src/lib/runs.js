// Practice runs built from templates.
//
// A run takes at most one question from each template: the templates are
// chosen first, as a set of registry bits (see template-mask.js), and one
// question is then drawn from each. A run is therefore described by its
// template mask and its seed, which together form its code (plus, when a
// draw steered around the student's past scenes, the attempt each template
// used; see runCode). Pure logic with no DOM access; loads in Node and as a
// plain browser script (window.LiminalRuns, after window.LiminalTemplateMask).
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

  // Joins families with their registry entries and drops retired templates.
  // `registry` is the parsed content/templates/<section>.json; each template
  // carries its permanent bit and its version (1 when the entry has none).
  function catalogTemplates(families, registry) {
    const entries = new Map(
      (registry.templates || [])
        .filter((entry) => !entry.retired)
        .map((entry) => [entry.id, entry]),
    );
    return families
      .filter((family) => entries.has(family.id))
      .map((family) => ({
        id: family.id,
        bit: entries.get(family.id).bit,
        version: entries.get(family.id).version || 1,
        family,
        difficulty: family.difficulty,
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

  // How a template ranks for a new run, lowest first. With `recency` (a map of
  // template id to the serve counter when it was last served): never served,
  // then least recently served. Without it, templates outside the `seen`
  // history mask come first. Ties go to the skill used least so far in this
  // run, then to a seeded shuffle.
  function ranker(settings) {
    const recency = settings.recency;
    const seen = settings.seen || Mask.EMPTY;
    const freshness = recency
      ? (template) => (Object.prototype.hasOwnProperty.call(recency, template.id)
        ? Number(recency[template.id])
        : -Infinity)
      : (template) => (Mask.has(seen, template.bit) ? 1 : 0);
    const order = new Map();
    const shuffled = (template) => {
      if (!order.has(template.id)) order.set(template.id, hash(`${settings.seed}|${template.id}`));
      return order.get(template.id);
    };
    return (template, skillUses) => [freshness(template), skillUses.get(template.skill) || 0, shuffled(template)];
  }

  function before(left, right) {
    for (let place = 0; place < left.length; place += 1) {
      if (left[place] !== right[place]) return left[place] < right[place];
    }
    return false;
  }

  // Greedy picks from `candidates`, re-ranking after each pick so skills
  // alternate. `state` carries the run's mask and skill uses across calls.
  function pick(candidates, count, rank, state) {
    const left = candidates.slice();
    const chosen = [];
    while (chosen.length < count && left.length) {
      let bestIndex = 0;
      let bestRank = rank(left[0], state.skillUses);
      for (let index = 1; index < left.length; index += 1) {
        const candidateRank = rank(left[index], state.skillUses);
        if (before(candidateRank, bestRank)) {
          bestIndex = index;
          bestRank = candidateRank;
        }
      }
      const [template] = left.splice(bestIndex, 1);
      chosen.push(template);
      state.mask = Mask.add(state.mask, template.bit);
      state.skillUses.set(template.skill, (state.skillUses.get(template.skill) || 0) + 1);
    }
    return chosen;
  }

  // Seats per domain in proportion to `weights` ({ [domain]: weight }), by
  // largest remainder, never more than a domain has (`sizes`); a capped
  // domain's surplus goes to the others in proportion. Ties in the remainder
  // go by a seeded order so no domain is favoured across runs. Domains without
  // weight get no seats here.
  function apportion(total, weights, sizes, seed) {
    const seats = {};
    let open = Object.keys(sizes).filter((domain) => Number(weights[domain]) > 0 && sizes[domain] > 0);
    let remaining = total;
    open.forEach((domain) => (seats[domain] = 0));
    while (remaining > 0 && open.length) {
      const weight = open.reduce((sum, domain) => sum + Number(weights[domain]), 0);
      const quotas = open.map((domain) => ({ domain, quota: (remaining * Number(weights[domain])) / weight }));
      const capped = quotas.filter(({ domain, quota }) => quota >= sizes[domain] - seats[domain]);
      if (capped.length) {
        // Fill every domain that cannot take its share, then share out the rest.
        capped.forEach(({ domain }) => {
          remaining -= sizes[domain] - seats[domain];
          seats[domain] = sizes[domain];
        });
        open = open.filter((domain) => !capped.some((entry) => entry.domain === domain));
        continue;
      }
      let handed = 0;
      quotas.forEach(({ domain, quota }) => {
        seats[domain] += Math.floor(quota);
        handed += Math.floor(quota);
      });
      quotas
        .map(({ domain, quota }) => ({ domain, remainder: quota - Math.floor(quota), order: hash(`${seed}|domain|${domain}`) }))
        .sort((left, right) => right.remainder - left.remainder || left.order - right.order)
        .slice(0, remaining - handed)
        .forEach(({ domain }) => (seats[domain] += 1));
      remaining = 0;
    }
    return seats;
  }

  // Chooses up to `count` templates that match `filters`, never more than
  // match. Options (all optional):
  //   seed           the run's seed; the same inputs give the same choice.
  //   recency        { [templateId]: lastServed } with lastServed a serve
  //                  counter that only grows: prefer never served, then least
  //                  recently served (see ranker). Replaces `seen`.
  //   seen           a history mask of templates served before; they come
  //                  last. Used when `recency` is absent.
  //   domainWeights  { [domain]: weight }, e.g. the catalog's domain targets:
  //                  domains get seats in proportion (see apportion), and the
  //                  preferences above apply within each domain. Seats a
  //                  weighted domain cannot fill go to the best remaining
  //                  templates of any domain.
  // Returns { templates, mask }.
  function chooseTemplates(templates, options) {
    const settings = options || {};
    const pool = templates.filter((template) => matches(template, settings.filters));
    const target = Math.min(Math.max(0, settings.count || 0), pool.length);
    const rank = ranker(settings);
    const state = { mask: Mask.EMPTY, skillUses: new Map() };
    const chosen = [];
    const weights = settings.domainWeights;
    if (weights && typeof weights === "object") {
      const byDomain = new Map();
      pool.forEach((template) => {
        if (!byDomain.has(template.domain)) byDomain.set(template.domain, []);
        byDomain.get(template.domain).push(template);
      });
      const sizes = Object.fromEntries([...byDomain].map(([domain, list]) => [domain, list.length]));
      const seats = apportion(target, weights, sizes, settings.seed);
      Object.keys(seats).sort().forEach((domain) => {
        chosen.push(...pick(byDomain.get(domain), seats[domain], rank, state));
      });
    }
    const rest = pool.filter((template) => !Mask.has(state.mask, template.bit));
    chosen.push(...pick(rest, target - chosen.length, rank, state));
    return { templates: chosen, mask: state.mask };
  }

  // The most seeds one template tries before it is skipped; a run code stores
  // each template's attempt as one base-36 digit.
  const MAX_ATTEMPTS = 36;

  // Draws one question from each template with `instantiate(family, seed)`
  // and returns them in the run's order. The seed of a template's question is
  // "<run seed>.<template id>.<attempt>", tried from attempt 0 up:
  //   - a draw that throws, or whose record has `verified === false`, is never
  //     used;
  //   - no two questions share a scene (one topic under two templates);
  //   - with options.seenScenes ({ [templateId]: [scene, …] }, oldest first),
  //     a template avoids the scenes it has shown before when it can, and
  //     otherwise shows the one seen longest ago;
  //   - with options.attempts ({ [templateId]: attempt }, from a run code),
  //     that attempt is used when its draw is good.
  // A template with no good draw in MAX_ATTEMPTS seeds is left out.
  //
  // Scenes are settled in bit order and the run's order depends only on its
  // seed, so the same templates, seed and options always give the same
  // questions in the same order. The returned array carries two
  // non-enumerable properties: `skipped`, a list of { templateId, reason }
  // for templates left out ("throws" or "unverified"), and `attempts`,
  // { [templateId]: attempt } for the questions drawn, which runCode takes.
  function drawQuestions(templates, seed, instantiate, idPrefix, options) {
    const settings = options || {};
    const seenScenes = settings.seenScenes || {};
    const pinned = settings.attempts || {};
    const scenes = new Set();
    const byId = new Map();
    const attempts = {};
    const skipped = [];
    const draw = (template, attempt) => {
      const itemSeed = `${seed}.${template.id}.${attempt}`;
      try {
        const record = instantiate(template.family, itemSeed);
        if (!record || record.verified === false) return { problem: "unverified" };
        return { question: { ...record, id: `${idPrefix || ""}${template.id}:${itemSeed}` } };
      } catch (error) {
        return { problem: "throws" };
      }
    };
    templates.slice().sort((left, right) => left.bit - right.bit).forEach((template) => {
      const history = Array.isArray(seenScenes[template.id]) ? seenScenes[template.id] : [];
      // Lower is better: a scene new to this run and to the student, then one
      // new to this run seen longest ago, then a scene already in this run.
      const cost = (question) => {
        if (!question.scene) return 0;
        if (scenes.has(question.scene)) return history.length + 1;
        const place = history.lastIndexOf(question.scene);
        return place < 0 ? 0 : 1 + place;
      };
      let best = null;
      let problem = null;
      const consider = (attempt) => {
        const result = draw(template, attempt);
        if (!result.question) {
          problem = problem || result.problem;
          return false;
        }
        const score = cost(result.question);
        if (!best || score < best.score) best = { question: result.question, attempt, score };
        return score === 0;
      };
      const pin = Number(pinned[template.id]);
      const pinnedGood = Number.isInteger(pin) && pin >= 0 && pin < MAX_ATTEMPTS && draw(template, pin).question;
      if (pinnedGood) best = { question: pinnedGood, attempt: pin, score: 0 };
      else {
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
          if (consider(attempt)) break;
        }
      }
      if (!best) {
        skipped.push({ templateId: template.id, reason: problem || "unverified" });
        return;
      }
      if (best.question.scene) scenes.add(best.question.scene);
      attempts[template.id] = best.attempt;
      byId.set(template.id, best.question);
    });
    const questions = templates
      .slice()
      .sort((left, right) => hash(`${seed}|order|${left.id}`) - hash(`${seed}|order|${right.id}`))
      .filter((template) => byId.has(template.id))
      .map((template) => byId.get(template.id));
    Object.defineProperty(questions, "skipped", { value: skipped, enumerable: false });
    Object.defineProperty(questions, "attempts", { value: attempts, enumerable: false });
    return questions;
  }

  // A run's code: its template mask and its seed, both in base 36, and, when
  // `attempts` ({ [templateId]: attempt }, from drawQuestions) is given with
  // `templates` and any attempt is not 0, one base-36 digit per template in
  // bit order ("mask-seed-attempts"). Passing parseRunCode's attempts back to
  // drawQuestions rebuilds a run exactly even when it steered around seen
  // scenes; a two-part code rebuilds exactly any run drawn without them.
  function runCode(mask, seed, attempts, templates) {
    const base = `${Mask.toCode(mask)}-${String(seed)}`;
    if (!attempts || !templates) return base;
    const digits = templatesForMask(templates, mask)
      .sort((left, right) => left.bit - right.bit)
      .map((template) => {
        const attempt = Number(attempts[template.id]) || 0;
        return attempt >= 0 && attempt < MAX_ATTEMPTS ? attempt.toString(36) : "0";
      })
      .join("");
    return /[^0]/.test(digits) ? `${base}-${digits}` : base;
  }

  // { mask, seed } from a run code, plus `attempts` when the code has them;
  // with `templates`, attempts is keyed by template id, else it is the list
  // of digits in bit order.
  function parseRunCode(code, templates) {
    const match = /^([0-9a-z]+)-([0-9a-z]+)(?:-([0-9a-z]+))?$/i.exec(String(code || "").trim());
    if (!match) throw new SyntaxError(`Invalid run code "${code}"`);
    const result = { mask: Mask.fromCode(match[1]), seed: match[2].toLowerCase() };
    if (match[3]) {
      const digits = [...match[3].toLowerCase()].map((digit) => parseInt(digit, 36));
      if (templates) {
        const ordered = templatesForMask(templates, result.mask).sort((left, right) => left.bit - right.bit);
        if (ordered.length !== digits.length) throw new SyntaxError(`Run code "${code}" does not match its templates`);
        result.attempts = Object.fromEntries(ordered.map((template, index) => [template.id, digits[index]]));
      } else result.attempts = digits;
    }
    return result;
  }

  // Rebuilds the exact templates of a run from its mask.
  function templatesForMask(templates, mask) {
    return templates.filter((template) => Mask.has(mask, template.bit));
  }

  return {
    MAX_ATTEMPTS,
    apportion,
    available,
    catalogTemplates,
    chooseTemplates,
    drawQuestions,
    parseRunCode,
    runCode,
    templatesForMask,
  };
});
