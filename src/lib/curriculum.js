/* Pure navigation and pacing for full-year course outlines. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LiminalCurriculum = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";

  function gradeLabel(grade) { return grade === 0 ? "Kindergarten" : "Grade " + grade; }
  function gradeKey(grade) { return grade === 0 ? "k" : String(grade); }
  function route(trackId, grade, unitId) { return "#" + trackId + "/" + gradeKey(grade) + (unitId ? "/" + unitId : ""); }
  function resolve(data, hash) {
    const parts = String(hash || "").replace(/^#/, "").split("/");
    const known = parts[0] === "grade" || data.tracks.some(t => t.track.id === parts[0]);
    const trackId = known ? parts[0] : data.tracks[0].track.id;
    const validGrade = /^(?:k|[0-9]|1[0-2])$/.test(parts[1] || "k");
    const grade = validGrade && parts[1] !== "k" ? Number(parts[1] || 0) : 0;
    const pair = courseAt(data, trackId, grade);
    const unitId = parts[2] && pair && pair.course.units.some(u => u.id === parts[2]) ? parts[2] : null;
    return { trackId, grade, unitId, invalid: (!known && !!parts[0]) || !validGrade || parts.length > 3 || (!!parts[2] && !unitId) };
  }
  function courseAt(data, trackId, grade) {
    const track = data.tracks.find(t => t.track.id === trackId);
    const course = track && track.courses.find(c => c.grade === grade);
    return course ? { track, course } : null;
  }
  function pacedUnits(course) {
    let week = 1;
    return course.units.map(unit => {
      const result = { ...unit, startWeek: week, endWeek: week + unit.weeks - 1 };
      week += unit.weeks;
      return result;
    });
  }
  function coverage(track, course) {
    return track.standards.filter(s => course.units.some(u => u.standards.includes(s.id)))
      .map(standard => ({ ...standard,
        source: track.sources.find(s => s.id === standard.sourceId),
        units: course.units.filter(u => u.standards.includes(standard.id)).map(u => u.id),
      }));
  }
  function connections(data, trackId, grade) {
    return {
      previous: courseAt(data, trackId, grade - 1),
      next: courseAt(data, trackId, grade + 1),
      peers: data.tracks.filter(t => t.track.id !== trackId).map(t => courseAt(data, t.track.id, grade)).filter(Boolean),
    };
  }
  return { gradeLabel, gradeKey, route, resolve, courseAt, pacedUnits, coverage, connections };
});
