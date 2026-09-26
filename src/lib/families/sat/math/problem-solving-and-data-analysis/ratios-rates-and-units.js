(function (root, factory) {
  const node = typeof module === "object" && module.exports;
  const S = node ? require("../../../shared") : root.LiminalFamilyShared;
  const C = node ? require("./common") : (root.LiminalFamilyCommon || {})["sat/math/problem-solving-and-data-analysis"];
  const families = factory(S, C);
  if (node) module.exports = families;
  else S.register(families);
})(typeof self !== "undefined" ? self : this, function (S, C) {
  "use strict";

  // Ratios, rates, and units templates (Problem-Solving and Data Analysis), ordered Easy, Medium, Hard.

  const { MINUS, frac, table, plural, money } = S;
  // Every printed number is grouped by thousands ("1,440 minutes").
  const num = S.grouped;
  const {
    DATA, tidy, isClean, fmt, shown, retry, pack, close, DOMAIN, about, finish, packRanked,
  } = C;

  // Every modelled mistake that prints as the key redraws the item.
  const packStrict = (numeric, keyValue, keyText, candidates, fields) => pack(numeric, keyValue, keyText, candidates, fields, true);

  // A value a test would print as a whole number, or NaN so it drops out.
  const whole = (value) => (Number.isInteger(tidy(value)) ? tidy(value) : NaN);

  // A positive value with at most `places` decimals, or NaN so it drops out.
  const clean = (value, places = 2) => (value > 0 && isClean(value, places) ? tidy(value) : NaN);

  /* ==================================== proportional-rate-scaling (Easy) */

  const RATE_SCENES = [
    {
      rate: [8, 30], base: [2, 9], a: "pages", b: "minutes", per: "minute",
      given: (A, B) => `A printer prints ${fmt(A)} pages in ${B} minutes.`,
      askA: (c) => `At this rate, how many pages will the printer print in ${c} minutes?`,
      askB: (A) => `At this rate, how many minutes will it take the printer to print ${fmt(A)} pages?`,
      heads: ["Time (minutes)", "Pages printed"],
      intro: "The table shows the numbers of pages a printer prints in different amounts of time. The number of pages printed is proportional to the time.",
      hint: "How many pages does the printer print in one minute?",
    },
    {
      rate: [18, 42], base: [2, 9], a: "miles", b: "gallons", per: "gallon",
      given: (A, B) => `A car travels ${fmt(A)} miles on ${B} gallons of gasoline.`,
      askA: (c) => `At this rate, how many miles can the car travel on ${c} gallons of gasoline?`,
      askB: (A) => `At this rate, how many gallons of gasoline will the car use to travel ${fmt(A)} miles?`,
      heads: ["Gasoline used (gallons)", "Distance (miles)"],
      intro: "The table shows the distances a car traveled and the amounts of gasoline it used. The distance traveled is proportional to the gasoline used.",
      hint: "How far does the car travel on one gallon?",
    },
    {
      rate: [12, 32], base: [3, 9], a: "dollars", b: "hours", per: "hour",
      given: (A, B) => `Dana earns $${fmt(A)} for ${B} hours of work.`,
      askA: (c) => `At this rate, how much will Dana earn, in dollars, for ${c} hours of work?`,
      askB: (A) => `At this rate, how many hours must Dana work to earn $${fmt(A)}?`,
      heads: ["Hours worked", "Earnings (dollars)"],
      intro: "The table shows Dana's earnings for different numbers of hours worked. Her earnings are proportional to the number of hours she works.",
      hint: "How much does Dana earn for one hour of work?",
    },
    {
      rate: [3, 16], base: [2, 9], a: "liters", b: "minutes", per: "minute",
      given: (A, B) => `Water flows from a hose at a constant rate, and ${fmt(A)} liters flow from it in ${B} minutes.`,
      askA: (c) => `At this rate, how many liters of water will flow from the hose in ${c} minutes?`,
      askB: (A) => `At this rate, how many minutes will it take for ${fmt(A)} liters of water to flow from the hose?`,
      heads: ["Time (minutes)", "Water (liters)"],
      intro: "The table shows the amounts of water that flow from a hose in different amounts of time. The amount of water is proportional to the time.",
      hint: "How many liters flow in one minute?",
    },
    {
      rate: [5, 40], base: [2, 8], a: "kilometers", b: "centimeters", per: "centimeter",
      given: (A, B) => `On a map, ${B} centimeters represent an actual distance of ${fmt(A)} kilometers.`,
      askA: (c) => `Two towns are ${c} centimeters apart on the map. What is the actual distance, in kilometers, between the towns?`,
      askB: (A) => `Two towns are ${fmt(A)} kilometers apart. How many centimeters apart are the towns on the map?`,
      heads: ["Map distance (centimeters)", "Actual distance (kilometers)"],
      intro: "The table shows several distances on a map and the actual distances they represent. The actual distance is proportional to the map distance.",
      hint: "What actual distance does one centimeter on the map represent?",
    },
    {
      rate: [8, 18], base: [2, 6], a: "cookies", b: "cups of flour", per: "cup of flour",
      given: (A, B) => `A recipe uses ${B} cups of flour to make ${fmt(A)} cookies.`,
      askA: (c) => `At this rate, how many cookies can be made with ${c} cups of flour?`,
      askB: (A) => `At this rate, how many cups of flour are needed to make ${fmt(A)} cookies?`,
      heads: ["Flour (cups)", "Cookies"],
      intro: "The table shows the numbers of cookies a recipe makes from different amounts of flour. The number of cookies is proportional to the amount of flour.",
      hint: "How many cookies does one cup of flour make?",
    },
    {
      rate: [20, 90], base: [2, 8], a: "kilowatt-hours", b: "hours", per: "hour",
      given: (A, B) => `A wind turbine generates ${fmt(A)} kilowatt-hours of energy in ${B} hours.`,
      askA: (c) => `At this rate, how many kilowatt-hours of energy will the turbine generate in ${c} hours?`,
      askB: (A) => `At this rate, how many hours will it take the turbine to generate ${fmt(A)} kilowatt-hours of energy?`,
      heads: ["Time (hours)", "Energy (kilowatt-hours)"],
      intro: "The table shows the energy a wind turbine generates in different amounts of time. The energy generated is proportional to the time.",
      hint: "How much energy does the turbine generate in one hour?",
    },
  ];

  /* ======================================== rate-unit-conversion (Medium) */

  // Each scene draws its own numbers and returns the item's parts; `check`
  // recomputes the key in the other direction (from the answer back to a
  // given quantity).
  const CONVERSIONS = {
    time: [
      (t) => {
        const R = t.pick([12, 15, 18, 20, 24, 25, 30, 36, 40, 45, 48, 50, 60]);
        const H = t.pick([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7.5, 8]);
        const G = R * 60 * H;
        const minutes = G / R;
        return {
          stem: `A pump removes water from a flooded basement at a constant rate of ${R} gallons per minute. There are ${fmt(G)} gallons of water in the basement. How many hours will it take the pump to remove all of the water?`,
          key: H,
          candidates: [
            [clean(minutes), `Stops at the time in minutes, ${fmt(G)} ÷ ${R} = ${fmt(minutes)}, without converting to hours.`],
            [clean(minutes / 100), `Converts ${fmt(minutes)} minutes to hours by moving the decimal point, as if an hour had 100 minutes.`],
            [clean((G * 60) / R), "Multiplies by 60 instead of dividing, converting between minutes and hours in the wrong direction."],
            [clean(R * 60), `Gives the pump's rate in gallons per hour, ${R} × 60, instead of the time.`],
            [clean(minutes / 3600, 3), `Divides the ${fmt(minutes)} minutes by 3,600, as if they were seconds, instead of by 60.`],
          ],
          explanation: `At ${R} gallons per minute, ${fmt(G)} gallons take ${fmt(G)} ÷ ${R} = ${fmt(minutes)} minutes, and ${fmt(minutes)} minutes is ${fmt(minutes)} ÷ 60 = ${num(H)} hours.`,
          steps: [
            `Time in minutes: ${fmt(G)} ÷ ${R} = ${fmt(minutes)}.`,
            `There are 60 minutes in an hour: ${fmt(minutes)} ÷ 60 = ${num(H)}.`,
            `Check: ${R} gallons per minute is ${fmt(R * 60)} gallons per hour, and ${fmt(R * 60)} × ${num(H)} = ${fmt(G)}.`,
          ],
          trap: `${fmt(minutes)} is the time in minutes; the question asks for hours.`,
          hint: "Which unit does the rate use for time, and which unit does the question ask for?",
          check: (key) => close(key * 60 * R, G),
        };
      },
      (t) => {
        const R = t.pick([8, 10, 12, 15, 16, 20, 24, 25, 30, 40, 50]);
        const M = t.pick([1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10, 12]);
        const F = R * 60 * M;
        const seconds = F / R;
        return {
          stem: `A computer downloads a file at a constant rate of ${R} megabytes per second. The file is ${fmt(F)} megabytes. How many minutes does the download take?`,
          key: M,
          candidates: [
            [clean(seconds), `Stops at the time in seconds, ${fmt(F)} ÷ ${R} = ${fmt(seconds)}, without converting to minutes.`],
            [clean(seconds / 100), `Converts ${fmt(seconds)} seconds to minutes by moving the decimal point, as if a minute had 100 seconds.`],
            [clean((F * 60) / R), "Multiplies by 60 instead of dividing, converting between seconds and minutes in the wrong direction."],
            [clean(R * 60), `Gives the download rate in megabytes per minute, ${R} × 60, instead of the time.`],
            [clean(seconds / 3600, 3), `Divides the ${fmt(seconds)} seconds by 3,600, which converts seconds to hours, not minutes.`],
          ],
          explanation: `At ${R} megabytes per second, ${fmt(F)} megabytes take ${fmt(F)} ÷ ${R} = ${fmt(seconds)} seconds, which is ${fmt(seconds)} ÷ 60 = ${num(M)} minutes.`,
          steps: [
            `Time in seconds: ${fmt(F)} ÷ ${R} = ${fmt(seconds)}.`,
            `There are 60 seconds in a minute: ${fmt(seconds)} ÷ 60 = ${num(M)}.`,
            `Check: ${R} megabytes per second is ${fmt(R * 60)} megabytes per minute, and ${fmt(R * 60)} × ${num(M)} = ${fmt(F)}.`,
          ],
          trap: `${fmt(seconds)} is the time in seconds; the question asks for minutes.`,
          hint: "Which unit does the rate use for time, and which unit does the question ask for?",
          check: (key) => close(key * 60 * R, F),
        };
      },
    ],
    amount: [
      (t) => {
        const M = t.pick([2, 3, 4, 5, 6]);
        const Pn = t.int(5, 40);
        const H = t.int(2, 8);
        const perHour = (Pn * 60) / M;
        const key = perHour * H;
        return {
          stem: `A machine produces ${Pn} bolts every ${M} minutes. At this rate, how many bolts does the machine produce in ${H} hours?`,
          key,
          candidates: [
            [clean((Pn * H) / M, 0), `Divides by ${M} and multiplies by ${H} without converting ${H} hours to minutes.`],
            [clean(Pn * 60 * H, 0), `Treats ${Pn} bolts as the number made each minute, ignoring that they take ${M} minutes.`],
            [clean(perHour, 0), `Stops at the number made in one hour, ${fmt(perHour)}.`],
            [clean(Pn * H, 0), `Multiplies ${Pn} by ${H}, as if ${Pn} bolts were made each hour.`],
            [clean(Pn * 60 * H * M, 0), `Multiplies by the ${M} minutes instead of dividing by them.`],
            [clean((Pn * 3600 * H) / M, 0), `Converts ${H} hours to seconds, ${num(3600 * H)}, instead of minutes.`],
          ],
          explanation: `${H} hours is ${H * 60} minutes, which is ${(H * 60) / M} periods of ${M} minutes. The machine makes ${Pn} bolts in each, so ${(H * 60) / M} × ${Pn} = ${fmt(key)} bolts.`,
          steps: [
            `Convert the time: ${H} hours = ${H} × 60 = ${H * 60} minutes.`,
            `Count the ${M}-minute periods: ${H * 60} ÷ ${M} = ${(H * 60) / M}.`,
            `Multiply by ${Pn} bolts per period: ${(H * 60) / M} × ${Pn} = ${fmt(key)}.`,
          ],
          trap: `The rate is per ${M} minutes and the time is in hours; skipping the conversion gives a result 60 times too small.`,
          hint: "How many minutes are in the time asked about?",
          check: (value) => value * M === Pn * 60 * H,
        };
      },
      (t) => {
        const D = t.pick([5, 8, 10, 12, 15, 20, 25, 30, 40, 50]);
        const H = t.pick([2, 3, 4, 5, 6, 8, 10, 12, 24]);
        const ml = D * 60 * H;
        const key = ml / 1000;
        return {
          stem: `A leaking faucet drips water at a constant rate of ${D} milliliters per minute. How many liters of water drip from the faucet in ${H} hours? (1 liter = 1,000 milliliters)`,
          key,
          candidates: [
            [clean(ml), `Stops at the amount in milliliters, ${D} × ${num(H * 60)} = ${fmt(ml)}.`],
            [clean((D * H) / 1000, 3), `Multiplies ${D} by ${H} without converting hours to minutes.`],
            [clean(ml / 100), "Divides by 100 instead of 1,000 to convert milliliters to liters."],
            [clean((D * 60) / 1000, 3), "Stops at the number of liters that drip in one hour."],
            [clean((D * 3600 * H) / 1000, 3), "Multiplies by 3,600, the number of seconds in an hour, instead of 60 minutes per hour."],
            [clean(ml / 1e6, 3), "Divides by 1,000 twice, converting milliliters past liters."],
          ],
          explanation: `In ${H} hours there are ${num(H * 60)} minutes, so ${D} × ${num(H * 60)} = ${fmt(ml)} milliliters drip. That is ${fmt(ml)} ÷ 1,000 = ${num(key)} liters.`,
          steps: [
            `Convert the time: ${H} hours = ${num(H * 60)} minutes.`,
            `Milliliters: ${D} × ${num(H * 60)} = ${fmt(ml)}.`,
            `Liters: ${fmt(ml)} ÷ 1,000 = ${num(key)}.`,
          ],
          trap: "Two conversions are needed, hours to minutes and milliliters to liters; skipping either gives an answer off by a factor of 60 or 1,000.",
          hint: "Which two units in the rate differ from the units in the question?",
          check: (value) => close(value * 1000, D * 60 * H),
        };
      },
      (t) => {
        const V = t.pick([6, 8, 9, 10, 12, 15, 18, 20, 24]);
        const T = t.pick([5, 10, 12, 15, 20, 25, 30, 40, 45]);
        const key = (V * 1000 * T) / 60;
        return {
          stem: `A runner runs at a constant speed of ${V} kilometers per hour. How many meters does the runner run in ${T} minutes? (1 kilometer = 1,000 meters)`,
          key,
          candidates: [
            [clean((V * T) / 60, 2), `Stops at the distance in kilometers, ${V} × ${T}/60.`],
            [clean(V * 1000 * T, 0), `Converts kilometers to meters but multiplies by ${T} without converting minutes to hours.`],
            [clean(V * 1000, 0), "Gives the number of meters in one hour."],
            [clean(V * T, 0), `Multiplies ${V} by ${T} without converting either unit.`],
            [clean((V * 100 * T) / 60, 2), "Converts kilometers to meters by multiplying by 100 instead of 1,000."],
            [clean((V * 1000 * 60) / T, 2), `Divides by ${T}/60 of an hour instead of multiplying by it.`],
          ],
          explanation: `${T} minutes is ${T}/60 of an hour, so the runner covers ${V} × ${T}/60 = ${plural(tidy((V * T) / 60), "kilometer")}, which is ${num(tidy((V * T) / 60))} × 1,000 = ${fmt(key)} meters.`,
          steps: [
            `Convert the time: ${T} minutes = ${T}/60 hour.`,
            `Kilometers: ${V} × ${T}/60 = ${num(tidy((V * T) / 60))}.`,
            `Meters: ${num(tidy((V * T) / 60))} × 1,000 = ${fmt(key)}.`,
          ],
          trap: "The speed is in kilometers per hour, but the time is in minutes and the answer is in meters; both units must change.",
          hint: "What fraction of an hour is the time given?",
          check: (value) => close(value * 60, V * 1000 * T),
        };
      },
    ],
    cost: [
      (t) => {
        const C = t.pick([0.25, 0.4, 0.5, 0.75, 0.8, 1.25, 1.5]);
        const W = t.pick([1.5, 2, 2.5, 3, 4, 5]);
        const key = tidy(C * 16 * W);
        return {
          stem: `Coffee beans cost ${money(C)} per ounce. At this price, what is the cost, in dollars, of ${num(W)} pounds of coffee beans? (1 pound = 16 ounces)`,
          key,
          show: money,
          candidates: [
            [clean(C * W), `Multiplies the price per ounce by ${num(W)} without converting pounds to ounces.`],
            [clean(C * 16), "Stops at the price of one pound."],
            [clean((C * W) / 16), "Divides by 16 instead of multiplying, converting in the wrong direction."],
            [clean(C * 10 * W), "Uses 10 ounces per pound."],
            [clean((16 * W) / C), `Divides the ${num(16 * W)} ounces by the price per ounce instead of multiplying.`],
          ],
          explanation: `${num(W)} pounds is ${num(W)} × 16 = ${num(W * 16)} ounces, and ${num(W * 16)} ounces at ${money(C)} each cost ${num(W * 16)} × ${num(C)} = ${money(key)}.`,
          steps: [
            `Convert to ounces: ${num(W)} × 16 = ${num(W * 16)}.`,
            `Multiply by the price per ounce: ${num(W * 16)} × ${num(C)} = ${num(key)}.`,
            `Check: ${money(key)} ÷ ${num(W)} = ${money(tidy(key / W))} per pound, which is 16 × ${money(C)}.`,
          ],
          trap: "The price is per ounce but the amount is in pounds; each pound holds 16 ounces.",
          hint: "How many ounces are being bought?",
          check: (value) => close(value, C * (W * 16)),
        };
      },
      (t) => {
        const C = t.pick([0.6, 0.8, 1.2, 1.5, 2, 2.4, 3]);
        const yards = t.int(4, 20);
        const feet = yards * 3;
        const key = tidy(C * yards);
        return {
          stem: `Ribbon costs ${money(C)} per yard. What is the cost, in dollars, of ${feet} feet of ribbon? (1 yard = 3 feet)`,
          key,
          show: money,
          candidates: [
            [clean(C * feet), `Multiplies the price per yard by ${feet} without converting feet to yards.`],
            [clean(C * feet * 3), "Multiplies by 3 instead of dividing, converting in the wrong direction."],
            [clean(yards, 0), `Stops at the length in yards, ${feet} ÷ 3 = ${yards}, and gives it as the cost.`],
            [clean(C * 3), "Gives the cost of 3 yards."],
            [clean(C / 3), "Gives the price of one foot of ribbon."],
            [clean((C * yards) / 3), "Converts feet to yards and then divides by 3 again."],
          ],
          explanation: `${feet} feet is ${feet} ÷ 3 = ${yards} yards, and ${yards} yards at ${money(C)} per yard cost ${yards} × ${num(C)} = ${money(key)}.`,
          steps: [
            `Convert to yards: ${feet} ÷ 3 = ${yards}.`,
            `Multiply by the price per yard: ${yards} × ${num(C)} = ${num(key)}.`,
            `Check: the price per foot is ${num(C)} ÷ 3, and ${feet} × (${num(C)} ÷ 3) = ${num(key)}.`,
          ],
          trap: `The price is per yard but the length is in feet; ${feet} feet is only ${yards} yards.`,
          hint: "How many yards of ribbon are being bought?",
          check: (value) => close(value * 3, C * feet),
        };
      },
    ],
  };

  /* ===================================================== multi-unit-rate */

  const UNIT_PRINCIPLES = [
    "Area conversion factors are squared and volume factors are cubed: 1 square yard = 9 square feet, 1 cubic yard = 27 cubic feet.",
    "When whole items must cover or hold an amount, round up: rounding down leaves part of the job undone.",
  ];

  const COVER_YARDS = [
    { region: "A rectangular lawn", noun: "lawn", item: "bag", items: "bags", coverage: "Each bag of fertilizer treats", verb: "treat" },
    { region: "A rectangular gym floor", noun: "floor", item: "can", items: "cans", coverage: "Each can of floor finish covers", verb: "cover" },
    { region: "A rectangular parking lot", noun: "lot", item: "drum", items: "drums", coverage: "Each drum of sealant covers", verb: "seal" },
    { region: "A rectangular field", noun: "field", item: "pallet", items: "pallets", coverage: "Each pallet of sod covers", verb: "cover" },
  ];

  const TILE_ROOMS = [
    { region: "A rectangular kitchen floor", tile: "tiles" },
    { region: "A rectangular patio", tile: "pavers" },
    { region: "A rectangular hallway floor", tile: "tiles" },
    { region: "A rectangular basement floor", tile: "tiles" },
  ];

  function unitsArea(t, numeric) {
    if (t.chance(0.5)) {
      const ctx = t.pick(COVER_YARDS);
      return retry(() => {
        const L = t.int(10, 80) * 3;
        const W = t.int(8, 50) * 3;
        const C = t.pick([40, 50, 60, 75, 80, 100, 120, 150, 200, 250]);
        const sqFt = L * W;
        const sqYd = sqFt / 9;
        const exact = sqYd / C;
        if (Number.isInteger(exact) || exact < 2 || exact > 90) return null;
        const key = Math.ceil(exact);
        const perimeter = (2 * (L + W)) / 3;
        return packRanked(t, numeric, key, [
          [Math.ceil(sqFt / 3 / C), "Divides square feet by 3, but a square yard is 3 × 3 = 9 square feet."],
          [Math.floor(exact), `Rounds ${about(exact)} down, which would leave part of the ${ctx.noun} untreated.`],
          [Math.ceil(sqFt / C), "Treats the area in square feet as if it were in square yards."],
          [sqYd, `Stops at the area in square yards, ${fmt(sqYd)}, without dividing by the coverage of one ${ctx.item}.`],
          [Math.ceil(perimeter / C), `Uses the distance around the ${ctx.noun}, ${fmt(perimeter)} yards, instead of its area.`],
          [Math.ceil(sqYd / (9 * C)), `Converts the coverage to ${fmt(9 * C)} square feet but divides the area in square yards by it, mixing the two units.`],
        ], {
          stimulus: null,
          stem:
            `${ctx.region} measures ${L} feet by ${W} feet. ${ctx.coverage} ${C} square yards. What is the least number of ` +
            `${ctx.items} needed to ${ctx.verb} the entire ${ctx.noun}? (1 yard = 3 feet)`,
          explanation:
            `The ${ctx.noun} is ${L / 3} yards by ${W / 3} yards, so its area is ${fmt(sqYd)} square yards. ` +
            `${fmt(sqYd)} ÷ ${C} = ${about(exact)}, and a partial ${ctx.item} still has to be bought, so ${key} ${ctx.items} are needed.`,
          steps: [
            `Convert each side to yards: ${L} ÷ 3 = ${L / 3} and ${W} ÷ 3 = ${W / 3}.`,
            `Area: ${L / 3} × ${W / 3} = ${fmt(sqYd)} square yards (equivalently, ${fmt(sqFt)} ÷ 9).`,
            `${ctx.items.charAt(0).toUpperCase() + ctx.items.slice(1)}: ${fmt(sqYd)} ÷ ${C} = ${about(exact)}.`,
            `Round up to cover everything: ${key}.`,
          ],
          principles: UNIT_PRINCIPLES,
          trap: "Converting square feet with the linear factor 3, or rounding the quotient down, gives an offered but wrong count.",
          hint: "How many square feet are in one square yard?",
          verify: () => {
            const yards = (L / 3) * (W / 3);
            return (key - 1) * C < yards && yards <= key * C;
          },
        }, { places: 2 });
      });
    }
    const ctx = t.pick(TILE_ROOMS);
    return retry(() => {
      const s = t.pick([4, 6, 8, 9, 16, 18]);
      const L = t.int(6, 30);
      const W = t.int(5, 24);
      if ((12 * L) % s || (12 * W) % s) return null;
      const tiles = ((12 * L) / s) * ((12 * W) / s);
      const k = t.pick([10, 12, 15, 20, 24, 25, 30, 40]);
      if (tiles % k === 0) return null;
      const key = Math.ceil(tiles / k);
      if (key > 999) return null;
      const linear = Math.ceil((L * W * 12) / (s * s) / k);
      return packRanked(t, numeric, key, [
        [linear, "Converts square feet to square inches by multiplying by 12 instead of 12 × 12 = 144."],
        [Math.floor(tiles / k), `Rounds ${about(tiles / k)} down, which leaves the floor short of ${ctx.tile}.`],
        [tiles, `Stops at the number of ${ctx.tile}, ${fmt(tiles)}, instead of the number of boxes.`],
        [Math.ceil((144 * L * W) / s / k), `Divides the area in square inches by ${s}, the side of one tile, instead of by its area, ${s} × ${s}.`],
        [Math.ceil((12 * L * W) / s / k), `Treats each ${ctx.tile.slice(0, -1)} as covering ${s}/12 square foot, its side in feet, instead of (${s}/12)² square foot.`],
        [L * W, `Stops at the area of the floor in square feet, ${fmt(L * W)}.`],
      ], {
        stimulus: null,
        stem:
          `${ctx.region} measures ${L} feet by ${W} feet. It will be covered, with no gaps, overlaps, or cut pieces, by square ` +
          `${ctx.tile} that are ${s} inches on each side. The ${ctx.tile} are sold only in boxes of ${k}. What is the least ` +
          `number of boxes needed? (1 foot = 12 inches)`,
        explanation:
          `In inches it measures ${12 * L} by ${12 * W}, so it takes ${(12 * L) / s} × ${(12 * W) / s} = ${fmt(tiles)} ${ctx.tile}. ` +
          `${fmt(tiles)} ÷ ${k} = ${about(tiles / k)}, and a partly used box must still be bought: ${key} boxes.`,
        steps: [
          `Convert the sides to inches: ${L} × 12 = ${12 * L} and ${W} × 12 = ${12 * W}.`,
          `Count ${ctx.tile} along each side: ${(12 * L) / s} and ${(12 * W) / s}.`,
          `Total ${ctx.tile}: ${fmt(tiles)}; boxes: ${fmt(tiles)} ÷ ${k} = ${about(tiles / k)}.`,
          `Round up: ${key} boxes.`,
        ],
        principles: UNIT_PRINCIPLES,
        trap: "Multiplying the area in square feet by 12 converts only one dimension; a square foot is 144 square inches.",
        hint: "How many square inches are in one square foot?",
        verify: () => {
          const areaInches = 144 * L * W;
          const count = areaInches / (s * s);
          return count === tiles && (key - 1) * k < count && count <= key * k;
        },
      }, { places: 0 });
    });
  }

  const SLABS = [
    { region: "A rectangular concrete patio", noun: "patio" },
    { region: "A rectangular concrete driveway", noun: "driveway" },
    { region: "A rectangular garage floor", noun: "floor" },
    { region: "A rectangular concrete basketball court", noun: "court" },
  ];

  function unitsVolume(t, numeric) {
    if (t.chance(0.5)) {
      const ctx = t.pick(SLABS);
      return retry(() => {
        const L = t.int(10, 60);
        const W = t.int(4, 30);
        const T = t.pick([3, 4, 5, 6, 8]);
        const cubicFeet = (L * W * T) / 12;
        const cubicYards = cubicFeet / 27;
        if (Number.isInteger(cubicYards) || cubicYards < 1.2 || cubicYards > 60) return null;
        const key = Math.ceil(cubicYards);
        return packRanked(t, numeric, key, [
          [Math.ceil(cubicFeet / 9), "Divides cubic feet by 9, the square-yard factor; a cubic yard is 3 × 3 × 3 = 27 cubic feet."],
          [Math.floor(cubicYards), `Rounds ${about(cubicYards)} down, which would not be enough concrete.`],
          [Math.ceil((L * W * T) / 27), `Uses the thickness, ${T} inches, as if it were ${T} feet.`],
          [Math.ceil(cubicFeet), "Rounds the volume in cubic feet up and never converts it to cubic yards."],
        ], {
          stimulus: null,
          stem:
            `${ctx.region} will be ${L} feet long, ${W} feet wide, and ${T} inches thick. Concrete is sold only in whole cubic ` +
            `yards. What is the least number of cubic yards of concrete that must be bought to pour the ${ctx.noun}? ` +
            `(1 yard = 3 feet and 1 foot = 12 inches)`,
          explanation:
            `The thickness is ${T}/12 foot, so the volume is ${L} × ${W} × ${T}/12 = ${about(cubicFeet)} cubic feet. A cubic ` +
            `yard is 27 cubic feet, so that is ${about(cubicYards)} cubic yards; buying whole cubic yards means ${key}.`,
          steps: [
            `Convert the thickness: ${T} inches = ${frac(T, 12)} foot.`,
            `Volume: ${L} × ${W} × ${frac(T, 12)} = ${about(cubicFeet)} cubic feet.`,
            `Convert: ${about(cubicFeet)} ÷ 27 = ${about(cubicYards)} cubic yards.`,
            `Round up to whole cubic yards: ${key}.`,
          ],
          principles: UNIT_PRINCIPLES,
          trap: "A cubic yard is 27 cubic feet, not 9, and the thickness is in inches, not feet.",
          hint: "Put every length in the same unit before multiplying. How many cubic feet make a cubic yard?",
          verify: () => {
            const yards = (L / 3) * (W / 3) * (T / 36);
            return key - 1 < yards - 1e-9 && yards <= key + 1e-9;
          },
        }, { places: 0 });
      });
    }
    return retry(() => {
      const L = t.pick([60, 75, 80, 90, 100, 120]);
      const W = t.pick([30, 35, 40, 45, 50]);
      const H = t.pick([40, 45, 50, 60]);
      const g = t.pick([5, 8, 10, 12]);
      const c = t.pick([4, 5, 7.5, 8, 10, 12]);
      const depth = H - g;
      const liters = (L * W * depth) / 1000;
      const exact = liters / c;
      if (isClean(exact, 0) || exact < 3) return null;
      const key = Math.ceil(exact);
      return packRanked(t, numeric, key, [
        [Math.ceil((L * W * depth) / 100 / c), "Divides cubic centimeters by 100 instead of 1,000 to get liters."],
        [Math.floor(exact), `Rounds ${about(exact)} down, which leaves the water short of the level.`],
        [Math.ceil((L * W * H) / 1000 / c), `Fills the aquarium to the top instead of to ${g} centimeters below it.`],
        [tidy(liters), `Stops at the volume in liters, ${num(tidy(liters))}, instead of the number of fillings.`],
        [Math.ceil((L * W * g) / 1000 / c), `Uses the ${g} centimeters left empty at the top as the depth of the water.`],
      ], {
        stimulus: null,
        stem:
          `The interior of a rectangular aquarium is ${L} centimeters long, ${W} centimeters wide, and ${H} centimeters tall. ` +
          `It will be filled with water to a level ${g} centimeters below the top, using a bucket that holds ${num(c)} liters. ` +
          `What is the least number of times the bucket must be filled? (1 liter = 1,000 cubic centimeters)`,
        explanation:
          `The water is ${depth} centimeters deep, so its volume is ${L} × ${W} × ${depth} = ${fmt(L * W * depth)} cubic ` +
          `centimeters, or ${num(tidy(liters))} liters. ${num(tidy(liters))} ÷ ${num(c)} = ${about(exact)}, so the bucket must be filled ${key} times.`,
        steps: [
          `Water depth: ${H} ${MINUS} ${g} = ${depth} centimeters.`,
          `Volume: ${L} × ${W} × ${depth} = ${fmt(L * W * depth)} cubic centimeters = ${num(tidy(liters))} liters.`,
          `Fillings: ${num(tidy(liters))} ÷ ${num(c)} = ${about(exact)}.`,
          `Round up: ${key}.`,
        ],
        principles: UNIT_PRINCIPLES,
        trap: "A liter is a 10-centimeter cube, 1,000 cubic centimeters; and the water stops below the top.",
        hint: "Find the volume of the water, not of the tank, then change units.",
        verify: () => {
          const litersCheck = (L / 10) * (W / 10) * (depth / 10);
          return (key - 1) * c < litersCheck && litersCheck <= key * c;
        },
      }, { places: 1 });
    });
  }

  function unitsRain(t, numeric) {
    return retry(() => {
      const L = t.int(6, 20);
      const W = t.int(4, 15);
      const r = t.pick([2, 3, 4, 5, 6, 8, 10, 12]);
      const h = t.int(2, 6);
      const B = t.pick([150, 180, 200, 208, 220, 250]);
      const liters = L * W * r * h;
      const exact = liters / B;
      if (Number.isInteger(exact) || exact < 2 || exact > 99) return null;
      const key = Math.ceil(exact);
      const depthMm = r * h;
      return packRanked(t, numeric, key, [
        [Math.ceil((10 * liters) / B), "Converts millimeters to meters by dividing by 100 instead of 1,000."],
        [Math.floor(exact), `Rounds ${about(exact)} down, which leaves some water with nowhere to go.`],
        [Math.ceil((L * W * r) / B), `Uses the rain from one hour only, ignoring the ${h}-hour duration.`],
        [liters, `Stops at the volume of rain in liters, ${fmt(liters)}.`],
        [Math.ceil((1000 * liters) / B), `Uses the depth of rain, ${depthMm} millimeters, as if it were ${depthMm} meters.`],
      ], {
        stimulus: null,
        stem:
          `Rain fell at a constant rate of ${r} millimeters per hour for ${h} hours on a flat rectangular roof that measures ` +
          `${L} meters by ${W} meters. All of the rain that fell on the roof was collected in barrels that each hold ${B} ` +
          `liters. What is the least number of barrels needed to hold all of the collected rain? ` +
          `(1 meter = 1,000 millimeters and 1 cubic meter = 1,000 liters)`,
        explanation:
          `In ${h} hours, ${r} × ${h} = ${depthMm} millimeters, or ${num(depthMm / 1000)} meter, of rain fell. The volume is ` +
          `${L} × ${W} × ${num(depthMm / 1000)} = ${num(tidy(liters / 1000))} cubic meters = ${fmt(liters)} liters, and ` +
          `${fmt(liters)} ÷ ${B} = ${about(exact)}, so ${key} barrels are needed.`,
        steps: [
          `Depth of rain: ${r} × ${h} = ${depthMm} millimeters = ${num(depthMm / 1000)} meter.`,
          `Volume: ${L} × ${W} × ${num(depthMm / 1000)} = ${num(tidy(liters / 1000))} cubic meters.`,
          `In liters: ${num(tidy(liters / 1000))} × 1,000 = ${fmt(liters)}; barrels: ${fmt(liters)} ÷ ${B} = ${about(exact)}.`,
          `Round up: ${key}.`,
        ],
        principles: UNIT_PRINCIPLES,
        trap: "Millimeters convert to meters by 1,000, the rate runs for several hours, and a partly filled barrel still counts.",
        hint: "What volume of water does the rain form over the whole roof?",
        verify: () => {
          const areaMm2 = L * 1000 * W * 1000;
          const cubicMm = areaMm2 * depthMm;
          const litersCheck = cubicMm / 1e6;
          return (key - 1) * B < litersCheck && litersCheck <= key * B;
        },
      }, { places: 0 });
    });
  }

  const rateScaling = {
    id: "proportional-rate-scaling",
    domain: DATA,
    skill: "Ratios, rates, and units",
    subskill: "proportions",
    difficulty: "Easy",
    title: "Scaling a rate to a new amount",
    recognize:
      "At a constant rate the two quantities change by the same factor, not by the same amount: find the amount per one unit " +
      "(or the factor between the amounts) and scale.",
    rubric: { steps: 0, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "neighbouring-rule"],
    build(t) {
      const scene = t.pick(RATE_SCENES);
      const form = t.pick(["words", "words", "table", "table"]);
      const findA = t.chance(form === "table" ? 0.6 : 0.55);
      const numeric = t.chance(0.4);
      return retry(() => {
        const r = t.int(scene.rate[0], scene.rate[1]);
        const b = t.int(scene.base[0], scene.base[1]);
        const c = t.int(2, 18);
        if (c === b) return null;
        const Aq = r * c;
        let B0 = b;
        let A0 = r * b;
        let stimulus = null;
        let stem;
        let rows = null;
        if (form === "table") {
          const b2 = t.int(2, 18);
          if (b2 === b || b2 === c) return null;
          rows = [[b, r * b], [b2, r * b2], [c, Aq]].sort((p, q) => p[0] - q[0]);
          const cells = rows.map(([bb, aa]) =>
            (bb === c ? (findA ? [fmt(bb), "k"] : ["k", fmt(aa)]) : [fmt(bb), fmt(aa)]));
          stimulus = { type: "table", content: table(scene.heads, cells) };
          stem = `${scene.intro} What is the value of k?`;
          [B0, A0] = rows.filter(([bb]) => bb !== c).reduce((best, row) =>
            (Math.abs(row[0] - c) < Math.abs(best[0] - c) ? row : best));
        } else {
          stem = `${scene.given(A0, B0)} ${findA ? scene.askA(c) : scene.askB(Aq)}`;
        }
        const key = findA ? Aq : c;
        const change = c - B0;
        const candidates = findA
          ? [
            [A0 + change, `${change > 0 ? "Adds" : "Subtracts"} the change in ${scene.b}, ${Math.abs(change)}, ${change > 0 ? "to" : "from"} the ${scene.a}, as if both quantities changed by the same amount; at a constant rate they change by the same factor.`],
            [A0 * c, `Multiplies ${fmt(A0)} by ${c}, treating ${fmt(A0)} ${scene.a} as the amount for one ${scene.per} instead of for ${B0} ${scene.b}.`],
            [r, `Stops at the unit rate, ${r} ${scene.a} per ${scene.per}, without scaling it to ${c} ${scene.b}.`],
            [whole((A0 * B0) / c), `Scales by ${B0}/${c}, the ratio of the two amounts upside down.`],
          ]
          : [
            [whole(Aq / A0), `Finds that ${fmt(Aq)} is ${fmt(Aq / A0)} times ${fmt(A0)} and stops; the ${scene.b} must be multiplied by that factor too.`],
            [whole(Aq / B0), `Divides ${fmt(Aq)} by ${B0} instead of by the rate, ${r} ${scene.a} per ${scene.per}.`],
            [r, `Gives the unit rate, ${r} ${scene.a} per ${scene.per}, instead of the number of ${scene.b}.`],
            [r * Aq, `Multiplies ${fmt(Aq)} by the rate instead of dividing by it.`],
          ];
        const rateStep = `The rate is ${fmt(A0)} ÷ ${B0} = ${r} ${scene.a} per ${scene.per}.`;
        return packRanked(t, numeric, key, candidates, {
          stimulus,
          figure: null,
          stem,
          explanation: findA
            ? `${rateStep} For ${c} ${scene.b}, that is ${r} × ${c} = ${fmt(Aq)} ${scene.a}.`
            : `${rateStep} So ${fmt(Aq)} ${scene.a} corresponds to ${fmt(Aq)} ÷ ${r} = ${c} ${scene.b}.`,
          steps: [
            form === "table" ? `Any complete row gives the rate: ${rateStep}` : rateStep,
            findA ? `Multiply the rate by ${c}: ${r} × ${c} = ${fmt(Aq)}.` : `Divide by the rate: ${fmt(Aq)} ÷ ${r} = ${c}.`,
            `Check: ${fmt(Aq)} ÷ ${c} = ${r}, the same rate as ${fmt(A0)} ÷ ${B0}.`,
          ],
          principles: [
            "Quantities in a proportional relationship change by the same factor, not by the same amount.",
            "The unit rate (the amount for one unit) connects every pair of values in a proportional relationship.",
          ],
          trap: findA
            ? `Adding ${Math.abs(change)} to both quantities treats a constant rate as equal steps; the quantities grow by the same factor.`
            : `Stopping at the factor ${Aq % A0 === 0 ? fmt(Aq / A0) : "between the amounts"}, or dividing by ${B0} instead of by the rate, answers a different question.`,
          hint: scene.hint,
          estimatedSeconds: 60,
          verify: () => {
            const forward = findA ? key * B0 === A0 * c : Aq * B0 === A0 * key;
            const rowsAgree = !rows || rows.every(([bb, aa]) => aa * B0 === A0 * bb);
            return forward && rowsAgree;
          },
        }, { places: 0 });
      });
    },
  };

  const rateConversion = {
    id: "rate-unit-conversion",
    domain: DATA,
    skill: "Ratios, rates, and units",
    subskill: "unit conversion",
    difficulty: "Easy",
    title: "Rates across units of time or measure",
    recognize:
      "The rate and the question use different units. Convert once, in the right direction (a bigger unit holds more of the " +
      "smaller one), and carry the result to the unit the question asks for.",
    // Easy (relabelled from Medium, 2026-09-26 review): one rate and one
    // or two stated conversion factors, applied directly; the answer is what
    // the question asks for once the units cancel.
    rubric: { steps: 1, concept: 0, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 0 },
    tricks: ["unit-mismatch", "intermediate-value", "neighbouring-rule"],
    build(t) {
      const kind = t.pick(["time", "amount", "amount", "cost"]);
      const numeric = t.chance(0.4);
      return retry(() => {
        const scene = t.pick(CONVERSIONS[kind])(t);
        const key = scene.key;
        // A key that does not terminate would print cut off ("5,333.3333").
        if (!isClean(key, 2)) return null;
        const show = numeric ? fmt : scene.show || fmt;
        return packRanked(t, numeric, key, scene.candidates, {
          stimulus: null,
          figure: null,
          stem: scene.stem,
          explanation: scene.explanation,
          steps: scene.steps,
          principles: [
            "A conversion factor is a ratio equal to 1, such as 60 minutes per 1 hour; multiply or divide so the unwanted unit cancels.",
            "Check the direction: a count of the smaller unit is larger than the same amount measured in the bigger unit.",
          ],
          trap: scene.trap,
          hint: scene.hint,
          estimatedSeconds: 90,
          verify: () => scene.check(key),
        }, { show, places: 3 });
      });
    },
  };

  const multiUnitRate = {
    id: "multi-unit-rate",
    domain: DOMAIN,
    skill: "Ratios, rates, and units",
    subskill: "unit conversion",
    difficulty: "Medium",
    title: "Multi-step conversions with area and volume units",
    recognize:
      "Area and volume units convert by the square and the cube of the length factor, every quantity must be in one unit " +
      "system before combining, and a count of whole containers rounds up.",
    // Medium: the conversion factors are printed and the structure is a
    // chain of steps; nothing has to be recognized before computing.
    rubric: { steps: 2, concept: 1, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 1, trap: 2 },
    tricks: ["unit-mismatch", "rounding-direction", "intermediate-value", "wrong-quantity"],
    build(t) {
      const form = t.int(0, 2);
      const numeric = t.chance(0.45);
      const instance = [unitsArea, unitsVolume, unitsRain][form](t, numeric);
      return { estimatedSeconds: 110, ...instance };
    },
  };

  /* ======================================= ratio-share-of-total (Easy) */

  // A whole made of exactly two kinds of thing. `amt(i)` names an amount of
  // kind i; the other fields finish the sentences a stem needs.
  const SHARE_SCENES = [
    {
      names: ["string players", "wind players"], m: [2, 12], step: 1,
      amt: (i, names) => names[i],
      intro: (r) => `Each member of a school orchestra plays either a string instrument or a wind instrument, and the ratio of string players to wind players in the orchestra is ${r}.`,
      per: (a, b) => `Each member of a school orchestra plays either a string instrument or a wind instrument, and the orchestra has ${a} string players for every ${b} wind players.`,
      total: (T) => `The orchestra has ${fmt(T)} members.`,
      has: (x, what) => `The orchestra has ${fmt(x)} ${what}.`,
      place: "in the orchestra",
      askTotal: "How many members does the orchestra have?",
      askFrac: (what) => `What fraction of the orchestra's members are ${what}?`,
    },
    {
      names: ["dogs", "cats"], m: [2, 12], step: 1,
      amt: (i, names) => names[i],
      intro: (r) => `An animal shelter houses only dogs and cats, and the ratio of dogs to cats at the shelter is ${r}.`,
      per: (a, b) => `An animal shelter houses only dogs and cats, and it has ${a} dogs for every ${b} cats.`,
      total: (T) => `There are ${fmt(T)} animals at the shelter.`,
      has: (x, what) => `There are ${fmt(x)} ${what} at the shelter.`,
      place: "at the shelter",
      askTotal: "How many animals are at the shelter?",
      askFrac: (what) => `What fraction of the animals at the shelter are ${what}?`,
    },
    {
      names: ["peanuts", "raisins"], m: [2, 9], step: 10,
      amt: (i, names) => `grams of ${names[i]}`,
      intro: (r) => `A trail mix is made of only peanuts and raisins, mixed in a ratio of ${r} by weight.`,
      per: (a, b) => `A trail mix is made of only peanuts and raisins, with ${a} grams of peanuts for every ${b} grams of raisins.`,
      total: (T) => `A bag of the trail mix weighs ${fmt(T)} grams.`,
      has: (x, what) => `A bag of the trail mix contains ${fmt(x)} ${what}.`,
      place: "in the bag",
      askTotal: "What is the weight, in grams, of the bag of trail mix?",
      askFrac: (what) => `What fraction of the weight of the trail mix is ${what}?`,
    },
    {
      names: ["blue paint", "white paint"], m: [1, 6], step: 1, be: "is",
      amt: (i, names) => `liters of ${names[i]}`,
      intro: (r) => `A shade of light blue paint is made by mixing only blue paint and white paint in a ratio of ${r} by volume.`,
      per: (a, b) => `A shade of light blue paint is made by mixing only blue paint and white paint, using ${a} liters of blue paint for every ${b} liters of white paint.`,
      total: (T) => `A painter mixes a batch of ${fmt(T)} liters of the light blue paint.`,
      has: (x, what) => `A painter mixes a batch of the light blue paint using ${fmt(x)} ${what}.`,
      place: "in the batch",
      askTotal: "How many liters of light blue paint are in the batch?",
      askFrac: (what) => `What fraction of the light blue paint, by volume, is ${what}?`,
    },
    {
      names: ["vegetable plots", "flower plots"], m: [2, 10], step: 1,
      amt: (i, names) => names[i],
      intro: (r) => `A community garden is divided into only vegetable plots and flower plots, and the ratio of vegetable plots to flower plots is ${r}.`,
      per: (a, b) => `A community garden is divided into only vegetable plots and flower plots, with ${a} vegetable plots for every ${b} flower plots.`,
      total: (T) => `The garden has ${fmt(T)} plots.`,
      has: (x, what) => `The garden has ${fmt(x)} ${what}.`,
      place: "in the garden",
      askTotal: "How many plots are in the garden?",
      askFrac: (what) => `What fraction of the plots in the garden are ${what}?`,
    },
    {
      names: ["tomato plants", "pepper plants"], m: [3, 40], step: 1,
      amt: (i, names) => names[i],
      intro: (r) => `A greenhouse grows only tomato plants and pepper plants, and the ratio of tomato plants to pepper plants is ${r}.`,
      per: (a, b) => `A greenhouse grows only tomato plants and pepper plants, with ${a} tomato plants for every ${b} pepper plants.`,
      total: (T) => `The greenhouse has ${fmt(T)} plants.`,
      has: (x, what) => `The greenhouse has ${fmt(x)} ${what}.`,
      place: "in the greenhouse",
      askTotal: "How many plants are in the greenhouse?",
      askFrac: (what) => `What fraction of the plants in the greenhouse are ${what}?`,
    },
    {
      names: ["nickels", "dimes"], m: [3, 30], step: 1,
      amt: (i, names) => names[i],
      intro: (r) => `A jar holds only nickels and dimes, and the ratio of nickels to dimes in the jar is ${r}.`,
      per: (a, b) => `A jar holds only nickels and dimes, with ${a} nickels for every ${b} dimes.`,
      total: (T) => `The jar holds ${fmt(T)} coins.`,
      has: (x, what) => `The jar holds ${fmt(x)} ${what}.`,
      place: "in the jar",
      askTotal: "How many coins are in the jar?",
      askFrac: (what) => `What fraction of the coins in the jar are ${what}?`,
    },
  ];

  // Counts (x, y) of the two kinds with x + y = total and x : y = a : b, found
  // by trying every split rather than by dividing into shares.
  function splitBySearch(total, a, b) {
    for (let x = 0; x <= total; x += 1) {
      if (x * b === (total - x) * a) return [x, total - x];
    }
    return null;
  }

  const ratioShare = {
    id: "ratio-share-of-total",
    domain: DATA,
    skill: "Ratios, rates, and units",
    subskill: "proportions",
    difficulty: "Easy",
    title: "Splitting a whole in a given ratio",
    recognize:
      "A ratio a to b compares the two parts with each other, not with the whole: the whole is a + b equal shares, and each " +
      "part is its number of shares.",
    rubric: { steps: 1, concept: 0, interpretation: 0, distractors: 1, abstraction: 0, synthesis: 0, trap: 1 },
    tricks: ["part-vs-whole", "intermediate-value"],
    build(t) {
      const scene = t.pick(SHARE_SCENES);
      const numeric = t.chance(0.3);
      const form = numeric ? t.pick(["part", "part", "total", "more"]) : t.pick(["part", "part", "total", "more", "fraction"]);
      const style = t.pick(["to", "colon", "per"]);
      return retry(() => {
        const a = t.int(2, 9);
        const b = t.int(2, 9);
        if (a === b || S.gcd(a, b) !== 1) return null;
        const r = [a, b];
        // A one-share difference would make "how many more" a single division.
        if (form === "more" && Math.abs(a - b) < 2) return null;
        const i = form === "more" ? (a > b ? 0 : 1) : t.int(0, 1);
        const j = 1 - i;
        const shares = a + b;
        // Parts must be whole counts, and the part-to-part slip must be too.
        const s = t.int(1, 6);
        const m = s * r[j] * scene.step;
        if (m / scene.step < scene.m[0] || m / scene.step > scene.m[1] * 2) return null;
        const T = m * shares;
        const parts = [m * a, m * b];
        const what = (k) => scene.amt(k, scene.names);
        const ratioWords = style === "colon" ? `${a}:${b}` : `${a} to ${b}`;
        const intro = style === "per" ? scene.per(a, b) : scene.intro(ratioWords);
        const shareStep = `The ratio ${a} to ${b} splits the whole into ${a} + ${b} = ${shares} equal shares.`;
        const principles = [
          "A part-to-part ratio a : b means the whole is a + b equal shares; the parts are a shares and b shares.",
          "A fraction of the whole compares a part with a + b, not with the other part.",
        ];
        const hint = "Into how many equal shares does the ratio divide the whole?";
        if (form === "fraction") {
          const keyText = S.frac(r[i], shares);
          // A fraction of a whole is below 1, so part-to-part ratios above 1
          // would be free eliminations; one share of the whole replaces them.
          const partial = [
            [r[i] < r[j] ? S.frac(r[i], r[j]) : null, `Compares the ${scene.names[i]} with the ${scene.names[j]}, a part-to-part ratio, instead of with the whole.`],
            [S.frac(r[j], shares), `Gives the fraction that is ${scene.names[j]}, the other part.`],
            [r[j] < r[i] ? S.frac(r[j], r[i]) : null, `Compares the ${scene.names[j]} with the ${scene.names[i]}, a part-to-part ratio turned upside down.`],
            [S.frac(1, shares), `Gives the fraction that one share is of the whole, without counting the ${r[i]} shares that are ${scene.names[i]}.`],
          ].filter(([text]) => text);
          return packStrict(false, null, keyText, partial, {
            stimulus: null,
            figure: null,
            stem: `${intro} ${scene.askFrac(scene.names[i])}`,
            explanation: `${shareStep} The ${scene.names[i]} ${scene.be || "are"} ${r[i]} of those shares: ${keyText} of the whole.`,
            steps: [
              `Count the shares in the whole: ${a} + ${b} = ${shares}.`,
              `The ${scene.names[i]} ${scene.be || "are"} ${r[i]} of the ${shares} shares: ${keyText}.`,
            ],
            principles,
            trap: `${S.frac(r[i], r[j])} compares one part with the other part; the question asks for a fraction of the whole.`,
            hint,
            estimatedSeconds: 50,
            verify: () => {
              const split = splitBySearch(shares * 7, a, b);
              return Boolean(split) && close(C.fractionValue(keyText), split[i] / (shares * 7));
            },
          });
        }
        if (form === "part") {
          const key = parts[i];
          return packRanked(t, numeric, key, [
            [whole(T * r[i] / r[j]), `Takes ${r[i]}/${r[j]} of ${fmt(T)}, treating the part-to-part ratio as a fraction of the whole.`],
            [parts[j], `Gives the amount of ${scene.names[j]}, the other part.`],
            [m, `Stops at the size of one share, ${fmt(T)} ÷ ${shares} = ${fmt(m)}.`],
            [whole(T / r[i]), `Divides ${fmt(T)} by ${r[i]}, the ${scene.names[i]}'s term of the ratio, instead of by ${shares} shares.`],
            [T, `Gives the whole, ${fmt(T)}, instead of the part that is ${scene.names[i]}.`],
            [whole(T / 2), `Splits the whole equally between the two kinds, ignoring the ratio.`],
          ], {
            stimulus: null,
            figure: null,
            stem: `${intro} ${scene.total(T)} How many ${what(i)} are ${scene.place}?`,
            explanation: `${shareStep} Each share is ${fmt(T)} ÷ ${shares} = ${fmt(m)}, and the ${scene.names[i]} ${scene.be || "are"} ${r[i]} shares: ${r[i]} × ${fmt(m)} = ${fmt(key)}.`,
            steps: [
              `Count the shares in the whole: ${a} + ${b} = ${shares}.`,
              `One share: ${fmt(T)} ÷ ${shares} = ${fmt(m)}.`,
              `The ${scene.names[i]}: ${r[i]} × ${fmt(m)} = ${fmt(key)}.`,
            ],
            principles,
            trap: `${r[i]}/${r[j]} of ${fmt(T)} uses the other part as if it were the whole; the whole is ${shares} shares.`,
            hint,
            estimatedSeconds: 60,
            verify: () => {
              const split = splitBySearch(T, a, b);
              return Boolean(split) && split[i] === key;
            },
          });
        }
        if (form === "total") {
          const x = parts[i];
          const key = T;
          return packRanked(t, numeric, key, [
            [whole(x * shares / r[j]), `Divides by ${r[j]}, the ${scene.names[j]}'s number of shares, instead of by ${r[i]}.`],
            [x * shares, `Multiplies ${fmt(x)} by ${shares}, treating ${fmt(x)} as one share instead of ${r[i]} shares.`],
            [parts[j], `Gives the amount of ${scene.names[j]}, not the whole.`],
            [m, `Stops at the size of one share, ${fmt(x)} ÷ ${r[i]} = ${fmt(m)}.`],
            [x + r[j], `Adds the ${scene.names[j]}'s term of the ratio, ${r[j]}, to ${fmt(x)}, as if it were a count.`],
            [T + x, `Finds the whole, ${fmt(T)}, and then adds the ${fmt(x)} ${scene.names[i]} again, counting them twice.`],
          ], {
            stimulus: null,
            figure: null,
            stem: `${intro} ${scene.has(x, what(i))} ${scene.askTotal}`,
            explanation: `The ${scene.names[i]} ${scene.be || "are"} ${r[i]} of ${shares} equal shares, so one share is ${fmt(x)} ÷ ${r[i]} = ${fmt(m)} and the whole is ${shares} × ${fmt(m)} = ${fmt(key)}.`,
            steps: [
              `The ${scene.names[i]} ${scene.be || "are"} ${r[i]} shares: one share is ${fmt(x)} ÷ ${r[i]} = ${fmt(m)}.`,
              `The whole is ${a} + ${b} = ${shares} shares: ${shares} × ${fmt(m)} = ${fmt(key)}.`,
            ],
            principles,
            trap: `${fmt(x)} is ${r[i]} shares, not one; and adding the ${scene.names[j]} is needed to reach the whole.`,
            hint,
            estimatedSeconds: 60,
            verify: () => {
              for (let whole = x; whole <= x * shares; whole += 1) {
                const split = splitBySearch(whole, a, b);
                if (split && split[i] === x) return whole === key;
              }
              return false;
            },
          });
        }
        const key = parts[i] - parts[j];
        return packRanked(t, numeric, key, [
          [r[i] - r[j], `Gives the difference between the ratio's terms, ${r[i]} ${MINUS} ${r[j]}, not between the amounts.`],
          [parts[i], `Gives the amount of ${scene.names[i]} instead of the difference.`],
          [parts[j], `Gives the amount of ${scene.names[j]} instead of the difference.`],
          [whole(T * (r[i] - r[j]) / r[i]), `Takes (${r[i]} ${MINUS} ${r[j]})/${r[i]} of the whole, using the larger part's shares as the whole.`],
          [m, `Stops at the size of one share, ${fmt(T)} ÷ ${shares} = ${fmt(m)}.`],
          [T, `Gives the whole, ${fmt(T)}, instead of the difference between the parts.`],
        ], {
          stimulus: null,
          figure: null,
          stem: `${intro} ${scene.total(T)} How many more ${what(i)} than ${what(j)} are ${scene.place}?`,
          explanation: `${shareStep} One share is ${fmt(T)} ÷ ${shares} = ${fmt(m)}. The ${scene.names[i]} ${scene.be || "are"} ${r[i]} ${MINUS} ${r[j]} = ${plural(r[i] - r[j], "share")} more than the ${scene.names[j]}: ${r[i] - r[j]} × ${fmt(m)} = ${fmt(key)}.`,
          steps: [
            `One share: ${fmt(T)} ÷ ${shares} = ${fmt(m)}.`,
            `Parts: ${a} × ${fmt(m)} = ${fmt(parts[0])} and ${b} × ${fmt(m)} = ${fmt(parts[1])}.`,
            `Difference: ${fmt(parts[i])} ${MINUS} ${fmt(parts[j])} = ${fmt(key)}.`,
          ],
          principles,
          trap: `${r[i] - r[j]} is the difference in shares; each share stands for ${fmt(m)}.`,
          hint,
          estimatedSeconds: 60,
          verify: () => {
            const split = splitBySearch(T, a, b);
            return Boolean(split) && split[i] - split[j] === key;
          },
        });
      });
    },
  };

  /* ===================================== ratio-after-change (Medium) */

  // Two kinds in a known ratio; some of one kind are added or removed and
  // the ratio changes. `now` and `then` finish "How many <kind> ...".
  const CHANGE_SCENES = [
    {
      names: ["adult members", "youth members"], whole: "members",
      before: (r) => `At a community rowing club, the ratio of adult members to youth members was ${r}.`,
      add: (d, what) => `Then ${d} new ${what} joined the club, and no members left.`,
      remove: (d, what) => `Then ${d} ${what} left the club, and no new members joined.`,
      after: (r) => `The ratio of adult members to youth members became ${r}.`,
      now: "does the club have now", then: "did the club have before the change",
    },
    {
      names: ["fiction books", "nonfiction books"], whole: "books",
      before: (r) => `On a library display, the ratio of fiction books to nonfiction books was ${r}.`,
      add: (d, what) => `A librarian then added ${d} ${what} to the display and removed none.`,
      remove: (d, what) => `A librarian then removed ${d} ${what} from the display and added none.`,
      after: (r) => `The ratio of fiction books to nonfiction books on the display became ${r}.`,
      now: "are on the display now", then: "were on the display before the change",
    },
    {
      names: ["maple saplings", "oak saplings"], whole: "saplings",
      before: (r) => `At a tree nursery, the ratio of maple saplings to oak saplings was ${r}.`,
      add: (d, what) => `A delivery then brought ${d} more ${what}, and no saplings were sold.`,
      remove: (d, what) => `The nursery then sold ${d} ${what} and received no new saplings.`,
      after: (r) => `The ratio of maple saplings to oak saplings at the nursery became ${r}.`,
      now: "does the nursery have now", then: "did the nursery have before the change",
    },
    {
      names: ["rock songs", "jazz songs"], whole: "songs",
      before: (r) => `In Dev's playlist, the ratio of rock songs to jazz songs was ${r}.`,
      add: (d, what) => `Dev then added ${d} ${what} to the playlist and deleted none.`,
      remove: (d, what) => `Dev then deleted ${d} ${what} from the playlist and added none.`,
      after: (r) => `The ratio of rock songs to jazz songs in the playlist became ${r}.`,
      now: "are in the playlist now", then: "were in the playlist before the change",
    },
    {
      names: ["neon tetras", "guppies"], whole: "fish",
      before: (r) => `In an aquarium tank, the ratio of neon tetras to guppies was ${r}.`,
      add: (d, what) => `Then ${d} more ${what} were put in the tank, and no fish were taken out.`,
      remove: (d, what) => `Then ${d} of the ${what} were moved to another tank, and no fish were added.`,
      after: (r) => `The ratio of neon tetras to guppies in the tank became ${r}.`,
      now: "are in the tank now", then: "were in the tank before the change",
    },
    {
      names: ["middle school teams", "high school teams"], whole: "teams",
      before: (r) => `For a robotics competition, the ratio of registered middle school teams to registered high school teams was ${r}.`,
      add: (d, what) => `Then ${d} more ${what} registered, and no teams withdrew.`,
      remove: (d, what) => `Then ${d} ${what} withdrew, and no new teams registered.`,
      after: (r) => `The ratio of registered middle school teams to registered high school teams became ${r}.`,
      now: "are registered now", then: "were registered before the change",
    },
  ];

  const ratioAfterChange = {
    id: "ratio-after-change",
    domain: DATA,
    skill: "Ratios, rates, and units",
    subskill: "proportions",
    difficulty: "Medium",
    title: "A ratio before and after a change",
    recognize:
      "Write the original amounts as multiples of one unknown share size from the first ratio, apply the change to one of " +
      "them, and set the result equal to the second ratio; the share size is a step, not the answer.",
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 1, abstraction: 1, synthesis: 0, trap: 1 },
    tricks: ["intermediate-value", "wrong-quantity"],
    build(t) {
      const scene = t.pick(CHANGE_SCENES);
      const numeric = t.chance(0.35);
      const ask = t.pick(["fixed", "changedNow", "changedThen", "totalNow"]);
      const adding = t.chance(0.55);
      const colon = t.chance(0.3);
      return retry(() => {
        const a = t.int(1, 9);
        const b = t.int(1, 9);
        if (a === b || S.gcd(a, b) !== 1) return null;
        const k = t.int(3, 24);
        const i = t.int(0, 1);
        const j = 1 - i;
        const r = [a, b];
        const before = [a * k, b * k];
        const d = t.int(2, 48);
        if (!adding && d >= before[i]) return null;
        const after = before.slice();
        after[i] += adding ? d : -d;
        const g = S.gcd(after[0], after[1]);
        const nr = [after[0] / g, after[1] / g];
        if (nr[0] > 12 || nr[1] > 12 || (nr[0] === a && nr[1] === b)) return null;
        const words = (p, q) => (colon ? `${p}:${q}` : `${p} to ${q}`);
        const key = ask === "fixed" ? before[j] : ask === "changedNow" ? after[i] : ask === "changedThen" ? before[i] : after[0] + after[1];
        if (key === k) return null;
        const askText = ask === "fixed"
          ? `How many ${scene.names[j]} ${scene.now}?`
          : ask === "changedNow"
            ? `How many ${scene.names[i]} ${scene.now}?`
            : ask === "changedThen"
              ? `How many ${scene.names[i]} ${scene.then}?`
              : `How many ${scene.whole} ${scene.now}?`;
        // The share-size slip: the ratio's term for the changed kind moved
        // from r[i] to nr[i], as if both ratios used shares of the same size.
        const termGap = Math.abs(nr[i] - r[i]);
        const slipShare = termGap ? d / termGap : NaN;
        const slip = Number.isInteger(slipShare)
          ? (ask === "fixed" ? r[j] * slipShare : ask === "changedThen" ? r[i] * slipShare : ask === "changedNow" ? nr[i] * slipShare : (nr[0] + nr[1]) * slipShare)
          : NaN;
        const candidates = [
          [shown(k, 0), `Stops at the size of one share in the original ratio, ${k}.`],
          ask === "changedNow" ? [shown(before[i], 0), `Gives the number of ${scene.names[i]} before the change, not now.`] : null,
          ask === "changedThen" ? [shown(after[i], 0), `Gives the number of ${scene.names[i]} after the change, not before it.`] : null,
          ask === "totalNow" ? [shown(before[0] + before[1], 0), "Gives the total before the change, not now."] : null,
          [slip > 0 && slip !== key ? shown(slip, 0) : null, `Treats the ${d} ${scene.names[i]} as the change in the ratio's term, ${r[i]} to ${nr[i]}, as if both ratios used shares of the same size.`],
          [shown(ask === "fixed" ? after[i] : after[j], 0), ask === "totalNow"
            ? `Gives the number of ${scene.names[j]} alone, not the total.`
            : `Gives the number of ${ask === "fixed" ? scene.names[i] : scene.names[j]}, the other kind.`],
          [shown(g, 0), `Gives the size of one share in the new ratio, ${g}.`],
        ].filter(Boolean);
        const change = adding ? scene.add(d, scene.names[i]) : scene.remove(d, scene.names[i]);
        const sign = adding ? "+" : MINUS;
        const lhs = i === 0 ? `(${a}k ${sign} ${d}) : ${b}k` : `${a}k : (${b}k ${sign} ${d})`;
        const cross = i === 0
          ? `${nr[1]}(${a}k ${sign} ${d}) = ${nr[0]}(${b}k)`
          : `${nr[1]}(${a}k) = ${nr[0]}(${b}k ${sign} ${d})`;
        return packStrict(numeric, key, fmt(key), candidates, {
          stimulus: null,
          figure: null,
          stem: `${scene.before(words(a, b))} ${change} ${scene.after(words(nr[0], nr[1]))} ${askText}`,
          explanation:
            `Let the original numbers be ${a}k ${scene.names[0]} and ${b}k ${scene.names[1]}. After the change the ratio ${lhs} equals ` +
            `${nr[0]} : ${nr[1]}, so ${cross}, which gives k = ${k}. Before the change there were ${fmt(before[0])} and ${fmt(before[1])}; ` +
            `now there are ${fmt(after[0])} and ${fmt(after[1])}. The answer is ${fmt(key)}.`,
          steps: [
            `Write the original amounts with one share size k: ${a}k and ${b}k.`,
            `Apply the change and set up the new ratio: ${cross}.`,
            `Solve: k = ${k}, so the original amounts were ${fmt(before[0])} and ${fmt(before[1])}.`,
            `After the change: ${fmt(after[0])} and ${fmt(after[1])}; the question asks for ${fmt(key)}.`,
          ],
          principles: [
            "Amounts in the ratio a : b can be written ak and bk for one share size k.",
            "A ratio reduced to lowest terms hides the share size, so the two ratios need not use the same k.",
          ],
          trap: `k = ${k} is the share size, not a count of ${scene.whole}; and the question asks about ${ask === "changedThen" ? "before" : "after"} the change.`,
          hint: "Describe the original amounts with a single unknown, then write the new ratio in terms of it.",
          estimatedSeconds: 100,
          verify: () => {
            const found = [];
            for (let share = 1; share <= 400; share += 1) {
              const counts = [a * share, b * share];
              counts[i] += adding ? d : -d;
              if (counts[i] >= 0 && counts[0] * nr[1] === counts[1] * nr[0]) found.push(share);
            }
            if (found.length !== 1) return false;
            const was = [a * found[0], b * found[0]];
            const is = was.slice();
            is[i] += adding ? d : -d;
            const expected = ask === "fixed" ? is[j] : ask === "changedNow" ? is[i] : ask === "changedThen" ? was[i] : is[0] + is[1];
            return expected === key && was[j] === is[j];
          },
        });
      });
    },
  };

  /* =================================== average-rate-two-legs (Hard) */

  const TRIPS = [
    {
      who: "Priya", unit: "miles", rate: "miles per hour", v: [24, 72], D: [30, 240], Dstep: 6,
      out: (D, v) => `Priya drove ${D} miles from her home to a lake at an average speed of ${v} miles per hour.`,
      back: (v) => `She drove home along the same route at an average speed of ${v} miles per hour.`,
      backPlain: "She drove home along the same route.",
      whole: "her entire round trip", legBack: "her drive home",
    },
    {
      who: "A cyclist", unit: "kilometers", rate: "kilometers per hour", v: [8, 36], D: [12, 60], Dstep: 3, outSlower: true,
      out: (D, v) => `A cyclist rode ${D} kilometers up a mountain road at an average speed of ${v} kilometers per hour.`,
      back: (v) => `The cyclist then rode back down the same road at an average speed of ${v} kilometers per hour.`,
      backPlain: "The cyclist then rode back down the same road.",
      whole: "the entire ride up and back", legBack: "the ride back down",
    },
    {
      who: "A ferry", unit: "kilometers", rate: "kilometers per hour", v: [12, 40], D: [12, 72], Dstep: 6,
      out: (D, v) => `A ferry crossed a lake, a distance of ${D} kilometers, at an average speed of ${v} kilometers per hour.`,
      back: (v) => `It returned along the same route at an average speed of ${v} kilometers per hour.`,
      backPlain: "It returned along the same route.",
      whole: "the entire round trip", legBack: "the return crossing",
    },
    {
      who: "A delivery drone", unit: "kilometers", rate: "kilometers per hour", v: [20, 60], D: [6, 30], Dstep: 3,
      out: (D, v) => `A delivery drone flew ${D} kilometers to drop off a package, averaging ${v} kilometers per hour.`,
      back: (v) => `It flew back along the same path, averaging ${v} kilometers per hour.`,
      backPlain: "It flew back along the same path.",
      whole: "the entire round trip", legBack: "the flight back",
    },
  ];

  const LEGS = [
    {
      noun: "a freight train", unit: "miles", rate: "miles per hour", v: [30, 70],
      story: (t1, v1, d2, v2) => `A freight train traveled for ${hours(t1)} at an average speed of ${v1} miles per hour and then traveled another ${d2} miles at an average speed of ${v2} miles per hour.`,
      ask: "What was the train's average speed, in miles per hour, for the whole trip?",
    },
    {
      noun: "a tour bus", unit: "miles", rate: "miles per hour", v: [25, 65],
      story: (t1, v1, d2, v2) => `A tour bus drove for ${hours(t1)} on a highway at an average speed of ${v1} miles per hour and then drove ${d2} miles on local roads at an average speed of ${v2} miles per hour.`,
      ask: "What was the bus's average speed, in miles per hour, for the whole trip?",
    },
    {
      noun: "a trail runner", unit: "kilometers", rate: "kilometers per hour", v: [6, 15],
      story: (t1, v1, d2, v2) => `A trail runner ran for ${hours(t1)} at an average speed of ${v1} kilometers per hour and then ran ${d2} more kilometers at an average speed of ${v2} kilometers per hour.`,
      ask: "What was the runner's average speed, in kilometers per hour, for the whole run?",
    },
  ];

  const FUEL = [
    {
      noun: "A delivery van",
      story: (d1, e1, d2, e2) => `On one day, a delivery van was driven ${d1} miles on highways, where it averaged ${e1} miles per gallon of gasoline, and ${d2} miles in city traffic, where it averaged ${e2} miles per gallon.`,
      ask: "For the day's driving, what was the van's average number of miles per gallon of gasoline?",
    },
    {
      noun: "A pickup truck",
      story: (d1, e1, d2, e2) => `On a trip, a pickup truck traveled ${d1} miles while towing a trailer, averaging ${e1} miles per gallon of gasoline, and ${d2} miles without the trailer, averaging ${e2} miles per gallon.`,
      ask: "For the whole trip, what was the truck's average number of miles per gallon of gasoline?",
    },
  ];

  const hours = (value) => `${num(value)} ${value === 1 ? "hour" : "hours"}`;

  const AVERAGE_PRINCIPLES = [
    "An average rate is the total amount divided by the total time (or total distance by total fuel), not the mean of the rates.",
    "When the parts take different times, each rate counts in proportion to its time, so the average leans toward the slower rate.",
  ];

  function averageRoundTrip(t, numeric) {
    const ctx = t.pick(TRIPS);
    return retry(() => {
      const v1 = t.int(ctx.v[0], ctx.v[1]);
      const v2 = t.int(ctx.v[0], ctx.v[1]);
      if (Math.abs(v1 - v2) < 4 || (ctx.outSlower && v1 > v2)) return null;
      const D = t.int(Math.ceil(ctx.D[0] / ctx.Dstep), Math.floor(ctx.D[1] / ctx.Dstep)) * ctx.Dstep;
      const t1 = D / v1;
      const t2 = D / v2;
      if (!isClean(t1, 2) || !isClean(t2, 2)) return null;
      const key = tidy((2 * D) / (t1 + t2));
      if (!isClean(key, 2)) return null;
      const mean = tidy((v1 + v2) / 2);
      const totalTime = tidy(t1 + t2);
      return packRanked(t, numeric, key, [
        [mean, `Averages the two speeds, ${v1} and ${v2}, though the ${v1 < v2 ? "first" : "second"} leg, the slower one, lasts longer.`],
        [tidy(D / totalTime), `Divides the one-way distance, ${D} ${ctx.unit}, by the total time; the round trip is ${2 * D} ${ctx.unit}.`],
        [totalTime, `Stops at the total time, ${plural(totalTime, "hour")}.`],
        [2 * D, `Stops at the total distance, ${2 * D} ${ctx.unit}.`],
        [Math.min(v1, v2), `Gives the slower of the two speeds, as if the whole trip were made at that speed.`],
        [2 * Math.max(v1, v2), `Divides the round-trip distance by the time for the faster leg alone.`],
      ], {
        stimulus: null,
        stem: `${ctx.out(D, v1)} ${ctx.back(v2)} What was the average speed, in ${ctx.rate}, for ${ctx.whole}?`,
        explanation:
          `The trip out took ${D} ÷ ${v1} = ${plural(tidy(t1), "hour")} and the trip back took ${D} ÷ ${v2} = ${plural(tidy(t2), "hour")}. ` +
          `The average speed is the total distance over the total time: ${2 * D} ÷ ${num(totalTime)} = ${num(key)} ${ctx.rate}.`,
        steps: [
          `Time out: ${D} ÷ ${v1} = ${plural(tidy(t1), "hour")}; time back: ${D} ÷ ${v2} = ${plural(tidy(t2), "hour")}.`,
          `Total time: ${plural(totalTime, "hour")}; total distance: ${2 * D} ${ctx.unit}.`,
          `Average speed: ${2 * D} ÷ ${num(totalTime)} = ${num(key)}.`,
        ],
        principles: AVERAGE_PRINCIPLES,
        trap: `The mean of the speeds, ${num(mean)}, weights both legs equally, but more time is spent at the slower speed.`,
        hint: "How long did each leg take?",
        // The closed form for equal distances: twice the product over the sum.
        verify: () => close((2 * v1 * v2) / (v1 + v2), key) && !close(key, mean),
      }, { show: num });
    });
  }

  function averageMixedLegs(t, numeric) {
    const ctx = t.pick(LEGS);
    return retry(() => {
      const t1 = t.pick([1, 1.5, 2, 2.5, 3, 4]);
      const v1 = t.int(ctx.v[0], ctx.v[1]);
      const v2 = t.int(ctx.v[0], ctx.v[1]);
      if (Math.abs(v1 - v2) < 4) return null;
      const t2 = t.pick([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]);
      if (t2 === t1) return null;
      const d1 = v1 * t1;
      const d2 = v2 * t2;
      if (!Number.isInteger(d1) || !Number.isInteger(d2)) return null;
      const key = tidy((d1 + d2) / (t1 + t2));
      if (!isClean(key, 2)) return null;
      const mean = tidy((v1 + v2) / 2);
      const byDistance = tidy((d1 * v1 + d2 * v2) / (d1 + d2));
      return packRanked(t, numeric, key, [
        [mean, `Averages the two speeds, ${v1} and ${v2}, though the two parts of the trip took different times.`],
        [byDistance, `Weights each speed by its distance instead of its time.`],
        [tidy((2 * v1 * v2) / (v1 + v2)), `Uses 2(${v1})(${v2})/(${v1} + ${v2}), which holds only when both parts cover the same distance.`],
        [d1 + d2, `Stops at the total distance, ${d1 + d2} ${ctx.unit}.`],
        [tidy(t1 + t2), `Stops at the total time, ${plural(tidy(t1 + t2), "hour")}.`],
        [tidy((d1 + d2) / 2), `Divides the total distance by 2, the number of parts, instead of by the total time.`],
        [v1 + v2, `Adds the two speeds.`],
        [t1 > t2 ? v1 : v2, `Gives the speed of the part that took longer, as if it set the average.`],
      ], {
        stimulus: null,
        stem: `${ctx.story(t1, v1, d2, v2)} ${ctx.ask}`,
        explanation:
          `The first part covered ${v1} × ${num(t1)} = ${d1} ${ctx.unit}, and the second part took ${d2} ÷ ${v2} = ${hours(t2)}. ` +
          `In all, ${d1 + d2} ${ctx.unit} in ${plural(tidy(t1 + t2), "hour")}: ${d1 + d2} ÷ ${num(tidy(t1 + t2))} = ${num(key)} ${ctx.rate}.`,
        steps: [
          `Distance of the first part: ${v1} × ${num(t1)} = ${d1}.`,
          `Time of the second part: ${d2} ÷ ${v2} = ${num(t2)}.`,
          `Totals: ${d1 + d2} ${ctx.unit} in ${plural(tidy(t1 + t2), "hour")}.`,
          `Average speed: ${d1 + d2} ÷ ${num(tidy(t1 + t2))} = ${num(key)}.`,
        ],
        principles: AVERAGE_PRINCIPLES,
        trap: `Averaging ${v1} and ${v2} gives ${num(mean)}, which would be right only if both parts took the same time.`,
        hint: "Put both parts in the same terms: how far did each go, and how long did each take?",
        verify: () => close(key * (t1 + d2 / v2), v1 * t1 + d2),
      }, { show: num });
    });
  }

  function averageFuel(t, numeric) {
    const ctx = t.pick(FUEL);
    return retry(() => {
      const e1 = t.int(16, 40);
      const e2 = t.int(10, 32);
      if (Math.abs(e1 - e2) < 5) return null;
      const g1 = t.int(2, 12);
      const g2 = t.int(2, 12);
      if (g1 === g2) return null;
      const d1 = e1 * g1;
      const d2 = e2 * g2;
      if (d1 === d2) return null;
      const key = tidy((d1 + d2) / (g1 + g2));
      if (!isClean(key, 2)) return null;
      const mean = tidy((e1 + e2) / 2);
      const byDistance = tidy((d1 * e1 + d2 * e2) / (d1 + d2));
      return packRanked(t, numeric, key, [
        [mean, `Averages ${e1} and ${e2}, as if the same amount of gasoline were used on each part.`],
        [byDistance, "Weights each rate by the miles driven, but miles per gallon must be averaged over gallons."],
        [tidy((2 * e1 * e2) / (e1 + e2)), `Uses 2(${e1})(${e2})/(${e1} + ${e2}), which holds only when both parts cover the same number of miles.`],
        [g1 + g2, `Stops at the total gasoline used, ${g1 + g2} gallons.`],
        [tidy((d1 + d2) / 2), "Divides the total miles by 2, the number of parts of the trip."],
        [e1 + e2, `Adds the two rates, ${e1} and ${e2}.`],
        [d1 > d2 ? e1 : e2, "Gives the rate for the part with more miles, as if it set the average."],
      ], {
        stimulus: null,
        stem: `${ctx.story(d1, e1, d2, e2)} ${ctx.ask}`,
        explanation:
          `The first part used ${d1} ÷ ${e1} = ${g1} gallons and the second used ${d2} ÷ ${e2} = ${g2} gallons. In all, ` +
          `${num(d1 + d2)} miles on ${g1 + g2} gallons: ${num(d1 + d2)} ÷ ${g1 + g2} = ${num(key)} miles per gallon.`,
        steps: [
          `Gasoline for the first part: ${d1} ÷ ${e1} = ${g1} gallons.`,
          `Gasoline for the second part: ${d2} ÷ ${e2} = ${g2} gallons.`,
          `Totals: ${num(d1 + d2)} miles and ${g1 + g2} gallons.`,
          `Overall: ${num(d1 + d2)} ÷ ${g1 + g2} = ${num(key)}.`,
        ],
        principles: AVERAGE_PRINCIPLES,
        trap: `Averaging ${e1} and ${e2} gives ${num(mean)}, but more gasoline was burned at ${Math.min(e1, e2)} miles per gallon than the plain average allows for.`,
        hint: "How many gallons did each part of the driving use?",
        verify: () => close(key * (d1 / e1 + d2 / e2), d1 + d2),
      }, { show: num });
    });
  }

  const averageRate = {
    id: "average-rate-two-legs",
    domain: DOMAIN,
    skill: "Ratios, rates, and units",
    subskill: "unit rates",
    difficulty: "Medium",
    title: "Average rate over two unequal parts",
    recognize:
      "An average rate is a total over a total, so parts that last different times cannot be averaged as plain rates: find " +
      "each part's time (or fuel) first, then divide the total distance by the total.",
    // Medium: both rates and both amounts are given, so the work is a
    // two-step total-over-total once the mean-of-speeds reflex is resisted.
    rubric: { steps: 1, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["unweighted-average", "intermediate-value", "wrong-quantity"],
    build(t) {
      const form = t.pick([0, 0, 1, 2]);
      const numeric = t.chance(0.35);
      const instance = [averageRoundTrip, averageMixedLegs, averageFuel][form](t, numeric);
      return { estimatedSeconds: 100, ...instance };
    },
  };

  /* ================================= average-rate-required-leg (Hard) */

  // The whole trip's average is given and one leg's speed is wanted: the
  // average fixes the total time, and the unknown leg gets what is left.
  function requiredReturn(t, numeric) {
    const ctx = t.pick(TRIPS);
    const offerDouble = t.chance(0.5);
    return retry(() => {
      const v1 = t.int(ctx.v[0], ctx.v[1]);
      const v2 = t.int(ctx.v[0], ctx.v[1]);
      if (Math.abs(v1 - v2) < 4 || (ctx.outSlower && v1 > v2)) return null;
      const D = t.int(Math.ceil(ctx.D[0] / ctx.Dstep), Math.floor(ctx.D[1] / ctx.Dstep)) * ctx.Dstep;
      const t1 = D / v1;
      const t2 = D / v2;
      if (!isClean(t1, 2) || !isClean(t2, 2)) return null;
      const avg = tidy((2 * D) / (t1 + t2));
      if (!isClean(avg, 2)) return null;
      const key = v2;
      const reflex = tidy(2 * avg - v1);
      const totalTime = tidy(t1 + t2);
      // Twice the key is a look-alike of it; in the other half of the items
      // a look-alike pair (the average and half of it) sits among the wrong
      // answers instead, so a pair never marks the key.
      const doubled = [tidy(2 * v2), `Divides the round-trip distance, ${2 * D} ${ctx.unit}, by the time for ${ctx.legBack} alone.`];
      const halfAverage = [tidy(D / (t1 + t2)), `Divides one leg's distance, ${D} ${ctx.unit}, by the total time for both legs.`];
      const atAverage = [avg, `Assumes ${ctx.legBack} was made at the round-trip average, ${num(avg)} ${ctx.rate}.`];
      return packRanked(t, numeric, key, [
        ...(offerDouble ? [doubled] : [atAverage, halfAverage]),
        [reflex, `Treats ${num(avg)} as the mean of the two speeds, so the return speed would be 2(${num(avg)}) ${MINUS} ${v1}; the two legs take different times.`],
        [tidy(t2), `Stops at the time for ${ctx.legBack}, ${plural(tidy(t2), "hour")}.`],
        [totalTime, `Gives the total time for the round trip, ${plural(totalTime, "hour")}.`],
        ...(offerDouble ? [atAverage] : []),
        [tidy((2 * D) / t1), `Divides the round-trip distance by the time for the first leg instead of the second.`],
      ], {
        stimulus: null,
        stem: `${ctx.out(D, v1)} ${ctx.backPlain} The average speed for ${ctx.whole} was ${num(avg)} ${ctx.rate}. What was the average speed, in ${ctx.rate}, for ${ctx.legBack}?`,
        explanation:
          `The round trip is ${2 * D} ${ctx.unit} at an average of ${num(avg)} ${ctx.rate}, so it took ${2 * D} ÷ ${num(avg)} = ${plural(totalTime, "hour")}. ` +
          `The first leg took ${D} ÷ ${v1} = ${plural(tidy(t1), "hour")}, leaving ${plural(tidy(t2), "hour")} for the ${D} ${ctx.unit} back: ${D} ÷ ${num(tidy(t2))} = ${key} ${ctx.rate}.`,
        steps: [
          `Total time: ${2 * D} ÷ ${num(avg)} = ${plural(totalTime, "hour")}.`,
          `First leg: ${D} ÷ ${v1} = ${plural(tidy(t1), "hour")}.`,
          `Return leg: ${num(totalTime)} ${MINUS} ${num(tidy(t1))} = ${plural(tidy(t2), "hour")}.`,
          `Return speed: ${D} ÷ ${num(tidy(t2))} = ${key}.`,
        ],
        principles: AVERAGE_PRINCIPLES,
        trap: `The average speed is not the mean of the two speeds, because the slower leg lasts longer; assuming it is gives ${num(reflex)}.`,
        hint: "How long did the whole round trip take, and how much of that time was the first leg?",
        verify: () => close((2 * D) / (D / v1 + D / key), avg),
      }, { show: num });
    });
  }

  const RACES = [
    {
      unit: "kilometers", rate: "kilometers per hour", v: [6, 16], D: [8, 42],
      story: (D, d1, v1, V) => `A runner completed ${S.article(D)} ${D}-kilometer race. The runner covered the first ${d1} kilometers at an average speed of ${v1} kilometers per hour, and the runner's average speed for the entire race was ${num(V)} kilometers per hour.`,
      ask: (rest) => `What was the runner's average speed, in kilometers per hour, for the last ${rest} kilometers?`,
      part: "the last part of the race",
    },
    {
      unit: "miles", rate: "miles per hour", v: [30, 70], D: [60, 300],
      story: (D, d1, v1, V) => `A bus made ${S.article(D)} ${D}-mile trip. It traveled the first ${d1} miles at an average speed of ${v1} miles per hour, and its average speed for the whole trip was ${num(V)} miles per hour.`,
      ask: (rest) => `What was the bus's average speed, in miles per hour, for the remaining ${rest} miles?`,
      part: "the rest of the trip",
    },
    {
      unit: "kilometers", rate: "kilometers per hour", v: [12, 40], D: [30, 150],
      story: (D, d1, v1, V) => `A cyclist rode ${S.article(D)} ${D}-kilometer route. The cyclist rode the first ${d1} kilometers at an average speed of ${v1} kilometers per hour, and the average speed for the whole route was ${num(V)} kilometers per hour.`,
      ask: (rest) => `What was the cyclist's average speed, in kilometers per hour, for the remaining ${rest} kilometers?`,
      part: "the rest of the route",
    },
  ];

  function requiredRest(t, numeric) {
    const ctx = t.pick(RACES);
    return retry(() => {
      const v1 = t.int(ctx.v[0], ctx.v[1]);
      const v2 = t.int(ctx.v[0], ctx.v[1]);
      if (Math.abs(v1 - v2) < 3) return null;
      const t1 = t.pick([0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]);
      const t2 = t.pick([0.25, 0.5, 0.75, 1, 1.5, 2, 2.5]);
      const d1 = v1 * t1;
      const d2 = v2 * t2;
      const D = d1 + d2;
      if (!Number.isInteger(d1) || !Number.isInteger(d2) || d1 === d2 || D < ctx.D[0] || D > ctx.D[1]) return null;
      const V = tidy(D / (t1 + t2));
      if (!isClean(V, 2)) return null;
      const key = v2;
      const reflex = tidy(2 * V - v1);
      const byDistance = tidy((V * D - v1 * d1) / d2);
      const totalTime = tidy(t1 + t2);
      return packRanked(t, numeric, key, [
        [byDistance, `Treats ${num(V)} as the average of the two speeds weighted by distance, ${d1} and ${d2} ${ctx.unit}, but the speeds must be weighted by time.`],
        [reflex, `Treats ${num(V)} as the plain mean of the two speeds, so the second speed would be 2(${num(V)}) ${MINUS} ${v1}.`],
        [tidy(t2), `Stops at the time for ${ctx.part}, ${plural(tidy(t2), "hour")}.`],
        [tidy(d2 / totalTime), `Divides the remaining ${d2} ${ctx.unit} by the total time, ${plural(totalTime, "hour")}.`],
        [tidy(d2 / t1), `Divides the remaining ${d2} ${ctx.unit} by the time for the first part, ${plural(t1, "hour")}.`],
      ], {
        stimulus: null,
        stem: `${ctx.story(D, d1, v1, V)} ${ctx.ask(d2)}`,
        explanation:
          `At an average of ${num(V)} ${ctx.rate}, the whole ${D} ${ctx.unit} took ${D} ÷ ${num(V)} = ${plural(totalTime, "hour")}. ` +
          `The first ${d1} ${ctx.unit} took ${d1} ÷ ${v1} = ${plural(t1, "hour")}, leaving ${plural(t2, "hour")} for the last ${d2} ${ctx.unit}: ` +
          `${d2} ÷ ${num(t2)} = ${key} ${ctx.rate}.`,
        steps: [
          `Total time from the overall average: ${D} ÷ ${num(V)} = ${plural(totalTime, "hour")}.`,
          `Time for the first ${d1} ${ctx.unit}: ${d1} ÷ ${v1} = ${plural(t1, "hour")}.`,
          `Time left: ${num(totalTime)} ${MINUS} ${num(t1)} = ${plural(t2, "hour")}.`,
          `Speed for the rest: ${d2} ÷ ${num(t2)} = ${key}.`,
        ],
        principles: AVERAGE_PRINCIPLES,
        trap: `An average speed is total distance over total time, so it is not a mean of the two speeds by distance or by count; weighting by distance gives ${num(byDistance)}.`,
        hint: "What does the average speed for the whole distance say about the total time?",
        verify: () => {
          // Rebuild the trip from the key and recompute the overall average.
          const time = d1 / v1 + (D - d1) / key;
          return close(D / time, V) && D - d1 === d2;
        },
      }, { show: num });
    });
  }

  const requiredLeg = {
    id: "average-rate-required-leg",
    domain: DOMAIN,
    skill: "Ratios, rates, and units",
    subskill: "unit rates",
    difficulty: "Hard",
    title: "The speed one part must have for a given overall average",
    recognize:
      "The overall average speed is not a mean of the two speeds; it fixes the total time (total distance ÷ average). " +
      "Subtract the known part's time, then divide the remaining distance by the time left.",
    // Hard: the average is given and a part's rate is asked, so the
    // student must see that an average rate fixes a total time; averaging
    // the speeds, by count or by distance, produces an offered answer.
    rubric: { steps: 2, concept: 2, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["unweighted-average", "intermediate-value", "wrong-quantity"],
    build(t) {
      const numeric = t.chance(0.35);
      const instance = t.chance(0.5) ? requiredReturn(t, numeric) : requiredRest(t, numeric);
      return { estimatedSeconds: 120, ...instance };
    },
  };

  /* ======================================== density-cube-edge (Hard) */

  // A solid cube's mass and its material's density; the edge (or the
  // surface area) is wanted. Density turns mass into volume, and a cube's
  // volume gives its edge only through a cube root.
  const MATERIALS = [
    { name: "a type of pine wood", system: "si", d: [400, 450, 480, 500, 520, 560, 600, 640] },
    { name: "a type of oak wood", system: "si", d: [680, 700, 720, 750, 800, 840] },
    { name: "a type of concrete", system: "si", d: [2000, 2200, 2240, 2400, 2500] },
    { name: "a type of plastic", system: "cgs", d: [0.9, 0.95, 1.2, 1.25, 1.4, 1.5] },
    { name: "a type of stone", system: "cgs", d: [2.4, 2.5, 2.6, 2.7, 2.8, 3] },
    { name: "a metal alloy", system: "cgs", d: [4, 4.5, 6.4, 7.5, 8] },
  ];

  const EDGES = [4, 5, 6, 8, 10, 12, 14, 15, 16, 18, 20, 24, 25, 28, 30, 32, 35, 40, 45, 50, 60];

  function densityCube(t, numeric) {
    const ctx = t.pick(MATERIALS);
    const askArea = t.chance(0.4);
    return retry(() => {
      const d = t.pick(ctx.d);
      const e = t.pick(EDGES);
      const cm3 = e ** 3;
      // Mass in kilograms: kg/m^3 times m^3, or g/cm^3 times cm^3 over 1,000.
      const M = tidy(ctx.system === "si" ? (d * cm3) / 1e6 : (d * cm3) / 1000);
      if (!isClean(M, 3) || M < 0.1 || M > 3000) return null;
      const densityText = ctx.system === "si"
        ? `${num(d)} kilograms per cubic meter`
        : `${num(d)} grams per cubic centimeter`;
      const key = askArea ? 6 * e * e : e;
      const volumeText = ctx.system === "si" ? `${num(M)} ÷ ${num(d)} = ${num(tidy(cm3 / 1e6))} cubic meter` : `${fmt(M * 1000)} ÷ ${num(d)} = ${fmt(cm3)} cubic centimeters`;
      const inCm = ctx.system === "si" ? `${num(tidy(cm3 / 1e6))} × 1,000,000 = ${fmt(cm3)} cubic centimeters` : `${fmt(cm3)} cubic centimeters`;
      // The unit slip: meters for centimeters (si), or kilograms read as grams (cgs).
      const slipEdge = ctx.system === "si" ? e / 100 : e / 10;
      const slipReason = ctx.system === "si"
        ? `Takes the cube root of the volume in cubic meters, ${num(tidy(cm3 / 1e6))}, which gives the edge in meters, not centimeters.`
        : `Divides the mass in kilograms by the density in grams per cubic centimeter without converting ${num(M)} kilograms to ${fmt(M * 1000)} grams.`;
      const candidates = askArea
        ? [
          [e * e, "Gives the area of one face of the cube, not all six."],
          [cm3, `Stops at the volume, ${fmt(cm3)} cubic centimeters.`],
          [4 * e * e, "Counts only four faces of the cube."],
          [e, "Stops at the length of an edge."],
          [tidy(6 * slipEdge * slipEdge), `${slipReason} Six faces of that edge give this area.`],
          [6 * cm3 / e / 2, `Uses 3 × (edge)², half the surface area.`],
          [6 * cm3, "Multiplies the volume by 6, the number of faces, instead of multiplying the area of one face by 6."],
          [36 * e * e, `Squares 6 × ${e} instead of multiplying ${e}² by 6.`],
        ]
        : [
          [slipEdge, slipReason],
          [cm3, `Stops at the volume, ${fmt(cm3)} cubic centimeters, without taking its cube root.`],
          [e * e, "Gives the area of one face instead of the length of an edge."],
          [tidy(cm3 / 3), `Divides the volume by 3 instead of taking its cube root.`],
          [ctx.system === "si" ? e / 10 : e * 10, ctx.system === "si"
            ? "Converts the edge from meters to centimeters by multiplying by 10 instead of 100."
            : "Converts the mass from kilograms to grams twice."],
        ];
      const mass = plural(M, "kilogram");
      return packRanked(t, numeric, key, candidates, {
        stimulus: null,
        stem:
          `A solid cube is made of ${ctx.name} that has a density of ${densityText}. The mass of the cube is ${mass}. ` +
          (askArea ? "What is the total surface area, in square centimeters, of the cube?" : "What is the length, in centimeters, of each edge of the cube?"),
        explanation:
          `Volume = mass ÷ density: ${volumeText}` + (ctx.system === "si" ? `, which is ${inCm}` : "") + `. ` +
          `A cube's volume is its edge cubed, so the edge is the cube root of ${fmt(cm3)}: ${e} centimeters.` +
          (askArea ? ` Its six square faces have a total area of 6 × ${e}² = ${fmt(key)} square centimeters.` : ""),
        steps: [
          `Volume = mass ÷ density: ${volumeText}.`,
          ctx.system === "si" ? `In cubic centimeters: ${inCm} (a cubic meter is 100 × 100 × 100 cubic centimeters).` : `The mass in grams is ${fmt(M * 1000)}, matching the density's units.`,
          `Edge: the number whose cube is ${fmt(cm3)} is ${e}.`,
          askArea ? `Surface area: 6 × ${e} × ${e} = ${fmt(key)}.` : `The edge is ${e} centimeters.`,
        ],
        principles: [
          "Density = mass ÷ volume, so volume = mass ÷ density, in matching units.",
          "A cube with edge s has volume s³ and surface area 6s²; a cubic meter is 100³ = 1,000,000 cubic centimeters.",
        ],
        trap: askArea
          ? `The volume, ${fmt(cm3)}, is a step on the way; the edge comes from its cube root, and the surface area counts all six faces.`
          : `The volume, ${fmt(cm3)}, is not the edge: the edge is its cube root, measured in centimeters.`,
        hint: "What does the density say about the volume of the cube?",
        estimatedSeconds: 120,
        verify: () => {
          const edge = askArea ? Math.sqrt(key / 6) : key;
          const massBack = ctx.system === "si" ? d * (edge / 100) ** 3 : (d * edge ** 3) / 1000;
          return close(massBack, M) && Number.isInteger(edge);
        },
      }, { show: fmt, places: 3 });
    });
  }

  const densityCubeEdge = {
    id: "density-cube-edge",
    domain: DOMAIN,
    skill: "Ratios, rates, and units",
    subskill: "unit conversion",
    difficulty: "Hard",
    title: "A cube's size from its mass and density",
    recognize:
      "Density links mass and volume (volume = mass ÷ density, in matching units); a cube's edge is the cube root of its " +
      "volume, and a cubic meter is 100³ cubic centimeters, not 100.",
    // Hard: nothing asks for a volume, yet the volume, a cube root, and a
    // cubed unit factor all stand between the given mass and the answer.
    rubric: { steps: 2, concept: 1, interpretation: 1, distractors: 2, abstraction: 0, synthesis: 2, trap: 1 },
    tricks: ["intermediate-value", "unit-mismatch", "neighbouring-rule"],
    build(t) {
      return densityCube(t, t.chance(0.35));
    },
  };

  /* ======================================== combined-work-rate (Hard) */

  const CREWS = [
    { a: "Pump A", b: "Pump B", job: "fill an empty tank", unit: "hours", one: "hour" },
    { a: "Printer P", b: "Printer Q", job: "print a batch of flyers", unit: "minutes", one: "minute" },
    { a: "Rosa", b: "Kai", job: "paint a fence", unit: "hours", one: "hour" },
    { a: "Snowplow X", b: "Snowplow Y", job: "clear a parking lot", unit: "hours", one: "hour" },
    { a: "Machine A", b: "Machine B", job: "sort a shipment of packages", unit: "minutes", one: "minute" },
  ];

  function workRate(t, numeric) {
    const ctx = t.pick(CREWS);
    const pairKey = t.chance(0.5);
    const form = t.pick(["together", "together", "alone", "staged"]);
    const scale = ctx.unit === "minutes" ? 5 : 1;
    return retry(() => {
      const a = t.int(2, 24) * scale;
      const b = t.int(2, 24) * scale;
      if (a === b) return null;
      const c = tidy((a * b) / (a + b));
      if (!isClean(c, 2)) return null;
      const u = ctx.unit;
      const both = `${ctx.a} and ${ctx.b}`;
      const rates = `${ctx.a} works at a rate of 1/${a} of the job per ${ctx.one} and ${ctx.b} at 1/${b}`;
      if (form === "together") {
        // A look-alike pair (a value and its double) sits on the key in half
        // the items and among the wrong answers in the rest, so neither the
        // pair nor its absence marks the key.
        const twin = pairKey
          ? [[tidy(2 * c), `Averages the two rates and gives the time for one worker at that average rate, twice the time together.`]]
          : [];
        const halfFaster = pairKey ? [] : [[tidy(Math.min(a, b) / 2), `Halves the faster time, as if both worked at the faster rate.`]];
        return packRanked(t, numeric, c, [
          ...twin,
          [tidy((a + b) / 2), `Averages the two times, ${a} and ${b}; working together is faster than either alone.`],
          ...halfFaster,
          [a + b, `Adds the two times, as if one worked after the other.`],
          [Math.min(a, b), `Gives the faster time alone, ${Math.min(a, b)} ${u}; the second helper shortens it.`],
          [Math.abs(a - b), `Subtracts the two times.`],
        ], {
          stimulus: null,
          stem: `Working alone at a constant rate, ${ctx.a} can ${ctx.job} in ${a} ${u}. Working alone at a constant rate, ${ctx.b} can ${ctx.job} in ${b} ${u}. ` +
            `At these rates, how many ${u} would it take ${both} working together to ${ctx.job}?`,
          explanation:
            `${rates}. Together they do 1/${a} + 1/${b} = ${S.frac(a + b, a * b)} of the job per ${ctx.one}, so the whole job takes ` +
            `${S.frac(a * b, a + b)} = ${plural(c, ctx.one)}.`,
          steps: [
            `Rates: 1/${a} and 1/${b} of the job per ${ctx.one}.`,
            `Combined rate: 1/${a} + 1/${b} = ${S.frac(a + b, a * b)} of the job per ${ctx.one}.`,
            `Time for one whole job: 1 ÷ ${S.frac(a + b, a * b)} = ${plural(c, ctx.one)}.`,
          ],
          principles: WORK_PRINCIPLES,
          trap: `Rates add, times do not: averaging ${a} and ${b} gives ${num(tidy((a + b) / 2))}, longer than the faster one alone.`,
          hint: `What fraction of the job does each do in one ${ctx.one}?`,
          verify: () => close(c / a + c / b, 1),
        }, { show: num });
      }
      if (form === "alone") {
        // Together time and one solo time are given; the other solo time is wanted.
        return packRanked(t, numeric, b, [
          [tidy(a - c), `Subtracts the together time from ${ctx.a}'s time; rates subtract, times do not.`],
          [tidy(2 * c), `Doubles the together time, as if both worked at the same rate.`],
          [tidy((a * c) / (a + c)), `Adds the rates 1/${a} and 1/${num(c)} instead of subtracting them.`],
          [a, `Assumes ${ctx.b} works at the same rate as ${ctx.a}.`],
          [tidy(a + c), `Adds the two times.`],
        ], {
          stimulus: null,
          stem: `Working alone at a constant rate, ${ctx.a} can ${ctx.job} in ${a} ${u}. Working together at constant rates, ${both} can ${ctx.job} in ${num(c)} ${u}. ` +
            `How many ${u} would it take ${ctx.b}, working alone, to ${ctx.job}?`,
          explanation:
            `Together they do 1/${num(c)} of the job per ${ctx.one} and ${ctx.a} alone does 1/${a}, so ${ctx.b} does ` +
            `1/${num(c)} ${MINUS} 1/${a} = 1/${b} of the job per ${ctx.one}, and alone needs ${b} ${u}.`,
          steps: [
            `Combined rate: 1/${num(c)} of the job per ${ctx.one}.`,
            `${ctx.b}'s rate: 1/${num(c)} ${MINUS} 1/${a} = 1/${b}.`,
            `${ctx.b} alone: ${b} ${u}.`,
          ],
          principles: WORK_PRINCIPLES,
          trap: `${num(tidy(a - c))} subtracts times; it is the rates, 1/${num(c)} and 1/${a}, that subtract.`,
          hint: `How much of the job does the pair do in one ${ctx.one}, and how much of that is ${ctx.a}'s share?`,
          verify: () => close(1 / a + 1 / b, 1 / c),
        }, { show: num });
      }
      // Staged: one works alone for h, then both finish the job.
      const h = t.int(1, Math.max(1, Math.floor((a - 1) / scale))) * scale;
      if (h >= a) return null;
      const rest = tidy((1 - h / a) * c);
      if (!isClean(rest, 2) || rest <= 0) return null;
      return packRanked(t, numeric, rest, [
        ...(pairKey ? [[tidy(2 * rest), `Averages the two rates instead of adding them, as if one worker at that average rate finished the part left.`]] : []),
        [c, `Gives the time for the pair to do the whole job, ignoring the part ${ctx.a} did alone.`],
        [tidy(c - h), `Subtracts the ${plural(h, ctx.one)} from the time the pair would need for the whole job; time alone is slower than time together.`],
        [tidy(h + rest), `Gives the total time since ${ctx.a} started, not the time the two worked together.`],
        ...(pairKey ? [] : [[tidy((a - h) / 2), `Halves ${ctx.a}'s remaining time, as if ${ctx.b} worked at the same rate.`]]),
        [tidy(a - h), `Gives the time ${ctx.a} alone would need to finish.`],
      ], {
        stimulus: null,
        stem: `Working alone at a constant rate, ${ctx.a} can ${ctx.job} in ${a} ${u}, and working alone at a constant rate, ${ctx.b} can do it in ${b} ${u}. ` +
          `${ctx.a} works alone for ${plural(h, ctx.one)}, and then ${ctx.b} joins in. At these rates, how many ${u} do ${both} work together to finish the job?`,
        explanation:
          `In ${plural(h, ctx.one)} alone, ${ctx.a} does ${S.frac(h, a)} of the job, leaving ${S.frac(a - h, a)}. Together they do ${S.frac(a + b, a * b)} of the job ` +
          `per ${ctx.one}, so the rest takes ${S.frac(a - h, a)} ÷ ${S.frac(a + b, a * b)} = ${plural(rest, ctx.one)}.`,
        steps: [
          `${ctx.a} alone: ${h} × 1/${a} = ${S.frac(h, a)} of the job.`,
          `Left: 1 ${MINUS} ${S.frac(h, a)} = ${S.frac(a - h, a)}.`,
          `Combined rate: 1/${a} + 1/${b} = ${S.frac(a + b, a * b)} per ${ctx.one}.`,
          `Time together: ${S.frac(a - h, a)} ÷ ${S.frac(a + b, a * b)} = ${num(rest)}.`,
        ],
        principles: WORK_PRINCIPLES,
        trap: `Time spent alone is not time saved from the pair's schedule: ${ctx.a} alone works more slowly than the pair, so subtracting ${h} from ${num(c)} is wrong.`,
        hint: `How much of the job is done before ${ctx.b} joins?`,
        verify: () => close(h / a + rest / a + rest / b, 1),
      }, { show: num });
    });
  }

  const WORK_PRINCIPLES = [
    "A job done alone in t units of time is done at a rate of 1/t of the job per unit; rates of helpers working together add.",
    "Times do not add or average: the time together is 1 divided by the combined rate.",
  ];

  const combinedWorkRate = {
    id: "combined-work-rate",
    domain: DOMAIN,
    skill: "Ratios, rates, and units",
    subskill: "unit rates",
    difficulty: "Medium",
    title: "Two workers or machines sharing one job",
    recognize:
      "Turn each time into a rate (the fraction of the job done per unit of time); rates of workers together add, and the " +
      "time is the work left divided by the combined rate.",
    // Medium (relabelled from Hard, 2026-09-26 review): one known model
    // (rates add) applied in two or three steps; averaging or adding the
    // times gives offered answers.
    rubric: { steps: 1, concept: 2, interpretation: 1, distractors: 1, abstraction: 0, synthesis: 0, trap: 2 },
    tricks: ["neighbouring-rule", "unweighted-average", "intermediate-value"],
    build(t) {
      return { estimatedSeconds: 115, ...workRate(t, t.chance(0.35)) };
    },
  };

  return [rateScaling, ratioShare, rateConversion, ratioAfterChange, multiUnitRate, averageRate, requiredLeg, densityCubeEdge, combinedWorkRate];
});
