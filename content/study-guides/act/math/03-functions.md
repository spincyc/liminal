# ACT Mathematics — Functions

**Catalog domain:** Functions
**Skills:** Function concepts · Function models
**17-20% of the scored questions** — 7-8 of the 41

The ACT reaches further into function territory than the SAT does: logarithms,
trigonometric graphs, and inverse functions all appear here.

---

## Function basics

### Notation

- `f(3)` — substitute 3 for `x`
- `f(a + 2)` — substitute the whole expression
- `f(x) = 0` — find the **zeros / roots / x-intercepts**
- `f(x) = g(x)` — find where the graphs **intersect**

**Vocabulary equivalence** — all the same thing:

> zero = root = solution = x-intercept = where the graph meets the x-axis (crosses or touches) =
> where `f(x) = 0`

### Domain and range

**Domain** — allowable inputs. Restricted by:
- Division by zero → denominator ≠ 0
- Even roots of negatives → radicand ≥ 0
- Logarithms → argument > 0

**Range** — possible outputs. Often found from the graph, or by reasoning about
the function's shape. An upward-opening parabola with no domain restriction
has range `y ≥ k`, where `k` is the vertex y-value. A restricted domain can
remove the vertex or impose an upper bound.

**Read endpoints separately.** An open circle excludes a point; a filled
circle includes it. Read the domain across the x-axis and the range up the
y-axis. Arrows indicate continuation; the edge of the picture alone does not
end a graph.

> **Worked example.** A function's graph consists only of a line segment
> from an open point at `(−3, 4)` to a filled point at `(2, −1)`. What are its
> domain and range?
>
> Inputs: `−3 < x ≤ 2`, or `(−3, 2]` in interval notation.
> Outputs: `−1 ≤ y < 4`, or `[−1, 4)`. The lower output is included even
> though the left endpoint is open: its inclusion comes from the filled
> right endpoint.

> **Worked example.** For `f(x) = (x − 2)²` restricted to `0 ≤ x ≤ 3`,
> find the range.
>
> The vertex at `x = 2` is allowed and gives the minimum 0. The endpoints
> give `f(0) = 4` and `f(3) = 1`, so the maximum is 4. The continuous curve
> fills every output between them: `0 ≤ y ≤ 4`.

**Trap:** checking only the two endpoints would miss the minimum 0. With
separate pieces, inspect each piece and combine the attained outputs; an
open point's y-value may still occur elsewhere.

### Composition

`f(g(x))` — **inner function first**.

> `f(x) = 2x + 1`, `g(x) = x²`
> `f(g(3)) = f(9) = 19`
> `g(f(3)) = g(7) = 49`

Order matters, and reversing it is the standard trap.

### Inverse functions

`f⁻¹(x)` undoes `f(x)`.

**To find:** swap `x` and `y`, then solve for `y`.

> `y = 3x − 6` → `x = 3y − 6` → `y = (x + 6)/3`

**Properties:**
- `f(f⁻¹(x)) = x`
- The graph of `f⁻¹` is the reflection of `f` over the line `y = x`
- If `(a, b)` is on `f`, then `(b, a)` is on `f⁻¹`
- A function has an inverse only if it's one-to-one (passes the horizontal line
  test)

**Note:** `f⁻¹(x)` is **not** `1/f(x)`. The ACT offers that as a distractor.

---

## Transformations

For `f(x)`:

| Transformation | Effect |
| --- | --- |
| `f(x) + k` | Up `k` |
| `f(x) − k` | Down `k` |
| `f(x + h)` | **Left** `h` |
| `f(x − h)` | **Right** `h` |
| `−f(x)` | Reflect over the x-axis |
| `f(−x)` | Reflect over the y-axis |
| `a·f(x)`, `a > 1` | Vertical stretch |
| `a·f(x)`, `0 < a < 1` | Vertical compression |
| `f(ax)`, `a > 1` | Horizontal compression |

**For a horizontal change, solve for the new input.** To move an old point
`(u, v)` to `g(x) = a·f(b(x − h)) + k`, solve `b(x − h) = u`.
For nonzero `a` and `b`, the point becomes `(h + u/b, av + k)`.
This handles shifts, stretches and reflections without a vague sign rule.

> **Worked example.** The graph of `f` contains `(4, −2)`. Where is the
> corresponding point on `g(x) = −3f(2x − 6) + 1`?
>
> Set the inside equal to the old input: `2x − 6 = 4`, so `x = 5`.
> The output becomes `−3(−2) + 1 = 7`. The new point is `(5, 7)`.
> Factoring `2x − 6 = 2(x − 3)` shows a horizontal compression by `1/2`
> followed by a shift right 3. It is not a shift right 6.

The shortcuts "plus inside means left" and "outside multipliers change
height" are useful for simple forms. **They fail when applied one symbol at
a time to an unfactored inside expression.** Solve for the input instead,
and carry domain restrictions and open/filled endpoints with the points.

---

## Quadratic functions

**Three forms:**

| Form | Reveals |
| --- | --- |
| `y = ax² + bx + c` | y-intercept `c` |
| `y = a(x − r₁)(x − r₂)` | Roots |
| `y = a(x − h)² + k` | Vertex `(h, k)` |

**Vertex:** `x = −b/(2a)`, then substitute. Or take the **midpoint of the
roots**, which is often faster.

**Direction:** `a > 0` opens up (minimum at the vertex); `a < 0` opens down
(maximum).

**Axis of symmetry:** the vertical line through the vertex, `x = −b/(2a)`.

**Maximum/minimum word problems:** check the opening direction and allowed
inputs before using the vertex. For a downward-opening quadratic, the vertex
maximizes output only if its input is allowed. On a restricted interval,
compare the allowed vertex and endpoints; for whole-number inputs, compare
the allowed integers near the vertex too.

---

## Exponential functions

```
y = a · bˣ
```

- `a` = initial value (at `x = 0`)
- `b` = growth factor
- `b > 1` growth; `0 < b < 1` decay

**Percent form:** `y = a(1 ± r)ᵗ`

| Description | `b` |
| --- | --- |
| +8% per period | 1.08 |
| −8% per period | 0.92 |
| Doubles | 2 |
| Halves | 0.5 |
| Triples every 5 years | `3^(1/5)` per year; model `a·3^(t/5)` |

**Compound interest:** `A = P(1 + r/n)^(nt)`

**Linear vs. exponential:** for equally spaced inputs in a table:

| | Linear | Exponential |
| --- | --- | --- |
| Changes by | constant **amount** | constant **factor** |
| Table shows | constant differences | constant ratios |
| Language | "increases by 5 each year" | "increases by 5% each year" |

**Asymptote:** `y = a·bˣ` approaches `y = 0` but never reaches it. Shifting the
function shifts the asymptote: `y = a·bˣ + c` has asymptote `y = c`.

---

## Logarithms

The ACT tests logs; the SAT largely doesn't.

### Definition

```
log_b(x) = y   ⟺   bʸ = x
```

A logarithm answers: *"to what power must I raise the base to get this number?"*

> `log₂(8) = 3` because `2³ = 8`
> `log₁₀(1000) = 3`
> `log₅(1) = 0` — any log of 1 is 0

### Rules

```
log(mn)   = log m + log n
log(m/n)  = log m − log n
log(mᵖ)   = p · log m
log_b(b)  = 1
log_b(1)  = 0
```

**Change of base:** `log_b(x) = log(x)/log(b)` — needed to compute non-standard
bases on a calculator.

**Conventions:** `log x` with no base means base 10. `ln x` means base `e`.

**Solving:** convert to exponential form.

> `log₃(x − 1) = 2` → `3² = x − 1` → `x = 10`

**Domain restriction:** a real log needs a positive base other than 1 and a
**positive** argument. Solutions
that make it non-positive are extraneous.

---

## Trigonometric functions and graphs

### The unit circle basics

```
sin θ = opp/hyp     cos θ = adj/hyp     tan θ = opp/adj
```

Reciprocals — the ACT does test these:
```
csc θ = 1/sin θ     sec θ = 1/cos θ     cot θ = 1/tan θ
```

### Graph properties

For `y = A·sin(Bx + C) + D`:

| Parameter | Meaning |
| --- | --- |
| `\|A\|` | **Amplitude** — half the distance from max to min |
| `B` | Affects period: **period = 2π/\|B\|** |
| `C` | With `B`, determines phase shift `−C/B` when `B ≠ 0` |
| `D` | Vertical shift — the midline is `y = D` |

For tangent, the period is `π/|B|`, not `2π/|B|`.

**Common question:** "What is the amplitude and period of `y = 3sin(2x)`?"
Amplitude `3`, period `2π/2 = π`.

> **Worked example.** For `y = 2sin(3x − π) + 1`, find the amplitude,
> midline, period and horizontal shift, using radians.
>
> Amplitude: 2. Midline: `y = 1`, so the range is `−1 ≤ y ≤ 3`.
> Period: `2π/3`. Factor the inside as `3(x − π/3)`: the shift is right
> `π/3`, not right `π`.

These amplitude and period rules apply to sine and cosine. Tangent has
asymptotes and no finite amplitude; its period formula differs as stated
above. If the horizontal axis is in degrees, sine and cosine use
`360°/|B|` instead of `2π/|B|`.

### Values to know

| θ | 0 | π/6 (30°) | π/4 (45°) | π/3 (60°) | π/2 (90°) |
| --- | --- | --- | --- | --- | --- |
| sin | 0 | 1/2 | √2/2 | √3/2 | 1 |
| cos | 1 | √3/2 | √2/2 | 1/2 | 0 |
| tan | 0 | √3/3 | 1 | √3 | — |

### Identities

```
sin²θ + cos²θ = 1
tan θ = sin θ / cos θ
sin θ = cos(90° − θ)
```

**Radians:** `π rad = 180°`. Convert with `× π/180` or `× 180/π`.

---

## Reading graphs and tables

Many ACT function questions give you a graph or table instead of an equation.

| Question | How to answer |
| --- | --- |
| "What is `f(3)`?" | Find `x = 3`, read the `y` value |
| "For what `x` is `f(x) = 5`?" | Find `y = 5`, read the `x` value(s) — there may be several |
| "Where is `f` increasing?" | Where the graph goes up left-to-right |
| "How many solutions does `f(x) = 2` have?" | Count intersections with the horizontal line `y = 2` |
| "Where do `f` and `g` intersect?" | Where the curves meet, including a touch |
| "What is the maximum value?" | The highest `y`, not the `x` where it occurs |

**That last distinction is a recurring trap.** "The maximum value of the
function" is a `y`-value. "The value of `x` at which the maximum occurs" is an
`x`-value. Read which is asked.

Touching also counts as an intersection. For `f(x) = g(x)`, the solutions
are the x-coordinates of intersections, not their heights. A horizontal
line can meet a curve more than once; keep every allowed input.

> **Worked example.** A continuous function is drawn with straight segments
> joining `(−2, 0)`, `(1, 6)` and `(4, 0)`. What are `f(1)`, the solutions
> of `f(x) = 4`, and the interval where `f` is decreasing?
>
> `f(1) = 6`. The left segment has slope 2 and equation `y = 2x + 4`,
> so `y = 4` gives `x = 0`. The right segment has equation `y = −2x + 8`,
> giving `x = 2`. The solutions are 0 and 2. The function decreases from
> `x = 1` to `x = 4`, even while its outputs remain positive.

**Trap:** negative output and decreasing behavior are different. Increasing
and decreasing describe changes as x moves right. Check the labeled axis
values before judging rate: a rise of two grid squares need not be 2 units.

---

## Patterns and tells

**Backsolve on function questions with numeric choices.** Substituting is faster
than solving.

**For "which graph represents..." questions**, check three things: the
y-intercept, the direction, and one easy point. That usually eliminates
everything but one.

**When it fails:** different curves can share those features. Check additional
points, zeros, extrema, asymptotes and domain restrictions as needed. A graph
window can hide an intersection or an intercept.

**Transformation questions:** determine the horizontal shift direction
explicitly. Say out loud "plus three inside means left three."

**Amplitude/period questions** are formulaic. `|A|` and `2π/|B|`.

**Composition questions:** write the inner value down before computing the
outer. Don't do it in one step.

---

## Traps

| Trap | Description |
| --- | --- |
| **Horizontal shift direction** | `f(x+2)` shifted right |
| **Composition order** | Computed `g(f(x))` |
| **`f⁻¹(x)` as `1/f(x)`** | |
| **Max value vs. location** | Reported `x` instead of `y` |
| **Period formula** | Used `B` instead of `2π/B` |
| **Log domain** | Kept a solution making the argument negative |
| **Log rules** | `log(m + n) ≠ log m + log n` |
| **Exponential rate** | Used `0.05` instead of `1.05` |

---

## Drill plan

| Stage | Filter | Volume |
| --- | --- | --- |
| 1. Notation and composition | Function concepts | 25. Write the inner value separately. |
| 2. Domain and range | Function concepts | 15 |
| 3. Transformations | Function concepts | 20. Say the direction aloud. |
| 4. Quadratic functions | Function models | 25 |
| 5. Exponentials | Function models | 20. Write `a` and `b` explicitly. |
| 6. Logarithms | Function concepts | 20 |
| 7. Trig graphs | Function models | 15. Amplitude and period drills. |
| 8. Mixed timed | Whole domain | 30 at 65 sec each |

Use the endpoint, transformation and trig examples to identify what to drill.
The guide's topic list does not guarantee a fixed number of any question type
on a form, and repeated numerical variants are not proof of transfer.

---

**Next:** [Geometry](04-geometry.md)
