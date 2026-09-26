---
id: sat-math/geometry-and-trigonometry/area-and-volume
title: Area and volume
section: sat-math
domain: Geometry and Trigonometry
skill: Area and volume
---
# Area and volume

Area measures the flat space inside a shape (square units); surface area is
the total area of a solid's faces; volume is the space inside a solid (cubic
units). This skill is part of Geometry and Trigonometry,
{{fact:sat-math-geometry}} of the Math section. Bluebook's reference sheet
gives most basic formulas, so the questions test setup: composite shapes,
missing dimensions found backward, and what happens to area and volume when
every length is scaled. Hard questions find the one length two figures
share, or work from an area or volume ratio back to the lengths. See
[the reference sheet](learn:sat/general/format-and-scoring#reference-sheet).

## Area {#area}

| Shape | Area | On the reference sheet? |
| --- | --- | --- |
| Rectangle | lw | yes |
| Triangle | ½bh | yes |
| Circle | πr² | yes |
| Parallelogram | bh (h is perpendicular to b) | no |
| Trapezoid | ½(b₁ + b₂)h | no |
| Equilateral triangle with side s | (s²√3)/4 | no |

For a composite shape, split it into pieces you know, then add or subtract.

> **Example.** A garden is a 10-meter by 6-meter rectangle with a semicircle
> of diameter 6 meters cut out of one short side. What is its area?
>
> Rectangle: 10 × 6 = 60 square meters.
>
> The semicircle has radius 3, so its area is ½ · π · 3² = 4.5π.
>
> Garden: 60 − 4.5π ≈ 60 − 14.14 = 45.86 square meters.

If every length of a figure is multiplied by k, its area is multiplied by k².

> **Example.** Two similar triangles have corresponding sides in the ratio
> 2 : 3. The smaller has an area of 8. What is the area of the larger?
>
> Length factor k = 3/2, so the area factor is k² = 9/4.
>
> Larger area: 8 × 9/4 = 18. The trap answer is 12, from scaling the area by
> 3/2.

### A polygon and a circle, one inside the other {#inscribed-figures}

When a polygon and a circle fit together, find the one length they share
before computing anything:

| Figure | Shared length |
| --- | --- |
| square inside a circle (corners on the circle) | the square's diagonal is the circle's diameter |
| circle inside a square (touching all four sides) | the square's side is the circle's diameter |
| regular hexagon inside a circle | each side equals the radius (six equilateral triangles) |
| equilateral triangle inside a circle | each side is √3 times the radius |

> **Example.** A square is inscribed in a circle of radius 5. What is the
> area of the square?
>
> The square's diagonal is a diameter, 10. A square with diagonal d has
> side d/√2, so the side is 10/√2 = 5√2.
>
> Area: (5√2)² = 50. (Or: a square's area is half its diagonal squared,
> 10²/2 = 50.)

> **Trap.** Using the diameter as the square's side. That is the circle
> inside the square, which has area 100 here, twice the right answer.

A region between two circles with the same center is sometimes given only
by a chord of the larger circle that just touches the smaller one. The
radius to the touching point is perpendicular to the chord and bisects it,
so R² − r² = (half the chord)², and the shaded area π(R² − r²) follows
without either radius.

## Surface area {#surface-area}

Surface area is the sum of the areas of all the faces, and these formulas are
not on the reference sheet:

| Solid | Surface area |
| --- | --- |
| Rectangular prism, l × w × h | 2(lw + lh + wh) |
| Cube with edge s | 6s² |
| Cylinder, radius r, height h | 2πr² + 2πrh (two circles plus the curved side) |

> **Example.** Find the surface area of a closed box 4 by 3 by 2 inches, and
> of a closed cylinder with radius 3 and height 5.
>
> Box: 2(4 · 3 + 4 · 2 + 3 · 2) = 2(12 + 8 + 6) = 52 square inches.
>
> Cylinder: two circles 2π(3²) = 18π, plus the side 2π(3)(5) = 30π. Total
> 48π square units.

> **Trap.** An open-top box or a can without a lid is missing one face. Read
> whether every face is included before adding.

## Volume {#volume}

| Solid | Volume (all on the reference sheet) |
| --- | --- |
| Rectangular prism | lwh |
| Cylinder | πr²h |
| Sphere | (4/3)πr³ |
| Cone | (1/3)πr²h |
| Rectangular pyramid | (1/3)lwh |

The pattern: a prism or cylinder is base area × height, and a cone or
pyramid with the same base and height is one third of that. If every length
is multiplied by k, the volume is multiplied by k³.

> **Example.** A full cylindrical can with radius 4 cm and height 9 cm is
> poured into an empty rectangular tank whose base is 12 cm by 8 cm. How deep
> is the water?
>
> Can: π · 4² · 9 = 144π cubic centimeters.
>
> Tank: 12 · 8 · d = 96d. Set equal: 96d = 144π, so d = 1.5π ≈ 4.71 cm.

> **Example.** A sphere has a volume of 36π. What is its radius?
>
> (4/3)πr³ = 36π. Divide by π: (4/3)r³ = 36, so r³ = 27 and r = 3.

> **Trap.** Doubling every edge of a box doubles its volume. It multiplies
> the volume by 2³ = 8 (and the surface area by 2² = 4).

The scaling runs backward too. If two similar solids have surface areas in
the ratio 9 : 25, their lengths are in the ratio 3 : 5 (square roots), and
their volumes in the ratio 27 : 125 (cubes). Go through the length ratio;
never scale a volume by an area ratio.

### Density {#density}

Density is mass per unit of volume, so mass = density × volume and
volume = mass ÷ density. Put the mass and the density in matching units
first.

> **Example.** A solid cube has a mass of 1 kilogram and is made of a metal
> with a density of 8 grams per cubic centimeter. How long is each edge?
>
> 1 kilogram is 1,000 grams. Volume: 1,000 ÷ 8 = 125 cubic centimeters.
>
> A cube's volume is its edge cubed, so the edge is the cube root of 125:
> 5 centimeters.
>
> Check: 5³ = 125, and 125 × 8 = 1,000 grams.

> **Trap.** Dividing 1 by 8 without converting kilograms to grams, or
> converting cubic meters to cubic centimeters by 100 instead of
> 100³ = 1,000,000.

## What Hard looks like {#hard}

- A polygon and a circle, one inside the other: a square, a hexagon or an equilateral triangle in a circle, or a circle in a square. Find the shared length first (see [a polygon and a circle](#inscribed-figures)).
- A region bounded by circles: two circles with one center and a chord of the larger touching the smaller, or equal circles packed in a square. Look for the relationship the figure forces, such as R² − r² from a right triangle, rather than each measure.
- Similar solids with a given area or volume ratio. Go back to the length ratio first (a square root or a cube root), then forward to the measure asked: lengths scale by k, areas by k², volumes by k³.

> **Example.** A cone and a cylinder have the same radius, and the cone's
> volume equals the cylinder's. The cylinder is 5 inches tall. How tall is
> the cone?
>
> (1/3)πr²h = πr²(5). Divide both sides by πr²: h/3 = 5, so h = 15 inches.
