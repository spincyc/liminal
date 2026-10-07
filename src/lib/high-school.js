/* Pure navigation and pacing for the named high-school sequence. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalHighSchool = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  const ORDER = ["algebra", "geometry", "algebra-2", "trigonometry", "calculus"];
  function courses(data) { return ORDER.map(id => (data.courses || []).find(c => c.id === id)).filter(Boolean); }
  function route(courseId, unitId) {
    if (!ORDER.includes(courseId) || unitId !== undefined && unitId !== null && (typeof unitId !== "string" || !/^u[1-9][0-9]*$/.test(unitId))) return "";
    return "#" + courseId + (unitId ? "/" + unitId : "");
  }
  function resolve(data, hash) {
    const raw = String(hash || "").replace(/^#/, "");
    const parts = raw.split("/");
    const ordered = courses(data);
    const requested = ordered.find(c => c.id === parts[0]);
    const course = requested || ordered[0] || null;
    const unitId = requested && parts.length === 2 && requested.units.some(u => u.id === parts[1]) ? parts[1] : null;
    return { course, unitId, invalid: !!raw && (!requested || parts.length > 2 || parts.length === 2 && !unitId) };
  }
  function pacedUnits(course) {
    let week = 1;
    return course.units.map(unit => {
      const result = { ...unit, startWeek: week, endWeek: week + unit.weeks - 1 };
      week += unit.weeks;
      return result;
    });
  }
  return { ORDER, courses, route, resolve, pacedUnits };
});
