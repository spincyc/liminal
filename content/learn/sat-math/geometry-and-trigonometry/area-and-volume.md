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
{{fact:sat-math-geometry}} of the Math section. Bluebook's
[reference sheet](learn:sat/general/format-and-scoring#reference-sheet)
gives most basic formulas, so the questions test setup: composite shapes,
dimensions found backward, and scaling.

## Before you start {#before-you-start}

These checks cover area and volume from Grades 7 and 8. If one goes wrong,
rebuild it with
[Grade 7, week 22: circles](weeks.html#common-core-math/7/22),
[Grade 7, week 24: prisms](weeks.html#common-core-math/7/24) or
[Grade 8, week 34: cylinders](weeks.html#common-core-math/8/34).

> **Try it.** A circle has a diameter of 14. What is its area, in terms of
> π?
>
> **Answer.** 49π
>
> The radius is half the diameter, 7, so the area is π · 7² = 49π. Shaky?
> [Grade 7, week 22](weeks.html#common-core-math/7/22).

> **Try it.** A closed box is 6 by 5 by 2 centimeters. What are its volume
> and its surface area?
>
> **Answer.** 60 cubic centimeters and 104 square centimeters
>
> Volume: 6 · 5 · 2 = 60. The three pairs of faces have areas 6 · 5 = 30,
> 6 · 2 = 12 and 5 · 2 = 10, so the surface area is
> 2(30 + 12 + 10) = 104. Shaky?
> [Grade 7, week 24](weeks.html#common-core-math/7/24).

> **Try it.** A cylinder has a radius of 3 and a height of 10. What is its
> volume, in terms of π?
>
> **Answer.** 90π
>
> Base area times height: π · 3² · 10 = 90π. Shaky?
> [Grade 8, week 34](weeks.html#common-core-math/8/34).

## Area {#area}

| Shape | Area | On the reference sheet? |
| --- | --- | --- |
| Rectangle | lw | yes |
| Triangle | ½bh | yes |
| Circle | πr² | yes |
| Parallelogram | bh (h is perpendicular to b) | no |
| Trapezoid | ½(b₁ + b₂)h | no |
| Equilateral triangle with side s | (s²√3)/4 | no |

Choose the measurement before the formula. A border or distance around a
shape asks for perimeter (length units); covering a flat region asks for
area (square units). A triangle's height is the perpendicular distance to
its chosen base, not necessarily a side of the triangle.

{{figure:triangle-height}}

For the pictured base AB, use CH as the height: area = (1/2)bh.
The sloping side AC, labeled s, belongs to the boundary; it does not
replace h. First identify the base and the right-angle mark, then attach
the question's measurements to those labels.

When a dimension is missing, put a letter in its place and set the formula
equal to the given measurement. If solving that equation is the sticking
point, review [rearranging formulas](learn:sat-math/algebra/linear-equations-in-one-variable#rearranging-formulas).

> **Example.** An isosceles triangular sign has a base of 12 inches, two
> sides of 10 inches and a perpendicular height of 8 inches. How much area
> does it cover, and how much trim goes around its edge?
>
> Covering uses area: (1/2) · 12 · 8 = 48 square inches. The height, 8,
> meets the base at 90°; the slanted side, 10, does not.
>
> Trim uses perimeter: 12 + 10 + 10 = 32 inches. The height is inside the
> sign and is not part of its boundary.

> **Try it.** A triangular sign has an area of 84 square centimeters and a
> base of 24 centimeters. A scale copy has every length 1.5 times the
> corresponding original length. What is the height of the copy, in
> centimeters, perpendicular to the corresponding base?
>
> **Answer.** 10.5
>
> First find the original height h: 84 = (1/2) · 24 · h = 12h, so h = 7
> centimeters. The copy's height is 1.5 · 7 = 10.5 centimeters.
>
> Check: the copy's base is 36 and its area is (1/2) · 36 · 10.5 = 189
> square centimeters, which is 1.5² · 84. Heights scale by 1.5; areas scale
> by 1.5².

For a composite shape, split it into pieces you know, then add or subtract.

> **Example.** A garden is a 10-meter by 6-meter rectangle with a semicircle
> of diameter 6 meters cut out of one short side. What is its area?
>
> Rectangle: 10 × 6 = 60 square meters.
>
> The semicircle has radius 3, so its area is ½ · π · 3² = 4.5π.
>
> Garden: 60 − 4.5π ≈ 60 − 14.14 = 45.86 square meters.

> **Try it.** A window is a rectangle 4 feet wide and 3 feet tall with a
> semicircle on top, whose diameter is the rectangle's 4-foot top side.
> What is the area of the window?
>
> **First step.** Rectangle: 4 × 3 = 12 square feet. Now add the
> semicircle.
>
> **Answer.** 12 + 2π, about 18.28 square feet
>
> The semicircle has diameter 4, so radius 2, and area ½ · π · 2² = 2π.
>
> Window: 12 + 2π ≈ 12 + 6.28 = 18.28 square feet.

If every length of a figure is multiplied by k, its area is multiplied by k².

> **Example.** Two similar triangles have corresponding sides in the ratio
> 2 : 3. The smaller has an area of 8. What is the area of the larger?
>
> Length factor k = 3/2, so the area factor is k² = 9/4.
>
> Larger area: 8 × 9/4 = 18. The trap answer is 12, from scaling the area by
> 3/2.

> **Try it.** Two similar rectangles have corresponding sides in the ratio
> 3 : 5. The larger rectangle has an area of 75. What is the area of the
> smaller rectangle?
>
> **Answer.** 27
>
> From larger to smaller the length factor is 3/5, so the area factor is
> (3/5)² = 9/25.
>
> Smaller area: 75 × 9/25 = 27. Scaling by 3/5 alone gives 45, the trap
> answer.

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

> **Try it.** A square is inscribed in a circle with an area of 36π. What
> is the area of the square?
>
> **First step.** πr² = 36π, so r = 6 and the diameter is 12. Now use the
> length the square and the circle share.
>
> **Answer.** 72
>
> The diameter 12 is the square's diagonal, and a square's area is half its
> diagonal squared: 12²/2 = 72. (The side is 12/√2 = 6√2, and
> (6√2)² = 72.)

> **Try it.** A regular hexagon is inscribed in a circle of radius 6. What
> is the area of the hexagon?
>
> **Answer.** 54√3, about 93.5
>
> Each side equals the radius, so the hexagon is six equilateral triangles
> with side 6.
>
> One triangle has area (6²√3)/4 = 9√3, so the hexagon has area
> 6 · 9√3 = 54√3 ≈ 93.5.

For a harder ring-shaped region, see
[the region between two circles](#concentric-circles).

## Surface area {#surface-area}

Surface area counts exposed faces, while volume counts the space inside.
For paint or wrapping, list which faces are included before calculating;
for capacity, use [volume](#volume). The same dimensions can answer either
question, so the numbers alone do not choose the formula.

These surface area formulas are not on the reference sheet:

| Solid | Surface area |
| --- | --- |
| Rectangular prism, l × w × h | 2(lw + lh + wh) |
| Cube with edge s | 6s² |
| Cylinder, radius r, height h | 2πr² + 2πrh (two circles plus the curved side) |
| Sphere, radius r | 4πr², which is also πd² |

> **Example.** Find the surface area of a closed box 4 by 3 by 2 inches, and
> of a closed cylinder with radius 3 and height 5.
>
> Box: 2(4 · 3 + 4 · 2 + 3 · 2) = 2(12 + 8 + 6) = 52 square inches.
>
> Cylinder: two circles 2π(3²) = 18π, plus the side 2π(3)(5) = 30π. Total
> 48π square units.

> **Trap.** An open-top box or a can without a lid is missing one face. Read
> whether every face is included before adding.

> **Try it.** Find the surface area of a closed box 5 by 4 by 3
> centimeters, and of a cylindrical can with radius 2 centimeters and
> height 7 centimeters that has no lid.
>
> **First step.** Box: 2(5 · 4 + 5 · 3 + 4 · 3) = 2(20 + 15 + 12) = 94
> square centimeters. Now do the can.
>
> **Answer.** The box is 94 square centimeters and the can is 32π square
> centimeters.
>
> The can has one circle, π · 2² = 4π, and the side, 2π · 2 · 7 = 28π.
>
> Total: 4π + 28π = 32π ≈ 100.5 square centimeters. With a lid it would be
> 36π.

### A box inside a sphere {#box-in-a-sphere}

A box's space diagonal runs through its inside from one corner to the
opposite corner: d = √(l² + w² + h²). When all eight corners of a box lie
on a sphere, that diagonal is a diameter of the sphere.

> **Example.** All eight corners of a box 3 by 6 by 6 inches lie on a
> sphere. What is the surface area of the sphere?
>
> Space diagonal: √(3² + 6² + 6²) = √(9 + 36 + 36) = √81 = 9 inches. That is
> the diameter, so r = 4.5.
>
> Surface area: 4π(4.5)² = 4π(20.25) = 81π square inches.

> **Trap.** Taking a face diagonal (√(6² + 6²) ≈ 8.5) or the longest edge as
> the diameter, or the space diagonal as the radius.

> **Try it.** All eight corners of a box 2 by 3 by 6 inches lie on a
> sphere. What is the surface area of the sphere?
>
> **First step.** Space diagonal: √(2² + 3² + 6²) = √(4 + 9 + 36) = √49 = 7
> inches. Now finish.
>
> **Answer.** 49π square inches
>
> The space diagonal is the diameter, so r = 3.5.
>
> Surface area: 4π(3.5)² = 4π(12.25) = 49π square inches. (Or πd² = 49π.)

### Drilled and glued solids {#drilled-and-glued}

Start from each solid's own surface area, then fix what the change hid or
exposed:

- Gluing two solids face to face hides two equal patches, one on each solid, each the size of the contact area.
- Drilling a round hole of radius r straight through a thickness h removes two circles, 2πr², and adds the hole's inside wall, 2πrh.

> **Example.** A block 8 cm by 8 cm by 5 cm has a hole of radius 2 cm
> drilled straight down through its 5 cm height. What is the surface area of
> the solid that remains, including the inside of the hole?
>
> Block: 2(8 · 8 + 8 · 5 + 8 · 5) = 2(64 + 40 + 40) = 288.
>
> The hole removes two circles, 2 · π · 2² = 8π, and adds a wall of
> 2π · 2 · 5 = 20π.
>
> Total: 288 − 8π + 20π = 288 + 12π square centimeters.

> **Try it.** A cube with edges of 6 centimeters has a hole of radius 1
> centimeter drilled straight through it, from the center of one face to
> the center of the opposite face. What is the surface area of the solid
> that remains, including the inside of the hole?
>
> **First step.** Cube: 6 · 6² = 216 square centimeters. Now fix what the
> hole removed and what it added.
>
> **Answer.** 216 + 10π, about 247.4 square centimeters
>
> The hole removes two circles, 2 · π · 1² = 2π, and adds a wall of
> 2π · 1 · 6 = 12π.
>
> Total: 216 − 2π + 12π = 216 + 10π ≈ 247.4 square centimeters.

> **Trap.** Subtracting one patch when two solids are glued, or a whole face
> of the larger solid. The contact area is hidden twice, once on each
> solid.

> **Try it.** A cube with edges of 4 inches is glued to the center of the
> top face of a cube with edges of 6 inches. What is the surface area of the
> combined solid?
>
> **Answer.** 280 square inches
>
> Separately the cubes have 6 · 6² = 216 and 6 · 4² = 96 square inches, a
> total of 312.
>
> The contact patch is a 4-by-4 square, 16 square inches, hidden on both
> cubes: 312 − 2 · 16 = 280 square inches.

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

Write the requested quantity beside your work: depth, radius, edge or
volume. A volume equation may be only a bridge to a requested length. Keep
going until both the quantity and its units match the question.

> **Example.** A full cylindrical can with radius 4 cm and height 9 cm is
> poured into an empty rectangular tank whose base is 12 cm by 8 cm. How deep
> is the water?
>
> Can: π · 4² · 9 = 144π cubic centimeters.
>
> Tank: 12 · 8 · d = 96d. Set equal: 96d = 144π, so d = 1.5π ≈ 4.71 cm.

> **Try it.** A full cylindrical jar with radius 3 inches and height 8
> inches is poured into an empty rectangular pan whose base is 9 inches by
> 8 inches. How deep is the water in the pan?
>
> **First step.** Jar: π · 3² · 8 = 72π cubic inches. Now set the pan's
> volume equal to it.
>
> **Answer.** π inches, about 3.14 inches
>
> Pan: 9 · 8 · d = 72d. Set equal: 72d = 72π, so d = π ≈ 3.14 inches.

> **Example.** A sphere has a volume of 36π. What is its radius?
>
> (4/3)πr³ = 36π. Divide by π: (4/3)r³ = 36, so r³ = 27 and r = 3.

> **Try it.** A sphere has a volume of 288π cubic centimeters. What is its
> radius?
>
> **Answer.** 6 centimeters
>
> (4/3)πr³ = 288π. Divide by π: (4/3)r³ = 288, so r³ = 216 and r = 6.

> **Example.** A cone and a cylinder have the same radius, and the cone's
> volume equals the cylinder's. The cylinder is 5 inches tall. How tall is
> the cone?
>
> (1/3)πr²h = πr²(5). Divide both sides by πr²: h/3 = 5, so h = 15 inches.

> **Try it.** A cone and a cylinder have the same height, and the cone's
> volume equals the cylinder's. The cylinder's radius is 4 centimeters.
> What is the cone's radius?
>
> **Answer.** 4√3 centimeters, about 6.93 centimeters
>
> (1/3)πR²h = π(4²)h. Divide both sides by πh: R²/3 = 16, so R² = 48.
>
> R = √48 = 4√3 ≈ 6.93 centimeters.

> **Trap.** Doubling every edge of a box doubles its volume. It multiplies
> the volume by 2³ = 8 (and the surface area by 2² = 4).

The scaling runs backward too: surface areas in the ratio 9 : 25 mean
lengths in the ratio 3 : 5 (square roots) and volumes in the ratio
27 : 125 (cubes). Never scale a volume by an area ratio.

> **Try it.** Two similar cylinders have surface areas in the ratio 4 : 9.
> The smaller cylinder has a volume of 16π. What is the volume of the
> larger cylinder?
>
> **Answer.** 54π
>
> Lengths: the square roots, 2 : 3. Volumes: the cubes, 8 : 27.
>
> Larger volume: 16π × 27/8 = 54π. Scaling 16π by the area ratio 9/4 gives
> 36π, the trap answer.

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

> **Trap.** Dividing 1 by 8 without converting kilograms to grams, or
> converting cubic meters to cubic centimeters by 100 instead of
> 100³ = 1,000,000.

> **Try it.** A solid cube has a mass of 2.16 kilograms and is made of a
> material with a density of 10 grams per cubic centimeter. How long, in
> centimeters, is each edge?
>
> **First step.** 2.16 kilograms is 2,160 grams. Now find the volume, then
> the edge.
>
> **Answer.** 6
>
> Volume: 2,160 ÷ 10 = 216 cubic centimeters.
>
> The edge is the cube root of 216: 6 centimeters. Check: 6³ = 216, and
> 216 × 10 = 2,160 grams.

For a harder version, see [two boxes, one volume](#equal-volume-boxes).

## Harder versions {#hard}

The hardest questions here hide the key relationship: a chord that fixes
the area between two circles, or an equation with one solution too many.

### The region between two circles {#concentric-circles}

Two circles with the same center are sometimes given only by a chord of
the larger one that just touches the smaller one. The area between them
follows without either radius.

> **Example.** Two circles have the same center. A chord of the larger
> circle is 18 units long and touches the smaller circle at exactly one
> point. What is the area of the region between the circles?
>
> The smaller radius r meets the chord at a right angle at its midpoint, so
> r, half the chord and the larger radius R form a right triangle:
> R² − r² = 9² = 81.
>
> The area between the circles is πR² − πr² = π(R² − r²) = 81π.

> **Try it.** Two circles have the same center, and the region between
> them has an area of 49π. A chord of the larger circle touches the smaller
> circle at exactly one point. How long is the chord?
>
> **Hint.** The smaller circle's radius to the touching point meets the
> chord at a right angle, at the chord's midpoint.
>
> **Answer.** 14
>
> The smaller circle's radius to the touching point bisects the chord at a
> right angle, so R² − r² = (half the chord)².
>
> π(R² − r²) = 49π, so R² − r² = 49, and half the chord is √49 = 7.
>
> The chord is 2 × 7 = 14.

### Two boxes, one volume {#equal-volume-boxes}

A square sheet of side s with a square of side c cut from each corner
folds into an open box of height c on a base of side s − 2c. Equal volumes
can give two positive values of s; keep the one that leaves every length
positive.

> **Example.** Two equal square sheets are folded into open boxes, one
> after cutting 1-inch squares from its corners and the other after cutting
> 4-inch squares. The boxes have equal volumes. What is the side length of
> each sheet?
>
> Let s be the side: 1 · (s − 2)² = 4 · (s − 8)².
>
> Take square roots: s − 2 = 2(s − 8) gives s = 14, and
> s − 2 = −2(s − 8) gives s = 6. But s = 6 makes the second base
> 6 − 8 = −2, so s = 14 inches. Check: 12² = 144 = 4 · 6².

> **Try it.** Two square sheets of cardboard are the same size. A 1-inch
> square is cut from each corner of one and a 9-inch square from each
> corner of the other, and each sheet is folded into an open box. The boxes
> have equal volumes. What is the side length, in inches, of each sheet?
>
> **Hint.** Each box's volume is its cut times (s − 2 · cut)². Set the two
> equal and take square roots.
>
> **Answer.** 26
>
> Let s be the side. The volumes are 1 · (s − 2)² and 9 · (s − 18)², so (s −
> 2)² = 9(s − 18)².
>
> s − 2 = 3(s − 18) gives 2s = 52, so s = 26.
>
> s − 2 = −3(s − 18) gives 4s = 56, so s = 14, but then the second base
> would be 14 − 18 = −4 inches. So s = 26.
>
> Check: 1 · 24² = 576 and 9 · 8² = 576.
