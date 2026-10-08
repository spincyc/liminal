(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../../math.js'));
  else root.LiminalGrade8Topic1 = factory(root.LiminalCourseMath);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (M) {
  'use strict';

  // Original course exercises. Check data describes inputs, never a second answer key.
  const templates = [];
  const signed = n => String(n).replace(/-/g, '−');
  const fraction = (n, d) => signed(M.fraction(n, d));
  const pow = (b, e) => `${b}^${signed(e)}`;
  const variable = r => r.pick(['a', 'b', 'm', 'n', 'p', 't']);
  function add(id, lesson, skill, generate) {
    templates.push({ id: `g8-t1-${id}`, lessonId: `1-${lesson}`, skill, generate(rng) {
      const question = generate(rng);
      question.practiceKey = practiceKey(question.check);
      return question;
    } });
  }
  function item(prompt, answer, steps, check, workLines) {
    return { prompt, answer, steps, workLines: workLines || 4, check };
  }
  // Keys describe the mathematical task and its inputs, not the answer or its
  // presentation. Keep complete signatures rather than risking hash collisions.
  function practiceKey(c) {
    let task = c.kind, inputs;
    switch (c.kind) {
      case 'fraction': task = 'decimal-to-fraction'; inputs = [fraction(c.n, c.d)]; break;
      case 'decimal-fraction': inputs = [fraction(c.n, c.d)]; break;
      case 'classify-roots': inputs = c.candidates.map(v => v.text).sort(); break;
      case 'number-sets': inputs = [c.text]; break;
      case 'infinite-pattern': inputs = [c.digit, c.first, c.whole]; break;
      case 'bounds': case 'cube-equation': inputs = [c.n]; break;
      case 'square-equation': inputs = [c.coefficient, c.offset, c.right]; break;
      case 'order': inputs = c.values.map(v => v.text).sort(); break;
      case 'negative-comparison': inputs = [c.n, c.decimalNumerator]; break;
      case 'roots': inputs = [c.a, c.b]; break;
      case 'square-cube-categories': inputs = c.values.map(v => v.n).sort((a, b) => a - b); break;
      case 'cube-row': inputs = [c.volume, c.count]; break;
      case 'cube-face': inputs = [c.volume]; break;
      case 'exponent': inputs = [c.operation, c.operation === 'product' ? c.exponents.slice().sort((a, b) => a - b) : c.exponents]; break;
      case 'power-product': inputs = [[c.a, c.b].sort((a, b) => a - b), c.exponent]; break;
      case 'reciprocal': inputs = [c.coefficient, c.exponent]; break;
      case 'reciprocal-product': inputs = [c.a, c.b]; break;
      case 'evaluate-powers': inputs = [c.x, c.coefficient, c.constant]; break; // Every allowed y gives y^0 = 1.
      case 'estimate': case 'scientific': case 'ordinary': inputs = [decimal(c.n, c.exponent)]; break;
      case 'estimated-ratio': inputs = [decimal(c.nA, c.exponentA), decimal(c.nB, c.exponentB)]; break;
      case 'scientific-operation': {
        const operands = [decimal(c.a, c.e), decimal(c.b, c.f)];
        inputs = [c.operation, c.operation === '*' || c.operation === '+' ? operands.sort() : operands];
        break;
      }
      case 'storage-model': inputs = [c.count, decimal(c.each, c.exponent - 1), decimal(c.small, c.exponent - c.gap)]; break;
      case 'panel-model': inputs = [c.area, c.count]; break;
      default: throw new Error(`Missing practice identity for ${c.kind}`);
    }
    return JSON.stringify(['grade8-topic1-v1', task, inputs]);
  }
  // Shift an integer's decimal point without binary floating-point formatting.
  function decimal(n, exponent) {
    if (n === 0) return '0';
    const sign = n < 0 ? '−' : '';
    const digits = String(Math.abs(n));
    const point = digits.length + exponent;
    let out = point <= 0 ? `0.${'0'.repeat(-point)}${digits}`
      : point >= digits.length ? digits + '0'.repeat(point - digits.length)
        : `${digits.slice(0, point)}.${digits.slice(point)}`;
    if (out.includes('.')) out = out.replace(/0+$/, '').replace(/\.$/, '');
    return sign + out;
  }
  function sci(n, exponent) {
    if (n === 0) return '0';
    const places = String(Math.abs(n)).length - 1;
    return `${decimal(n, -places)} × ${pow(10, exponent + places)}`;
  }
  function repeating(n, d) {
    const sign = n < 0 ? '−' : '';
    n = Math.abs(n);
    const whole = Math.floor(n / d);
    let rem = n % d;
    if (!rem) return sign + whole;
    const seen = new Map(), digits = [];
    while (rem && !seen.has(rem)) {
      seen.set(rem, digits.length);
      rem *= 10;
      digits.push(Math.floor(rem / d));
      rem %= d;
    }
    const start = seen.get(rem);
    return `${sign}${whole}.` + (rem ? `${digits.slice(0, start).join('')}[${digits.slice(start).join('')}]` : digits.join(''));
  }
  function numberLine(min, max, points) {
    return { numberLine: true, xMin: min, xMax: max, yMin: -1, yMax: 1, xStep: 1, yStep: 1,
      xLabel: 'Value', yLabel: '', points: points || [], lines: [] };
  }

  add('repeat-block-fraction', 1, 'Repeating decimals to fractions', r => {
    const whole = r.int(0, 12), block = r.int(1, 98), negative = r.sign();
    const text = `${negative < 0 ? '−' : ''}${whole}.[${String(block).padStart(2, '0')}]`;
    const n = negative * (99 * whole + block);
    return item(`Write ${text} as a fraction in simplest form. Show how subtraction removes the repeating digits.`, fraction(n, 99), [
      `Let x = ${text}. Moving two places gives 100x with the same repeating tail as x.`,
      `Subtract: 100x − x = ${signed(n)}, so 99x = ${signed(n)}.`,
      `Divide by 99 and reduce: x = ${fraction(n, 99)}.`
    ], { kind: 'fraction', n, d: 99, text }, 6);
  });
  add('repeat-after-prefix', 1, 'Repeating decimals with a nonrepeating part', r => {
    const whole = r.int(0, 9), prefix = r.int(0, 9), digit = r.int(1, 8);
    const n = 90 * whole + 9 * prefix + digit;
    const text = `${whole}.${prefix}[${digit}]`;
    return item(`Convert ${text} to a simplified fraction. Explain which two multiples of the decimal you subtract.`, fraction(n, 90), [
      `Let x = ${text}. Both 100x and 10x have the same repeating decimal tail.`,
      `100x − 10x = ${n}, so 90x = ${n}.`,
      `x = ${fraction(n, 90)}.`
    ], { kind: 'fraction', n, d: 90, text }, 6);
  });
  add('fraction-decimal', 1, 'Fractions to terminating or repeating decimals', r => {
    const d = r.pick([6, 8, 9, 11, 12, 15, 20, 22, 24, 25, 30, 33]);
    const n = r.nonzero(-4 * d, 4 * d), text = fraction(n, d), answer = repeating(n, d);
    return item(`Write ${text} as a decimal. Use a bar above any repeating block.`, answer, [
      `Divide the numerator by the denominator, keeping the sign of ${text}.`,
      'A zero remainder ends the decimal. A repeated remainder starts a repeating digit block.',
      `${text} = ${answer}.`
    ], { kind: 'decimal-fraction', n, d }, 5);
  });
  add('terminating-fraction', 1, 'Terminating decimals to fractions', r => {
    const n = r.nonzero(-999, 999), places = r.pick([2, 3]), text = decimal(n, -places);
    return item(`Write ${text} as a fraction in simplest form.`, fraction(n, 10 ** places), [
      `Use place value: ${text} = ${signed(n)}/${10 ** places}.`,
      `Reduce the numerator and denominator by their greatest common factor to get ${fraction(n, 10 ** places)}.`
    ], { kind: 'fraction', n, d: 10 ** places, text }, 3);
  });

  add('root-classification', 2, 'Classifying rational and irrational roots', r => {
    const used = new Set();
    const roots = r.shuffle([true, false, r.pick([true, false])]).map(irrational => {
      let base, n;
      do {
        base = r.int(2, 15);
        n = base * base + (irrational ? r.int(1, 2 * base) : 0);
      } while (used.has(n));
      used.add(n);
      const sign = r.sign(), text = `${sign < 0 ? '−' : ''}√${n}`;
      const reason = irrational
        ? `${base * base} < ${n} < ${(base + 1) ** 2}, so the integer ${n} is not a perfect square. A nonsquare nonnegative integer has an irrational square root, and its negative is also irrational`
        : `${text} = ${signed(sign * base)}, an integer and therefore rational`;
      return { text, irrational, reason };
    });
    const candidates = r.shuffle([...roots,
      { text: `${r.sign() < 0 ? '−' : ''}${r.int(0, 8)}.[${r.int(1, 8)}]`, irrational: false, reason: 'a repeating decimal is rational' },
      { text: fraction(r.sign() * r.int(1, 20), r.int(2, 15)), irrational: false, reason: 'a ratio of integers with a nonzero denominator is rational' }
    ]);
    return item(`Which of these numbers are irrational? Select all that apply and explain each classification: ${candidates.map(v => v.text).join('; ')}.`, candidates.filter(v => v.irrational).map(v => v.text).join(', '), candidates.map(v => `${v.text}: ${v.reason}.`), { kind: 'classify-roots', candidates }, 6);
  });
  add('number-set-membership', 2, 'Natural, whole, integer, rational, and real numbers', r => {
    const category = r.int(0, 4), n = r.int(2, 150), d = r.pick([3, 7, 9]);
    const text = category === 0 ? String(n) : category === 1 ? '0' : category === 2 ? signed(-n)
      : category === 3 ? fraction(d * n + 1, d) : `√${n * n + 1}`;
    const sets = ['natural, whole, integer, rational, real', 'whole, integer, rational, real', 'integer, rational, real', 'rational, real', 'real'];
    const reasons = ['A positive counting number belongs to all five sets.', 'Zero is whole but is not natural under the convention in this question.', 'A negative integer is rational because it can be written over 1.', 'This noninteger fraction is rational; it is not an integer.', 'The radicand lies strictly between consecutive perfect squares, so it is a nonnegative integer that is not a perfect square. The square root of such an integer is irrational and real.'];
    return item(`List every set containing ${text}: natural, whole, integer, rational, real. Here natural numbers begin at 1.`, sets[category], [reasons[category], 'The sets nest as natural ⊂ whole ⊂ integer ⊂ rational ⊂ real. Irrational numbers are also real.'], { kind: 'number-sets', category, text }, 3);
  });
  add('infinite-decimal-classification', 2, 'Recognizing an explicitly nonrepeating decimal', r => {
    const digit = r.int(1, 9), first = r.int(1, 6), whole = r.int(0, 30);
    const rationalLabel = r.pick(['A', 'B']), irrationalLabel = rationalLabel === 'A' ? 'B' : 'A';
    const descriptions = {
      [rationalLabel]: `repeats the block ${digit}${'0'.repeat(first)} forever`,
      [irrationalLabel]: `has digit ${digit}, then ${first} zero${first === 1 ? "" : "s"}, then digit ${digit}, then ${first + 1} zeros, and continues forever with one more zero in each successive gap`
    };
    const answer = rationalLabel === 'A' ? 'A is rational; B is irrational.' : 'A is irrational; B is rational.';
    return item(`Two decimals have whole-number part ${whole}. After the decimal point, Decimal A ${descriptions.A}. Decimal B ${descriptions.B}. Classify A and B as rational or irrational and explain.`, answer, [
      `${rationalLabel} has a fixed repeating block, so it can be expressed as a fraction of integers.`,
      `${irrationalLabel} never terminates: another ${digit} always follows each gap. Its zero gaps grow without bound, so no finite digit block repeats forever.`,
      'A nonterminating, nonrepeating decimal is irrational.'
    ], { kind: 'infinite-pattern', digit, first, whole, rationalLabel }, 5);
  });

  add('root-bounds', 3, 'Bounding square roots', r => {
    const lower = r.int(2, 30), n = r.int(lower * lower + 1, (lower + 1) ** 2 - 1);
    return item(`Fill the blanks with consecutive whole numbers: ___ < √${n} < ___. Justify your bounds with squares.`, `${lower} < √${n} < ${lower + 1}`, [
      `${lower}^2 = ${lower * lower} and ${lower + 1}^2 = ${(lower + 1) ** 2}.`,
      `${lower * lower} < ${n} < ${(lower + 1) ** 2}, so ${lower} < √${n} < ${lower + 1}.`
    ], { kind: 'bounds', n, lower }, 3);
  });
  add('order-and-plot', 3, 'Ordering and plotting real numbers', r => {
    const base = r.int(3, 20), tenth = r.pick([2, 6]);
    // Keep the plotted marks visibly distinct on a printed number line.
    const rationalValues = [base + 1 / 3, base + tenth / 10, base + 3 / 4];
    const radicands = Array.from({ length: 2 * base }, (_, i) => base * base + i + 1)
      .filter(n => rationalValues.every(value => Math.abs(Math.sqrt(n) - value) >= 0.12));
    const radicand = r.pick(radicands);
    const values = r.shuffle([
      { text: `√${radicand}`, value: Math.sqrt(radicand) },
      { text: `${base}.[3]`, value: base + 1 / 3 },
      { text: `${base}.${tenth}`, value: base + tenth / 10 },
      { text: `${base} 3/4`, value: base + 3 / 4 }
    ]);
    const ordered = values.slice().sort((a, b) => a.value - b.value);
    const q = item(`Order these numbers from least to greatest, then label them approximately on the number line: ${values.map(v => v.text).join('; ')}. A space in ${base} 3/4 denotes a mixed number.`, ordered.map(v => v.text).join(' < '), [
      `Compare ${base}.[3] = ${base} + 1/3, ${base}.${tenth}, and ${base} 3/4 = ${base}.75.`,
      `√${radicand} ≈ ${Math.sqrt(radicand).toFixed(3)}. This approximation is only for placing the point.`,
      `From left to right: ${ordered.map(v => v.text).join(', ')}.`
    ], { kind: 'order', values }, 5);
    q.graph = numberLine(base - 1, base + 2);
    q.answerGraph = numberLine(base - 1, base + 2, ordered.map(v => ({ x: v.value, y: 0, label: v.text })));
    return q;
  });
  add('negative-root-comparison', 3, 'Comparing negative real numbers', r => {
    const base = r.int(2, 18), n = base * base + r.int(1, 2 * base), tenth = r.int(1, 9);
    const decimalText = decimal(-(base * 10 + tenth), -1);
    const comparison = n * 100 > (base * 10 + tenth) ** 2 ? '<' : '>';
    return item(`Insert < or >: −√${n} ___ ${decimalText}. Explain how the negative signs affect the comparison.`, `−√${n} ${comparison} ${decimalText}`, [
      `Compare positive magnitudes by squaring: ${n} and (${decimalText.slice(1)})^2 = ${decimal((base * 10 + tenth) ** 2, -2)}.`,
      'Negating two unequal numbers reverses their order.',
      `Therefore −√${n} ${comparison} ${decimalText}.`
    ], { kind: 'negative-comparison', n, decimalNumerator: base * 10 + tenth }, 4);
  });

  add('evaluate-roots', 4, 'Evaluating square and cube roots', r => {
    const a = r.int(2, 25), b = r.nonzero(-12, 12);
    return item(`Evaluate √${a * a} and ³√(${signed(b ** 3)}). Explain why the square-root answer is nonnegative.`, `${a}; ${signed(b)}`, [
      `${a} × ${a} = ${a * a}, and √ denotes the principal, nonnegative square root.`,
      `(${signed(b)})^3 = ${signed(b ** 3)}, so ³√(${signed(b ** 3)}) = ${signed(b)}.`
    ], { kind: 'roots', a: a * a, b: b ** 3 }, 3);
  });
  add('square-cube-categories', 4, 'Recognizing perfect squares and perfect cubes', r => {
    const pools = {
      'perfect square only': Array.from({ length: 24 }, (_, i) => (i + 2) ** 2).filter(n => Math.round(Math.cbrt(n)) ** 3 !== n),
      'perfect cube only': Array.from({ length: 11 }, (_, i) => (i + 2) ** 3).filter(n => !Number.isInteger(Math.sqrt(n))),
      both: [0, 1, 64, 729],
      neither: Array.from({ length: 149 }, (_, i) => i + 2).filter(n => !Number.isInteger(Math.sqrt(n)) && Math.round(Math.cbrt(n)) ** 3 !== n)
    };
    const used = new Set(), chosen = [];
    for (let i = 0; i < 4; i++) {
      const category = r.pick(Object.keys(pools).filter(name => pools[name].some(n => !used.has(n))));
      const n = r.pick(pools[category].filter(value => !used.has(value)));
      used.add(n);
      chosen.push({ n, category });
    }
    const values = r.shuffle(chosen);
    return item(`Classify each number as a perfect square only, a perfect cube only, both, or neither: ${values.map(v => v.n).join(', ')}.`, values.map(v => `${v.n}: ${v.category}`).join('; '), [
      'A perfect square is the square of an integer; a perfect cube is the cube of an integer.',
      ...values.map(({ n, category }) => {
        const square = Math.floor(Math.sqrt(n)), cube = Math.round(Math.cbrt(n));
        if (category === 'both') return `${n} = ${square}^2 = ${cube}^3, so it is both.`;
        if (category === 'perfect square only') return `${n} = ${square}^2, but it has no integer cube root.`;
        if (category === 'perfect cube only') return `${n} = ${cube}^3, but it has no integer square root.`;
        const lowerCube = Math.floor(Math.cbrt(n));
        return `${square}^2 < ${n} < ${square + 1}^2 and ${lowerCube}^3 < ${n} < ${lowerCube + 1}^3, so it is neither.`;
      })
    ], { kind: 'square-cube-categories', values }, 5);
  });
  add('cube-edge-context', 4, 'Finding a cube edge from its volume', r => {
    const edge = r.int(2, 12), count = r.int(2, 20);
    return item(`A display uses ${count} identical solid cubes in a straight row, touching face to face. Each cube has volume ${edge ** 3} cm^3. How long is the row?`, `${edge * count} cm`, [
      `For one cube, edge^3 = ${edge ** 3}, so edge = ³√${edge ** 3} = ${edge} cm.`,
      `The row has ${count} edges end to end: ${count} × ${edge} = ${count * edge} cm.`
    ], { kind: 'cube-row', volume: edge ** 3, count }, 4);
  });

  add('square-equation', 5, 'Solving squared-variable equations', r => {
    const kind = r.pick(['positive', 'positive', 'zero', 'negative']), root = r.int(2, 25), perfect = r.pick([true, false]);
    const n = kind === 'zero' ? 0 : kind === 'negative' ? -r.int(1, 100) : perfect ? root * root : root * root + r.int(1, 2 * root);
    const multistep = r.pick([true, false]), coefficient = multistep ? r.int(2, 5) : 1, offset = multistep ? r.nonzero(-20, 20) : 0, right = coefficient * n + offset;
    const left = `${coefficient === 1 ? '' : coefficient}x^2${offset === 0 ? '' : offset < 0 ? ` − ${-offset}` : ` + ${offset}`}`;
    const exact = perfect ? String(root) : `√${n}`;
    const answer = n < 0 ? 'No real solutions.' : n === 0 ? 'x = 0' : `x = −${exact} or x = ${exact}`;
    const steps = multistep ? [
      `Subtract ${signed(offset)} from both sides: ${coefficient}x^2 = ${signed(right - offset)}.`,
      `Divide by ${coefficient}: x^2 = ${signed(n)}.`
    ] : [];
    steps.push(...(n < 0 ? ['The square of a real number is nonnegative.', `It cannot equal ${signed(n)}, so there are no real solutions.`]
      : n === 0 ? ['Only zero has a square of zero.', 'Thus x = 0 is the one real solution.']
        : [`Taking principal square roots gives |x| = √${n}.`, `Both a positive number and its negative have square ${n}.`, `Thus ${answer}.`]));
    return item(`Find all real solutions of ${left} = ${signed(right)}. Give exact values; do not round.`, answer, steps,
      { kind: 'square-equation', n, perfect, coefficient, offset, right }, multistep ? 6 : 4);
  });
  add('cube-equation', 5, 'Solving cubed-variable equations', r => {
    const root = r.int(2, 12), sign = r.sign(), perfect = r.pick([true, false]);
    const n = sign * (perfect ? root ** 3 : root ** 3 + r.int(1, 3 * root));
    const answer = perfect ? signed(sign * root) : `${sign < 0 ? '−' : ''}³√${Math.abs(n)}`;
    return item(`Find the real solution of y^3 = ${signed(n)}. Give an exact integer or radical.`, `y = ${answer}`, [
      `Take the cube root of both sides: y = ³√(${signed(n)}).`,
      'Cubing preserves sign and is one-to-one on the real numbers, so there is one real solution.',
      `y = ${answer}.`
    ], { kind: 'cube-equation', n, perfect }, 4);
  });
  add('cube-face-dimensions', 5, 'Interpreting positive lengths from roots', r => {
    const edge = r.int(2, 12), radical = r.pick([true, false]);
    const volume = radical ? edge ** 3 + r.int(1, 3 * edge) : edge ** 3;
    const length = radical ? `³√${volume}` : String(edge);
    return item(`A solid cube has volume ${volume} cm^3. Give the two dimensions of one square face, in centimeters. Give exact values.`, `${length} cm by ${length} cm`, [
      `If s is the edge length, s^3 = ${volume}.`,
      `A length is positive, so s = ${length} cm.`,
      `Every face is a square with dimensions ${length} cm by ${length} cm.`
    ], { kind: 'cube-face', volume, radical }, 4);
  });

  add('product-of-powers', 6, 'Multiplying powers with the same base', r => {
    const v = variable(r), a = r.nonzero(-9, 9), b = r.nonzero(-9, 9), c = r.int(2, 6);
    return item(`Write ${pow(v, a)} × ${pow(v, b)} × ${pow(v, c)} as one power of ${v}. Assume ${v} ≠ 0. An exponent of 0 or a negative exponent may remain.`, pow(v, a + b + c), [
      'When multiplying powers of the same base, add the exponents.',
      `${signed(a)} + (${signed(b)}) + ${c} = ${signed(a + b + c)}, so the expression is ${pow(v, a + b + c)}.`
    ], { kind: 'exponent', operation: 'product', base: v, exponents: [a, b, c] }, 3);
  });
  add('power-of-power', 6, 'Raising a power to a power', r => {
    const v = variable(r), a = r.nonzero(-9, 9), b = r.nonzero(-7, 7);
    return item(`Write (${pow(v, a)})^${signed(b)} as one power of ${v}. Assume ${v} ≠ 0. A negative exponent may remain.`, pow(v, a * b), [
      'A power raised to a power multiplies the exponents.',
      `${signed(a)} × (${signed(b)}) = ${signed(a * b)}, giving ${pow(v, a * b)}.`
    ], { kind: 'exponent', operation: 'power', base: v, exponents: [a, b] }, 3);
  });
  add('power-of-product', 6, 'Combining equal powers of different bases', r => {
    const a = r.int(2, 14), b = r.int(2, 14), exponent = r.nonzero(-7, 7);
    return item(`Write ${pow(a, exponent)} × ${pow(b, exponent)} as a single power whose base is an integer. Do not evaluate the power.`, pow(a * b, exponent), [
      'Equal exponents allow a^n × b^n = (ab)^n; both bases here are nonzero.',
      `Multiply the bases: ${a} × ${b} = ${a * b}. Keep the exponent ${signed(exponent)}.`
    ], { kind: 'power-product', a, b, exponent }, 3);
  });
  add('quotient-of-powers', 6, 'Dividing powers with the same base', r => {
    const v = variable(r), a = r.nonzero(-12, 12), b = r.nonzero(-12, 12);
    return item(`Write (${pow(v, a)})/(${pow(v, b)}) as one power of ${v}. Assume ${v} ≠ 0. An exponent of 0 or a negative exponent may remain.`, pow(v, a - b), [
      'For a quotient of powers with the same nonzero base, subtract the denominator exponent.',
      `${signed(a)} − (${signed(b)}) = ${signed(a - b)}, so the quotient is ${pow(v, a - b)}.`
    ], { kind: 'exponent', operation: 'quotient', base: v, exponents: [a, b] }, 3);
  });

  add('negative-power-reciprocal', 7, 'Rewriting negative exponents', r => {
    const v = variable(r), coefficient = r.nonzero(-12, 12), exponent = r.int(2, 9);
    return item(`Rewrite (${signed(coefficient)}) × ${pow(v, -exponent)} using only positive exponents. Assume ${v} ≠ 0.`, `${signed(coefficient)}/(${pow(v, exponent)})`, [
      `${pow(v, -exponent)} = 1/(${pow(v, exponent)}).`,
      `The coefficient stays in the numerator: ${signed(coefficient)}/(${pow(v, exponent)}).`
    ], { kind: 'reciprocal', base: v, coefficient, exponent }, 3);
  });
  add('negative-power-denominator', 7, 'Simplifying a reciprocal of a negative power', r => {
    const v = variable(r), a = r.int(2, 12), b = r.int(2, 12);
    return item(`Rewrite (1/(${pow(v, -a)})) × ${pow(v, -b)} as one power, then give a form with no negative exponents. Assume ${v} ≠ 0.`, `${pow(v, a - b)}; ${a === b ? '1' : a > b ? pow(v, a - b) : `1/(${pow(v, b - a)})`}`, [
      `The reciprocal of ${pow(v, -a)} is ${pow(v, a)}.`,
      `Multiply: ${pow(v, a)} × ${pow(v, -b)} = ${pow(v, a - b)}.`,
      a === b ? 'A nonzero base to the zero power equals 1.' : a < b ? 'A negative exponent moves the power to the denominator.' : 'The final exponent is already positive.'
    ], { kind: 'reciprocal-product', base: v, a, b }, 4);
  });
  add('evaluate-zero-negative-powers', 7, 'Evaluating expressions with zero and negative exponents', r => {
    const x = r.nonzero(-7, 7), y = r.nonzero(-9, 9), coefficient = r.nonzero(-12, 12), constant = r.int(2, 15);
    const n = coefficient + constant * x * x;
    return item(`Evaluate (${signed(coefficient)})x^−2 + ${constant}y^0 for x = ${signed(x)} and y = ${signed(y)}. Give an exact simplified fraction or integer.`, fraction(n, x * x), [
      `Because y ≠ 0, y^0 = 1. Because x ≠ 0, x^−2 = 1/x^2 = 1/${x * x}.`,
      `The expression is ${signed(coefficient)}/${x * x} + ${constant} = ${signed(n)}/${x * x}.`,
      `In simplest form: ${fraction(n, x * x)}.`
    ], { kind: 'evaluate-powers', x, y, coefficient, constant }, 5);
  });

  add('estimate-large', 8, 'Estimating large numbers with powers of ten', r => {
    const n = r.int(101, 999), exponent = r.int(3, 8), digit = Math.floor((n + 50) / 100);
    const roundedDigit = digit === 10 ? 1 : digit, roundedExponent = exponent + 2 + (digit === 10 ? 1 : 0);
    return item(`A simulated archive contains ${decimal(n, exponent)} records. Round this number to one significant digit, writing the result as a single nonzero digit times a power of 10.`, `${roundedDigit} × ${pow(10, roundedExponent)}`, [
      `The first two significant digits of ${decimal(n, exponent)} determine the rounding.`,
      `Rounding to one significant digit gives ${roundedDigit} × ${pow(10, roundedExponent)} records.`
    ], { kind: 'estimate', n, exponent }, 3);
  });
  add('estimate-small', 8, 'Estimating small numbers with powers of ten', r => {
    const n = r.int(101, 999), exponent = -r.int(5, 10), digit = Math.floor((n + 50) / 100);
    const roundedDigit = digit === 10 ? 1 : digit, roundedExponent = exponent + 2 + (digit === 10 ? 1 : 0);
    return item(`In a model, a thin coating is ${decimal(n, exponent)} m thick. Round its thickness to one significant digit and write the estimate as a digit times a power of 10, with units.`, `${roundedDigit} × ${pow(10, roundedExponent)} m`, [
      `The first nonzero digit sets the place value; the next digit determines whether to round up.`,
      `The estimated thickness is ${roundedDigit} × ${pow(10, roundedExponent)} m.`
    ], { kind: 'estimate', n, exponent, units: 'm' }, 3);
  });
  add('estimated-ratio', 8, 'Comparing quantities using one-digit estimates', r => {
    const a = r.pick([2, 4, 6, 8]), b = r.pick([1, 2]), e = r.int(5, 8), gap = r.int(1, 3);
    const nA = 100 * a + r.int(-35, 35), nB = 100 * b + r.int(b === 1 ? 0 : -35, 35);
    const ratio = (a / b) * 10 ** gap;
    return item(`A model tracks ${decimal(nA, e - 2)} red signals and ${decimal(nB, e - gap - 2)} blue signals. Round each count to one significant digit, then estimate how many times as large the red count is as the blue count.`, `About ${ratio} times as large.`, [
      `Red ≈ ${a} × ${pow(10, e)}; blue ≈ ${b} × ${pow(10, e - gap)}.`,
      `Divide the estimates: (${a}/${b}) × ${pow(10, gap)} = ${ratio}.`,
      'This is an estimated ratio, not the quotient of the original exact counts.'
    ], { kind: 'estimated-ratio', nA, nB, exponentA: e - 2, exponentB: e - gap - 2 }, 5);
  });

  add('large-scientific-notation', 9, 'Writing large numbers in scientific notation', r => {
    const n = 100 * r.int(1, 9) + r.int(1, 9), exponent = r.int(3, 10);
    return item(`Write ${decimal(n, exponent)} in normalized scientific notation. Preserve every nonzero digit.`, sci(n, exponent), [
      `Place the decimal point after the first nonzero digit: ${decimal(n, -2)}.`,
      `The decimal point moved ${exponent + 2} places left, so ${decimal(n, exponent)} = ${sci(n, exponent)}.`
    ], { kind: 'scientific', n, exponent }, 3);
  });
  add('small-scientific-notation', 9, 'Writing small measurements in scientific notation', r => {
    const n = r.int(101, 999), exponent = -r.int(5, 11);
    return item(`A model stipulates a particle width of ${decimal(n, exponent)} mm. Express this width in normalized scientific notation without rounding.`, `${sci(n, exponent)} mm`, [
      `Move the decimal point to make the coefficient ${decimal(n, -2)}, which is at least 1 and less than 10.`,
      `The result is ${sci(n, exponent)} mm. A negative exponent represents a small positive quantity.`
    ], { kind: 'scientific', n, exponent, units: 'mm' }, 3);
  });
  add('scientific-to-decimal', 9, 'Converting scientific notation to ordinary notation', r => {
    const n = r.int(101, 999), exponent = r.nonzero(-9, 9);
    return item(`Write ${decimal(n, -2)} × ${pow(10, exponent)} in ordinary decimal notation. Do not round.`, decimal(n, exponent - 2), [
      `Multiplying by ${pow(10, exponent)} moves the decimal point ${Math.abs(exponent)} ${Math.abs(exponent) === 1 ? 'place' : 'places'} ${exponent < 0 ? 'left' : 'right'}.`,
      `Insert zeros as needed: ${decimal(n, exponent - 2)}.`
    ], { kind: 'ordinary', n, exponent: exponent - 2 }, 3);
  });

  add('scientific-product', 10, 'Multiplying scientific-notation numbers', r => {
    const a = r.int(21, 99), b = r.int(21, 99), e = r.int(-7, 8), f = r.int(-7, 8);
    const left = `${decimal(a, -1)} × ${pow(10, e)}`, right = `${decimal(b, -1)} × ${pow(10, f)}`;
    return item(`Multiply (${left})(${right}). Write the exact result in normalized scientific notation.`, sci(a * b, e + f - 2), [
      `Multiply coefficients: ${decimal(a, -1)} × ${decimal(b, -1)} = ${decimal(a * b, -2)}.`,
      `Add exponents: ${signed(e)} + (${signed(f)}) = ${signed(e + f)}.`,
      `Adjust the coefficient and exponent together to get ${sci(a * b, e + f - 2)}.`
    ], { kind: 'scientific-operation', operation: '*', a, b, e: e - 1, f: f - 1 }, 5);
  });
  add('scientific-quotient', 10, 'Dividing scientific-notation numbers', r => {
    const a = r.int(11, 49), b = r.pick([2, 4, 5, 8]), e = r.int(-7, 8), f = r.int(-7, 8);
    // The denominator divides 1000, making the quotient an exact terminating decimal.
    const numerator = a * (1000 / b);
    return item(`Divide (${decimal(a, -1)} × ${pow(10, e)}) by (${b} × ${pow(10, f)}). Give normalized scientific notation without rounding.`, sci(numerator, e - f - 4), [
      `Divide coefficients: ${decimal(a, -1)}/${b} = ${decimal(numerator, -4)}.`,
      `Subtract exponents: ${signed(e)} − (${signed(f)}) = ${signed(e - f)}.`,
      `Normalize the coefficient: ${sci(numerator, e - f - 4)}.`
    ], { kind: 'scientific-operation', operation: '/', a, b, e: e - 1, f }, 5);
  });
  add('scientific-sum', 10, 'Adding numbers with different powers of ten', r => {
    const a = r.int(11, 99), b = r.int(11, 99), e = r.int(-7, 8), gap = r.int(1, 3);
    const total = a * 10 ** gap + b;
    return item(`Add (${decimal(a, -1)} × ${pow(10, e)}) + (${decimal(b, -1)} × ${pow(10, e - gap)}). Give the exact result in normalized scientific notation.`, sci(total, e - gap - 1), [
      `Use the common power ${pow(10, e - gap)}: the first coefficient becomes ${decimal(a, gap - 1)}.`,
      `Add coefficients: ${decimal(a, gap - 1)} + ${decimal(b, -1)} = ${decimal(total, -1)}.`,
      `Normalize: ${sci(total, e - gap - 1)}. Exponents are not added when adding the original quantities.`
    ], { kind: 'scientific-operation', operation: '+', a, b, e: e - 1, f: e - gap - 1 }, 5);
  });
  add('scientific-difference', 10, 'Subtracting numbers with different powers of ten', r => {
    const a = r.int(11, 99), b = r.int(11, 99), e = r.int(-7, 8), gap = r.int(1, 2);
    const difference = a * 10 ** gap - b;
    return item(`Subtract (${decimal(a, -1)} × ${pow(10, e)}) − (${decimal(b, -1)} × ${pow(10, e - gap)}). Give the exact result in normalized scientific notation.`, sci(difference, e - gap - 1), [
      `First express both terms using ${pow(10, e - gap)}. The first coefficient becomes ${decimal(a, gap - 1)}.`,
      `Subtract coefficients: ${decimal(a, gap - 1)} − ${decimal(b, -1)} = ${decimal(difference, -1)}.`,
      `Keep the common power of ten, then normalize to ${sci(difference, e - gap - 1)}.`
    ], { kind: 'scientific-operation', operation: '-', a, b, e: e - 1, f: e - gap - 1 }, 5);
  });

  add('model-storage-comparison', 11, 'Modeling a multiplicative comparison', r => {
    const each = r.int(12, 48), count = r.int(3, 18), small = r.pick([2, 4, 5, 8]), exponent = r.int(5, 9), gap = r.int(1, 3);
    const total = each * count;
    const times = fraction(total * 10 ** gap, 10 * small);
    return item(`A fictional monitoring project stores ${count} files, each containing ${decimal(each, -1)} × ${pow(10, exponent)} bytes. A second project stores ${small} × ${pow(10, exponent - gap)} bytes in total. Find the first project's total in scientific notation, then determine how many times as large it is as the second total.`, `${sci(total, exponent - 1)} bytes; ${times} times as large.`, [
      `Multiply file size by file count: ${count} × (${decimal(each, -1)} × ${pow(10, exponent)}) = ${sci(total, exponent - 1)} bytes.`,
      `Compare totals by division: (${decimal(total, -1)}/${small}) × ${pow(10, gap)}.`,
      `The first total is ${times} times as large as the second.`
    ], { kind: 'storage-model', each, count, small, exponent, gap }, 7);
  });
  add('model-square-covering', 11, 'Combining roots, area, and scientific notation', r => {
    const side = r.int(12, 45), count = r.int(3, 15), unit = r.pick(['cm', 'mm']);
    const area = side * side, totalArea = area * count;
    return item(`An art model uses ${count} separate square panels. Each panel has area ${area} ${unit}^2. A strip goes once around the outside of each panel. Find the total strip length, then write the combined panel area in scientific notation. Ignore strip thickness.`, `${4 * side * count} ${unit}; ${sci(totalArea, 0)} ${unit}^2`, [
      `A panel's side is the positive length √${area} = ${side} ${unit}.`,
      `Each perimeter is 4 × ${side} = ${4 * side} ${unit}; all ${count} need ${4 * side * count} ${unit} of strip.`,
      `Combined area is ${count} × ${area} = ${totalArea} ${unit}^2 = ${sci(totalArea, 0)} ${unit}^2.`
    ], { kind: 'panel-model', area, count, unit }, 7);
  });

  return templates;
}));
