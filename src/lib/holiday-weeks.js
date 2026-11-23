/* Resolve a curated week against the actual holiday and the grade's reading set. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./reading-calendar"));
  else root.LiminalHolidayWeeks = factory(root.LiminalReadingCalendar);
})(typeof window === "object" ? window : globalThis, function (calendar) {
  "use strict";

  function dates(key, year) {
    const holiday = calendar.holidays(year).find(item => item.key === key);
    if (!holiday) throw new Error("Choose a calendar holiday and a year from 1 to 9999.");
    const week = Array.from({ length: 7 }, (_, day) => calendar.addDays(holiday.date, day - 6));
    if (!week[0]) throw new Error("This week starts before the first supported calendar year.");
    return week;
  }

  function readingIds(key, gradeKey, set, selections) {
    const lead = selections?.[key]?.[gradeKey];
    // Source calendars contain IDs. Built calendars include a preview with each ID.
    const entry = set?.anchors?.[key];
    const last = typeof entry === "string" ? entry : entry?.id;
    if (!Array.isArray(lead) || lead.length !== 6 || !last) throw new Error("Incomplete holiday week for " + key + ", level " + gradeKey);
    return [...lead, last];
  }

  return { dates, readingIds };
});
