# ACT Mathematics — Algebra

**Catalog domain:** Algebra
**Skills:** Expressions and equations · Polynomial and rational expressions
**17-20% of the scored questions** — 7-8 of the 41

---

## Linear equations and inequalities

### Solving

1. Distribute
2. Combine like terms
3. Variables one side, constants the other
4. Divide

**Fractions:** multiply every term by the LCD first.

**Inequalities:** identical procedure, with one rule —

> **Multiplying or dividing by a negative flips the sign.**

Circle any negative coefficient before dividing. This is the most-missed
mechanical rule in ACT algebra.

**Compound inequalities:** `−5 < 3x + 1 ≤ 10` — do the same operation to all
three parts.

### Lines

```
Slope:           m = (y₂ − y₁)/(x₂ − x₁)
Slope-intercept: y = mx + b
Point-slope:     y − y₁ = m(x − x₁)
Standard:        Ax + By = C
```

| | |
| --- | --- |
| Parallel | `m₁ = m₂` |
| Perpendicular | `m₁ · m₂ = −1` when both slopes are defined; horizontal and vertical lines are also perpendicular |
| Horizontal | `m = 0`, `y = c` |
| Vertical | undefined, `x = c` |

```
Distance:  d = √[(x₂−x₁)² + (y₂−y₁)²]
Midpoint:  ((x₁+x₂)/2, (y₁+y₂)/2)
```

**Midpoint questions run both directions.** "Given one endpoint and the
midpoint, find the other endpoint" is common — solve `(x₁+x₂)/2 = mₓ` for `x₂`.

> **Worked example: read a scaled graph.** A line models total cost `C`
> in dollars after `h` hours. Its labeled points are `(0, 18)` and `(3, 42)`.
> Each horizontal grid interval represents 1 hour; each vertical interval
> represents 6 dollars. Find the hourly rate and starting charge.
>
> Slope is `(42 − 18)/(3 − 0) = 8 dollars per hour`. The starting charge
> is the y-intercept, 18 dollars. A rise of four squares over three squares
> is not a rate of `4/3 dollars per hour`: the vertical squares mean 6 dollars
> each. The model is `C = 8h + 18`.

**Intercept versus slope:** an intercept is a value when the other variable
is zero. A slope is a change in output per input unit. To find an x-intercept,
set `y = 0`; to find a y-intercept, set `x = 0`.

### Graphing inequality regions

Draw the boundary equation first. Use a solid line for `≤` or `≥`, a dashed
line for `<` or `>`. Test a point off the boundary to determine which side
works. A system uses the overlap, so a solution must satisfy every condition.

> **Worked example.** Is `(2, 1)` in the solution region of
> `y ≥ 2x − 3` and `x + y < 5`? What about `(3, 2)`?
>
> For `(2, 1)`, `1 ≥ 1` and `3 < 5` are both true. It lies on the
> included solid boundary of the first inequality and below the dashed
> boundary `y = 5 − x` of the second. It is included.
> For `(3, 2)`, `2 ≥ 3` is false, and `5 < 5` is also false. It is excluded.

**When the shortcut fails:** "shade above for `>`" works only after isolating
`y`. In `−2y > 4x − 6`, division by `−2` gives `y < −2x + 3`, so shade below.
For `x > 2`, shade right of the vertical boundary. If the origin lies on a
boundary, use a different test point; equality cannot distinguish its sides.

An intersection of boundaries is not automatically a greatest or least value.
Check whether the region extends indefinitely in the requested direction and
whether the boundary point is included. Counts may add whole-number and
nonnegative restrictions that the drawn half-planes alone do not show.

### Systems

**Substitution** when a variable is isolated. **Elimination** when coefficients
align.

**Three cases for two nonvertical lines:**

| Case | Condition |
| --- | --- |
| One solution | Different slopes |
| No solution | Same slope, different intercept |
| Infinitely many | Identical equations |

When variables cancel and you get a **false** statement → no solution. A **true**
statement → infinitely many.

**Look for the shortcut.** If the question asks for `x + y` rather than `x` and
`y` separately, adding or subtracting the equations often produces it directly.

---

## Polynomials

### Operations

**Multiplying:** distribute every term. For binomials, FOIL.

**Special products** — memorize:
```
(a + b)(a − b) = a² − b²
(a + b)² = a² + 2ab + b²
(a − b)² = a² − 2ab + b²
```

**Common error:** `(a + b)² ≠ a² + b²`. The middle term is real.

### Factoring

| Pattern | Factored |
| --- | --- |
| Common factor | `6x² + 9x = 3x(2x + 3)` |
| Difference of squares | `a² − b² = (a+b)(a−b)` |
| Trinomial, `a = 1` | `x² + bx + c` → find two numbers multiplying to `c`, summing to `b` |
| Trinomial, `a ≠ 1` | Factor by grouping, or use the quadratic formula |
| Perfect square | `a² ± 2ab + b² = (a ± b)²` |
| Difference of cubes | `a³ − b³ = (a−b)(a²+ab+b²)` |
| Sum of cubes | `a³ + b³ = (a+b)(a²−ab+b²)` |
| Grouping (4 terms) | `ax + ay + bx + by = (a+b)(x+y)` |

### Quadratics

These formulas apply to `ax² + bx + c = 0` with `a ≠ 0`.

```
Quadratic formula:  x = [−b ± √(b² − 4ac)]/(2a)
Discriminant:       D = b² − 4ac
```

| D | Solutions |
| --- | --- |
| `> 0` | Two real |
| `= 0` | One real |
| `< 0` | No real (two complex) |

```
Sum of roots     = −b/a
Product of roots =  c/a
Vertex x         = −b/(2a)
```

**Vertex form:** `y = a(x − h)² + k`, vertex `(h, k)`.
**Factored form:** `y = a(x − r₁)(x − r₂)`, roots `r₁`, `r₂`.

**Solving methods, by situation:**

| Situation | Method |
| --- | --- |
| Factors cleanly | Factor, set each to zero |
| `x² = k` | For `k > 0`, `x = ±√k`; for `k = 0`, just zero; for `k < 0`, no real solutions |
| Doesn't factor | Quadratic formula |
| Only need the count | Discriminant |
| Answer choices given | **Backsolve** |

**Forgetting `±`** on square roots is a top-five error.

### Polynomial division and theorems

**Remainder theorem:** the remainder of `f(x) ÷ (x − a)` is `f(a)`.

**Factor theorem:** `(x − a)` is a factor ⟺ `f(a) = 0` ⟺ `a` is a root ⟺
`(a, 0)` is on the graph.

Those four statements are the same statement. The ACT tests whether you know
that.

**Degree and roots:** a degree-*n* polynomial has at most *n* real roots and at
most *n − 1* turning points.

---

## Rational expressions

**Simplify:** factor top and bottom, cancel common factors.

**Excluded values:** any `x` making a denominator zero — **including factors you
cancelled**. This is a standard ACT question.

> `(x² − 4)/(x² − x − 2) = [(x+2)(x−2)]/[(x−2)(x+1)] = (x+2)/(x+1)`,
> with `x ≠ 2` **and** `x ≠ −1`.

**Adding and subtracting:** common denominator required.

**Solving rational equations:** multiply through by the LCD, solve, then
**check for extraneous solutions** — any solution that makes an original
denominator zero must be discarded.

**Complex fractions:** multiply numerator and denominator by the LCD of the
inner fractions.

---

## Radical equations

Isolate the radical, square both sides, solve.

**Always check for extraneous solutions.** Squaring can introduce solutions that
don't satisfy the original equation. The ACT builds questions around this
specifically.

> `√(x + 6) = x` → `x + 6 = x²` → `x² − x − 6 = 0` → `(x−3)(x+2) = 0` →
> `x = 3` or `x = −2`.
> Check: `√9 = 3` ✓. `√4 = 2 ≠ −2` ✗. **Only `x = 3`.**

---

## Word problems

### Translation

| English | Math |
| --- | --- |
| is, was | `=` |
| of | `×` |
| per, for each | rate |
| more than, increased by | `+` |
| less than, decreased by | `−` (watch order) |
| twice | `× 2` |

**"Less than" reverses order.** "7 less than x" is `x − 7`.

### Common setups

**Consecutive integers:** `n`, `n+1`, `n+2`. Consecutive **even** or **odd**:
`n`, `n+2`, `n+4`.

**Age problems:** define the present, then add or subtract for past and future.

**Mixture problems:** amount of substance = concentration × volume. Set up as
`c₁v₁ + c₂v₂ = c_final(v₁ + v₂)`.

**Distance:** `d = rt`. For two objects, decide whether times are equal,
distances are equal, or distances sum to a total.

---

## Patterns and tells

**Consider backsolving** when choices give candidate values you can test in
the original conditions. A choice giving a count or a combined quantity may
not be directly substitutable.

**Use allowed sample values to eliminate variable expressions.** A mismatch
disproves equivalence; agreement at sampled values does not prove identity.

**"Which of the following must be true?"** — hunt counterexamples. Test
fractions between 0 and 1, negatives, and zero when the conditions allow them.

**"Which could be true?"** — one working example is enough.

**Excluded-value questions** are free if you remember to include cancelled
factors.

**Parameter questions** require identifying what the parameter controls.
For a quadratic root-count condition, the discriminant may help; for a linear
system, compare whether the lines intersect, coincide or are parallel.

---

## Traps

| Trap | Description |
| --- | --- |
| **Didn't flip the inequality** | Divided by a negative |
| **Missing `±`** | `x² = 25` → only `5` |
| **Extraneous solution** | Squared both sides, didn't check |
| **`(a+b)² = a² + b²`** | Dropped the middle term |
| **Excluded values** | Forgot the cancelled factor |
| **"Less than" order** | Wrote `7 − x` for "7 less than x" |
| **Solved for the wrong thing** | Found `x`, question wanted `2x − 1` |
| **Perpendicular slope** | Took the reciprocal without negating |

---

## Drill plan

| Stage | Filter | Volume |
| --- | --- | --- |
| 1. Linear mechanics | Expressions and equations | 25, writing every step |
| 2. Inequalities | Expressions and equations | 15, circling negative divisors |
| 3. Lines and systems | Expressions and equations | 25 |
| 4. Factoring | Polynomial and rational expressions | 30. Recognize patterns on sight. |
| 5. Quadratics | Polynomial and rational expressions | 25. Track missing `±`. |
| 6. Rational and radical | Polynomial and rational expressions | 20. Check extraneous every time. |
| 7. Mixed timed | Whole domain | 30 at 60 sec each |

Stage 4 has the best return. Factoring fluency speeds everything downstream and
turns several 90-second problems into 20-second ones.

---

**Next:** [Functions](03-functions.md)
